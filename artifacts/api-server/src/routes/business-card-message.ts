import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

function yearsPhrase(eventDate: string): string {
  const then = new Date(eventDate);
  const now  = new Date();
  const diff = now.getFullYear() - then.getFullYear();
  const adj  = now < new Date(now.getFullYear(), then.getMonth(), then.getDate()) ? diff - 1 : diff;
  const n    = Math.max(1, adj);
  const words: Record<number, string> = { 1:"one", 2:"two", 3:"three", 4:"four", 5:"five", 6:"six", 7:"seven", 8:"eight", 9:"nine", 10:"ten" };
  return words[n] ?? `${n}`;
}

router.post("/business-card-message", async (req, res) => {
  const {
    businessType,
    tone,
    relationshipCategory,
    relationshipLength,
    moments,
    eventDate,
  } = req.body as {
    businessType: string;
    tone: string;
    relationshipCategory: string;
    relationshipLength: string;
    moments: string[];
    eventDate?: string;
  };

  const primaryMoment = moments?.includes("Holiday / Christmas Cards")   ? "holiday"
    : moments?.includes("Birthdays")                                      ? "birthday"
    : moments?.includes("Referral Thank You Cards")                       ? "referral"
    : moments?.includes("Client Anniversaries")                           ? "client anniversary"
    : moments?.includes("Home Purchase Anniversaries")                    ? "home purchase anniversary"
    : "general appreciation";

  const yearsContext = eventDate
    ? `The event date was ${eventDate}. It has been exactly ${yearsPhrase(eventDate)} year(s) since this date. Reference this milestone naturally in the message.`
    : "";

  const prompt = `You are writing a real physical greeting card message for a ${businessType} business.

Card event: ${primaryMoment}
Business tone: ${tone}
Relationship type: ${relationshipCategory}
Relationship length: ${relationshipLength}
${yearsContext}

Write a single, short greeting card message (2–4 sentences max). Rules:
- Match the tone exactly: ${tone}
- Sound like a real card from a real business — warm but professional
- Never mention the business name or recipient name (those will be filled in separately)
- For home purchase anniversary: naturally mention how many years it has been since they got their home — make it feel warm and celebratory
- For client anniversary: mention the milestone duration if provided
- For birthdays: keep it warm and celebratory
- For holidays: keep it seasonal and sincere
- For referrals: express genuine gratitude
- No fake emojis, no corporate buzzwords, no "we are pleased to"
- Write in first-person plural ("we") 
- Output ONLY the message text. No quotes, no labels, no explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const message = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ message });
  } catch (err) {
    req.log.error({ err }, "Failed to generate card message");
    res.status(500).json({ error: "Failed to generate message" });
  }
});

export default router;
