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

  // ── Derive pronouns + romantic context from relationship ─────────────────
  const rel = (relationship ?? "").toLowerCase();
  const isRomantic = ["wife","girlfriend","partner","fiancée","fiancee","spouse","husband","boyfriend"].some(r => rel.includes(r));
  const isFeminine = ["wife","girlfriend","mom","mother","sister","daughter","aunt","grandma","grandmother","fiancée","fiancee"].some(r => rel.includes(r));
  const isMasculine = ["husband","boyfriend","dad","father","brother","son","uncle","grandpa","grandfather","friend","buddy","best friend"].some(r => rel.includes(r)) && !isFeminine;
  const pronoun   = isFeminine ? "she" : isMasculine ? "he" : "they";
  const possessive = isFeminine ? "her" : isMasculine ? "his" : "their";
  const objective  = isFeminine ? "her" : isMasculine ? "him" : "them";
  const capPron   = pronoun.charAt(0).toUpperCase() + pronoun.slice(1);

  const contextLines: string[] = [];

  // ── Core profile ──────────────────────────────────────────────────────────
  if (relationship) contextLines.push(`- Relationship to sender: ${relationship}`);
  if (personalityNotes) contextLines.push(`- ${capPron} personality: ${personalityNotes}`);
  if (interests.length > 0) contextLines.push(`- ${capPron} interests: ${interests.join(", ")}`);
  if (tonePreference) contextLines.push(`- Preferred card tone: ${tonePreference}`);
  if (emotionalLevel) contextLines.push(`- Emotional depth (1=low, 5=high): ${emotionalLevel}`);
  if (kidsNames) contextLines.push(`- ${capPron} children (names & ages): ${kidsNames}`);
  if (favoriteMemories) contextLines.push(`- Favorite shared memories: ${favoriteMemories}`);
  if (insideJokes) contextLines.push(`- Inside references or shared history: ${insideJokes}`);
  if (petName && !insideJokes?.includes(petName)) contextLines.push(`- Nickname / pet name: "${petName}"`);
  if (yearsTogther) contextLines.push(`- [BACKGROUND ONLY - do NOT state this in the card] How long they've known each other: ${yearsTogther}`);
  if (thingsToAvoid) contextLines.push(`- NEVER include: ${thingsToAvoid}`);

  // ── This card's personalization briefing (Q&A answered by the sender) ────
  const activeBriefingItems = (eventBriefing ?? []).filter((a: BriefingAnswer) => a.answer?.trim());
  if (activeBriefingItems.length > 0) {
    contextLines.push(`\n--- Personalization for this ${holiday} card (specific details provided by the sender — USE THESE) ---`);
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

  // ── Tone variants — romantic relationships vs everyone else ───────────────
  const toneBlock = isRomantic
    ? `1. SWEET — Warm, genuine, heartfelt. Shows real appreciation without being over-the-top. Notices the small things.
2. FUNNY — Self-aware and charming. Makes ${objective} laugh, gently pokes fun at the sender (never ${objective}), but still lands with real feeling underneath.
3. ROMANTIC — Goes bigger. Sweeping and emotional, the version ${pronoun}'d screenshot and send to ${possessive} friends.`
    : `1. HEARTFELT — Genuine and warm. Shows you actually see them and what they mean to you. Not sappy, just real.
2. FUNNY — Captures the dynamic between you. Self-deprecating when needed. Makes them laugh but still says something true.
3. REAL TALK — Direct and sincere. The thing you'd actually say if you were better at saying it out loud.`;

  const toneNames = isRomantic
    ? ["Sweet", "Funny", "Romantic"]
    : ["Heartfelt", "Funny", "Real Talk"];

  const systemPrompt = `You are a professional greeting card writer for "F" I Forgot — a concierge card service that writes genuinely personalized cards people actually want to send.

Your cards sound like the sender themselves wrote them — specific, personal, never generic. You are NOT a Hallmark writer. You write like a real person who actually knows this person.

Rules:
- The recipient's relationship to the sender is: ${relationship ?? "someone important to them"}. Write accordingly — a card to a best friend reads nothing like a card to a spouse.
- NEVER open a card by stating how long they've known each other. Use that as background context for emotional depth only.
- NEVER use greeting card clichés ("words cannot express", "on this special day", "from the bottom of my heart")
- Each of the 3 versions must have a completely different opening line — vary the structure, not just the words
- If briefing answers are provided, they are the PRIMARY RAW MATERIAL. Every specific detail the sender gave us MUST appear in the cards — if they mentioned a specific memory, story, or moment, it goes in the card. Do not invent details when real ones are provided.
- Reference the relationship context — kids, shared history, personality — when relevant
- Cards should feel earned, not manufactured
- Sign as "${senderName ?? "Mike"}"`;

  const userPrompt = `Write exactly 3 versions of a ${holiday} card for ${recipientName}.

${context}

Write each card as the sender (${senderName ?? "Mike"}) speaking directly to ${objective}. Make each version genuinely distinct — different opening, different angle, different emotional register:

${toneBlock}

Return your response as a valid JSON object in exactly this format:
{
  "cards": [
    { "tone": "${toneNames[0]}", "text": "..." },
    { "tone": "${toneNames[1]}", "text": "..." },
    { "tone": "${toneNames[2]}", "text": "..." }
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
