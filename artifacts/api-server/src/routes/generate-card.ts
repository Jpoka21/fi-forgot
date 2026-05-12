import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

router.post("/generate-card", async (req, res) => {
  const {
    recipientName,
    relationship,
    holiday,
    personality = [],
    interests = [],
    tone,
    petName,
    yearsTogther,
    thingsToAvoid,
  } = req.body;

  if (!recipientName || !holiday) {
    res.status(400).json({ error: "recipientName and holiday are required" });
    return;
  }

  const contextLines: string[] = [];
  if (relationship) contextLines.push(`- Relationship: ${relationship}`);
  if (personality.length > 0) contextLines.push(`- Personality: ${personality.join(", ")}`);
  if (interests.length > 0) contextLines.push(`- Interests & loves: ${interests.join(", ")}`);
  if (tone) contextLines.push(`- Preferred card tone: ${tone}`);
  if (petName) contextLines.push(`- Pet name / nickname: "${petName}"`);
  if (yearsTogther) contextLines.push(`- Time together: ${yearsTogther}`);
  if (thingsToAvoid) contextLines.push(`- Things to NEVER include: ${thingsToAvoid}`);

  const context = contextLines.length > 0
    ? `Here is what we know about her:\n${contextLines.join("\n")}`
    : "";

  const systemPrompt = `You are a professional greeting card writer for "F" I Forgot — a service that helps forgetful men send genuinely great cards to the important women in their lives. Your tone ranges from heartfelt and sincere to funny and self-aware, but always warm. Never corny. Never cliché. Never generic.

You write cards as if the man himself wrote them — in his voice, not yours. The cards should feel personal, specific, and earned.

Always sign the card as "Mike" unless a different name is specified.`;

  const userPrompt = `Write exactly 3 versions of a ${holiday} card for ${recipientName}.

${context}

Write each card as the man speaking directly to her. Make each version distinct in tone:
1. SWEET — Warm, genuine, heartfelt. Shows real appreciation without being over-the-top.
2. FUNNY — Self-aware and charming. Makes her laugh, pokes fun at the sender (not her), but still lands with real feeling underneath.
3. ROMANTIC — Goes big. Sweeping, emotional, the version she'd screenshot and send to her friends.

Return your response as a valid JSON object in exactly this format:
{
  "cards": [
    { "tone": "Sweet", "text": "..." },
    { "tone": "Funny", "text": "..." },
    { "tone": "Romantic", "text": "..." }
  ]
}

Use \\n for line breaks within card text. Do not include markdown. Return only the JSON object, nothing else.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: { cards: { tone: string; text: string }[] };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      req.log.error({ raw }, "Failed to parse OpenAI JSON response");
      res.status(500).json({ error: "Failed to parse card response" });
      return;
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "OpenAI card generation failed");
    res.status(500).json({ error: "Card generation failed" });
  }
});

export default router;
