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
    senderName,
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
    previousMessages = [] as string[], // recent approved card texts for this recipient
  } = req.body;

  // The name that prints on the card signature — "James", "Dad", etc.
  const signatureName: string = (senderName as string | undefined)?.trim() || (customerName as string | undefined) || "Your sender";

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

  const prevMsgs = (previousMessages as string[]).filter(Boolean);
  if (prevMsgs.length > 0) {
    contextLines.push(
      `PREVIOUS CARDS ALREADY SENT (do not repeat the same themes, angles, or specific details used in these):\n${prevMsgs.map((m, i) => `  Card ${i + 1}: "${m}"`).join("\n")}`
    );
  }

  const context = contextLines.length > 0
    ? `Context:\n${contextLines.join("\n")}`
    : "";

  const systemPrompt = `You are a professional greeting card writer for "F" I Forgot — a concierge card service. You write personalized, genuine cards for busy men who care but forget. Cards sound like the sender wrote them — specific, real, never generic.

CRITICAL RULES — violating any of these is a failure:
1. NEVER invent or assume any facts about the recipient. Only reference details explicitly provided in the context. If you don't know something (family size, personality, hobbies, life situations), do NOT mention it.
2. NEVER use the same theme, angle, or specific detail that appears in previous cards for this recipient. If Greek roots was used before, find a completely different angle.
3. Never open with relationship duration. Never use greeting card clichés ("wishing you all the best", "on your special day", etc.).
4. Sign with exactly the name provided — never add a last name or change it.`;

  const userPrompt = `Write a ${tone} ${eventType} card from ${signatureName} to ${recipientName}. Sign it exactly as "${signatureName}" — nothing more.

${context}

Keep it to 3–6 sentences. Personal, specific, grounded only in the facts provided. Return only the card text, no quotes, no labels.`;

  const usesMockAI = !process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (usesMockAI) {
    // Placeholder response for when OpenAI is not connected
    const mock = `${recipientName} — ${eventType === "Mother's Day" ? "watching you be a mom is one of the privileges of my life" : eventType === "Birthday" ? "another year and you somehow keep getting better" : eventType === "Anniversary" ? "I'd pick you again in every version of this life" : "I don't say this enough, but I mean it every time"
      }. ${customNotes ? `${customNotes}. ` : ""}You make everything better, and I don't take that for granted. — ${signatureName}`;

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

// ─── AI card suggestion ───────────────────────────────────────────────────────

router.post("/admin/suggest-card", async (req, res) => {
  const {
    eventType = "",
    interests = [] as string[],
    relationship = "",
    personalityNotes = "",
    recipientName = "",
  } = req.body;

  // 1. Fetch the full card catalog
  let allCards: { id: string; name: string; imageUrl?: string; category?: string }[] = [];
  try {
    allCards = await handwryttenService.listCards() as typeof allCards;
  } catch (err) {
    req.log.error({ err }, "suggest-card: failed to fetch cards");
    res.status(500).json({ error: "Could not fetch Handwrytten cards" });
    return;
  }

  // 2. Score cards — keyword match on event + interests → pick best 40
  const eventKeywords: string[] = [];
  const et = String(eventType).toLowerCase();
  if (et.includes("birthday")) eventKeywords.push("birthday", "bday", "celebrate");
  if (et.includes("anniversary")) eventKeywords.push("anniversary", "love", "together");
  if (et.includes("mother")) eventKeywords.push("mom", "mother", "mama");
  if (et.includes("valentine")) eventKeywords.push("valentine", "love", "heart", "romance");
  if (et.includes("christmas") || et.includes("holiday")) eventKeywords.push("christmas", "holiday", "season");
  if (et.includes("thanksgiving")) eventKeywords.push("thanks", "gratitude", "thankful");
  if (et.includes("father")) eventKeywords.push("dad", "father");
  if (et.includes("congratulations")) eventKeywords.push("congrats", "achievement", "celebrate");
  if (eventKeywords.length === 0) eventKeywords.push("greeting", "general", "occasion");

  const interestKeywords: string[] = [];
  const iArr = (interests as string[]).map((s) => s.toLowerCase());
  if (iArr.some((i) => i.includes("travel"))) interestKeywords.push("travel", "adventure", "explore", "world", "journey");
  if (iArr.some((i) => i.includes("food"))) interestKeywords.push("food", "cooking", "chef", "kitchen", "garden");
  if (iArr.some((i) => i.includes("fitness"))) interestKeywords.push("sport", "active", "health", "run");
  if (iArr.some((i) => i.includes("nature"))) interestKeywords.push("floral", "flower", "garden", "botanical", "nature", "leaf");
  if (iArr.some((i) => i.includes("music"))) interestKeywords.push("music", "melody", "song");
  if (iArr.some((i) => i.includes("animals") || i.includes("pets"))) interestKeywords.push("animal", "pet", "dog", "cat");
  if (iArr.some((i) => i.includes("movies") || i.includes("tv"))) interestKeywords.push("cinema", "film", "star");
  if (iArr.some((i) => i.includes("fashion"))) interestKeywords.push("fashion", "style", "elegant", "chic");
  if (iArr.some((i) => i.includes("reading") || i.includes("learning"))) interestKeywords.push("book", "read", "classic", "literary");
  if (iArr.some((i) => i.includes("family"))) interestKeywords.push("family", "home", "warmth");

  function scoreCard(card: { name: string; category?: string }) {
    const text = `${card.name} ${card.category ?? ""}`.toLowerCase();
    let score = 0;
    for (const kw of eventKeywords) if (text.includes(kw)) score += 2;
    for (const kw of interestKeywords) if (text.includes(kw)) score += 3;
    return score;
  }

  const scored = allCards
    .map((c) => ({ ...c, score: scoreCard(c) }))
    .sort((a, b) => b.score - a.score);

  // Take top 40 (prioritise scored > 0, then fill with random if needed)
  const topCards = scored.slice(0, 40);

  // 3. Build compact card list for GPT
  const cardList = topCards.map((c) => `${c.id}: ${c.name}`).join("\n");

  const systemPrompt = `You are a card selection assistant for "F" I Forgot — a concierge card service. Your job is to pick the single best Handwrytten card from the provided list for the given event and recipient.

Return ONLY valid JSON in exactly this format:
{ "cardId": "<exact id from list>", "reason": "<one sentence why this card fits>" }`;

  const userPrompt = `Pick the best card for:
- Recipient: ${recipientName}
- Event: ${eventType}
- Relationship: ${relationship}
- Interests: ${(interests as string[]).join(", ") || "not specified"}
- Personality: ${personalityNotes || "not specified"}

Available cards (id: name):
${cardList}

Pick the card that best matches the event type first, then secondarily reflects her interests and personality. Return only the JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: { cardId: string; reason: string };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      req.log.error({ raw }, "suggest-card: failed to parse GPT JSON");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const card = allCards.find((c) => String(c.id) === String(parsed.cardId));
    res.json({
      cardId: parsed.cardId,
      cardName: card?.name ?? parsed.cardId,
      imageUrl: card?.imageUrl ?? "",
      reason: parsed.reason,
    });
  } catch (err) {
    req.log.error({ err }, "suggest-card: OpenAI failed");
    res.status(500).json({ error: "AI card selection failed" });
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
