/**
 * AI Card Library Generator
 *
 * Generates a reusable library of AI card images (via gpt-image-1) uploaded to
 * Handwrytten and stored in ai_card_library.  Cards are generated ONCE and
 * reused forever — no on-demand generation at approval time.
 *
 * Categories:
 *   home_purchase_anniversary  (12 cards)
 *   business_relationship_anniversary (10 cards)
 *   closing_anniversary        (8 cards)
 *   general_milestone          (5 cards)
 *   holiday                    (5 cards)
 */

import { openai } from "../lib/openai";
import { db } from "@workspace/db";
import { aiCardLibraryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { uploadCustomImage, createCustomHandwryttenCard, getCustomCardDimensions } from "./handwrytten";
import { logger } from "../lib/logger";


// ─── Card designs ─────────────────────────────────────────────────────────────

interface CardDesign {
  category: string;
  subcategory: string;
  title: string;
  prompt: string;
  tags: string[];
  style: string;
  tone: string;
  primaryColor: string;
  seasonal: boolean;
}

const CARD_DESIGNS: CardDesign[] = [
  // ── Home Purchase Anniversary (12) ─────────────────────────────────────────
  {
    category: "home_purchase_anniversary",
    subcategory: "cozy_home",
    title: "Cozy Cottage",
    prompt: "A premium greeting card front. Soft watercolor illustration of a charming cottage home with warm amber lights glowing through the windows at dusk. Lush green ivy climbing the brick facade, a welcoming front door painted in deep teal, flower boxes with blooming wildflowers. Impressionistic brushstrokes, warm golden palette with touches of green and terracotta. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["watercolor", "warm", "cozy", "traditional", "cottage", "amber"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "modern_house",
    title: "Modern Architecture",
    prompt: "A premium greeting card front. Clean architectural illustration of a sleek modern home — flat roof, floor-to-ceiling windows, warm wood cladding contrasted with white concrete. Soft afternoon light creating long shadows. Minimalist landscaping with ornamental grasses. Muted palette: warm white, light slate, natural wood tones. Crisp, contemporary, sophisticated. No text, no people. Portrait orientation, high resolution.",
    tags: ["modern", "minimal", "architectural", "clean", "contemporary", "slate"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "slate",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "luxury_home",
    title: "Luxury Estate",
    prompt: "A premium greeting card front. Elegant oil painting style rendering of a grand estate home at golden hour. Stone facade with arched windows, manicured symmetrical hedgerows, circular driveway with ornate fountain. Warm amber and gold tones, dramatic sky with soft clouds. Museum-quality painting feel. Opulent yet tasteful. No text, no people, no numbers. Portrait orientation, print-quality.",
    tags: ["luxury", "estate", "premium", "gold", "grand", "oil-painting"],
    style: "luxury painting",
    tone: "sophisticated",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "neighborhood",
    title: "Tree-Lined Street",
    prompt: "A premium greeting card front. Charming illustrated neighborhood street in autumn. Mature maple trees arching overhead, leaves in amber, orange, and gold. A row of classic American homes with front porches, warm lights in windows, a brick pathway. Soft, nostalgic illustration style with gentle watercolor textures. Inviting and community-oriented. No text, no people, no numbers. Portrait orientation.",
    tags: ["neighborhood", "street", "community", "illustration", "warm", "autumn"],
    style: "illustration",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "front_porch",
    title: "Welcome Home Porch",
    prompt: "A premium greeting card front. Warm lifestyle photograph-style image of a welcoming front porch. Painted white wooden boards, two rocking chairs with plush cushions, potted ferns, a wreath on a painted red door, string lights glowing softly. Late afternoon golden light. Cozy, inviting, quintessentially American home. No text, no people. Portrait orientation, warm golden tones.",
    tags: ["porch", "welcome", "cozy", "lifestyle", "warm", "terracotta"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "fireplace",
    title: "Fireplace Evening",
    prompt: "A premium greeting card front. Intimate interior scene of a glowing stone fireplace on a winter evening. Crackling orange flames, a rustic wood mantle with simple seasonal greenery and two pillar candles. Warm amber and deep burgundy tones, soft shadows. Cozy lifestyle aesthetic — feels like home. No people, no text, no numbers visible. Portrait orientation, high resolution.",
    tags: ["fireplace", "interior", "cozy", "evening", "warm", "burgundy"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "moving_milestone",
    title: "Golden Keys",
    prompt: "A premium greeting card front. Elegant minimalist design on cream paper texture. A single ornate vintage brass house key with a simple botanical twig and small leaf beside it. Subtle watercolor wash in warm gold tones around the key. Fine-line illustration style, sophisticated and tasteful. No text, no numbers. Portrait orientation, print-quality.",
    tags: ["keys", "milestone", "gold", "minimal", "elegant", "cream"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "seasonal_home",
    title: "Autumn Home",
    prompt: "A premium greeting card front. Loose, impressionistic watercolor painting of a cozy home in peak autumn. Fiery maple tree in the foreground with falling leaves, golden light on a classic craftsman-style house, pumpkins on the front steps, smoke rising from the chimney. Rich palette: burnt orange, deep red, golden yellow, forest green. No text, no people, no numbers. Portrait orientation.",
    tags: ["autumn", "fall", "seasonal", "warm", "watercolor", "orange"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "burnt orange",
    seasonal: true,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "seasonal_home",
    title: "Winter Home",
    prompt: "A premium greeting card front. Painterly illustration of a charming home on a quiet snowy evening. Soft blue-grey shadows on fresh snow, warm amber light glowing from every window, snow-covered evergreen trees, a lamppost with a soft glow. Blue-white and warm amber color palette. Silent, peaceful, beautiful. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["winter", "snow", "cozy", "seasonal", "warm", "blue"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "blue-white",
    seasonal: true,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "seasonal_home",
    title: "Garden Home",
    prompt: "A premium greeting card front. Botanical illustration of a cottage garden home in full bloom. A climbing rose covering a white picket fence, lavender borders, a garden path to a blue door, window boxes overflowing with colorful blooms. Detailed illustration style with clean linework and soft watercolor fills. Palette: sage green, dusty rose, sky blue, cream. No text, no people, no numbers. Portrait orientation.",
    tags: ["garden", "spring", "botanical", "warm", "illustration", "sage"],
    style: "illustration",
    tone: "fresh",
    primaryColor: "sage green",
    seasonal: true,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "classy_minimalist",
    title: "Architectural Blueprint",
    prompt: "A premium greeting card front. Sophisticated minimalist design on deep navy blue. Thin white line architectural elevations of a classic American home — front elevation, side, and floor plan fragments arranged elegantly as abstract decoration. Blueprint aesthetic but refined and premium. White and gold accent lines. Geometric, sophisticated, timeless. No text visible, no numbers, no labels. Portrait orientation, high resolution.",
    tags: ["minimal", "architectural", "classy", "modern", "navy", "blueprint"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "home_purchase_anniversary",
    subcategory: "classy_minimalist",
    title: "Doorway New Chapter",
    prompt: "A premium greeting card front. Elegant photograph-style image focused on a beautiful front door — deep forest green double doors with brass hardware, stone surround with carved details, a marble step below, a single potted topiary on each side. Warm dappled light. Luxury home aesthetic. No people, no text, no numbers. Portrait orientation, ultra high resolution, print quality.",
    tags: ["doorway", "elegant", "milestone", "luxury", "warm", "green"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "forest green",
    seasonal: false,
  },

  // ── Business Relationship Anniversary (10) ─────────────────────────────────
  {
    category: "business_relationship_anniversary",
    subcategory: "partnership",
    title: "Golden Partnership",
    prompt: "A premium greeting card front. Minimalist illustration of two elegant hands reaching toward each other in a refined, abstract style inspired by Michelangelo's Creation — but modern and geometric. Gold line art on a deep navy blue background. Thin gold geometric accents in the corners. Sophisticated, aspirational, professional. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["partnership", "professional", "gold", "elegant", "navy", "business"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "client_appreciation",
    title: "Client Appreciation",
    prompt: "A premium greeting card front. Warm, elegant composition on cream paper. A hand-tied bundle of dried botanicals — wheat stalks, eucalyptus, cotton, and seed pods — arranged with an organic ribbon in warm terracotta. Soft watercolor washes in warm neutral tones. Premium stationery aesthetic. No text, no numbers, no people. Portrait orientation, high resolution.",
    tags: ["appreciation", "warm", "professional", "business", "botanical", "cream"],
    style: "elegant illustration",
    tone: "warm",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "coffee_meeting",
    title: "Coffee & Conversation",
    prompt: "A premium greeting card front. Warm flat-lay lifestyle photograph of a coffee meeting. Two ceramic espresso cups on a warm wooden table, a closed leather notebook, a single pen, a small succulent. Morning light streaming in from the left. Earthy, warm, professional. Tones of warm brown, cream, sage green. No text visible, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["coffee", "meeting", "warm", "professional", "lifestyle", "brown"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "warm brown",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "success_milestone",
    title: "Milestone Achievement",
    prompt: "A premium greeting card front. Dramatic luxury design. A polished gold trophy sculpture silhouetted against a deep charcoal background with subtle radiant light behind it. Minimal, powerful, celebratory. Gold foil texture effect. Small scattered gold confetti pieces. No text, no words, no numbers. Portrait orientation, print-quality, premium feel.",
    tags: ["milestone", "achievement", "gold", "celebration", "premium", "charcoal"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "elegant_professional",
    title: "Navy & Gold Abstract",
    prompt: "A premium greeting card front. Abstract luxury design. Deep navy background with flowing abstract shapes in brushed gold and warm copper — overlapping arcs, sweeping curves, a sense of movement and progression. Inspired by premium financial and luxury brand design aesthetics. No text, no numbers, no literal imagery. Portrait orientation, high resolution.",
    tags: ["navy", "gold", "abstract", "elegant", "premium", "copper"],
    style: "modern minimal",
    tone: "sophisticated",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "small_business",
    title: "Local Business Warmth",
    prompt: "A premium greeting card front. Warm illustration of a charming main-street storefront — a small shop with a beautiful display window, potted plants on either side of a welcoming door, warm light inside. Cozy illustrated style with detailed linework. Palette: warm red, cream, navy, gold accents. Inviting community feel. No readable text on the building, no people visible, no numbers. Portrait orientation.",
    tags: ["small-business", "warm", "community", "illustration", "welcoming", "red"],
    style: "illustration",
    tone: "warm",
    primaryColor: "warm red",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "modern_business",
    title: "Modern Geometric",
    prompt: "A premium greeting card front. Contemporary geometric design. A series of precisely arranged overlapping circles and arcs in muted professional tones — midnight blue, warm grey, soft gold. Abstract but structured and confident. Clean white space balanced with the pattern. Premium corporate aesthetic. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["geometric", "modern", "contemporary", "clean", "professional", "blue"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "midnight blue",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "teamwork",
    title: "Collaborative Energy",
    prompt: "A premium greeting card front. Dynamic abstract composition suggesting collaboration and energy. Interconnected abstract shapes in warm blues, gold, and cream flowing together — suggesting different perspectives converging. Modern, optimistic, professional. No text, no numbers, no literal imagery. Portrait orientation, high resolution.",
    tags: ["teamwork", "collaboration", "abstract", "modern", "growth", "blue"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "blue",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "warm_professional",
    title: "Botanical Business",
    prompt: "A premium greeting card front. Elegant watercolor composition. A carefully arranged bouquet of eucalyptus, fern, and magnolia leaves in a simple glass vase. Soft warm tones — deep green, muted gold, cream background. Tasteful and sophisticated. Professional enough for business while warmly personal. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["botanical", "warm", "connection", "elegant", "business", "green"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "business_relationship_anniversary",
    subcategory: "growth",
    title: "Growth Journey",
    prompt: "A premium greeting card front. Minimalist abstract design representing growth. A single elegant upward-curving line in gold on cream, thickening and becoming more confident as it rises. Small organic shapes flowering from the line at the top like a tree in bloom. Simple, powerful, aspirational. No text, no numbers. Portrait orientation, high resolution, print-quality.",
    tags: ["growth", "journey", "professional", "abstract", "premium", "gold"],
    style: "modern minimal",
    tone: "inspirational",
    primaryColor: "gold",
    seasonal: false,
  },

  // ── Closing Anniversary (8) ────────────────────────────────────────────────
  {
    category: "closing_anniversary",
    subcategory: "sold_sign",
    title: "Sold Sign Celebration",
    prompt: "A premium greeting card front. Elegant minimalist illustration of a classic real estate 'SOLD' sign silhouette abstracted into a clean geometric gold icon on cream background — the icon is purely visual, no words. Surrounded by small celebratory confetti marks in gold and navy. Sophisticated and celebratory without being kitschy. No readable text, no numbers. Portrait orientation, high resolution.",
    tags: ["sold", "real-estate", "celebration", "milestone", "elegant", "gold"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "keys",
    title: "Luxury Keys",
    prompt: "A premium greeting card front. Luxury photograph-style close-up of ornate brass house keys. Multiple keys on a premium leather keychain, slightly overlapping, on a black marble surface with gold veining. Dramatic side lighting creating rich shadows. Gold and black palette. Premium, celebratory, milestone feel. No text, no people, no numbers visible. Portrait orientation, ultra-high resolution.",
    tags: ["keys", "luxury", "gold", "celebration", "premium", "marble"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "celebration",
    title: "Champagne Toast",
    prompt: "A premium greeting card front. Elegant luxury photograph of two crystal champagne flutes being raised in a toast, catching the light beautifully. Champagne bubbles rising, a bokeh background of warm golden lights. Rich warm tones — amber, gold, cream. The glasses only, no hands or people visible. Sophisticated celebration. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["champagne", "celebration", "luxury", "toast", "elegant", "amber"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "moving_boxes",
    title: "New Beginning",
    prompt: "A premium greeting card front. Warm lifestyle scene of neatly stacked moving boxes in a sunny empty room with large windows and hardwood floors. Afternoon light streaming in, a small potted plant on the windowsill, everything has a fresh-start quality. Warm golden tones, clean and hopeful. No people, no text visible on boxes, no numbers. Portrait orientation, high resolution.",
    tags: ["moving", "fresh-start", "new-beginning", "warm", "milestone", "golden"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "warm white",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "real_estate_success",
    title: "Property Success",
    prompt: "A premium greeting card front. Clean architectural watercolor of a distinguished modern home — elegant, investment-grade property feel. Painted in loose architectural watercolor style with precise line details. Cream background, navy blue and warm grey tones. Professional, understated, premium. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["property", "milestone", "professional", "success", "elegant", "navy"],
    style: "watercolor",
    tone: "professional",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "classy_closing",
    title: "Elegant Threshold",
    prompt: "A premium greeting card front. Ultra-luxury photograph of a grand entrance threshold — carved stone pillars flanking tall mahogany double doors with polished brass handles, a black and white marble foyer floor visible through the open door. Dramatic warm lighting from inside creating a golden glow. No people, no text, no numbers. Portrait orientation, high resolution, museum quality.",
    tags: ["doorway", "threshold", "elegant", "milestone", "luxury", "marble"],
    style: "luxury photography",
    tone: "sophisticated",
    primaryColor: "warm gold",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "investment_property",
    title: "Investment Achievement",
    prompt: "A premium greeting card front. Sophisticated abstract design representing real estate investment and success. Minimalist architectural elevation sketches in gold ink on charcoal paper — a modern residential building profile, geometric shapes suggesting skyline, an upward trajectory rendered as architecture. Premium, financial district aesthetic. No text, no legible numbers, no literal labels. Portrait orientation, high resolution.",
    tags: ["investment", "achievement", "sophisticated", "premium", "property", "charcoal"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "closing_anniversary",
    subcategory: "professional_milestone",
    title: "Closing Milestone",
    prompt: "A premium greeting card front. Premium abstract milestone design. A large compass rose or clock-inspired geometric mandala in gold on warm cream — timeless, elegant, professional. Deep navy accents in the geometric detail. Marks an important moment in time without specific reference. No text, no readable numbers, no dates. Portrait orientation, high resolution.",
    tags: ["professional", "milestone", "achievement", "abstract", "premium", "compass"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "gold",
    seasonal: false,
  },

  // ── General Business Milestone (5) ─────────────────────────────────────────
  {
    category: "general_milestone",
    subcategory: "growth",
    title: "Growth Upward",
    prompt: "A premium greeting card front. Dramatic abstract composition on deep navy. A series of ascending geometric bars in graduated gold tones, like a stylized chart or mountain range. The tallest bar catches more light — almost luminous. Abstract data visualization rendered as fine art. Premium, aspirational, business-forward. No text, no readable numbers. Portrait orientation, high resolution.",
    tags: ["growth", "upward", "abstract", "professional", "gold", "navy"],
    style: "modern minimal",
    tone: "inspirational",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "general_milestone",
    subcategory: "success",
    title: "Summit Achievement",
    prompt: "A premium greeting card front. Painterly mountain landscape at golden hour. A single dramatic mountain peak bathed in warm light against a sky of deep blues and amber. A winding path leading upward disappears at the summit. Metaphor for achievement. Cinematic quality. No text, no people, no numbers. Portrait orientation, high resolution, premium artistic quality.",
    tags: ["achievement", "peak", "milestone", "premium", "inspirational", "mountain"],
    style: "luxury painting",
    tone: "inspirational",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "general_milestone",
    subcategory: "celebration",
    title: "Elegant Celebration",
    prompt: "A premium greeting card front. Sophisticated celebration design. A burst of precisely illustrated confetti in premium colors — gold, deep navy, champagne, and forest green — arranged as a loose starburst from the center. Tiny geometric shapes: diamonds, triangles, elongated stars. Elegant, not childish. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["celebration", "confetti", "elegant", "premium", "milestone", "gold"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "general_milestone",
    subcategory: "achievement",
    title: "Award Recognition",
    prompt: "A premium greeting card front. Minimalist gold illustration on cream. A simple, iconic laurel wreath rendered in detailed botanical linework — the universal symbol of achievement. Clean negative space inside. Warm gold tones with subtle shadows. Timeless, classic, prestigious. No text, no numbers inside the wreath. Portrait orientation, high resolution.",
    tags: ["award", "recognition", "achievement", "minimal", "gold", "wreath"],
    style: "modern minimal",
    tone: "prestigious",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "general_milestone",
    subcategory: "premium_business",
    title: "Luxe Abstract",
    prompt: "A premium greeting card front. Museum-quality abstract art piece. Fluid overlapping shapes in deep midnight blue, burnished gold, and warm copper — like controlled brushstrokes from a master abstract expressionist. Luxury art feel. Perfect for any professional achievement. No text, no numbers, no literal imagery. Portrait orientation, high resolution, gallery quality.",
    tags: ["luxury", "abstract", "premium", "business", "sophisticated", "copper"],
    style: "modern minimal",
    tone: "sophisticated",
    primaryColor: "midnight blue",
    seasonal: false,
  },

  // ── Holiday (5) ────────────────────────────────────────────────────────────
  {
    category: "holiday",
    subcategory: "elegant_winter",
    title: "Crystal Winter",
    prompt: "A luxurious greeting card front. Deep navy blue background. Delicate hand-drawn snowflakes in gold and silver scattered across the card. A single elegant gold-foil geometric star at center. Fine gold border frame. No text anywhere on the card. Minimalist, premium, sophisticated. Portrait orientation, high resolution, print-ready quality.",
    tags: ["winter", "elegant", "crystal", "premium", "seasonal", "navy"],
    style: "modern minimal",
    tone: "sophisticated",
    primaryColor: "navy",
    seasonal: true,
  },
  {
    category: "holiday",
    subcategory: "business_holiday",
    title: "Business Holiday",
    prompt: "An elegant business holiday greeting card front. Rich deep forest green background with a single, perfectly symmetrical wreath made of minimal botanical elements — eucalyptus, cedar, small berries — rendered in gold and cream illustration style. A thin gold circle frame. No text, no ribbons, no bows. Refined, professional, tasteful. Portrait orientation, high resolution.",
    tags: ["holiday", "corporate", "elegant", "professional", "seasonal", "green"],
    style: "modern minimal",
    tone: "professional",
    primaryColor: "forest green",
    seasonal: true,
  },
  {
    category: "holiday",
    subcategory: "warm_festive",
    title: "Champagne New Year",
    prompt: "An elegant holiday greeting card front. Rich champagne and warm amber tones. Two crystal champagne flutes with golden bubbles rising, surrounded by subtle gold confetti and ribbon swirls. Dark charcoal background with soft bokeh light. No text. Sophisticated and celebratory, perfect for a New Year toast. Portrait orientation, high resolution, print-ready quality.",
    tags: ["champagne", "new-year", "celebration", "luxury", "seasonal", "amber"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "champagne",
    seasonal: true,
  },
  {
    category: "holiday",
    subcategory: "premium_holiday",
    title: "Gold Snowflakes",
    prompt: "A rich and sophisticated holiday greeting card front. Deep burgundy background with an intricate repeating pattern of hand-drawn gold geometric snowflakes and botanical winter branches. Thin gold border. No text. Looks like luxury gift wrap or high-end stationery. Portrait orientation, high resolution, print-ready quality.",
    tags: ["snowflakes", "gold", "premium", "winter", "seasonal", "burgundy"],
    style: "elegant illustration",
    tone: "sophisticated",
    primaryColor: "burgundy",
    seasonal: true,
  },
  {
    category: "holiday",
    subcategory: "modern_seasonal",
    title: "Modern Minimal Winter",
    prompt: "A serene and sophisticated holiday greeting card front. Pure white background with a single elegantly illustrated winter branch in the upper left corner — bare birch with delicate silver ice crystals. A small arrangement of subtle gold dots scattered like distant stars on the right. Ultra-minimal, gallery-quality aesthetic. No text, no people. Portrait orientation, high resolution.",
    tags: ["modern", "minimal", "winter", "clean", "seasonal", "white"],
    style: "modern minimal",
    tone: "serene",
    primaryColor: "white",
    seasonal: true,
  },
];

// ─── Public API ────────────────────────────────────────────────────────────────

export interface LibraryGenerationResult {
  succeeded: { id: string; title: string; category: string }[];
  failed: { title: string; category: string; error: string }[];
  skipped: { title: string; category: string }[];
}

export interface RegenerateResult {
  id: string;
  title: string;
  imageUrl: string;
  handwryttenCardId: string;
}

/**
 * Generate all cards in the library (or a filtered subset by category).
 * Idempotent by title+category — skips cards that already exist unless force=true.
 */
export async function generateLibraryCards(options: {
  categories?: string[];
  force?: boolean;
  onProgress?: (msg: string) => void;
}): Promise<LibraryGenerationResult> {
  const { categories, force = false, onProgress } = options;
  const result: LibraryGenerationResult = { succeeded: [], failed: [], skipped: [] };

  const designs = categories?.length
    ? CARD_DESIGNS.filter(d => categories.includes(d.category))
    : CARD_DESIGNS;

  // Fetch Handwrytten dimension once upfront
  let dimensionId: string;
  try {
    const dims = await getCustomCardDimensions();
    const portrait = dims.find(
      d => d.orientation?.toLowerCase().includes("portrait") ||
           d.format?.toLowerCase().includes("a2") ||
           d.name?.toLowerCase().includes("portrait"),
    ) ?? dims[0];
    if (!portrait) throw new Error("No card dimensions available");
    dimensionId = String(portrait.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "ai-card-library: failed to fetch HW dimensions");
    return {
      succeeded: [],
      skipped: [],
      failed: designs.map(d => ({ title: d.title, category: d.category, error: msg })),
    };
  }

  for (const design of designs) {
    // Check for existing card unless force
    if (!force) {
      const existing = await db
        .select({ id: aiCardLibraryTable.id, title: aiCardLibraryTable.title })
        .from(aiCardLibraryTable)
        .where(eq(aiCardLibraryTable.title, design.title))
        .limit(1);
      if (existing.length > 0) {
        result.skipped.push({ title: design.title, category: design.category });
        onProgress?.(`Skipped (exists): ${design.title}`);
        continue;
      }
    }

    try {
      onProgress?.(`Generating: ${design.title}…`);

      // Step 1: Generate image
      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: design.prompt,
        n: 1,
        size: "1024x1536",
      } as any);

      const b64 = (imageResponse.data?.[0] as any)?.b64_json as string | undefined;
      if (!b64) throw new Error("gpt-image-1 returned no image data");
      const imageBuffer = Buffer.from(b64, "base64");

      onProgress?.(`Uploading to Handwrytten: ${design.title}…`);

      // Step 2: Upload to Handwrytten
      const uploaded = await uploadCustomImage({ buffer: imageBuffer, imageType: "cover" });
      if (!uploaded.id) throw new Error("Handwrytten upload returned no image ID");

      // Step 3: Create Handwrytten custom card
      const hwName = `FIF Library - ${design.category} - ${design.title}`;
      const customCard = await createCustomHandwryttenCard({
        name: hwName,
        dimensionId,
        coverId: uploaded.id,
      });
      if (!customCard.cardId) throw new Error("Handwrytten create returned no card ID");

      // Step 4: Store in DB
      const [row] = await db
        .insert(aiCardLibraryTable)
        .values({
          category: design.category,
          subcategory: design.subcategory,
          title: design.title,
          imageUrl: uploaded.imageUrl ?? "",
          handwryttenCardId: String(customCard.cardId),
          promptUsed: design.prompt,
          tags: design.tags,
          style: design.style,
          tone: design.tone,
          primaryColor: design.primaryColor,
          seasonal: design.seasonal,
          active: true,
          timesShown: 0,
          timesSelected: 0,
          timesRejected: 0,
        })
        .onConflictDoUpdate({
          target: aiCardLibraryTable.handwryttenCardId,
          set: {
            imageUrl: uploaded.imageUrl ?? "",
            active: true,
          },
        })
        .returning();

      result.succeeded.push({ id: row!.id, title: design.title, category: design.category });
      logger.info({ title: design.title, cardId: customCard.cardId }, "ai-card-library: card generated and stored");
      onProgress?.(`Done: ${design.title}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err, title: design.title }, "ai-card-library: generation failed");
      result.failed.push({ title: design.title, category: design.category, error: msg });
      onProgress?.(`Failed: ${design.title} — ${msg}`);
    }
  }

  return result;
}

/**
 * Regenerate a single card by its DB ID.
 */
export async function regenerateLibraryCard(id: string): Promise<RegenerateResult> {
  const [existing] = await db
    .select()
    .from(aiCardLibraryTable)
    .where(eq(aiCardLibraryTable.id, id))
    .limit(1);

  if (!existing) throw new Error(`Card ${id} not found`);

  const dims = await getCustomCardDimensions();
  const portrait = dims.find(
    d => d.orientation?.toLowerCase().includes("portrait") ||
         d.format?.toLowerCase().includes("a2") ||
         d.name?.toLowerCase().includes("portrait"),
  ) ?? dims[0];
  if (!portrait) throw new Error("No card dimensions available");
  const dimensionId = String(portrait.id);

  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt: existing.promptUsed,
    n: 1,
    size: "1024x1536",
  } as any);

  const b64 = (imageResponse.data?.[0] as any)?.b64_json as string | undefined;
  if (!b64) throw new Error("gpt-image-1 returned no image data");
  const imageBuffer = Buffer.from(b64, "base64");

  const uploaded = await uploadCustomImage({ buffer: imageBuffer, imageType: "cover" });
  if (!uploaded.id) throw new Error("Handwrytten upload returned no image ID");

  const hwName = `FIF Library - ${existing.category} - ${existing.title} (v${Date.now()})`;
  const customCard = await createCustomHandwryttenCard({ name: hwName, dimensionId, coverId: uploaded.id });
  if (!customCard.cardId) throw new Error("Handwrytten create returned no card ID");

  await db
    .update(aiCardLibraryTable)
    .set({
      imageUrl: uploaded.imageUrl ?? existing.imageUrl,
      handwryttenCardId: String(customCard.cardId),
      timesShown: 0,
      timesSelected: 0,
      timesRejected: 0,
    })
    .where(eq(aiCardLibraryTable.id, id));

  return {
    id,
    title: existing.title,
    imageUrl: uploaded.imageUrl ?? existing.imageUrl,
    handwryttenCardId: String(customCard.cardId),
  };
}

export { CARD_DESIGNS };
