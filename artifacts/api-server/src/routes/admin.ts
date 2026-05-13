import { Router } from "express";
import OpenAI from "openai";
import {
  handwryttenService,
  HandwryttenOrderRequest,
  listHandwryttenFonts,
} from "../services/handwrytten";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ─── Generate admin message ───────────────────────────────────────────────────

router.post("/admin/generate-message", async (req, res) => {
  const {
    recipientName,
    customerName,
    relationship,
    eventType,
    tone,
    customNotes,
    personalityNotes,
    favoriteMemories,
    insideJokes,
    thingsToAvoid,
    children,
    yearsMarried,
    interests = [] as string[],
    petName,
    emotionalLevel,
  } = req.body;

  if (!recipientName || !eventType) {
    res.status(400).json({ error: "recipientName and eventType are required" });
    return;
  }

  const contextLines: string[] = [];
  if (relationship) contextLines.push(`Relationship: ${relationship}`);
  if (personalityNotes) contextLines.push(`Personality: ${personalityNotes}`);
  if ((interests as string[]).length > 0) contextLines.push(`Her interests & passions: ${(interests as string[]).join(", ")} — weave these naturally when relevant`);
  if (children) contextLines.push(`Her children: ${children}`);
  if (yearsMarried) contextLines.push(`Years married (background only, do not state): ${yearsMarried}`);
  if (favoriteMemories) contextLines.push(`Shared memories: ${favoriteMemories}`);
  if (insideJokes) contextLines.push(`Inside references: ${insideJokes}`);
  if (petName) contextLines.push(`Pet name / nickname: "${petName}"`);
  if (emotionalLevel) contextLines.push(`Emotional depth (1=brief, 5=sweeping): ${emotionalLevel}`);
  if (customNotes) contextLines.push(`Admin notes: ${customNotes}`);
  if (thingsToAvoid) contextLines.push(`NEVER include: ${thingsToAvoid}`);

  const context = contextLines.length > 0
    ? `Context:\n${contextLines.join("\n")}`
    : "";

  const systemPrompt = `You are a professional greeting card writer for "F" I Forgot — a concierge card service. You write personalized, genuine cards for busy men who care but forget. Cards sound like the sender wrote them — specific, real, never generic. 

Rules: Never open with relationship duration. Never use greeting card clichés. Sign as the customer's name.`;

  const userPrompt = `Write a ${tone} ${eventType} card from ${customerName} to ${recipientName}.

${context}

Keep it to 3–6 sentences. Personal, specific, and sounds like a real person wrote it. Return only the card text, no quotes, no labels.`;

  const usesMockAI = !process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (usesMockAI) {
    // Placeholder response for when OpenAI is not connected
    const mock = `${recipientName} — ${eventType === "Mother's Day" ? "watching you be a mom is one of the privileges of my life" : eventType === "Birthday" ? "another year and you somehow keep getting better" : eventType === "Anniversary" ? "I'd pick you again in every version of this life" : "I don't say this enough, but I mean it every time"
      }. ${customNotes ? `${customNotes}. ` : ""}You make everything better, and I don't take that for granted. — ${customerName}`;

    req.log.info("MOCK: AI message generation (no API key configured)");
    res.json({ message: mock, mock: true });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const message = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ message, mock: false });
  } catch (err) {
    req.log.error({ err }, "Admin message generation failed");
    res.status(500).json({ error: "Message generation failed" });
  }
});

// ─── Handwrytten: list cards ──────────────────────────────────────────────────

router.get("/admin/handwrytten/cards", async (req, res) => {
  try {
    const cards = await handwryttenService.listCards(req.query["category"] as string | undefined);
    res.json({ cards, mock: handwryttenService.isMock });
  } catch (err) {
    req.log.error({ err }, "listHandwryttenCards failed");
    res.status(500).json({ error: "Failed to fetch Handwrytten cards" });
  }
});

// ─── Handwrytten: list fonts ──────────────────────────────────────────────────

router.get("/admin/handwrytten/fonts", async (req, res) => {
  try {
    const fonts = await listHandwryttenFonts();
    res.json({ fonts, mock: handwryttenService.isMock });
  } catch (err) {
    req.log.error({ err }, "listHandwryttenFonts failed");
    res.status(500).json({ error: "Failed to fetch fonts" });
  }
});

// ─── Handwrytten: create order ────────────────────────────────────────────────

router.post("/admin/handwrytten/orders", async (req, res) => {
  const { cardId, recipientAddress, message, wishes, fontId } = req.body;

  if (!cardId || !recipientAddress || !message) {
    res.status(400).json({ error: "cardId, recipientAddress, and message are required" });
    return;
  }

  const addr = recipientAddress;

  // Accept either firstName/lastName OR a full `name` field (split on first space)
  let firstName: string = addr.firstName ?? "";
  let lastName: string = addr.lastName ?? "";
  if (!firstName && !lastName && addr.name) {
    const parts = String(addr.name).trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  // Accept either street1 OR legacy line1
  const street1: string = addr.street1 ?? addr.line1 ?? "";

  if (!street1 || !addr.city || !addr.state || !addr.zip) {
    res.status(400).json({ error: "Incomplete recipient address (need street, city, state, zip)" });
    return;
  }

  try {
    const orderReq: HandwryttenOrderRequest = {
      cardId,
      message,
      wishes: wishes ?? "",
      fontId,
      recipientAddress: {
        firstName,
        lastName,
        street1,
        street2: addr.street2 ?? addr.line2,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
      },
    };

    const result = await handwryttenService.createOrder(orderReq);
    req.log.info({ result }, "Handwrytten order created");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "createHandwryttenOrder failed");
    res.status(500).json({ error: "Failed to create Handwrytten order" });
  }
});

// ─── Handwrytten: order status ────────────────────────────────────────────────

router.get("/admin/handwrytten/orders/:orderId/status", async (req, res) => {
  try {
    const status = await handwryttenService.getOrderStatus(req.params["orderId"]);
    res.json(status);
  } catch (err) {
    req.log.error({ err }, "getHandwryttenOrderStatus failed");
    res.status(500).json({ error: "Failed to get order status" });
  }
});

// ─── Handwrytten: cancel order ────────────────────────────────────────────────

router.post("/admin/handwrytten/orders/:orderId/cancel", async (req, res) => {
  try {
    const result = await handwryttenService.cancelOrder(req.params["orderId"]);
    req.log.info({ orderId: req.params["orderId"] }, "Handwrytten order cancelled");
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "cancelHandwryttenOrder failed");
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
