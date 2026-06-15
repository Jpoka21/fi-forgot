/**
 * AI Card Library Generator
 *
 * Generates a reusable library of AI card images (via gpt-image-1) uploaded to
 * Handwrytten and stored in ai_card_library.  Cards are generated ONCE and
 * reused forever — no on-demand generation at approval time.
 *
 * Business categories:
 *   home_purchase_anniversary          (12 cards)
 *   business_relationship_anniversary  (10 cards)
 *   closing_anniversary                (8 cards)
 *   general_milestone                  (5 cards)
 *   holiday                            (5 cards)
 *
 * Personal categories:
 *   birthday                   (12 cards)
 *   personal_anniversary       (8 cards)
 *   thank_you                  (8 cards)
 *   graduation                 (6 cards)
 *   holiday_personal           (8 cards)
 *   just_because               (25 cards)
 *   thinking_of_you            (8 cards)
 *   encouragement              (8 cards)
 *   congratulations_personal   (6 cards)
 *   new_baby                   (6 cards)
 *   get_well                   (6 cards)
 *   miss_you                   (6 cards)
 *   humor                      (15 cards)
 */

import { openai } from "../lib/openai";
import { db } from "@workspace/db";
import { aiCardLibraryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { uploadCustomImage, createCustomHandwryttenCard, getCustomCardDimensions } from "./handwrytten";
import { logger } from "../lib/logger";
import sharp from "sharp";

// Target: exactly 300 DPI at 5" × 7" (Handwrytten standard portrait card)
const PRINT_WIDTH_PX  = 1500; // 5"  × 300 DPI
const PRINT_HEIGHT_PX = 2100; // 7"  × 300 DPI

async function upscaleToPrintResolution(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(PRINT_WIDTH_PX, PRINT_HEIGHT_PX, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .png({ compressionLevel: 6 })
    .toBuffer();
}


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

  // ── Just Because (10) ──────────────────────────────────────────────────────
  {
    category: "just_because",
    subcategory: "coffee_friends",
    title: "Two Mugs Morning",
    prompt: "A premium greeting card front. Warm lifestyle flat-lay photograph of two ceramic mugs of coffee on a worn wooden table — one mug with a slight ring stain, both with steam rising gently. A folded newspaper, a sprig of rosemary, dappled morning light from the left. Feels like a shared Saturday morning. Earthy tones: warm brown, cream, terracotta. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["coffee", "friendship", "warm", "lifestyle", "morning", "terracotta"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "warm brown",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "open_road",
    title: "Open Road",
    prompt: "A premium greeting card front. Cinematic landscape photograph of an open highway stretching toward a distant mountain range at golden hour. The road curves gently, warm amber light flooding the scene, wildflowers on the verge. Feels like freedom and possibility. Rich amber, burnt orange, deep blue palette. No people, no cars, no text. Portrait orientation, high resolution, film quality.",
    tags: ["adventure", "freedom", "road", "travel", "warm", "amber"],
    style: "cozy lifestyle",
    tone: "adventurous",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "abstract_good_vibes",
    title: "Good Vibes",
    prompt: "A premium greeting card front. Bold, joyful abstract illustration. Loose gestural brushstrokes in warm terracotta, dusty rose, sage green, and cream on an off-white background. Energetic and free — feels like a great mood, not a specific occasion. Gallery art feel, contemporary. No text, no numbers, no representational imagery. Portrait orientation, high resolution.",
    tags: ["abstract", "joyful", "bold", "colorful", "contemporary", "terracotta"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "backyard_summer",
    title: "Backyard Summer",
    prompt: "A premium greeting card front. Warm lifestyle photograph of a sun-drenched backyard in summer — a wooden Adirondack chair in dappled shade, a cold sweating glass of lemonade on the armrest, long afternoon shadows. Quintessential summer ease. No people, no text. Portrait orientation, golden warm tones, high resolution.",
    tags: ["summer", "backyard", "ease", "warm", "lifestyle", "golden"],
    style: "cozy lifestyle",
    tone: "relaxed",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "reading_nook",
    title: "Afternoon Light",
    prompt: "A premium greeting card front. Intimate interior scene of a cozy reading corner. A worn leather armchair bathed in warm afternoon light from a tall window, a stack of well-loved books on the side table, a half-full tea cup. Dust motes visible in the light beams. Warm amber and deep caramel tones. No people, no text. Portrait orientation, high resolution.",
    tags: ["cozy", "reading", "afternoon", "warm", "interior", "caramel"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "caramel",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "city_evening",
    title: "City at Golden Hour",
    prompt: "A premium greeting card front. Painterly cityscape at golden hour — a classic American main street with warm light hitting building facades, soft bokeh of streetlights beginning to glow. Loose impressionistic style with confident brushstrokes. Palette: warm amber, soft coral, deep slate blue. No readable signage, no people visible, no numbers. Portrait orientation, high resolution.",
    tags: ["city", "golden-hour", "warm", "urban", "impressionistic", "amber"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "wildflowers",
    title: "Wild Meadow",
    prompt: "A premium greeting card front. Loose, expressive watercolor of a wild meadow in full bloom — tall grasses, poppies, cornflowers, Queen Anne's lace swaying gently. Feels spontaneous and alive, not a formal arrangement. Palette: dusty rose, warm sage, golden yellow, soft sky blue. No text, no people, no numbers. Portrait orientation, high resolution, fine-art quality.",
    tags: ["wildflowers", "meadow", "botanical", "loose", "warm", "sage"],
    style: "watercolor",
    tone: "fresh",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "weekend_bold",
    title: "Saturday Energy",
    prompt: "A premium greeting card front. Bold graphic illustration with a retro-inspired feel. Geometric sun rays in warm terracotta and cream radiating from a central circle on a deep navy background. Clean, confident, joyful — like a perfect Saturday morning. No text, no numbers, no letters. Portrait orientation, high resolution, print-quality.",
    tags: ["bold", "graphic", "retro", "geometric", "navy", "terracotta"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "minimal_warm",
    title: "Simple Good Day",
    prompt: "A premium greeting card front. Ultra-minimal composition on warm cream paper. A single small ink-drawn circle in warm terracotta at the center — perfectly imperfect, slightly irregular, handmade quality. Generous white space around it. Calm, intentional, warm. No text, no numbers, nothing else. Portrait orientation, high resolution, premium stationery aesthetic.",
    tags: ["minimal", "simple", "warm", "cream", "terracotta", "calm"],
    style: "modern minimal",
    tone: "calm",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "abstract_connection",
    title: "Good Energy",
    prompt: "A premium greeting card front. Abstract watercolor composition suggesting warmth and connection. Overlapping circles and loose gestural marks in warm dusty rose, amber, and soft terracotta — touching, overlapping, like two people in easy orbit. No literal imagery, no figures, no text, no numbers. Portrait orientation, high resolution, gallery quality.",
    tags: ["abstract", "connection", "warm", "friendship", "dusty-rose", "amber"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "dusty rose",
    seasonal: false,
  },

  {
    category: "just_because",
    subcategory: "morning_dog_walk",
    title: "Morning Walk",
    prompt: "A premium greeting card front. Warm lifestyle photograph looking down a quiet suburban sidewalk at early morning — long tree shadows, dew on grass, a leash stretching ahead out of frame. Golden hour light filtering through maple leaves. No people fully visible, no text, no numbers. Warm amber and deep green palette. Portrait orientation, high resolution.",
    tags: ["morning", "lifestyle", "warm", "neighborhood", "amber", "peaceful"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "vinyl_record",
    title: "Side A",
    prompt: "A premium greeting card front. Close-up fine-art photograph of a vinyl record on a warm wood turntable. The grooves catching light, the label slightly off-center and worn at the edges. Deep charcoal and warm wood tones, a single amber lamp glow. No text visible on the label, no numbers. Portrait orientation, high resolution, rich and tactile.",
    tags: ["music", "vinyl", "retro", "warm", "masculine", "charcoal"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "charcoal",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "campfire_night",
    title: "Campfire",
    prompt: "A premium greeting card front. Intimate close-up of a small campfire at night — orange and gold flames, glowing embers at the base, the surrounding darkness soft and warm. Sparks lifting gently upward. No people, no text, no numbers. Deep black background with amber and deep orange flames. Portrait orientation, high resolution, cozy and elemental.",
    tags: ["campfire", "night", "cozy", "warm", "masculine", "orange"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "orange",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "ocean_horizon",
    title: "Open Water",
    prompt: "A premium greeting card front. Expansive seascape at dusk — a calm ocean horizon, the last amber light just above the water line, deep blue-grey sky above. Minimalist and vast. A single low wave catching the remaining light. No people, no boats, no text. Deep navy, slate blue, and warm amber palette. Portrait orientation, high resolution, cinematic quality.",
    tags: ["ocean", "horizon", "calm", "vast", "navy", "amber"],
    style: "cozy lifestyle",
    tone: "calm",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "workshop_bench",
    title: "Good Work",
    prompt: "A premium greeting card front. Warm close-up of a woodworker's bench — a hand plane, scattered wood shavings curled on aged oak, a worn measuring tape. Afternoon light from a side window casting long shadows. Earthy and masculine. No people, no text, no numbers. Deep warm wood tones and golden light. Portrait orientation, high resolution.",
    tags: ["workshop", "tools", "masculine", "warm", "wood", "craftsmanship"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "warm brown",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "mountain_path",
    title: "Keep Going",
    prompt: "A premium greeting card front. A narrow hiking trail winding up through a pine forest toward a bright clearing at the ridge. Early morning light, slight mist between the trees, golden light at the top. Feels like effort and reward together. No people, no text, no numbers. Deep forest green, misty blue, warm gold palette. Portrait orientation, high resolution.",
    tags: ["mountain", "hiking", "adventure", "pine", "green", "gold"],
    style: "cozy lifestyle",
    tone: "adventurous",
    primaryColor: "forest green",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "farmers_market",
    title: "Fresh Start",
    prompt: "A premium greeting card front. Vibrant flat-lay of a farmers market haul — heirloom tomatoes in deep red and gold, a bunch of sunflowers, a brown paper bag, a small jar of honey catching the light. Dappled outdoor light on a rough linen surface. Joyful and seasonal without being tied to a specific season. No text, no numbers, no people. Portrait orientation, high resolution.",
    tags: ["market", "colorful", "fresh", "lifestyle", "warm", "sunflowers"],
    style: "cozy lifestyle",
    tone: "joyful",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "rain_window",
    title: "Rainy Day",
    prompt: "A premium greeting card front. Looking through a rain-streaked window from inside — blurred street lights and green trees visible through the glass, water droplets tracking down in sharp focus. Warm interior light from behind the camera. Contemplative and cozy. No people, no text, no numbers. Muted grey-green and warm amber palette. Portrait orientation, high resolution.",
    tags: ["rain", "window", "cozy", "contemplative", "grey", "warm"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "grey-green",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "classic_car",
    title: "Long Road",
    prompt: "A premium greeting card front. Side profile of a vintage 1960s American car parked on an empty desert highway, shot at golden hour. The chrome catching late light, the paint a deep classic red, open sky in the background. No people, no readable text on the car, no licence plates. Cinematic and nostalgic. Deep red, cream, and amber palette. Portrait orientation, high resolution.",
    tags: ["vintage", "car", "retro", "road", "masculine", "amber"],
    style: "cozy lifestyle",
    tone: "adventurous",
    primaryColor: "deep red",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "rooftop_dusk",
    title: "Rooftop View",
    prompt: "A premium greeting card front. Looking out from a rooftop terrace at dusk — city skyline silhouetted against a gradient sky in deep coral, mauve, and soft navy. Two empty chairs at the edge, string lights beginning to glow. No people, no readable signage, no text. Warm urban atmosphere. Portrait orientation, high resolution, painterly quality.",
    tags: ["rooftop", "city", "dusk", "coral", "urban", "warm"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "coral",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "bold_smiley",
    title: "Just Because",
    prompt: "A premium greeting card front. Bold graphic illustration. A single oversized hand-drawn smiley face in warm terracotta ink on cream — drawn with confidence and slight imperfection, the circle slightly lopsided, the eyes and smile thick and gestural. Generous white space. Contemporary, warm, and irresistible. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["smiley", "bold", "warm", "graphic", "terracotta", "cream"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "fresh_flowers_desk",
    title: "Desk Flowers",
    prompt: "A premium greeting card front. Close-up lifestyle photograph of a small mason jar of wildflowers on a light wood desk — daisy, sprig of lavender, a single red ranunculus. Morning light from a nearby window, a blurred notebook in the background. Simple, fresh, and intentional. No people, no text, no numbers. Soft cream and sage palette. Portrait orientation, high resolution.",
    tags: ["flowers", "desk", "fresh", "lifestyle", "sage", "cream"],
    style: "cozy lifestyle",
    tone: "fresh",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "bold_arrow_up",
    title: "On the Rise",
    prompt: "A premium greeting card front. Bold minimalist graphic design. A large confident upward-pointing arrow in deep navy on cream — the arrow drawn with a broad brush stroke, slightly imperfect and full of energy. The negative space below it feels like a launchpad. No text, no numbers, nothing else. Portrait orientation, high resolution, print-quality.",
    tags: ["arrow", "bold", "navy", "minimal", "energy", "upward"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "warm_abstract_sun",
    title: "Sunny Side",
    prompt: "A premium greeting card front. Cheerful abstract illustration. A large loose circle — the sun — in warm golden yellow with gestural short rays radiating outward, all drawn with a thick soft brush on cream paper. Feels warm and handmade, like something you'd find in a gallery. No text, no faces, no numbers. Portrait orientation, high resolution.",
    tags: ["sun", "warm", "golden", "abstract", "joyful", "cream"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "just_because",
    subcategory: "backyard_grill",
    title: "Good Times",
    prompt: "A premium greeting card front. Warm lifestyle close-up of a backyard grill with a few ears of sweet corn and burgers, smoke rising gently, late afternoon summer light. The grill grate weathered and seasoned. Feels like a perfect ordinary moment. No people, no text, no numbers. Deep charcoal, warm amber, and green palette. Portrait orientation, high resolution.",
    tags: ["grill", "summer", "backyard", "masculine", "warm", "charcoal"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "charcoal",
    seasonal: false,
  },

  // ── Thinking of You (8) ────────────────────────────────────────────────────
  {
    category: "thinking_of_you",
    subcategory: "candle_window",
    title: "Candle in the Window",
    prompt: "A premium greeting card front. Intimate interior scene — a single white pillar candle burning on a windowsill at dusk, warm amber flame reflected in the dark glass, rain streaks on the outside of the window. Soft and contemplative. No people, no text, no numbers. Deep charcoal and warm amber palette. Portrait orientation, high resolution.",
    tags: ["candle", "intimate", "warm", "contemplative", "amber", "dusk"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "morning_light",
    title: "First Light",
    prompt: "A premium greeting card front. Soft painterly sunrise over a still landscape. The horizon glows in pale gold and dusty rose, the world quiet and expectant. Loose impressionistic style, gentle brushstrokes. Palette: warm blush, pale gold, soft lavender at the edges. Peaceful and hopeful. No people, no text, no numbers. Portrait orientation, high resolution.",
    tags: ["sunrise", "hopeful", "warm", "gentle", "blush", "gold"],
    style: "watercolor",
    tone: "hopeful",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "still_water",
    title: "Still Waters",
    prompt: "A premium greeting card front. Serene watercolor landscape of a glassy lake at dawn. Perfect reflections of trees and pale sky on the still surface, a single bird crossing in the distance. Muted palette: soft slate blue, pale sage, cream. Meditative and calm. No people, no boats, no text. Portrait orientation, high resolution, fine art quality.",
    tags: ["water", "calm", "peaceful", "reflection", "slate", "sage"],
    style: "watercolor",
    tone: "serene",
    primaryColor: "slate blue",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "night_sky",
    title: "Same Stars",
    prompt: "A premium greeting card front. Painterly night sky above a quiet landscape — a deep blue-black sky dusted with stars, the Milky Way a soft smear of light. Silhouetted trees along the bottom edge. Romantic and contemplative — the sense that two people can look at the same sky from wherever they are. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["night-sky", "stars", "contemplative", "navy", "connection", "celestial"],
    style: "luxury painting",
    tone: "contemplative",
    primaryColor: "midnight blue",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "warm_cup",
    title: "Warm Cup for You",
    prompt: "A premium greeting card front. Close-up lifestyle photograph of two hands wrapping around a warm ceramic mug — no faces, just hands and mug, steam rising. Intimate and tender. Warm cream and terracotta tones, soft depth of field. Feels like comfort. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["warmth", "comfort", "intimate", "friendship", "terracotta", "cream"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "autumn_path",
    title: "Autumn Walk",
    prompt: "A premium greeting card front. Painterly illustration of a path winding through an autumn forest. Golden and amber leaves falling, dappled light through the canopy, the path ahead curving out of sight. Feels like a familiar walk, a shared memory. Loose watercolor style. Palette: amber, rust, deep forest green. No people, no text. Portrait orientation, high resolution.",
    tags: ["autumn", "path", "warm", "memory", "amber", "forest"],
    style: "watercolor",
    tone: "nostalgic",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "soft_botanicals",
    title: "Soft Arrangement",
    prompt: "A premium greeting card front. Delicate botanical watercolor of a loose, informal arrangement of garden flowers — ranunculus, sweet peas, pale roses, eucalyptus — in soft muted tones. Not a formal bouquet, more like something gathered from a garden on a whim. Palette: blush, pale lavender, sage green, cream. No text, no vase, no numbers. Portrait orientation, high resolution.",
    tags: ["botanical", "flowers", "soft", "blush", "delicate", "sage"],
    style: "watercolor",
    tone: "gentle",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "thinking_of_you",
    subcategory: "minimalist_connection",
    title: "Paper Crane",
    prompt: "A premium greeting card front. Minimalist illustration on warm cream. A single elegantly drawn origami crane in the center, rendered in precise thin lines in soft terracotta. Below it, five tiny dots suggesting flight or echo. Deeply calm and intentional. Inspired by the tradition of cranes as symbols of care. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["minimal", "crane", "origami", "care", "terracotta", "cream"],
    style: "modern minimal",
    tone: "gentle",
    primaryColor: "cream",
    seasonal: false,
  },

  // ── Encouragement (8) ─────────────────────────────────────────────────────
  {
    category: "encouragement",
    subcategory: "mountain_sunrise",
    title: "Summit Light",
    prompt: "A premium greeting card front. Dramatic painterly mountain scene. A bold mountain peak bathed in the first light of sunrise — warm gold and rose light on the summit, deep blue-purple valleys below, the sky still dark behind. Cinematic and powerful. The sense that the hardest part is almost over. No people, no text. Portrait orientation, high resolution, museum quality.",
    tags: ["mountain", "sunrise", "powerful", "inspirational", "gold", "dramatic"],
    style: "luxury painting",
    tone: "inspirational",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "upward_momentum",
    title: "Rising",
    prompt: "A premium greeting card front. Bold abstract composition suggesting upward momentum. Loose confident brushstrokes in warm terracotta and gold sweeping upward from the lower left, growing more energetic and bright as they rise. White space at the top — possibility. Gallery-quality abstract expressionism. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["abstract", "rising", "momentum", "bold", "terracotta", "gold"],
    style: "bold illustration",
    tone: "energizing",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "storm_break",
    title: "Light After the Storm",
    prompt: "A premium greeting card front. Painterly sky scene — dark dramatic storm clouds on the left giving way to a wide opening of warm light on the right. A shaft of golden light breaking through, illuminating a small meadow below. The shift from dark to light, storm to calm. No people, no text. Portrait orientation, high resolution, fine-art quality.",
    tags: ["storm", "light", "hope", "dramatic", "golden", "sky"],
    style: "luxury painting",
    tone: "hopeful",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "strong_roots",
    title: "Deep Roots",
    prompt: "A premium greeting card front. Painterly illustration of a single large oak tree, full canopy in summer. The composition emphasizes both the wide spreading branches and, below the ground line, a mirror of deep strong roots — equal above and below. Warm sage and amber palette. No people, no text. Portrait orientation, high resolution.",
    tags: ["tree", "roots", "strength", "grounded", "sage", "warm"],
    style: "illustration",
    tone: "grounding",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "bold_star",
    title: "Gold Star",
    prompt: "A premium greeting card front. Ultra-simple powerful design. A single large hand-drawn star in burnished gold on deep navy — slightly irregular, clearly hand-made, full of warmth and intention. Generous space around it. No glitter, no decorations, just the star. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["star", "gold", "bold", "navy", "achievement", "simple"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "forward_direction",
    title: "Arrow Forward",
    prompt: "A premium greeting card front. Bold graphic design. A single large arrow pointing up and to the right — thick, confident, hand-painted in deep terracotta on warm cream. Loose and gestural, not computer-generated. Energy, direction, momentum. No text, no other elements. Portrait orientation, high resolution.",
    tags: ["arrow", "direction", "bold", "terracotta", "graphic", "momentum"],
    style: "bold illustration",
    tone: "energizing",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "bloom_anyway",
    title: "Bloom Anyway",
    prompt: "A premium greeting card front. Botanical illustration with a powerful quiet message. A single bright wildflower growing from a crack in rough stone pavement — vivid and alive against the grey. Detailed fine-line illustration style. The flower in warm terracotta and gold, the stone in cool grey. No text, no people. Portrait orientation, high resolution.",
    tags: ["flower", "resilience", "botanical", "terracotta", "stone", "strength"],
    style: "illustration",
    tone: "inspirational",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "encouragement",
    subcategory: "open_sky",
    title: "Open Sky",
    prompt: "A premium greeting card front. Vast painterly sky — a high viewpoint looking out over an open landscape, nothing but rolling land below and an enormous expanse of sky above. Cumulus clouds catching warm afternoon light. The feeling of total possibility. No text, no people. Palette: warm gold, cloud white, deep sky blue. Portrait orientation, high resolution.",
    tags: ["sky", "vast", "open", "possibility", "gold", "blue"],
    style: "luxury painting",
    tone: "expansive",
    primaryColor: "sky blue",
    seasonal: false,
  },

  // ── Congratulations Personal (6) ──────────────────────────────────────────
  {
    category: "congratulations_personal",
    subcategory: "champagne",
    title: "Pop the Cork",
    prompt: "A premium greeting card front. Joyful celebration scene. A single bottle of champagne just uncorked — the cork mid-air, a shower of bubbles and foam catching the light against a warm amber bokeh background. Gold, cream, champagne tones. Festive without being corporate. No glasses, no people, no text, no numbers. Portrait orientation, high resolution.",
    tags: ["champagne", "celebration", "pop", "joyful", "gold", "amber"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "congratulations_personal",
    subcategory: "confetti",
    title: "Confetti Moment",
    prompt: "A premium greeting card front. Loose, hand-drawn confetti burst illustration on cream. A cascade of small shapes — rectangles, circles, tiny stars — in warm terracotta, dusty rose, sage green, and gold, falling from the top of the card. Handmade feel, joyful, not corporate. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["confetti", "celebration", "hand-drawn", "joyful", "terracotta", "warm"],
    style: "bold illustration",
    tone: "celebratory",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "congratulations_personal",
    subcategory: "constellation",
    title: "Star Moment",
    prompt: "A premium greeting card front. Minimalist night-sky illustration on deep navy. A single constellation of connected stars in gold — the stars large and luminous, the connecting lines delicate. The composition asymmetrical and elegant, feeling like a specific personal star. No text, no numbers, no zodiac labels. Portrait orientation, high resolution.",
    tags: ["stars", "constellation", "navy", "gold", "minimal", "celestial"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "congratulations_personal",
    subcategory: "sunrise_future",
    title: "New Chapter",
    prompt: "A premium greeting card front. Hopeful painterly sunrise — warm amber and rose light on the horizon, the landscape below still in gentle shadow, the sky beginning to fill with light. The classic metaphor for new beginnings, rendered beautifully. Loose, expressive brushwork. No people, no text. Portrait orientation, high resolution.",
    tags: ["sunrise", "new-beginning", "hopeful", "warm", "blush", "amber"],
    style: "watercolor",
    tone: "hopeful",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "congratulations_personal",
    subcategory: "trophy_minimal",
    title: "You Did the Thing",
    prompt: "A premium greeting card front. Playful minimal illustration on cream. A simple, slightly wobbly hand-drawn trophy in warm terracotta — clearly drawn by hand, with personality and warmth rather than corporate precision. Centered, large, confident. No text, no numbers, no laurels. Portrait orientation, high resolution.",
    tags: ["trophy", "achievement", "playful", "minimal", "terracotta", "warm"],
    style: "bold illustration",
    tone: "celebratory",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "congratulations_personal",
    subcategory: "fireworks_abstract",
    title: "Fireworks",
    prompt: "A premium greeting card front. Abstract painterly fireworks against a dark sky — loose gestural bursts of warm color (gold, dusty rose, soft coral) expanding outward, multiple overlapping blooms. Not illustrative-literal fireworks but expressionist paint bursts that feel celebratory. No text, no numbers. Portrait orientation, high resolution, gallery quality.",
    tags: ["fireworks", "abstract", "celebration", "gold", "coral", "expressive"],
    style: "luxury painting",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },

  // ── New Baby (6) ──────────────────────────────────────────────────────────
  {
    category: "new_baby",
    subcategory: "soft_nest",
    title: "Soft Nest",
    prompt: "A premium greeting card front. Tender botanical illustration of a bird's nest viewed from above — carefully woven from fine twigs, lined with soft down, three small speckled eggs nestled inside. Warm and organic. Soft watercolor style, palette: warm cream, sage, dusty rose. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["nest", "eggs", "new-life", "botanical", "cream", "sage"],
    style: "watercolor",
    tone: "tender",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "new_baby",
    subcategory: "first_morning",
    title: "Baby's First Morning",
    prompt: "A premium greeting card front. Soft impressionistic sunrise — the very first light of a new day, pale gold and blush pink on the horizon, the landscape barely visible below, the world quiet and new. Tender and hopeful. Loose, gentle brushwork. No people, no text. Portrait orientation, high resolution.",
    tags: ["sunrise", "new-beginning", "tender", "blush", "gold", "gentle"],
    style: "watercolor",
    tone: "tender",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "new_baby",
    subcategory: "botanicals_new_life",
    title: "New Growth",
    prompt: "A premium greeting card front. Delicate botanical illustration of emerging spring growth — tiny unfurling fern fronds, new leaf buds, small fragile shoots just breaking through soil. The fragility and hopefulness of new life. Fine-line illustration style with soft watercolor fills. Pale sage, cream, dusty rose. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["botanical", "new-life", "growth", "delicate", "sage", "cream"],
    style: "illustration",
    tone: "tender",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "new_baby",
    subcategory: "moon_stars",
    title: "Moon and Tiny Stars",
    prompt: "A premium greeting card front. Gentle watercolor night scene — a large soft crescent moon surrounded by a scatter of hand-painted stars of various sizes. Painterly, warm, not cartoonish. Deep warm navy with the moon in pale cream-gold. Calm, magical, tender. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["moon", "stars", "night", "tender", "navy", "cream"],
    style: "watercolor",
    tone: "tender",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "new_baby",
    subcategory: "spring_garden",
    title: "Garden Welcome",
    prompt: "A premium greeting card front. Vibrant loose watercolor of a cottage garden in full spring bloom — tulips, daffodils, blossoming branches, the energy of new life in full color. Joyful and celebratory. Palette: pale yellow, blush, sky blue, fresh green. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["garden", "spring", "joyful", "blush", "fresh", "botanical"],
    style: "watercolor",
    tone: "joyful",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "new_baby",
    subcategory: "cozy_nursery",
    title: "Warm Welcome Home",
    prompt: "A premium greeting card front. Warm lifestyle interior — a sun-filled corner of a room with a simple wooden rocking chair, a small potted plant, afternoon light making long rectangles on a clean wooden floor. Feels new, hopeful, ready. No people, no baby items, no text. Pale wood tones, cream, warm sage. Portrait orientation, high resolution.",
    tags: ["interior", "warm", "home", "cozy", "sage", "cream"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "cream",
    seasonal: false,
  },

  // ── Get Well (6) ──────────────────────────────────────────────────────────
  {
    category: "get_well",
    subcategory: "healing_garden",
    title: "Healing Garden",
    prompt: "A premium greeting card front. Warm botanical illustration of a sunlit garden corner — lavender, chamomile, rosemary, and calendula in soft bloom, bathed in golden afternoon light. Plants historically associated with healing and comfort. Soft detailed botanical style. Sage green, warm gold, dusty lavender. No text, no people. Portrait orientation, high resolution.",
    tags: ["botanical", "healing", "garden", "lavender", "warm", "sage"],
    style: "illustration",
    tone: "comforting",
    primaryColor: "sage green",
    seasonal: false,
  },
  {
    category: "get_well",
    subcategory: "sunny_window",
    title: "Sunny Window",
    prompt: "A premium greeting card front. Warm interior lifestyle photograph — a windowsill in full morning sun, a small potted succulent, a single bright flower in a slim vase, the world outside pleasantly blurred. Clean white curtains catching the light. The feeling of light returning. Warm cream and golden yellow tones. No people, no text. Portrait orientation, high resolution.",
    tags: ["window", "sunlight", "warmth", "interior", "golden", "cream"],
    style: "cozy lifestyle",
    tone: "comforting",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "get_well",
    subcategory: "soft_warmth",
    title: "Soft Comfort",
    prompt: "A premium greeting card front. Intimate cozy lifestyle flat-lay — a thick cream knit blanket folded softly, a warm ceramic mug of tea with a sprig of chamomile, a smooth river stone beside it. Everything soft, warm, restful. Cream, warm oat, sage green tones. No people, no text, no numbers. Portrait orientation, high resolution.",
    tags: ["cozy", "comfort", "blanket", "tea", "cream", "restful"],
    style: "cozy lifestyle",
    tone: "comforting",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "get_well",
    subcategory: "spring_return",
    title: "Spring Returns",
    prompt: "A premium greeting card front. Hopeful botanical watercolor — a bare branch with tiny new buds just breaking, the very beginning of spring. A small bird perched lightly on one branch. Pale blue sky background. Fragile optimism made visible. Soft palette: warm cream, pale sage, blush. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["spring", "renewal", "hopeful", "botanical", "sage", "blush"],
    style: "watercolor",
    tone: "hopeful",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "get_well",
    subcategory: "calm_waves",
    title: "Gentle Tide",
    prompt: "A premium greeting card front. Painterly ocean scene — gentle waves lapping a quiet shore at low tide, the water catching morning light in pale gold and soft aqua. The horizon line low, the sky large and calm. Meditative and peaceful. Loose watercolor style. Palette: pale aqua, soft sand, warm cream. No people, no text. Portrait orientation, high resolution.",
    tags: ["ocean", "calm", "peaceful", "aqua", "gentle", "sand"],
    style: "watercolor",
    tone: "serene",
    primaryColor: "pale aqua",
    seasonal: false,
  },
  {
    category: "get_well",
    subcategory: "home_fire",
    title: "Home Fire",
    prompt: "A premium greeting card front. Warm interior painting — a close view of a stone fireplace with a crackling fire, the glow warm and amber, a simple wooden mantle above. Everything radiates warmth and safety. The feeling of being cared for and sheltered. No people, no text, no numbers. Amber, deep burgundy, cream palette. Portrait orientation, high resolution.",
    tags: ["fireplace", "warmth", "home", "safe", "amber", "cozy"],
    style: "cozy lifestyle",
    tone: "comforting",
    primaryColor: "amber",
    seasonal: false,
  },

  // ── Miss You (6) ──────────────────────────────────────────────────────────
  {
    category: "miss_you",
    subcategory: "shared_horizon",
    title: "Shared Horizon",
    prompt: "A premium greeting card front. Vast painterly landscape looking out toward a wide horizon — the sense of great distance, yet the same sky overhead. Warm evening light. A landscape two people could both look at from different sides of the country. No people, no text. Palette: warm amber, soft coral, deep blue. Portrait orientation, high resolution.",
    tags: ["horizon", "distance", "connection", "warm", "amber", "landscape"],
    style: "luxury painting",
    tone: "wistful",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "miss_you",
    subcategory: "long_road",
    title: "Road That Leads to You",
    prompt: "A premium greeting card front. Painterly illustration of a winding country road stretching toward the distance — warm afternoon light, the road disappearing into a soft horizon. Feels like coming home, or the long stretch between two people. Impressionistic style. Palette: warm amber, sage green, sky blue. No people, no cars, no text. Portrait orientation, high resolution.",
    tags: ["road", "journey", "distance", "warm", "amber", "sage"],
    style: "watercolor",
    tone: "wistful",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "miss_you",
    subcategory: "same_stars",
    title: "Looking Up Together",
    prompt: "A premium greeting card front. Intimate night-sky painting — a deep indigo sky dense with stars, the Milky Way clearly visible, a dark silhouette of rolling hills at the base. The sense that wherever you are, you're under the same sky. No people, no text. Deep indigo, cream star-light, soft warm glow on the horizon. Portrait orientation, high resolution.",
    tags: ["stars", "night-sky", "connection", "indigo", "celestial", "distance"],
    style: "luxury painting",
    tone: "contemplative",
    primaryColor: "indigo",
    seasonal: false,
  },
  {
    category: "miss_you",
    subcategory: "postcard_memories",
    title: "Somewhere We've Been",
    prompt: "A premium greeting card front. Warm nostalgic impressionistic painting of a sunny coastal town — white-washed buildings, terracotta rooftops, blue water in the distance, a narrow street. Feels like a place you went together once. Loose, painterly Mediterranean style. No people, no text on buildings, no numbers. Portrait orientation, high resolution.",
    tags: ["travel", "nostalgia", "warm", "coastal", "terracotta", "memories"],
    style: "luxury painting",
    tone: "nostalgic",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "miss_you",
    subcategory: "empty_chair",
    title: "Saving Your Seat",
    prompt: "A premium greeting card front. Warm lifestyle scene — a cozy corner with two chairs by a window, one empty, afternoon light coming through. Not sad, just expectant — the warmth of knowing someone could be here, or the simple acknowledgment of missing them. Warm cream, terracotta, sage. No people, no text. Portrait orientation, high resolution.",
    tags: ["chair", "warmth", "waiting", "expectant", "cream", "cozy"],
    style: "cozy lifestyle",
    tone: "wistful",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "miss_you",
    subcategory: "abstract_distance",
    title: "Close No Matter What",
    prompt: "A premium greeting card front. Abstract minimalist illustration — two simple circles in warm terracotta and dusty rose, drawn close but not touching, connected by a fine curved line. On cream background. Quiet, warm, and tender. The feeling of closeness across distance. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["abstract", "connection", "minimal", "terracotta", "dusty-rose", "distance"],
    style: "modern minimal",
    tone: "tender",
    primaryColor: "terracotta",
    seasonal: false,
  },

  // ── Humor & Funny (15) ─────────────────────────────────────────────────────
  {
    category: "humor",
    subcategory: "cat_portrait",
    title: "Lord Fluffington",
    prompt: "A premium greeting card front. A formal Renaissance oil painting portrait of a very judgmental orange tabby cat. The cat is posed regally in a velvet chair, wearing an elaborate 17th-century lace ruff collar and a small powdered wig. Expression is deeply unimpressed and aristocratic. Rich jewel-toned background. Impeccable old-master painting technique. Absurdly dignified. No text, no numbers. Portrait orientation, print quality.",
    tags: ["cat", "humor", "portrait", "renaissance", "regal", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "coffee_worship",
    title: "Holy Coffee",
    prompt: "A premium greeting card front. A dramatic baroque oil painting of a single coffee mug centered in a divine shaft of golden light, as if it is a holy relic. Heavenly rays radiate outward, tiny golden dust particles suspended in the beam. Deep dark background like a Caravaggio painting. The mug is rendered with reverent photorealism. Absurdly sacred and theatrical. No text, no numbers. Portrait orientation, print quality.",
    tags: ["coffee", "humor", "dramatic", "baroque", "light", "funny"],
    style: "baroque parody",
    tone: "playful",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "cake_chaos",
    title: "Too Many Candles",
    prompt: "A premium greeting card front. Whimsical watercolor illustration of an enormous tiered birthday cake absolutely overwhelmed with lit candles — far too many, packed in ridiculous density. Small plumes of smoke curl upward. The cake leans slightly. Warm pastel tones, confetti scattered around the base. Charming and chaotic. Celebratory panic energy. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["birthday", "cake", "candles", "humor", "watercolor", "funny"],
    style: "whimsical watercolor",
    tone: "playful",
    primaryColor: "pink",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "procrastinator_trophy",
    title: "Champion of Later",
    prompt: "A premium greeting card front. An ornate, over-the-top golden trophy on a velvet podium, completely covered in elaborate cobwebs. Tiny dust motes float around it. The trophy is exquisitely detailed — baroque scrollwork, cherubs, laurel wreaths — yet clearly hasn't been touched in years. Dramatic spotlight from above. Noble and absurd. No text, no numbers. Portrait orientation, print quality.",
    tags: ["trophy", "humor", "procrastination", "gold", "cobwebs", "funny"],
    style: "still life parody",
    tone: "playful",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "guilty_dog",
    title: "I Did Nothing",
    prompt: "A premium greeting card front. A formal painted portrait of a very guilty-looking golden retriever in the style of an 18th-century aristocratic painting. The dog sits upright in a velvet chair, eyes wide and innocent, surrounded by gently falling confetti and a suspiciously torn bow. Ears slightly back. Painted with warm, rich tones and golden light. Magnificently guilty. No text, no numbers. Portrait orientation, print quality.",
    tags: ["dog", "humor", "portrait", "guilty", "confetti", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "wine_clock",
    title: "Wine O'Clock",
    prompt: "A premium greeting card front. A charming watercolor illustration of an elegant grandfather clock, but where the clock face should be there is instead a beautiful full wine glass, rendered in soft rose and burgundy. Roman numerals around the glass face. Warm, sophisticated palette — cream background, warm wood tones, dusty rose wine. Whimsical and chic. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["wine", "humor", "clock", "watercolor", "chic", "funny"],
    style: "whimsical watercolor",
    tone: "playful",
    primaryColor: "burgundy",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "vintage_bottle",
    title: "Aged to Perfection",
    prompt: "A premium greeting card front. A vintage illustration of a single very distinguished wine bottle in a cobwebbed cellar niche, lit by a single dripping candle. The bottle is elaborately labelled, clearly from a very old vintage, wrapped lightly in dust and cobwebs. Rich jewel tones — deep burgundy, aged cream, warm candlelight amber. Dignified, old, and perfectly preserved. No text, no numbers. Portrait orientation, print quality.",
    tags: ["wine", "humor", "vintage", "cellar", "candle", "funny"],
    style: "vintage illustration",
    tone: "playful",
    primaryColor: "burgundy",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "inbox_tower",
    title: "Inbox Zero (Never)",
    prompt: "A premium greeting card front. A surrealist illustration in the style of René Magritte — an impossible tower of stacked paper envelopes and documents stretching endlessly upward into a cloudy blue sky, perfectly balanced and gravity-defying. Each envelope is crisp and white. The stack narrows toward the top like a spire. Serene, absurd, and elegant. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["email", "humor", "surrealist", "tower", "office", "funny"],
    style: "surrealist illustration",
    tone: "playful",
    primaryColor: "blue",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "sad_succulent",
    title: "I Tried",
    prompt: "A premium greeting card front. A dramatic fine-art still life of a single, heroically wilted succulent on a bare windowsill. A single theatrical shaft of warm light falls on it from above, like a spotlight on a tragic actor. The succulent droops magnificently. The pot is terracotta. Muted warm tones, shadows long and dramatic. Quietly devastating. No text, no numbers. Portrait orientation, print quality.",
    tags: ["plant", "humor", "dramatic", "still-life", "succulent", "funny"],
    style: "dramatic still life",
    tone: "playful",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "angel_devil",
    title: "Both Valid Points",
    prompt: "A premium greeting card front. A charming whimsical illustration of two tiny cartoon figures — a sweet white-winged angel and a tiny red devil — sitting on separate fluffy clouds, leaning toward each other mid-argument, both making very compelling hand gestures. Both look equally reasonable and confident. Soft pastel sky, golden light, fluffy clouds. Adorable and relatable. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["angel", "devil", "humor", "cartoon", "decision", "funny"],
    style: "whimsical illustration",
    tone: "playful",
    primaryColor: "blue",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "book_stack",
    title: "Ambitious Reading List",
    prompt: "A premium greeting card front. A charming illustration of an impossibly tall, precarious tower of beautiful hardcover books stacked floor to ceiling. A single ornate bookmark sticks out of the very first book at the bottom. All books above it are pristine, unread, and aspiring. Warm library tones — deep greens, burgundy, gold spines. Cozy and self-aware. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["books", "humor", "library", "stack", "reading", "funny"],
    style: "warm illustration",
    tone: "playful",
    primaryColor: "green",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "couch_impression",
    title: "Peak Productivity",
    prompt: "A premium greeting card front. A top-down aerial-view illustration, as if from directly above, of a beautiful velvet couch. In the center cushion is a perfectly person-shaped impression. A TV remote sits at the exact center of the impression. A few chip crumbs arranged with suspiciously artful precision. Rendered in rich jewel tones — deep teal couch, cream cushions. Architectural and absurd. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["couch", "humor", "lazy", "aerial", "relatable", "funny"],
    style: "flat illustration",
    tone: "playful",
    primaryColor: "teal",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "lost_explorer",
    title: "Getting Warmer",
    prompt: "A premium greeting card front. A vintage hand-illustrated adventure map, aged parchment style. A single red dotted trail winds in a deeply confused spiral pattern across mountains and forests before ending at a blinking \"YOU ARE HERE\" pin placed in the most improbable location — surrounded by question marks. Classic cartography style with ornate compass rose, illustrated sea monsters, and decorative borders. Warm sepia and aged tones. No text beyond map legend elements. No numbers. Portrait orientation, print quality.",
    tags: ["map", "humor", "adventure", "lost", "vintage", "funny"],
    style: "vintage cartography",
    tone: "playful",
    primaryColor: "sepia",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "monday_portrait",
    title: "A Portrait of Monday",
    prompt: "A premium greeting card front. A dramatic classical portrait painting of a single coffee mug — rendered as if it were a distinguished historical figure. Sitting in a velvet chair, lit by dramatic side-lighting, with a rich dark background. The mug has a dignified, slightly exhausted expression implied through its posture. The portrait is earnest and reverent. Old-master oil painting technique. Absurdly serious. No text, no numbers. Portrait orientation, print quality.",
    tags: ["coffee", "humor", "portrait", "monday", "dramatic", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "brown",
    seasonal: false,
  },
  {
    category: "humor",
    subcategory: "nailed_it",
    title: "Nailed It",
    prompt: "A premium greeting card front. A whimsical split illustration: on one side, an elegant perfectly-frosted professional cake on a marble stand under perfect light; on the other side, the same cake attempt — lopsided, one layer sliding, frosting applied with obvious enthusiasm, a single candle listing sideways. Both rendered with equal artistic respect. Warm pastel bakery tones. Charming and relatable. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["baking", "humor", "cake", "relatable", "split", "funny"],
    style: "whimsical illustration",
    tone: "playful",
    primaryColor: "pink",
    seasonal: false,
  },

  // ── Birthday (12) ──────────────────────────────────────────────────────────
  {
    category: "birthday",
    subcategory: "champagne_celebration",
    title: "Birthday Pour",
    prompt: "A premium greeting card front. Luxury close-up photograph of golden champagne being poured into a crystal flute, a cascade of tiny bubbles rising, caught in warm backlighting. Gold and amber tones against a dark bokeh background. Celebratory, sophisticated, festive. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["champagne", "birthday", "luxury", "celebration", "gold", "bubbles"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "wildflower_birthday",
    title: "Birthday Wildflowers",
    prompt: "A premium greeting card front. Joyful loose watercolor of a generous wildflower bouquet — sunflowers, zinnias, ranunculus, and sweet peas in a vivid mix of warm yellow, coral, dusty rose, and sage. Painterly, expressive, full of energy. Cream background with scattered petals. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["wildflowers", "birthday", "colorful", "joyful", "watercolor", "bouquet"],
    style: "watercolor",
    tone: "joyful",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_candles",
    title: "Candlelight Wish",
    prompt: "A premium greeting card front. Intimate close-up of a single beautiful birthday cake in soft focus, a row of lit candles glowing warmly, the flames creating a soft amber light. The cake is elegant — smooth frosting, a single flower on top. No numbers, no text, no plates, no background clutter. Portrait orientation, warm candlelight palette, high resolution.",
    tags: ["cake", "candles", "birthday", "warm", "intimate", "amber"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "gold_confetti",
    title: "Gold Burst",
    prompt: "A premium greeting card front. Elegant abstract celebration design. An explosion of fine gold confetti and ribbon streamers bursting outward from the center — small geometric shapes, dots, and curled ribbon in gold, champagne, and deep navy. Premium, celebratory, not kitschy. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["confetti", "gold", "celebration", "birthday", "navy", "burst"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_balloons",
    title: "Balloon Garden",
    prompt: "A premium greeting card front. Charming illustrated scene — a cluster of hand-drawn balloons floating upward from a garden, in dusty rose, sage green, warm gold, and cream. The style is loose and illustrative, like a confident ink-and-watercolor drawing. Joyful, not childish. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["balloons", "birthday", "illustration", "warm", "sage", "joyful"],
    style: "illustration",
    tone: "joyful",
    primaryColor: "dusty rose",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_botanical",
    title: "Blooming Birthday",
    prompt: "A premium greeting card front. Lush botanical illustration of a full arrangement of garden roses, peonies, and eucalyptus — rich, layered, and celebratory. Deep blush and cream roses, full-petaled and glowing. Fine detailed linework with soft watercolor fills. Generous and beautiful. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["botanical", "roses", "birthday", "lush", "blush", "elegant"],
    style: "illustration",
    tone: "celebratory",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_minimal",
    title: "One Good Year",
    prompt: "A premium greeting card front. Ultra-minimalist design on warm cream. A single hand-drawn circle in warm terracotta, slightly imperfect and gestural, with a tiny five-point star beside it. Clean, intentional, contemporary. The simplicity feels like a quiet celebration. No text, no numbers, nothing else. Portrait orientation, high resolution.",
    tags: ["minimal", "birthday", "terracotta", "cream", "simple", "contemporary"],
    style: "modern minimal",
    tone: "warm",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_adventure",
    title: "Best Day Yet",
    prompt: "A premium greeting card front. Cinematic landscape at golden hour — a viewpoint looking out from a hilltop over rolling hills and open sky, the day at its most beautiful. Warm amber, deep green, soft coral sky. The feeling of a perfect day. No people, no text. Portrait orientation, high resolution, fine-art quality.",
    tags: ["landscape", "birthday", "adventure", "golden-hour", "amber", "freedom"],
    style: "luxury painting",
    tone: "adventurous",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_table",
    title: "Birthday Morning",
    prompt: "A premium greeting card front. Warm cozy flat-lay of a birthday morning setup — a beautiful small cake on a marble surface, a cup of coffee beside it, loose flower petals scattered, dappled morning light. Looks like a perfect slow start to a birthday. No text, no numbers visible, no people. Cream, blush, warm gold tones. Portrait orientation, high resolution.",
    tags: ["morning", "cake", "birthday", "cozy", "cream", "lifestyle"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_masculine",
    title: "Aged to Excellence",
    prompt: "A premium greeting card front. Sophisticated still-life photograph — a crystal rocks glass with a single large ice sphere and a measure of amber whiskey, catching warm side-lighting beautifully. On a dark walnut surface, a small sprig of rosemary beside it. Deep amber, charcoal, and warm wood tones. No text, no labels readable, no numbers. Portrait orientation, high resolution.",
    tags: ["whiskey", "birthday", "masculine", "premium", "amber", "dark"],
    style: "luxury photography",
    tone: "sophisticated",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_abstract",
    title: "Your Year",
    prompt: "A premium greeting card front. Bold abstract expressionist painting. Large confident brushstrokes in warm terracotta, gold, dusty rose, and sage green — energetic, joyful, free. Feels like a celebration in paint. Gallery quality. No text, no numbers, no representational imagery. Portrait orientation, high resolution.",
    tags: ["abstract", "birthday", "bold", "joyful", "terracotta", "gold"],
    style: "bold illustration",
    tone: "celebratory",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "birthday",
    subcategory: "birthday_stars",
    title: "Midnight Celebration",
    prompt: "A premium greeting card front. Dramatic night-sky celebration scene. A deep navy sky filled with stars and abstract firework bursts — loose impressionistic blooms of gold, coral, and cream light exploding softly against the dark. Painterly, cinematic, joyful. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["night", "fireworks", "birthday", "navy", "gold", "celebration"],
    style: "luxury painting",
    tone: "celebratory",
    primaryColor: "navy",
    seasonal: false,
  },

  // ── Personal Anniversary (8) ───────────────────────────────────────────────
  {
    category: "personal_anniversary",
    subcategory: "sunset_together",
    title: "Golden Hour",
    prompt: "A premium greeting card front. Painterly landscape at golden hour — two empty Adirondack chairs on a hillside facing a breathtaking sunset, the sky aflame in amber, coral, and deep rose. The chairs close together, facing the same direction. Intimate, romantic, and warm. No people visible, no text. Portrait orientation, high resolution.",
    tags: ["anniversary", "sunset", "romantic", "warm", "amber", "chairs"],
    style: "luxury painting",
    tone: "romantic",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "anniversary_champagne",
    title: "Anniversary Toast",
    prompt: "A premium greeting card front. Elegant lifestyle close-up of two crystal champagne flutes touching gently in a toast — caught in warm candlelight, soft bokeh of a romantic setting behind them. Gold and warm cream tones. Intimate and celebratory. No people, no text. Portrait orientation, high resolution.",
    tags: ["champagne", "anniversary", "romantic", "toast", "gold", "intimate"],
    style: "luxury photography",
    tone: "romantic",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "botanical_romance",
    title: "Garden Romance",
    prompt: "A premium greeting card front. Lush romantic botanical watercolor. Deep red peonies and garden roses with trailing eucalyptus and jasmine vine — rich, abundant, and deeply beautiful. The kind of flowers that stop you in your tracks. Deep rose, cream, sage green palette. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["peonies", "roses", "anniversary", "romantic", "botanical", "deep-rose"],
    style: "watercolor",
    tone: "romantic",
    primaryColor: "deep rose",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "candlelit_dinner",
    title: "Table for Two",
    prompt: "A premium greeting card front. Intimate lifestyle scene of a beautiful dinner table set for two — white linen, candles glowing, a single vase of roses, wine glasses catching the light. Soft warm candlelight, blurred background. The anticipation of a special evening together. No people, no text. Portrait orientation, high resolution.",
    tags: ["dinner", "anniversary", "romantic", "candles", "warm", "intimate"],
    style: "cozy lifestyle",
    tone: "romantic",
    primaryColor: "warm gold",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "abstract_love",
    title: "Intertwined",
    prompt: "A premium greeting card front. Abstract painterly composition — two flowing forms in warm rose gold and deep burgundy interweaving and overlapping, fluid and organic. Suggests togetherness, movement, connection. Gallery-quality abstract art. Cream background, warm palette. No text, no literal figures, no numbers. Portrait orientation, high resolution.",
    tags: ["abstract", "anniversary", "romantic", "rose-gold", "flowing", "connection"],
    style: "luxury painting",
    tone: "romantic",
    primaryColor: "rose gold",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "harbor_dusk",
    title: "Still Harbor",
    prompt: "A premium greeting card front. Painterly coastal scene at dusk — a calm harbor with soft reflections on the water, warm amber and deep coral on the horizon, a single sailboat at anchor. Peaceful and romantic. Loose impressionistic brushwork. Deep navy, warm coral, amber palette. No text, no people. Portrait orientation, high resolution.",
    tags: ["harbor", "anniversary", "romantic", "dusk", "navy", "coastal"],
    style: "watercolor",
    tone: "romantic",
    primaryColor: "navy",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "single_rose",
    title: "The Red Rose",
    prompt: "A premium greeting card front. Fine-art close-up photograph of a single deep red rose — the petals velvety and rich, drops of water catching light. Centered on a cream background, beautifully lit from the side. Timeless, elegant, deeply romantic. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["rose", "anniversary", "romantic", "red", "elegant", "timeless"],
    style: "luxury photography",
    tone: "romantic",
    primaryColor: "deep red",
    seasonal: false,
  },
  {
    category: "personal_anniversary",
    subcategory: "road_together",
    title: "Every Road With You",
    prompt: "A premium greeting card front. Painterly open country road stretching toward a warm horizon — late afternoon light, the world quiet and beautiful. The feeling of a long journey together, more road ahead than behind, and being glad for the company. No people, no cars, no text. Warm amber, sage green, soft sky. Portrait orientation, high resolution.",
    tags: ["road", "anniversary", "journey", "warm", "amber", "together"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },

  // ── Thank You (8) ──────────────────────────────────────────────────────────
  {
    category: "thank_you",
    subcategory: "lavender_bundle",
    title: "Lavender Thank You",
    prompt: "A premium greeting card front. Elegant lifestyle close-up of a hand-tied bundle of dried lavender on warm cream linen — the purple-grey stems perfectly bundled with a simple cream ribbon. Soft natural light. Calm, gracious, and beautiful. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["lavender", "thank-you", "botanical", "elegant", "cream", "calm"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "lavender",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "sunflower_thanks",
    title: "Big Gratitude",
    prompt: "A premium greeting card front. Bold close-up fine-art photograph of a single perfect sunflower — the golden petals radiating outward, the dark center rich with texture, shot against a warm cream background. Vivid, warm, generous. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["sunflower", "thank-you", "bold", "golden", "warm", "gratitude"],
    style: "luxury photography",
    tone: "warm",
    primaryColor: "golden yellow",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "gold_wreath_thanks",
    title: "With Gratitude",
    prompt: "A premium greeting card front. Minimalist elegant design on warm cream. A fine-line botanical wreath in warm gold — thin detailed branches, tiny leaves, small berries. Clean and sophisticated. Premium stationery aesthetic. No text visible inside the wreath, no numbers. Portrait orientation, high resolution.",
    tags: ["wreath", "thank-you", "elegant", "gold", "minimal", "gratitude"],
    style: "modern minimal",
    tone: "warm",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "warm_peony",
    title: "Peony Season",
    prompt: "A premium greeting card front. Lush loose watercolor of full blush peonies — open and generous, petals soft and layered. A few petals scattered below. The most gracious of flowers. Palette: deep blush, soft cream, pale sage. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["peonies", "thank-you", "watercolor", "blush", "gracious", "botanical"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "garden_gate",
    title: "Open Garden",
    prompt: "A premium greeting card front. Charming illustration of a white picket garden gate open wide, flanked by climbing roses in full bloom — a welcoming, generous image. Warm afternoon light beyond. Soft illustration style with precise linework. Palette: cream, soft rose, sage green, warm gold. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["garden", "thank-you", "welcoming", "roses", "illustration", "warm"],
    style: "illustration",
    tone: "warm",
    primaryColor: "cream",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "hands_warmth",
    title: "Grateful Hands",
    prompt: "A premium greeting card front. Close-up lifestyle photograph of two hands cupped warmly around a ceramic mug of tea — only the hands and mug, no faces. Steam rising gently. Tender and warm. Cream and terracotta tones, soft focus background. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["hands", "thank-you", "warm", "intimate", "terracotta", "grateful"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "terracotta",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "morning_light_thanks",
    title: "Morning Thanks",
    prompt: "A premium greeting card front. Soft impressionistic watercolor sunrise — pale gold light on a calm horizon, the world just waking. The feeling of a fresh start earned by someone else's generosity. Loose, gentle brushwork. Palette: warm blush, pale gold, soft lavender. No text, no people. Portrait orientation, high resolution.",
    tags: ["sunrise", "thank-you", "hopeful", "warm", "blush", "morning"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "thank_you",
    subcategory: "bold_thanks",
    title: "Simply, Thank You",
    prompt: "A premium greeting card front. Bold graphic illustration. A large hand-drawn sun — a circle with short radiating lines — in warm golden yellow on cream, drawn with a confident thick brush. Generous, warm, uncomplicated. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["sun", "thank-you", "bold", "golden", "warm", "simple"],
    style: "bold illustration",
    tone: "joyful",
    primaryColor: "golden yellow",
    seasonal: false,
  },

  // ── Graduation (6) ─────────────────────────────────────────────────────────
  {
    category: "graduation",
    subcategory: "cap_stars",
    title: "Cap and Stars",
    prompt: "A premium greeting card front. Elegant minimalist illustration on deep navy. A graduation cap silhouette in clean gold linework, surrounded by a loose scatter of hand-drawn gold stars. Simple, iconic, and celebratory. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["graduation", "cap", "stars", "navy", "gold", "milestone"],
    style: "modern minimal",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "graduation",
    subcategory: "open_road_grad",
    title: "Next Chapter",
    prompt: "A premium greeting card front. Cinematic landscape — a long open road stretching toward a bright horizon in the early morning. The road ahead is golden with possibility. The feeling of standing at a threshold with everything ahead. No cars, no people, no text. Warm amber, pale gold, deep sky blue palette. Portrait orientation, high resolution.",
    tags: ["graduation", "road", "possibility", "horizon", "amber", "milestone"],
    style: "luxury painting",
    tone: "hopeful",
    primaryColor: "amber",
    seasonal: false,
  },
  {
    category: "graduation",
    subcategory: "summit_grad",
    title: "Earned It",
    prompt: "A premium greeting card front. Dramatic painterly mountain summit at sunrise — warm gold and rose light flooding the peak from below, the summit just reached. The feeling of hard work rewarded and the view from the top. No people, no text. Palette: warm gold, deep blue, sunrise rose. Portrait orientation, high resolution.",
    tags: ["mountain", "graduation", "achievement", "summit", "gold", "earned"],
    style: "luxury painting",
    tone: "triumphant",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "graduation",
    subcategory: "bloom_grad",
    title: "Full Bloom",
    prompt: "A premium greeting card front. Vibrant botanical watercolor of a spring garden in full explosion — cherry blossoms, tulips, daffodils, new green leaves all at once. The height of bloom, everything fresh and bursting. A moment of everything coming together. No text, no numbers. Palette: blush, pale yellow, fresh green, cream. Portrait orientation, high resolution.",
    tags: ["bloom", "graduation", "spring", "botanical", "joyful", "fresh"],
    style: "watercolor",
    tone: "joyful",
    primaryColor: "blush",
    seasonal: false,
  },
  {
    category: "graduation",
    subcategory: "grad_champagne",
    title: "Pop the Cork",
    prompt: "A premium greeting card front. Joyful luxury photograph of a champagne bottle uncorking — the cork in mid-flight, a cascade of foam and bubbles catching the light against a warm bokeh background. Gold and cream tones. Pure, uncontained celebration. No people, no text, no numbers. Portrait orientation, high resolution.",
    tags: ["champagne", "graduation", "celebration", "joyful", "gold", "milestone"],
    style: "luxury photography",
    tone: "celebratory",
    primaryColor: "gold",
    seasonal: false,
  },
  {
    category: "graduation",
    subcategory: "bold_future",
    title: "The Whole World",
    prompt: "A premium greeting card front. Bold graphic illustration. A large confident upward-pointing arrow in deep navy on warm cream — the arrow drawn with a broad gestural brushstroke, full of forward energy. A small burst of confetti dots at the tip. No text, no numbers, nothing else. Portrait orientation, high resolution.",
    tags: ["arrow", "graduation", "bold", "navy", "future", "energy"],
    style: "bold illustration",
    tone: "triumphant",
    primaryColor: "navy",
    seasonal: false,
  },

  // ── Holiday Personal (8) ───────────────────────────────────────────────────
  {
    category: "holiday_personal",
    subcategory: "christmas_tree",
    title: "Christmas Morning",
    prompt: "A premium greeting card front. Warm cozy interior — a beautifully decorated Christmas tree glowing in a corner of a room, wrapped gifts beneath it, morning light beginning to filter in through a frosted window. The tree lights warm amber and gold, ornaments deep red and brass. No people, no text. The feeling of Christmas morning before everyone wakes up. Portrait orientation, high resolution.",
    tags: ["christmas", "tree", "morning", "cozy", "warm", "holiday"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "holiday_wreath",
    title: "Holiday Wreath",
    prompt: "A premium greeting card front. Lush illustrated holiday wreath on a warm cream background — full of fresh pine, magnolia leaves, red berries, pinecones, dried oranges, and a single large velvet red bow at the bottom. Richly detailed botanical illustration. Deep green, deep red, warm gold accents. No text. Portrait orientation, high resolution.",
    tags: ["wreath", "christmas", "holiday", "botanical", "red", "warm"],
    style: "illustration",
    tone: "warm",
    primaryColor: "deep green",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "winter_hearth",
    title: "Home for the Holidays",
    prompt: "A premium greeting card front. Cozy warm interior — a stone fireplace blazing with a crackling fire, two stockings hung from the mantle, a few pine branches and candles arranged above. The room glows amber. The quintessential feeling of the holidays at home. No people, no text, no numbers. Portrait orientation, high resolution.",
    tags: ["fireplace", "christmas", "holiday", "cozy", "stockings", "amber"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "snowy_home",
    title: "Winter Glow",
    prompt: "A premium greeting card front. Painterly winter scene — a charming home on a quiet snowy evening, every window glowing warm amber, snow dusting the roof and yard, a lamppost with a soft halo. The contrast of cold blue-white snow and warm interior light. No text, no people. Palette: deep blue-white snow, warm amber glow. Portrait orientation, high resolution.",
    tags: ["snow", "home", "winter", "holiday", "glow", "cozy"],
    style: "illustration",
    tone: "warm",
    primaryColor: "amber",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "thanksgiving_table",
    title: "Harvest Table",
    prompt: "A premium greeting card front. Warm lifestyle flat-lay of a Thanksgiving tablescape — a linen runner, dried wheat stalks, small gourds, a few candles, sprigs of rosemary and sage, a small vase of amber dahlias. Textured, abundant, warm. Palette: warm amber, rust, cream, sage green. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["thanksgiving", "harvest", "warm", "table", "amber", "seasonal"],
    style: "cozy lifestyle",
    tone: "warm",
    primaryColor: "amber",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "valentine_roses",
    title: "Be Mine",
    prompt: "A premium greeting card front. Romantic fine-art close-up of deep red and blush pink rose petals scattered across white linen — fresh petals, some still on small stems, shot in warm side-lighting. Rich sensory detail. Deep red, blush, cream palette. No text, no numbers. Portrait orientation, high resolution.",
    tags: ["valentine", "roses", "romantic", "red", "blush", "intimate"],
    style: "luxury photography",
    tone: "romantic",
    primaryColor: "deep red",
    seasonal: true,
  },
  {
    category: "holiday_personal",
    subcategory: "mothers_day",
    title: "For Her Garden",
    prompt: "A premium greeting card front. Lush soft watercolor of a cottage garden — foxglove, sweet peas, climbing roses on a white fence, lavender borders. Painted in gentle detail, clearly loved and tended with care. Palette: soft rose, lavender, sage green, cream. No text, no people, no numbers. Portrait orientation, high resolution.",
    tags: ["mothers-day", "garden", "flowers", "soft", "rose", "lavender"],
    style: "watercolor",
    tone: "warm",
    primaryColor: "soft rose",
    seasonal: false,
  },
  {
    category: "holiday_personal",
    subcategory: "fathers_day",
    title: "The Long View",
    prompt: "A premium greeting card front. Cinematic landscape at golden hour — a wide open vista from a hilltop, rolling landscape stretching to the horizon, a single well-worn wooden bench in the foreground. The kind of view a patient person waits for. Deep amber, forest green, warm gold sky. No people, no text. Portrait orientation, high resolution.",
    tags: ["fathers-day", "landscape", "golden-hour", "masculine", "bench", "amber"],
    style: "luxury painting",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },

  // ─── Funny Marketing Batch 1 ─────────────────────────────────────────────────

  {
    title: "Lord Fluffington",
    category: "humor",
    subcategory: "lord_fluffington",
    prompt: "A premium greeting card front. A grand Renaissance oil portrait of a regal orange tabby cat seated on a velvet throne, wearing a gold crown and ermine-trimmed cloak, paws resting on carved wooden armrests. Ornate gilded frame implied by rich drapery behind the subject. Deep burgundy, royal gold, and dark mahogany tones. Museum-quality brushwork, dramatic chiaroscuro lighting, every whisker rendered with painterly precision. The cat's expression radiates aristocratic authority. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["humor", "cat", "renaissance", "royal", "portrait", "gold", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "gold",
    seasonal: false,
  },

  {
    title: "Coffee Before Humanity",
    category: "humor",
    subcategory: "coffee_before_humanity",
    prompt: "A premium greeting card front. A grumpy tabby cat rendered in rich oil paint, seated possessively over an impossibly large ceramic coffee mug on a dark wooden table. Steam curls upward in elegant wisps. The cat's expression is one of supreme territorial disdain — brows furrowed, eyes half-closed. Early morning window light, golden and hazy. Amber, warm cream, and deep shadow. Museum still-life quality, dramatic side lighting. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["humor", "cat", "coffee", "morning", "grumpy", "amber", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "amber",
    seasonal: false,
  },

  {
    title: "Retirement Sloth",
    category: "retirement",
    subcategory: "retirement_sloth",
    prompt: "A premium greeting card front. A serene sloth reclines in a woven hammock strung between two palm trees, gently swaying above a pristine tropical beach at golden hour. The ocean stretches to a warm horizon, turquoise and gold. Lush palm fronds frame the composition. The sloth's expression is one of complete, deserved contentment. Watercolor illustration with loose, luminous brushwork — tropical teal, sandy gold, and warm coral. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["retirement", "sloth", "tropical", "beach", "hammock", "relax", "teal"],
    style: "watercolor",
    tone: "relaxed",
    primaryColor: "teal",
    seasonal: false,
  },

  {
    title: "Judgmental Chicken",
    category: "humor",
    subcategory: "judgmental_chicken",
    prompt: "A premium greeting card front. A plump, opinionated hen stands in the foreground of a sun-drenched rustic farmyard, staring directly at the viewer with an expression of profound skeptical judgment — head tilted, one eye narrowed. Behind her, a weathered red barn, wildflower meadow, and wooden fence. Warm oil paint style evoking Dutch Golden Age farmyard paintings. Ochre, barn red, sage green, and golden straw. Every feather painted with wry dignity. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["humor", "chicken", "farm", "judgmental", "rustic", "ochre", "funny"],
    style: "vintage illustration",
    tone: "playful",
    primaryColor: "ochre",
    seasonal: false,
  },

  {
    title: "Motivational Goat",
    category: "encouragement",
    subcategory: "motivational_goat",
    prompt: "A premium greeting card front. A confident, majestic mountain goat stands triumphantly on the very tip of a dramatic rocky peak, silhouetted against a sweeping alpine sunrise. Below, clouds roll through a valley of granite and pine. The goat's posture radiates unshakeable self-assurance. Deep cerulean sky, warm sunrise gold, and cool slate grey. Painterly realism with bold, confident brushwork. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["encouragement", "goat", "mountain", "sunrise", "inspiring", "cerulean", "peak"],
    style: "luxury painting",
    tone: "inspirational",
    primaryColor: "cerulean",
    seasonal: false,
  },

  {
    title: "Noble Dog",
    category: "birthday",
    subcategory: "noble_dog",
    prompt: "A premium greeting card front. A distinguished golden retriever rendered as an 18th-century aristocratic oil portrait — seated upright on a tufted velvet chair, wearing a silk cravat, one paw resting on a leather-bound book. Background of rich dark green drapery and a mahogany bookcase. The dog's expression is dignified, warm, and slightly self-satisfied. Deep forest green, warm honey gold, ivory, and walnut brown. Thick, luminous oil paint with masterful soft-focus background. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["birthday", "dog", "golden-retriever", "portrait", "aristocratic", "gold", "funny"],
    style: "oil painting parody",
    tone: "warm",
    primaryColor: "gold",
    seasonal: false,
  },

  {
    title: "Golf Goose",
    category: "humor",
    subcategory: "golf_goose",
    prompt: "A premium greeting card front. A smug, imperious Canada goose strides across an immaculate championship golf fairway as though it owns every blade of grass. The perfectly manicured course stretches to a tree-lined horizon behind it. The goose's expression radiates absolute territorial authority. Painterly realism — lush emerald green fairway, powder blue sky, warm afternoon light. Rich oil paint in the manner of a prestigious sporting scene. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["golf", "goose", "humor", "outdoor", "sport", "green", "funny"],
    style: "luxury painting",
    tone: "playful",
    primaryColor: "green",
    seasonal: false,
  },

  {
    title: "Royal Raccoon",
    category: "humor",
    subcategory: "royal_raccoon",
    prompt: "A premium greeting card front. A raccoon painted as 17th-century European nobility in a grand stately portrait — wearing a lace collar, velvet doublet, and an expression of unearned gravitas. The raccoon's natural eye mask rendered as the height of aristocratic fashion. Dark background with a single dramatic shaft of light. Deep charcoal, midnight blue, silver, and rich crimson. Old master oil technique with impeccable brushwork. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["humor", "raccoon", "royal", "portrait", "aristocratic", "charcoal", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "charcoal",
    seasonal: false,
  },

  {
    title: "Vintage Owl",
    category: "thinking_of_you",
    subcategory: "vintage_owl",
    prompt: "A premium greeting card front. A magnificent great horned owl perched on a stack of leather-bound antique books in a lantern-lit Victorian study. Bookshelves recede into warm shadow behind it. The owl gazes with calm, deep intelligence. Warm amber candlelight, aged parchment, dark mahogany, and ivory gold. Painted in the manner of 19th-century natural history illustration — precise, reverent, and luminous. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["thinking-of-you", "owl", "library", "vintage", "amber", "books", "warm"],
    style: "luxury painting",
    tone: "warm",
    primaryColor: "amber",
    seasonal: false,
  },

  {
    title: "Fishing Pelican",
    category: "humor",
    subcategory: "fishing_pelican",
    prompt: "A premium greeting card front. A great white pelican rendered as the subject of an old sea-captain's portrait — perched with absolute gravitas on the weathered end of a quiet morning dock, early mist rising off still water, fishing rods propped beside it. The pelican's expression is one of seasoned, unshakeable patience. Deep navy, warm grey, and muted gold from the low sunrise. Old master oil technique, painterly and atmospheric. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["fishing", "pelican", "water", "outdoor", "humor", "navy", "funny"],
    style: "oil painting parody",
    tone: "playful",
    primaryColor: "navy",
    seasonal: false,
  },

  {
    title: "BBQ Bulldog",
    category: "humor",
    subcategory: "bbq_bulldog",
    prompt: "A premium greeting card front. A stocky English bulldog stands before a magnificent backyard barbecue grill, smoke curling into a golden summer sky, with the proprietorial confidence of a medieval king surveying his domain. The bulldog's expression combines deep pride with complete satisfaction. Warm amber afternoon light, lush backyard greenery, vivid red grill. Painterly oil style, rich and sun-drenched. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["bbq", "cooking", "dog", "humor", "outdoor", "amber", "funny"],
    style: "luxury painting",
    tone: "playful",
    primaryColor: "amber",
    seasonal: false,
  },

  {
    title: "Wine Dachshund",
    category: "humor",
    subcategory: "wine_dachshund",
    prompt: "A premium greeting card front. A sleek, elongated dachshund reclines beside an elegant wine arrangement at golden hour — a bottle of fine red, a crystal glass catching the warm light, and scattered vine leaves on a rustic stone surface, rows of vineyard terraces glowing behind it. The dachshund's posture is one of absolute refined leisure. Deep burgundy, warm gold, and terracotta. Impressionistic oil technique, lush and warm. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["wine", "dog", "vineyard", "humor", "warm", "burgundy", "funny"],
    style: "luxury painting",
    tone: "playful",
    primaryColor: "burgundy",
    seasonal: false,
  },

  {
    title: "Birthday Bear",
    category: "birthday",
    subcategory: "birthday_bear",
    prompt: "A premium greeting card front. A cheerful brown bear seated at a rustic woodland picnic setting — a beautifully arranged spread of woodland berries, wildflowers, and a small layered cake on a moss-covered log. Dappled sunlight filters through tall oaks. The bear's expression radiates warm, uncomplicated joy. Warm honey, forest green, soft rose, and golden light. Whimsical watercolor illustration with loose, luminous brushwork. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["birthday", "bear", "woodland", "celebration", "warm", "honey", "whimsical"],
    style: "whimsical watercolor",
    tone: "celebratory",
    primaryColor: "honey",
    seasonal: false,
  },

  {
    title: "Wise Tortoise",
    category: "encouragement",
    subcategory: "wise_tortoise",
    prompt: "A premium greeting card front. A weathered, dignified tortoise making its steady way along a beautiful winding stone path through a sun-dappled wildflower meadow — bluebells, poppies, and golden grasses stretching to a gentle wooded horizon. The tortoise's expression conveys absolute equanimity and purpose. Warm watercolor washes — sage, ochre, poppy red, and sky blue. Soft, luminous light. The path curves gently, suggesting a journey well worth taking. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["encouragement", "tortoise", "journey", "wildflower", "sage", "hopeful", "nature"],
    style: "watercolor",
    tone: "hopeful",
    primaryColor: "sage",
    seasonal: false,
  },

  {
    title: "Legendary Fox",
    category: "birthday",
    subcategory: "legendary_fox",
    prompt: "A premium greeting card front. A charismatic red fox depicted as the subject of a dramatic heroic portrait — painted with sweeping confidence against a moody twilight sky, one paw raised on a mossy rock, the autumn forest ablaze with colour behind it. The fox's amber eyes gleam with magnetic intelligence and daring. Deep burnt sienna, midnight navy, copper, and flame orange. Bold, theatrical oil brushwork in the manner of a Romantic-era hero portrait. No text, no people, no numbers. Portrait orientation. Print-quality fine art.",
    tags: ["birthday", "fox", "heroic", "portrait", "autumn", "orange", "dramatic"],
    style: "oil painting parody",
    tone: "celebratory",
    primaryColor: "orange",
    seasonal: false,
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
      const rawBuffer = Buffer.from(b64, "base64");

      onProgress?.(`Upscaling to 300 DPI: ${design.title}…`);

      // Step 1b: Upscale to 1500×2100 (300 DPI at 5"×7") before uploading
      const imageBuffer = await upscaleToPrintResolution(rawBuffer);

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
  const rawBuffer = Buffer.from(b64, "base64");

  // Upscale to 1500×2100 (300 DPI at 5"×7") before uploading
  const imageBuffer = await upscaleToPrintResolution(rawBuffer);

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
