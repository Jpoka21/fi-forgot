import { Router } from "express";
import { openai } from "../lib/openai";
import { BANNED_PHRASES_SYSTEM, buildRelRules } from "./v2-generate-card";

const router = Router();

router.post("/edit-card", async (req, res) => {
  const {
    recipientName,
    holiday,
    tone,
    relationship = "friend",
    currentCardText,
    instruction,
  } = req.body;

  if (!currentCardText || !instruction) {
    res.status(400).json({ error: "currentCardText and instruction are required" });
    return;
  }

  const relRule = buildRelRules(relationship, holiday ?? "");
  const bannedList = BANNED_PHRASES_SYSTEM.map(p => `"${p}"`).join(", ");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are a professional greeting card writer for "F" I Forgot. You edit existing card drafts based on instructions.

Keep the same recipient (${recipientName}), occasion (${holiday}), and general tone (${tone}), but apply the edit instruction precisely.

${relRule}

BANNED PHRASES — do not introduce any of these into the edited card:
${bannedList}

If the edit instruction would require using a banned phrase or generic filler, fulfill the intent in a more specific, personal way. For example: if asked to "make it warmer," add warmth through a specific detail or observation — not through phrases like "you mean so much to me." If asked to "make it more heartfelt," go deeper on the specific references already in the card — do not swap them out for declarations.

Return only the revised card text — no commentary, no labels, no extra formatting.`,
        },
        {
          role: "user",
          content: `Here is the current card:\n\n${currentCardText}\n\nInstruction: ${instruction}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? currentCardText;
    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "OpenAI card edit failed");
    res.status(500).json({ error: "Card edit failed" });
  }
});

export default router;
