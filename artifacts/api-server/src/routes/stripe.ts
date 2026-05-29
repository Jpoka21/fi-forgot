import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getUncachableStripeClient } from "../stripeClient.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

function getBaseUrl(req: any): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0].trim()}`;
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/api/stripe/plans", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.description,
        p.metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY pr.unit_amount ASC
    `);
    res.json({ data: result.rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch Stripe plans");
    res.status(500).json({ error: "Failed to load plans" });
  }
});

router.post("/api/stripe/checkout", async (req, res) => {
  try {
    const { email, name, priceId, planKey } = req.body as {
      email: string;
      name?: string;
      priceId: string;
      planKey: string;
    };

    if (!email || !priceId) {
      res.status(400).json({ error: "email and priceId are required" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const base = getBaseUrl(req);

    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        name: name ?? undefined,
        metadata: { planKey },
      });
      customerId = customer.id;

      if (user) {
        await db.update(usersTable)
          .set({ stripeCustomerId: customerId })
          .where(eq(usersTable.email, email.toLowerCase()));
      } else {
        await db.insert(usersTable).values({
          id: `u_${Date.now()}`,
          email: email.toLowerCase(),
          name: name ?? null,
          stripeCustomerId: customerId,
          plan: "basic",
        }).onConflictDoNothing();
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${base}/checkout/success?plan=${planKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe`,
      metadata: { planKey, email: email.toLowerCase() },
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Checkout session creation failed");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/api/stripe/portal", async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "email required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (!user?.stripeCustomerId) {
      res.status(404).json({ error: "No Stripe customer found" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const base = getBaseUrl(req);

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${base}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Portal session creation failed");
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
