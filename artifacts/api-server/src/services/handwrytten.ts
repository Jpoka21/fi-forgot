/**
 * Handwrytten API Service (official SDK)
 *
 * Uses the `handwrytten` npm package — the official TypeScript SDK.
 * Auth, base URL, and endpoint paths are all handled by the SDK internally.
 *
 * Required env var:
 *   HANDWRYTTEN_API_KEY — from https://app.handwrytten.com/integrations
 *
 * Required sender env vars (one of two options):
 *   Option A — saved return address ID from your Handwrytten account:
 *     HANDWRYTTEN_SENDER_ADDRESS_ID  (numeric ID)
 *
 *   Option B — inline sender address fields:
 *     HANDWRYTTEN_SENDER_FIRST_NAME
 *     HANDWRYTTEN_SENDER_LAST_NAME
 *     HANDWRYTTEN_SENDER_STREET1
 *     HANDWRYTTEN_SENDER_CITY
 *     HANDWRYTTEN_SENDER_STATE
 *     HANDWRYTTEN_SENDER_ZIP
 *
 * Optional:
 *   HANDWRYTTEN_DEFAULT_FONT — font ID to use (default: first available from API)
 */

import { Handwrytten } from "handwrytten";
import { logger } from "../lib/logger";

const API_KEY = process.env["HANDWRYTTEN_API_KEY"];
export const IS_MOCK = !API_KEY;

if (IS_MOCK) {
  logger.warn("HANDWRYTTEN_API_KEY not set — running in MOCK mode. No real cards will be sent.");
}

// ─── SDK client (only created when key is present) ────────────────────────────

const hw = API_KEY ? new Handwrytten(API_KEY) : null;

// ─── Sender address resolution ────────────────────────────────────────────────

function getSender(): number | {
  firstName: string; lastName: string;
  street1: string; city: string; state: string; zip: string;
} {
  const savedId = process.env["HANDWRYTTEN_SENDER_ADDRESS_ID"];
  if (savedId) return parseInt(savedId, 10);

  const firstName = process.env["HANDWRYTTEN_SENDER_FIRST_NAME"];
  const lastName = process.env["HANDWRYTTEN_SENDER_LAST_NAME"];
  const street1 = process.env["HANDWRYTTEN_SENDER_STREET1"];
  const city = process.env["HANDWRYTTEN_SENDER_CITY"];
  const state = process.env["HANDWRYTTEN_SENDER_STATE"];
  const zip = process.env["HANDWRYTTEN_SENDER_ZIP"];

  if (!firstName || !lastName || !street1 || !city || !state || !zip) {
    throw new Error(
      "Sender address not configured. Set HANDWRYTTEN_SENDER_ADDRESS_ID or all HANDWRYTTEN_SENDER_* env vars."
    );
  }

  return { firstName, lastName, street1, city, state, zip };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HandwryttenCard {
  id: string | number;
  name: string;
  category?: string;
  imageUrl?: string;
  price?: number;
}

export interface HandwryttenRecipientAddress {
  firstName: string;
  lastName: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface HandwryttenOrderRequest {
  cardId: string | number;
  recipientAddress: HandwryttenRecipientAddress;
  message: string;
  wishes?: string;       // closing/signature line — e.g. "With love, James"
  fontId?: string;
}

export interface HandwryttenOrderResponse {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  mock?: boolean;
  raw?: unknown;
}

export interface HandwryttenOrderStatus {
  orderId: string;
  status: string;
  mailedAt?: string;
  deliveredAt?: string;
  trackingUrl?: string;
  mock?: boolean;
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockOrderId() {
  return `MOCK-HW-${Date.now().toString(36).toUpperCase()}`;
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Extract a human-readable card name from its image URL filename. */
function nameFromImageUrl(url: string): string {
  try {
    const filename = decodeURIComponent(url.split("/").pop() ?? "");
    // Strip timestamp prefix (digits_) and -Front/-Back suffix and extension
    return filename
      .replace(/^\d+_/, "")
      .replace(/[-_](front|back|a2|5x7|landscape|portrait).*$/i, "")
      .replace(/\.\w+$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
  } catch {
    return "Card";
  }
}

export async function listHandwryttenCards(category?: string): Promise<HandwryttenCard[]> {
  if (IS_MOCK || !hw) {
    logger.info("MOCK: listHandwryttenCards");
    return [
      { id: "hw-4421", name: "Classic Botanical", category: "Birthday", price: 399 },
      { id: "hw-4422", name: "Modern Minimal", category: "All Occasions", price: 349 },
      { id: "hw-4423", name: "Anniversary Gold", category: "Anniversary", price: 449 },
      { id: "hw-4424", name: "Funny Script", category: "Birthday", price: 379 },
      { id: "hw-4425", name: "Holiday Classic Red", category: "Holiday", price: 399 },
    ];
  }

  const cards = await hw.cards.list();
  return (cards as any[])
    .filter((c: any) => !category || c.category === category)
    .map((c: any) => {
      const imageUrl: string = c.imageUrl ?? c.image_url ?? "";
      return {
        id: String(c.id),
        name: c.name ?? c.title ?? nameFromImageUrl(imageUrl),
        category: c.category ?? c.category_name ?? "General",
        imageUrl,
        price: c.price,
      };
    });
}

export async function listHandwryttenFonts(): Promise<{ id: string; name: string }[]> {
  if (IS_MOCK || !hw) {
    return [
      { id: "hwDavid", name: "David (Natural)" },
      { id: "hwMegan", name: "Megan (Casual)" },
      { id: "hwJennifer", name: "Jennifer (Formal)" },
    ];
  }
  const fonts = await hw.fonts.list();
  return (fonts as any[]).map((f: any) => {
    const id = String(f.id ?? f.name ?? "");
    // SDK returns empty name — derive a readable label from the ID (e.g. "hwAmber" → "Amber")
    const rawName = String(f.name ?? f.title ?? "").trim();
    const label = rawName || id.replace(/^hw/i, "");
    return { id, name: label };
  });
}

export async function createHandwryttenOrder(
  req: HandwryttenOrderRequest
): Promise<HandwryttenOrderResponse> {
  if (IS_MOCK || !hw) {
    const orderId = mockOrderId();
    logger.info({ orderId, ...req }, "MOCK: createHandwryttenOrder");
    return {
      orderId,
      status: "queued",
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      mock: true,
    };
  }

  const defaultFont = process.env["HANDWRYTTEN_DEFAULT_FONT"];

  // Resolve font — use env override, passed fontId, or first available
  let font = req.fontId ?? defaultFont;
  if (!font) {
    try {
      const fonts = await hw.fonts.list();
      font = fonts[0]?.id as string;
    } catch {
      font = "hwDavid"; // known working fallback
    }
  }

  const sender = getSender();

  const result = await hw.orders.send({
    cardId: req.cardId as any,
    font: font as any,
    message: req.message,
    wishes: req.wishes ?? "",
    sender,
    recipient: {
      firstName: req.recipientAddress.firstName,
      lastName: req.recipientAddress.lastName,
      street1: req.recipientAddress.street1,
      street2: req.recipientAddress.street2,
      city: req.recipientAddress.city,
      state: req.recipientAddress.state,
      zip: req.recipientAddress.zip,
    } as any,
  }) as any;

  logger.info({ result }, "Handwrytten order created (live)");

  const orderId = String(result?.orderId ?? result?.order_id ?? result?.id ?? "unknown");
  return {
    orderId,
    status: result?.status ?? "submitted",
    estimatedDelivery: result?.estimatedDelivery ?? result?.estimated_delivery,
    raw: result,
    mock: false,
  };
}

export async function getHandwryttenOrderStatus(
  orderId: string
): Promise<HandwryttenOrderStatus> {
  if (IS_MOCK || !hw) {
    logger.info({ orderId }, "MOCK: getHandwryttenOrderStatus");
    const mockStatuses = ["queued", "printing", "mailed"];
    return {
      orderId,
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      trackingUrl: `https://app.handwrytten.com/orders/${orderId}`,
      mock: true,
    };
  }

  // The SDK may not expose status/cancel — fall back to direct HTTP
  const res = await fetch(`https://api.handwrytten.com/v2/orders/${orderId}`, {
    headers: { Authorization: API_KEY! },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Handwrytten status check failed ${res.status}: ${body}`);
  }

  const data = await res.json() as any;
  return {
    orderId,
    status: data.status ?? data.order_status ?? "unknown",
    mailedAt: data.mailedAt ?? data.mailed_at,
    deliveredAt: data.deliveredAt ?? data.delivered_at,
    trackingUrl: data.trackingUrl ?? data.tracking_url ?? `https://app.handwrytten.com/orders/${orderId}`,
    mock: false,
  };
}

export async function cancelHandwryttenOrder(
  orderId: string
): Promise<{ success: boolean; message?: string; mock?: boolean }> {
  if (IS_MOCK || !hw) {
    logger.info({ orderId }, "MOCK: cancelHandwryttenOrder");
    return { success: true, message: "Order cancelled (mock)", mock: true };
  }

  const res = await fetch(`https://api.handwrytten.com/v2/orders/${orderId}/cancel`, {
    method: "POST",
    headers: { Authorization: API_KEY!, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Handwrytten cancel failed ${res.status}: ${body}`);
  }

  return { success: true, mock: false };
}

export const handwryttenService = {
  listCards: listHandwryttenCards,
  listFonts: listHandwryttenFonts,
  createOrder: createHandwryttenOrder,
  getOrderStatus: getHandwryttenOrderStatus,
  cancelOrder: cancelHandwryttenOrder,
  isMock: IS_MOCK,
};
