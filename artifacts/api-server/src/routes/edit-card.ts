import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

router.post("/edit-card", async (req, res) => {
  const { recipientName, holiday, tone, currentCardText, instruction } = req.body;

  if (!currentCardText || !instruction) {
    res.status(400).json({ error: "currentCardText and instruction are required" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are a professional greeting card writer for "F" I Forgot. You edit existing card drafts based on instructions. Keep the same recipient (${recipientName}), occasion (${holiday}), and general tone (${tone}), but apply the instruction precisely. Return only the revised card text — no commentary, no labels, no extra formatting.`,
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
