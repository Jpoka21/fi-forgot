import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "placeholder",
});

const QUICK_ACTIONS: Record<string, string> = {
  funnier:    "Rewrite this to be funnier and more playful. Keep the warmth but add some humor or a light joke.",
  sweeter:    "Rewrite this to be more heartfelt, warm, and emotionally touching. Keep the core sentiment but make it feel more tender.",
  shorter:    "Shorten this message significantly — cut it to 2-3 sentences max while keeping the core emotion and sign-off.",
  formal:     "Rewrite this to sound more polished and professional, suitable for a colleague or client relationship.",
  personal:   "Rewrite this to sound more personal and specific. Add warmth that feels like it comes from someone who really knows this person.",
};

router.post("/demo-preview/refine-message", async (req, res) => {
  const { message, instruction, action, recipientName, relationship, occasion, personality } = req.body as {
    message?: string;
    instruction?: string;
    action?: string;
    recipientName?: string;
    relationship?: string;
    occasion?: string;
    personality?: string;
  };

  if (!message || (!instruction && !action)) {
    res.status(400).json({ error: "missing_fields", message: "message and instruction or action are required." });
    return;
  }

  const resolvedInstruction = action
    ? (QUICK_ACTIONS[action] ?? `Rewrite this message to be more ${action}.`)
    : instruction!;

  const systemPrompt = `You are a professional greeting card message writer. You rewrite card messages based on user instructions while preserving the core intent.

Context:
- Recipient: ${recipientName ?? "the recipient"}
- Relationship: ${relationship ?? "friend"}
- Occasion: ${occasion ?? "a special occasion"}
- Personality style: ${personality ?? "warm and nurturing"}

Rules:
- Keep "[Your Name]" at the end as the sign-off placeholder
- Keep "Dear ${recipientName ?? "recipient"}," as the greeting if present
- Do NOT add generic filler like "I hope this message finds you well"
- Do NOT explain what you changed — just return the new message text
- Keep the handwritten card format (short paragraphs, line breaks between them)`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the current card message:\n\n${message}\n\nInstruction: ${resolvedInstruction}\n\nReturn only the rewritten message text, nothing else.`,
        },
      ],
    });

    const block = response.content[0];
    const refined = block.type === "text" ? block.text.trim() : message;
    res.json({ message: refined });
  } catch (err) {
    req.log.error({ err }, "Message refinement failed");
    res.status(500).json({ error: "ai_error", message: "Could not refine the message right now. Try again in a moment." });
  }
});

export default router;
