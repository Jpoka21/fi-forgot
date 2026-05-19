import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../lib/logger";

const anthropic = new Anthropic({
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "placeholder",
});

const CACHE_PATH = "/tmp/fi-forgot-card-classifications.json";

const VALID_OCCASIONS = [
  "Birthday", "Anniversary", "Valentine's Day", "Mother's Day", "Father's Day",
  "Christmas", "Hanukkah", "Thanksgiving", "Easter", "New Year's",
  "Graduation", "Work Anniversary", "Get Well Soon", "Congratulations", "Just Because",
];

export interface CardClassification {
  occasions: string[];
  skip: boolean;
  classifiedAt: number;
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
  // Detect from magic bytes — don't trust the CDN's Content-Type header
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp";
  return "image/jpeg";
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mediaType = detectMediaType(buffer);
  return { data: buffer.toString("base64"), mediaType };
}

export async function classifyCard(imageUrl: string): Promise<CardClassification> {
  if (cache.has(imageUrl)) return cache.get(imageUrl)!;

  try {
    const { data, mediaType } = await fetchImageAsBase64(imageUrl);

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data },
            },
            {
              type: "text",
              text: `Look at this greeting card image and classify it.

Return a JSON object with exactly two fields:
- "occasions": an array of occasion names this card is appropriate to send for. Choose ONLY from this list: ${VALID_OCCASIONS.join(", ")}
- "skip": true if this card is primarily for weddings, newborns/babies, pet loss/memorial, funerals, or bereavement — these should never be sent; false otherwise

Classification rules:
- Be GENEROUS — a card can belong to multiple occasions if it could reasonably work.
- Mark as "Valentine's Day" if the card has ANY of: hearts, romantic imagery, love birds, a couple, "I love you" text, pink/red roses as the main motif, Cupid, hugging figures, or a romantic message. Do NOT require the word "Valentine" to be present.
- Mark as "Anniversary" if the card has romantic imagery between two people, milestone celebration, long-lasting love themes.
- Mark as "Just Because" if it's a general warm/friendly card that doesn't fit a specific occasion.
- Mark as "Birthday" if it has candles, cake, "birthday" text, confetti, or a celebration feel.
- A champagne/cheers card works for: Birthday, Congratulations, Anniversary, New Year's — but NOT Valentine's Day unless it also has hearts/love imagery.
- A floral/nature card with soft pinks/reds and no specific messaging → Valentine's Day AND Just Because AND Birthday are all valid.
- Mark "skip": true ONLY for: weddings (rings, bride/groom), newborn/baby, pet memorial/loss, funeral/sympathy for a person's death.

Return ONLY valid JSON. No explanation, no markdown.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { occasions?: unknown; skip?: unknown }) : null;

    const result: CardClassification = {
      occasions: Array.isArray(parsed?.occasions)
        ? (parsed.occasions as unknown[]).filter((o): o is string => typeof o === "string" && VALID_OCCASIONS.includes(o))
        : [],
      skip: parsed?.skip === true,
      classifiedAt: Date.now(),
    };

    cache.set(imageUrl, result);
    scheduleSave();
    return result;
  } catch (err) {
    logger.warn({ err, imageUrl }, "card-classifier: failed to classify card, skipping");
    const fallback: CardClassification = { occasions: [], skip: false, classifiedAt: Date.now() };
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

let warmupRunning = false;

export async function warmClassificationCache(
  cards: Array<{ imageUrl?: string | null }>
): Promise<void> {
  if (warmupRunning) return;
  warmupRunning = true;

  const uncached = cards.filter(
    c => c.imageUrl && c.imageUrl.startsWith("http") && !cache.has(c.imageUrl)
  );

  if (uncached.length === 0) {
    logger.info("card-classifier: all cards already classified");
    warmupRunning = false;
    return;
  }

  logger.info({ total: uncached.length }, "card-classifier: starting background warmup");

  const CONCURRENCY = 3;
  let i = 0;

  async function worker(): Promise<void> {
    while (i < uncached.length) {
      const card = uncached[i++];
      if (!card.imageUrl) continue;
      await classifyCard(card.imageUrl);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    logger.info({ classified: uncached.length }, "card-classifier: warmup complete");
  } catch (err) {
    logger.warn({ err }, "card-classifier: warmup encountered errors");
  }
  warmupRunning = false;
}

loadCache();
