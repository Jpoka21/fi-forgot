/**
 * Custom holiday card generator.
 *
 * Flow per card:
 *  1. Generate a card-front image via DALL-E 3
 *  2. Upload the image URL to Handwrytten (their CDN keeps it permanently)
 *  3. Fetch available card dimensions and create a custom Handwrytten card
 *  4. Store the resulting Handwrytten card ID in the custom_holiday_cards DB table
 */

import { openai } from "../lib/openai";
import { db } from "@workspace/db";
import { customHolidayCardsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { uploadCustomImage, createCustomHandwryttenCard, getCustomCardDimensions } from "./handwrytten";
import { logger } from "../lib/logger";


// ─── Card designs ────────────────────────────────────────────────────────────

const HOLIDAY_CARD_DESIGNS = [
  {
    name: "Winter Elegance",
    prompt:
      "A luxurious greeting card front. Deep navy blue background. Delicate hand-drawn snowflakes in gold and silver scattered across the card. A single elegant gold-foil geometric star at center. Fine gold border frame. No text anywhere on the card. Minimalist, premium, sophisticated. Portrait orientation, high resolution, print-ready quality.",
  },
  {
    name: "Warm Celebration",
    prompt:
      "An elegant holiday greeting card front. Rich champagne and warm amber tones. Two crystal champagne flutes with golden bubbles rising, surrounded by subtle gold confetti and ribbon swirls. Dark charcoal background with soft bokeh light. No text. Sophisticated and celebratory. Portrait orientation, high resolution, print-ready quality.",
  },
  {
    name: "Winter Dawn",
    prompt:
      "A serene and hopeful greeting card front. Soft watercolor-style winter landscape. Snow-covered pine trees silhouetted against a glowing dawn sky in muted golds, rose, and soft blues. Peaceful, forward-looking atmosphere suggesting renewal. No text anywhere. Premium fine-art style. Portrait orientation, high resolution, print-ready quality.",
  },
  {
    name: "Golden Season",
    prompt:
      "A rich and sophisticated greeting card front. Deep burgundy background with an intricate repeating pattern of gold geometric snowflakes and botanical winter branches. Thin gold border. No text. Looks like a luxury gift wrap or high-end stationery. Portrait orientation, high resolution, print-ready quality.",
  },
];

// ─── Generator ───────────────────────────────────────────────────────────────

export interface GeneratedHolidayCard {
  id: number;
  handwryttenCardId: string;
  name: string;
  imageUrl: string;
  occasion: string;
  active: boolean;
  generatedAt: number;
}

export interface GenerationResult {
  succeeded: GeneratedHolidayCard[];
  failed: { name: string; error: string }[];
}

/**
 * Generate all 4 holiday card designs and store them in the DB.
 * Idempotent by name — skips designs that already have an active card.
 * Pass `force: true` to regenerate everything.
 */
export async function generateHolidayCards(force = false): Promise<GenerationResult> {
  const result: GenerationResult = { succeeded: [], failed: [] };

  // Fetch available Handwrytten card dimensions (pick the first A2/portrait one)
  let dimensionId: string;
  try {
    const dims = await getCustomCardDimensions();
    const portrait = dims.find(
      d => d.orientation?.toLowerCase().includes("portrait") ||
           d.format?.toLowerCase().includes("a2") ||
           d.name?.toLowerCase().includes("portrait")
    ) ?? dims[0];
    if (!portrait) throw new Error("No card dimensions available");
    dimensionId = String(portrait.id);
    logger.info({ dimensionId, name: portrait.name }, "custom-card-generator: using dimension");
  } catch (err) {
    logger.error({ err }, "custom-card-generator: failed to fetch dimensions");
    return { succeeded: [], failed: HOLIDAY_CARD_DESIGNS.map(d => ({ name: d.name, error: "Could not fetch card dimensions" })) };
  }

  for (const design of HOLIDAY_CARD_DESIGNS) {
    // Skip if already generated (unless forced)
    if (!force) {
      const existing = await db
        .select()
        .from(customHolidayCardsTable)
        .where(eq(customHolidayCardsTable.name, design.name))
        .limit(1);
      if (existing.length > 0) {
        logger.info({ name: design.name }, "custom-card-generator: skipping existing card");
        result.succeeded.push(existing[0]! as GeneratedHolidayCard);
        continue;
      }
    }

    try {
      // Step 1: Generate image with gpt-image-1 (returns base64)
      logger.info({ name: design.name }, "custom-card-generator: generating image");
      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: design.prompt,
        n: 1,
        size: "1024x1536",
      } as any);

      const b64 = (imageResponse.data?.[0] as any)?.b64_json;
      if (!b64) throw new Error("gpt-image-1 returned no image data");
      const imageBuffer = Buffer.from(b64, "base64");
      logger.info({ name: design.name, bytes: imageBuffer.length }, "custom-card-generator: image generated");

      // Step 2: Upload buffer to Handwrytten
      const uploaded = await uploadCustomImage({ buffer: imageBuffer, imageType: "cover" });
      if (!uploaded.id) throw new Error("Handwrytten upload returned no image ID");
      logger.info({ name: design.name, imageId: uploaded.id }, "custom-card-generator: uploaded to Handwrytten");

      // Step 3: Create the custom card in Handwrytten
      const customCard = await createCustomHandwryttenCard({
        name: `FIF Holiday - ${design.name}`,
        dimensionId,
        coverId: uploaded.id,
      });
      if (!customCard.cardId) throw new Error("Handwrytten create returned no card ID");
      logger.info({ name: design.name, cardId: customCard.cardId }, "custom-card-generator: custom card created");

      // Step 4: Store in DB
      const now = Date.now();
      const [row] = await db
        .insert(customHolidayCardsTable)
        .values({
          handwryttenCardId: String(customCard.cardId),
          name: design.name,
          imageUrl: uploaded.imageUrl ?? "",
          occasion: "Happy Holidays",
          active: true,
          generatedAt: now,
        })
        .onConflictDoUpdate({
          target: customHolidayCardsTable.handwryttenCardId,
          set: {
            imageUrl: uploaded.imageUrl ?? "",
            active: true,
            generatedAt: now,
          },
        })
        .returning();

      result.succeeded.push(row as GeneratedHolidayCard);
      logger.info({ name: design.name, cardId: customCard.cardId }, "custom-card-generator: card stored in DB");

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err, name: design.name }, "custom-card-generator: failed");
      result.failed.push({ name: design.name, error: msg });
    }
  }

  return result;
}

// ─── Anniversary card (on-demand) ────────────────────────────────────────────

export interface GeneratedAnniversaryCard {
  handwryttenCardId: string;
  name: string;
  imageUrl: string;
}

/**
 * Generate a one-off custom anniversary card image tailored to the specific
 * message and context (home purchase, work anniversary, personal, etc.).
 *
 * Flow:
 *  1. Ask GPT to write a visual design brief from the message + context.
 *  2. Generate an image with gpt-image-1.
 *  3. Upload the buffer to Handwrytten.
 *  4. Create a custom Handwrytten card and return it.
 *
 * Not cached — every call produces a unique design.
 */
export async function generateCustomAnniversaryCard(
  contextNote: string | null,
  cardMessage: string,
): Promise<GeneratedAnniversaryCard> {
  // Step 1: GPT writes a tailored visual design brief
  const briefCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 300,
    messages: [
      {
        role: "system",
        content:
          `You write visual design briefs for premium physical greeting cards. ` +
          `Given an anniversary context and card message, describe a single cohesive card-front image. ` +
          `Rules: NO text or words in the image. Portrait orientation. Elegant, premium look. ` +
          `Tailor the scene to the anniversary type: ` +
          `home-purchase → architectural/house imagery; ` +
          `work anniversary → professional/milestone imagery (gold numbers, subtle office elements); ` +
          `personal/relationship → warm botanical or abstract celebratory imagery. ` +
          `Output ONLY the image generation prompt — one paragraph, vivid and specific, no preamble.`,
      },
      {
        role: "user",
        content: `Context: ${contextNote ?? "Anniversary"}\nCard message:\n${cardMessage}`,
      },
    ],
  });

  const imagePrompt = briefCompletion.choices[0]?.message?.content?.trim()
    ?? "An elegant, premium greeting card front. Gold foil abstract geometric shapes on deep navy background. No text. Portrait orientation, high resolution.";

  logger.info({ contextNote, imagePrompt }, "custom-card-generator: anniversary design brief generated");

  // Step 2: Generate image with gpt-image-1 (returns base64)
  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1536",
  } as any);

  const b64 = (imageResponse.data?.[0] as any)?.b64_json;
  if (!b64) throw new Error("gpt-image-1 returned no image data");
  const imageBuffer = Buffer.from(b64, "base64");
  logger.info({ bytes: imageBuffer.length }, "custom-card-generator: anniversary image generated");

  // Step 3: Fetch dimensions once and pick a portrait/A2 size
  const dims = await getCustomCardDimensions();
  const portrait = dims.find(
    d => d.orientation?.toLowerCase().includes("portrait") ||
         d.format?.toLowerCase().includes("a2") ||
         d.name?.toLowerCase().includes("portrait"),
  ) ?? dims[0];
  if (!portrait) throw new Error("No card dimensions available");
  const dimensionId = String(portrait.id);

  // Step 4: Upload buffer to Handwrytten
  const uploaded = await uploadCustomImage({ buffer: imageBuffer, imageType: "cover" });
  if (!uploaded.id) throw new Error("Handwrytten upload returned no image ID");

  // Step 5: Create custom Handwrytten card
  const cardName = `FIF Anniversary - ${Date.now()}`;
  const customCard = await createCustomHandwryttenCard({
    name: cardName,
    dimensionId,
    coverId: uploaded.id,
  });
  if (!customCard.cardId) throw new Error("Handwrytten create returned no card ID");

  logger.info({ cardId: customCard.cardId }, "custom-card-generator: anniversary card created");

  return {
    handwryttenCardId: String(customCard.cardId),
    name: cardName,
    imageUrl: uploaded.imageUrl ?? "",
  };
}

/**
 * Get all active custom holiday cards from DB.
 */
export async function getActiveHolidayCards(): Promise<GeneratedHolidayCard[]> {
  const rows = await db
    .select()
    .from(customHolidayCardsTable)
    .where(eq(customHolidayCardsTable.active, true));
  return rows as GeneratedHolidayCard[];
}
