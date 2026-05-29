import { getStripeClient } from "./stripeClient.js";

const PRODUCTS = [
  {
    planKey: "basic",
    name: "Bare Minimum",
    description: "For the guy trying not to screw this up. Birthday + anniversary coverage, 6 cards/year.",
    priceCents: 600,
  },
  {
    planKey: "standard",
    name: "Domestic Peacekeeper",
    description: "For wives, moms, kids, and damage control. All major occasions, up to 5 recipients, 18 cards/year.",
    priceCents: 1500,
  },
  {
    planKey: "premium",
    name: "Legend Status",
    description: "Unlimited recipients, 40 cards/year, premium card styles, gift add-ons, emergency save mode.",
    priceCents: 2900,
  },
];

async function main() {
  const stripe = await getStripeClient();
  console.log("Seeding Stripe products...");

  for (const p of PRODUCTS) {
    const existing = await stripe.products.search({
      query: `metadata['planKey']:'${p.planKey}'`,
    });

    if (existing.data.length > 0) {
      console.log(`  [skip] ${p.name} — already exists`);
      continue;
    }

    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
      metadata: { planKey: p.planKey },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.priceCents,
      currency: "usd",
      recurring: { interval: "month" },
    });

    console.log(`  [created] ${p.name} — product ${product.id}, price ${price.id} ($${p.priceCents / 100}/mo)`);
  }

  console.log("Done!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
