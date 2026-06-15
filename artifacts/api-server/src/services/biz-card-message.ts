import { openai } from "../lib/openai";
import { logger } from "../lib/logger";

function yearsPhrase(eventDate: string): string {
  const then = new Date(eventDate);
  const now  = new Date();
  const diff = now.getFullYear() - then.getFullYear();
  const adj  = now < new Date(now.getFullYear(), then.getMonth(), then.getDate()) ? diff - 1 : diff;
  const n    = Math.max(1, adj);
  const words: Record<number, string> = { 1:"one", 2:"two", 3:"three", 4:"four", 5:"five", 6:"six", 7:"seven", 8:"eight", 9:"nine", 10:"ten" };
  return words[n] ?? `${n}`;
}

export async function generateBizCardMessage(opts: {
  businessType: string;
  tone: string;
  relationship: string;
  eventType: string;
  eventDate?: string;
  cardSignature?: string;
}): Promise<string> {
  const primaryMoment =
    opts.eventType === "Happy Holidays" ? "holiday"
    : opts.eventType === "Birthday"     ? "birthday"
    : opts.eventType === "Anniversary"  ? "client anniversary"
    : "general appreciation";

  const yearsContext = opts.eventDate && opts.eventType === "Anniversary"
    ? `The event date was ${opts.eventDate}. It has been exactly ${yearsPhrase(opts.eventDate)} year(s) since this date. Reference this milestone naturally in the message.`
    : "";

  const prompt = `You are writing a real physical greeting card message for a ${opts.businessType || "professional services"} business.

Card event: ${primaryMoment}
Business tone: ${opts.tone || "Warm Professional"}
Relationship type: ${opts.relationship || "Client"}
${yearsContext}

Write a single, short greeting card message (2–4 sentences max). Rules:
- Match the tone exactly: ${opts.tone || "Warm Professional"}
- Sound like a real card from a real business — warm but professional
- Never mention the business name or recipient name (those will be filled in separately)
- For client anniversary: mention the milestone duration if provided
- For birthdays: keep it warm and celebratory
- For holidays: write a warm, inclusive "Happy Holidays" message. NEVER mention Christmas, Hanukkah, Kwanzaa, or any specific holiday or religion. Always use "Happy Holidays" or "this holiday season" — nothing more specific.
- No fake emojis, no corporate buzzwords, no "we are pleased to"
- Write in first-person plural ("we")
- Output ONLY the message text. No quotes, no labels, no explanations.
${opts.cardSignature ? `- End the message with exactly this signature on a new line: "${opts.cardSignature}"` : "- Do not include a signature or sign-off."}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content?.trim()
      ?? "Wishing you a wonderful day. We truly value your continued trust and are grateful to be a part of your journey.";
  } catch (err) {
    logger.warn({ err }, "generateBizCardMessage: GPT call failed, using fallback");
    return "Wishing you a wonderful day. We truly value your continued trust and are grateful to be a part of your journey.";
  }
}
