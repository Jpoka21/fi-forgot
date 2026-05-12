/**
 * Handwrytten API Service
 *
 * This is the isolated fulfillment provider layer. All Handwrytten interactions
 * go through this file only. Swap this file to change providers.
 *
 * Environment variables required:
 *   HANDWRYTTEN_API_KEY   — API key from Handwrytten dashboard
 *   HANDWRYTTEN_BASE_URL  — Base URL (default: https://api.handwrytten.com/v1)
 *
 * TODO: Fill in exact endpoint paths from https://app.handwrytten.com/api-docs
 * Mock mode is active when HANDWRYTTEN_API_KEY is not set.
 */

import { logger } from "../lib/logger";

const BASE_URL = process.env["HANDWRYTTEN_BASE_URL"] ?? "https://api.handwrytten.com/v1";
const API_KEY = process.env["HANDWRYTTEN_API_KEY"];

const IS_MOCK = !API_KEY;

if (IS_MOCK) {
  logger.warn("HANDWRYTTEN_API_KEY not set — running in MOCK mode. No real cards will be sent.");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HandwryttenCard {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
  price?: number;
}

export interface HandwryttenAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface HandwryttenOrderRequest {
  cardId: string;
  recipientAddress: HandwryttenAddress;
  message: string;
  handwritingStyleId?: string; // TODO: get available styles from Handwrytten
  scheduledSendDate?: string; // ISO date — if supported by API
  senderName?: string;
}

export interface HandwryttenOrderResponse {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  mock?: boolean;
}

export interface HandwryttenOrderStatus {
  orderId: string;
  status: string;
  mailedAt?: string;
  deliveredAt?: string;
  trackingUrl?: string;
  mock?: boolean;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function hwFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Handwrytten API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockOrderId() {
  return `MOCK-HW-${Date.now().toString(36).toUpperCase()}`;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * List available Handwrytten card designs.
 * TODO: Confirm endpoint path from Handwrytten docs (likely GET /cards)
 */
export async function listHandwryttenCards(category?: string): Promise<HandwryttenCard[]> {
  if (IS_MOCK) {
    logger.info("MOCK: listHandwryttenCards");
    return [
      { id: "hw-4421", name: "Classic Botanical", category: "Birthday", price: 399 },
      { id: "hw-4422", name: "Modern Minimal", category: "All Occasions", price: 349 },
      { id: "hw-4423", name: "Anniversary Gold", category: "Anniversary", price: 449 },
      { id: "hw-4424", name: "Funny Script", category: "Birthday", price: 379 },
      { id: "hw-4425", name: "Holiday Classic Red", category: "Holiday", price: 399 },
    ];
  }

  // TODO: Replace with actual Handwrytten endpoint
  // GET /cards or GET /catalog
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return hwFetch<HandwryttenCard[]>(`/cards${query}`);
}

/**
 * Create a Handwrytten order.
 * TODO: Confirm payload structure from Handwrytten API docs
 */
export async function createHandwryttenOrder(
  req: HandwryttenOrderRequest
): Promise<HandwryttenOrderResponse> {
  if (IS_MOCK) {
    const orderId = mockOrderId();
    logger.info({ orderId, ...req }, "MOCK: createHandwryttenOrder");
    return {
      orderId,
      status: "queued",
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      mock: true,
    };
  }

  // TODO: Replace with actual Handwrytten endpoint and payload shape
  // POST /orders
  return hwFetch<HandwryttenOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify({
      // TODO: Map these fields to actual Handwrytten API field names
      card_id: req.cardId,
      message: req.message,
      handwriting_style_id: req.handwritingStyleId,
      scheduled_date: req.scheduledSendDate,
      recipient: {
        name: req.recipientAddress.name,
        address1: req.recipientAddress.line1,
        address2: req.recipientAddress.line2,
        city: req.recipientAddress.city,
        state: req.recipientAddress.state,
        zip: req.recipientAddress.zip,
        country: req.recipientAddress.country ?? "US",
      },
    }),
  });
}

/**
 * Get the current status of a Handwrytten order.
 * TODO: Confirm endpoint from Handwrytten docs
 */
export async function getHandwryttenOrderStatus(
  orderId: string
): Promise<HandwryttenOrderStatus> {
  if (IS_MOCK) {
    logger.info({ orderId }, "MOCK: getHandwryttenOrderStatus");
    const mockStatuses = ["queued", "printing", "mailed"];
    return {
      orderId,
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      trackingUrl: `https://tracking.handwrytten.com/${orderId}`,
      mock: true,
    };
  }

  // TODO: Replace with actual endpoint
  // GET /orders/:id
  return hwFetch<HandwryttenOrderStatus>(`/orders/${orderId}`);
}

/**
 * Cancel a Handwrytten order (if supported by their API).
 * TODO: Confirm endpoint and whether cancellation is allowed
 */
export async function cancelHandwryttenOrder(
  orderId: string
): Promise<{ success: boolean; message?: string; mock?: boolean }> {
  if (IS_MOCK) {
    logger.info({ orderId }, "MOCK: cancelHandwryttenOrder");
    return { success: true, message: "Order cancelled (mock)", mock: true };
  }

  // TODO: Replace with actual endpoint
  // DELETE /orders/:id or POST /orders/:id/cancel
  return hwFetch<{ success: boolean; message?: string }>(`/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

export const handwryttenService = {
  listCards: listHandwryttenCards,
  createOrder: createHandwryttenOrder,
  getOrderStatus: getHandwryttenOrderStatus,
  cancelOrder: cancelHandwryttenOrder,
  isMock: IS_MOCK,
};
