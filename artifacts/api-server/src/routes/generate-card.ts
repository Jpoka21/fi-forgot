import { Router } from "express";
import { openai } from "../lib/openai";

const router = Router();

interface BriefingAnswer {
  questionKey: string;
  question: string;
  answer: string;
}

interface PastBriefing {
  event: string;
  year: number;
  answers: BriefingAnswer[];
}

router.post("/generate-card", async (req, res) => {
  const {
    recipientName,
    relationship,
    holiday,
    personalityNotes,
    interests = [],
    tonePreference,
    petName,
    insideJokes,
    yearsTogther,
    kidsNames,
    favoriteMemories,
    thingsToAvoid,
    emotionalLevel,
    senderName = "Mike",
    // Briefing data
    eventBriefing = [] as BriefingAnswer[],
    recipientHistory = [] as PastBriefing[],
  } = req.body as {
    recipientName?: string;
    relationship?: string;
    holiday?: string;
    personalityNotes?: string;
    interests?: string[];
    tonePreference?: string;
    petName?: string;
    insideJokes?: string;
    yearsTogther?: string;
    kidsNames?: string;
    favoriteMemories?: string;
    thingsToAvoid?: string;
    emotionalLevel?: number;
    senderName?: string;
    eventBriefing?: BriefingAnswer[];
    recipientHistory?: PastBriefing[];
  };

  if (!recipientName || !holiday) {
    res.status(400).json({ error: "recipientName and holiday are required" });
    return;
  }

  const contextLines: string[] = [];

  // ── Core profile ──────────────────────────────────────────────────────────
  if (relationship) contextLines.push(`- Relationship to sender: ${relationship}`);
  if (personalityNotes) contextLines.push(`- Her personality: ${personalityNotes}`);
  if (interests.length > 0) contextLines.push(`- Her interests: ${interests.join(", ")}`);
  if (tonePreference) contextLines.push(`- Preferred card tone: ${tonePreference}`);
  if (emotionalLevel) contextLines.push(`- Emotional depth (1=low, 5=high): ${emotionalLevel}`);
  if (kidsNames) contextLines.push(`- Her children (names & ages): ${kidsNames}`);
  if (favoriteMemories) contextLines.push(`- Favorite shared memories: ${favoriteMemories}`);
  if (insideJokes) contextLines.push(`- Inside references or pet names: ${insideJokes}`);
  if (petName && !insideJokes?.includes(petName)) contextLines.push(`- Pet name / nickname: "${petName}"`);
  if (yearsTogther) contextLines.push(`- [BACKGROUND ONLY - do NOT state this in the card] How long they've been together: ${yearsTogther}`);
  if (thingsToAvoid) contextLines.push(`- NEVER include: ${thingsToAvoid}`);

  // ── This card's personalization briefing (Q&A answered by the sender) ────
  const activeBriefingItems = (eventBriefing ?? []).filter((a: BriefingAnswer) => a.answer?.trim());
  if (activeBriefingItems.length > 0) {
    contextLines.push(`\n--- Personalization for this ${holiday} card (answers provided by sender) ---`);
    for (const a of activeBriefingItems) {
      contextLines.push(`  ${a.question}: ${a.answer}`);
    }
  }

  // ── Everything we know from past briefings (cumulative recipient profile) ─
  const historyWithAnswers = (recipientHistory ?? [])
    .map((b: PastBriefing) => ({ ...b, answers: b.answers.filter((a: BriefingAnswer) => a.answer?.trim()) }))
    .filter((b: PastBriefing) => b.answers.length > 0);

  if (historyWithAnswers.length > 0) {
    contextLines.push(`\n--- What we've learned about ${recipientName} from past cards (use as background color) ---`);
    for (const b of historyWithAnswers) {
      contextLines.push(`  [${b.event} ${b.year}]`);
      for (const a of b.answers) {
        contextLines.push(`    ${a.question}: ${a.answer}`);
      }
    }
  }

  const context = contextLines.length > 0
    ? `Here is what we know about ${recipientName}:\n${contextLines.join("\n")}`
    : "";

  const systemPrompt = `You are a professional greeting card writer for "F" I Forgot — a concierge card service that writes genuinely great, personalized cards for men to send to the important women in their lives.

Your cards sound like the man himself wrote them — personal, specific, never generic. You are NOT a greeting card company. You write like a real person who actually knows her.

Rules:
- NEVER open a card by stating how long they've been together. Use relationship length as background context to inform the emotional depth, but never as an opening line. The reader knows how long they've been together.
- NEVER use greeting card clichés ("words cannot express", "on this special day", "from the bottom of my heart")
- Each of the 3 versions must have a completely different opening line — vary the structure, not just the words
- Reference specific details from her profile when possible — interests, kids, personality, memories
- If briefing answers are provided, use them as the primary raw material — these are real details the sender gave us and they MUST show up in the card
- If she has children listed, naturally reference her role as a mom when relevant
- If kids' ages are provided, you can infer how long she has been a mom
- Background history from past cards should inform tone and depth — don't repeat what's old news, use it to write like someone who truly knows her
- Cards should feel earned, not manufactured
- Sign as "${senderName ?? "Mike"}"`;

  const userPrompt = `Write exactly 3 versions of a ${holiday} card for ${recipientName}.

${context}

Write each card as the sender (${senderName ?? "Mike"}) speaking directly to her. Make each version genuinely distinct — different opening, different angle, different emotional register:

1. SWEET — Warm, genuine, heartfelt. Shows real appreciation without being over-the-top. Notices the small things.
2. FUNNY — Self-aware and charming. Makes her laugh, gently pokes fun at the sender (never her), but still lands with real feeling underneath.
3. ROMANTIC — Goes bigger. Sweeping and emotional, the version she'd screenshot and send to her friends.

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
      model: "gpt-4o",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: { cards: { tone: string; text: string }[] };
    try {
      // Extract the outermost JSON object (handles markdown fences or preamble)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let jsonStr = jsonMatch ? jsonMatch[0] : raw;

      // Attempt 1: parse as-is
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        // Attempt 2: repair common truncation — missing closing } for last card
        // Pattern: last card ends without }, before the closing ]
        jsonStr = jsonStr
          .replace(/("text"\s*:\s*"(?:[^"\\]|\\.)*")\s*\n?\s*\]/g, '$1\n    }]')
          .replace(/\}\s*\]\s*$/, "}]}")  // ensure outer object closes
          .trim();
        if (!jsonStr.endsWith("}")) jsonStr += "}";
        parsed = JSON.parse(jsonStr);
      }
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
