import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const anthropic = new Anthropic({
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "placeholder",
});

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "placeholder",
});

const CACHE_PATH = "/tmp/fi-forgot-card-classifications.json";

const VALID_OCCASIONS = [
  "Birthday", "Anniversary", "Valentine's Day", "Mother's Day", "Father's Day",
  "Christmas", "Hanukkah", "Thanksgiving", "Easter", "New Year's",
  "Graduation", "Work Anniversary", "Get Well Soon", "Congratulations", "Just Because",
];

// Descriptive keyword categories the AI should tag each card with
const KEYWORD_GUIDE = `
Describe the card using keywords from these categories (pick all that apply):

STYLE: illustration, photograph, watercolor, bold, minimal, elegant, playful, modern, vintage, rustic, whimsical, abstract, typographic
IMAGERY: cake, candles, flowers, hearts, balloons, champagne, nature, animals, coffee, food, landscape, geometric
TONE: funny, heartfelt, sentimental, warm, sweet, humorous, romantic, uplifting, touching, lighthearted, serious
COLOR: colorful, pastel, dark, bright, muted, red, pink, blue, gold, green, black-and-white
GENDER LEAN: feminine, masculine, neutral
`;

export interface CardClassification {
  occasions: string[];           // union — either model tagged it
  confirmedOccasions: string[];  // intersection — both models agreed
  keywords: string[];            // union of all descriptive keywords from both models
  claudeKeywords: string[];      // Claude's keywords only
  gptKeywords: string[];         // GPT's keywords only
  skip: boolean;                 // either model says skip → skip
  classifiedAt: number;
  models: string[];              // which models contributed (e.g. ["claude", "gpt"])
}

const cache = new Map<string, CardClassification>();

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, CardClassification>;
      for (const [url, cls] of Object.entries(parsed)) {
        cache.set(url, cls);
      }
      logger.info({ count: cache.size }, "card-classifier: loaded cache from disk");
    }
  } catch (err) {
    logger.warn({ err }, "card-classifier: failed to load cache, starting fresh");
  }
}

function saveCache() {
  try {
    const obj: Record<string, CardClassification> = {};
    for (const [url, cls] of cache.entries()) {
      obj[url] = cls;
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(obj), "utf-8");
  } catch (err) {
    logger.warn({ err }, "card-classifier: failed to save cache");
  }
}

let savePending = false;
function scheduleSave() {
  if (savePending) return;
  savePending = true;
  setTimeout(() => {
    savePending = false;
    saveCache();
  }, 2000);
}

function detectMediaType(buf: Buffer): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp";
  return "image/jpeg";
}

// Claude's hard limit is 5 MB of base64-encoded data.
// Base64 adds ~37% overhead, so cap raw bytes at 3.5 MB (→ ~4.8 MB base64).
const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`Image too large for AI classification: ${buffer.byteLength} bytes`);
  }
  const mediaType = detectMediaType(buffer);
  return { data: buffer.toString("base64"), mediaType };
}

const CLASSIFICATION_PROMPT = `Look at this greeting card image and classify it.

Return a JSON object with exactly three fields:
- "occasions": array of occasion names this card is appropriate for. Choose ONLY from: ${VALID_OCCASIONS.join(", ")}
- "keywords": array of descriptive keywords (see guide below)
- "skip": true if this card should never be sent as a personal greeting (party invitations, wedding/newborn/pet loss/funeral cards); false otherwise

${KEYWORD_GUIDE}

BIRTHDAY — STRICT. Only tag if the card has explicit birthday imagery: candles, birthday cake, "Happy Birthday" text, party hats, festive balloons, or "bday". Floral or nature cards with NO birthday text = NOT Birthday.

VALENTINE'S DAY — mark if: hearts, romantic couple imagery, "I love you" text, red/pink roses as primary subject, Cupid, or clearly romantic message. Spring flowers with no romantic context = NOT Valentine's.

ANNIVERSARY — romantic couple imagery, milestone numbers, long-lasting love themes, or "happy anniversary" text.

JUST BECAUSE — catch-all for warm/friendly/general cards. Floral, nature photography, "thinking of you" = Just Because. Be generous.

MOTHER'S DAY — only if it explicitly says mom/mother. Flowers alone do NOT qualify.

CONGRATULATIONS — achievement imagery, trophies, ribbons, or explicit congratulations text. Floral cards alone = NOT this.

GRADUATION — caps/gowns, diplomas, "congrats grad" text only.

WORK ANNIVERSARY — years of service, employee appreciation, workplace milestones only.

GET WELL SOON — explicit healing/recovery imagery or text only.

CHRISTMAS/HANUKKAH/THANKSGIVING/EASTER/NEW YEAR'S — only with clear holiday-specific imagery or text.

Champagne/cheers → Congratulations, Anniversary, New Year's. NOT Birthday unless it also has candles/cake/"birthday" text.

Mark skip:true for: weddings, newborn/baby, pet memorial/loss, funerals, OR party invitations ("You're Invited", "Join Us For", "Birthday Party Invitation", event-invite layouts).

Return ONLY valid JSON. No explanation, no markdown.`;

interface RawResult {
  occasions: string[];
  keywords: string[];
  skip: boolean;
}

function parseResult(text: string): RawResult {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { occasions?: unknown; keywords?: unknown; skip?: unknown }) : null;
  return {
    occasions: Array.isArray(parsed?.occasions)
      ? (parsed.occasions as unknown[]).filter((o): o is string => typeof o === "string" && VALID_OCCASIONS.includes(o))
      : [],
    keywords: Array.isArray(parsed?.keywords)
      ? (parsed.keywords as unknown[]).filter((k): k is string => typeof k === "string").map(k => k.toLowerCase().trim())
      : [],
    skip: parsed?.skip === true,
  };
}

async function classifyWithClaude(imageData: string, mediaType: string): Promise<RawResult | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: imageData } },
          { type: "text", text: CLASSIFICATION_PROMPT },
        ],
      }],
    });
    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    return parseResult(text);
  } catch (err) {
    logger.warn({ err }, "card-classifier: Claude classification failed");
    return null;
  }
}

async function classifyWithGPT(imageData: string, mediaType: string): Promise<RawResult | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageData}` } },
          { type: "text", text: CLASSIFICATION_PROMPT },
        ],
      }],
    });
    const text = response.choices[0]?.message?.content ?? "";
    return parseResult(text);
  } catch (err) {
    logger.warn({ err }, "card-classifier: GPT classification failed");
    return null;
  }
}

function mergeResults(claude: RawResult | null, gpt: RawResult | null): Omit<CardClassification, "classifiedAt"> {
  const claudeOcc = new Set(claude?.occasions ?? []);
  const gptOcc = new Set(gpt?.occasions ?? []);
  const allOccasions = [...new Set([...claudeOcc, ...gptOcc])];
  const confirmedOccasions = allOccasions.filter(o => claudeOcc.has(o) && gptOcc.has(o));

  const claudeKw = claude?.keywords ?? [];
  const gptKw = gpt?.keywords ?? [];
  const allKeywords = [...new Set([...claudeKw, ...gptKw])];

  const models: string[] = [];
  if (claude) models.push("claude");
  if (gpt) models.push("gpt");

  return {
    occasions: allOccasions,
    confirmedOccasions,
    keywords: allKeywords,
    claudeKeywords: claudeKw,
    gptKeywords: gptKw,
    skip: (claude?.skip ?? false) || (gpt?.skip ?? false),
    models,
  };
}

export async function classifyCard(imageUrl: string): Promise<CardClassification> {
  if (cache.has(imageUrl)) return cache.get(imageUrl)!;

  try {
    const { data, mediaType } = await fetchImageAsBase64(imageUrl);

    // Run both models in parallel
    const [claude, gpt] = await Promise.all([
      classifyWithClaude(data, mediaType),
      classifyWithGPT(data, mediaType),
    ]);

    if (!claude && !gpt) throw new Error("Both models failed");

    const merged = mergeResults(claude, gpt);
    const result: CardClassification = { ...merged, classifiedAt: Date.now() };

    logger.debug({
      imageUrl: imageUrl.split("/").pop(),
      models: result.models,
      confirmed: result.confirmedOccasions,
      all: result.occasions,
      keywords: result.keywords.slice(0, 8),
      skip: result.skip,
    }, "card-classifier: classified");

    cache.set(imageUrl, result);
    scheduleSave();
    return result;
  } catch (err) {
    logger.warn({ err, imageUrl }, "card-classifier: failed to classify card, skipping");
    const fallback: CardClassification = {
      occasions: [], confirmedOccasions: [], keywords: [],
      claudeKeywords: [], gptKeywords: [], skip: false,
      classifiedAt: Date.now(), models: [],
    };
    cache.set(imageUrl, fallback);
    return fallback;
  }
}

export function getCachedClassification(imageUrl: string): CardClassification | undefined {
  return cache.get(imageUrl);
}

export function hasCachedClassification(imageUrl: string): boolean {
  return cache.has(imageUrl);
}

export interface ClassificationStats {
  totalEntries: number;
  skipped: number;
  classified: number;
  dualModel: number;
  singleModel: number;
  byOccasion: Array<{
    occasion: string;
    total: number;
    confirmed: number;
  }>;
  uniqueKeywords: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  scanInProgress: boolean;
}

export function getClassificationStats(): ClassificationStats {
  const entries = Array.from(cache.values());
  const skipped = entries.filter(e => e.skip).length;
  const classified = entries.filter(e => !e.skip);
  const dualModel = classified.filter(e => (e.models?.length ?? 0) >= 2).length;
  const singleModel = classified.filter(e => (e.models?.length ?? 0) === 1).length;

  const occasionTotals: Record<string, number> = {};
  const confirmedTotals: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};

  for (const e of classified) {
    for (const occ of (e.occasions ?? [])) {
      occasionTotals[occ] = (occasionTotals[occ] ?? 0) + 1;
    }
    for (const occ of (e.confirmedOccasions ?? [])) {
      confirmedTotals[occ] = (confirmedTotals[occ] ?? 0) + 1;
    }
    for (const kw of (e.keywords ?? [])) {
      keywordCounts[kw] = (keywordCounts[kw] ?? 0) + 1;
    }
  }

  const byOccasion = Object.entries(occasionTotals)
    .map(([occasion, total]) => ({ occasion, total, confirmed: confirmedTotals[occasion] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const topKeywords = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  return {
    totalEntries: entries.length,
    skipped,
    classified: classified.length,
    dualModel,
    singleModel,
    byOccasion,
    uniqueKeywords: Object.keys(keywordCounts).length,
    topKeywords,
    scanInProgress: isScanInProgress(),
  };
}

let _scanInProgress = false;
export function setScanInProgress(v: boolean) { _scanInProgress = v; }
export function isScanInProgress() { return _scanInProgress; }

// ── Periodic rescan ────────────────────────────────────────────────────────────

const STALE_AFTER_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const RESCAN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // weekly

let scanRunning = false;

async function runScan(cards: Array<{ imageUrl?: string | null }>, reason: string): Promise<void> {
  if (scanRunning) return;
  scanRunning = true;

  const now = Date.now();
  const activeUrls = new Set(
    cards.filter(c => c.imageUrl?.startsWith("http")).map(c => c.imageUrl!)
  );

  let pruned = 0;
  for (const url of cache.keys()) {
    if (!activeUrls.has(url)) { cache.delete(url); pruned++; }
  }
  if (pruned > 0) {
    logger.info({ pruned }, "card-classifier: pruned removed cards from cache");
    scheduleSave();
  }

  const toProcess = [...activeUrls].filter(url => {
    const cached = cache.get(url);
    // Also re-classify old entries that pre-date the dual-model upgrade (no confirmedOccasions field)
    if (!cached) return true;
    if (!("confirmedOccasions" in cached)) return true;
    return now - cached.classifiedAt > STALE_AFTER_MS;
  });

  if (toProcess.length === 0) {
    logger.info({ reason }, "card-classifier: catalog up-to-date, nothing to classify");
    scanRunning = false;
    return;
  }

  logger.info({ total: toProcess.length, reason }, "card-classifier: scan started (Claude + GPT)");

  const CONCURRENCY = 3;
  let i = 0;
  async function worker(): Promise<void> {
    while (i < toProcess.length) {
      const url = toProcess[i++];
      if (cache.has(url)) cache.delete(url);
      await classifyCard(url);
      await new Promise(r => setTimeout(r, 300)); // slightly longer gap for two API calls per card
    }
  }

  setScanInProgress(true);
  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    logger.info({ classified: toProcess.length, reason }, "card-classifier: scan complete");
  } catch (err) {
    logger.warn({ err }, "card-classifier: scan encountered errors");
  } finally {
    setScanInProgress(false);
    scanRunning = false;
  }
}

/** Fire-and-forget: classify any uncached cards now. */
export function warmClassificationCache(cards: Array<{ imageUrl?: string | null }>): void {
  void runScan(cards, "warmup");
}

let rescanTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Call once on startup. Runs an initial rescan after 60 s, then weekly —
 * picking up new cards, pruning removed ones, and refreshing stale ones.
 * Also re-classifies any entries that pre-date the dual-model upgrade.
 */
export function startPeriodicRescan(
  fetchCards: () => Promise<Array<{ imageUrl?: string | null }>>
): void {
  if (rescanTimer) return;

  async function runWithFetch(reason: string) {
    try {
      const cards = await fetchCards();
      await runScan(cards, reason);
    } catch (err) {
      logger.warn({ err }, "card-classifier: periodic rescan failed to fetch cards");
    }
  }

  setTimeout(() => void runWithFetch("scheduled-initial"), 60_000);
  rescanTimer = setInterval(() => void runWithFetch("scheduled-weekly"), RESCAN_INTERVAL_MS);
  logger.info("card-classifier: dual-model periodic rescan scheduled (Claude + GPT, every 7 days)");
}

loadCache();
