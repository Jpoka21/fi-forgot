import { ROUTE_PATHS } from "@/app/routes/routePaths";
import {
  seedNotifications,
  type FiNotification,
} from "@/app/notification/notificationDomain";
import type { CommunicationHistoryEntry } from "@/app/notification/notificationsPageDomain";
import type { CardOrder, PersonalSettings } from "@/lib/data";

const DELIVERY_STATUSES = new Set<CardOrder["status"]>([
  "Mailed to me",
  "Mailed to her",
  "Delivered",
  "Given",
]);

function parseDueDate(dueDate: string): string {
  const parsed = Date.parse(dueDate);
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
}

export function buildEmailHistory(cards: CardOrder[]): CommunicationHistoryEntry[] {
  return cards
    .filter((card) => card.status === "Ready for approval" || card.status === "Approved")
    .map((card) => ({
      id: `email-${card.id}`,
      title:
        card.status === "Ready for approval"
          ? `Approval request for ${card.recipientName}`
          : `Approval confirmed for ${card.recipientName}`,
      description:
        card.status === "Ready for approval"
          ? `${card.holiday} card is ready for your thoughtful review.`
          : `You approved the ${card.holiday} card for ${card.recipientName}.`,
      occurredAt: parseDueDate(card.dueDate),
      href: ROUTE_PATHS.cardsReview,
      statusLabel: card.status,
    }))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function buildCardHistory(cards: CardOrder[]): CommunicationHistoryEntry[] {
  return cards
    .map((card) => ({
      id: `card-${card.id}`,
      title: `${card.holiday} card for ${card.recipientName}`,
      description: `Status: ${card.status}. Due ${card.dueDate}.`,
      occurredAt: parseDueDate(card.dueDate),
      href: ROUTE_PATHS.cardsReview,
      statusLabel: card.status,
    }))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function buildDeliveryHistory(cards: CardOrder[]): CommunicationHistoryEntry[] {
  return cards
    .filter((card) => DELIVERY_STATUSES.has(card.status))
    .map((card) => ({
      id: `delivery-${card.id}`,
      title: `${card.recipientName}'s ${card.holiday} card`,
      description: `Delivery preference: ${card.deliveryPreference}.`,
      occurredAt: parseDueDate(card.dueDate),
      href: ROUTE_PATHS.dashboard,
      statusLabel: card.status,
    }))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function buildReminderHistory(
  notifications: FiNotification[] = seedNotifications,
  settings: PersonalSettings,
): CommunicationHistoryEntry[] {
  const fromNotifications = notifications
    .filter((item) => item.category === "reminder")
    .map((item) => ({
      id: `reminder-${item.id}`,
      title: item.title,
      description: item.body ?? "A gentle reminder from your concierge.",
      occurredAt: item.createdAt,
      href: item.href ?? ROUTE_PATHS.dashboard,
      statusLabel: item.readState === "unread" ? "Upcoming" : "Acknowledged",
    }));

  const timingEntries = settings.notifyTiming.map((timing, index) => ({
    id: `reminder-timing-${index}`,
    title: "Reminder timing preference",
    description: timing,
    occurredAt: new Date().toISOString(),
    href: ROUTE_PATHS.settingsReminders,
    statusLabel: "Preference",
  }));

  return [...fromNotifications, ...timingEntries].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}

export function buildCommunicationHistory(
  cards: CardOrder[],
  settings: PersonalSettings,
  notifications: FiNotification[] = seedNotifications,
) {
  return {
    email: buildEmailHistory(cards),
    cards: buildCardHistory(cards),
    delivery: buildDeliveryHistory(cards),
    reminders: buildReminderHistory(notifications, settings),
  };
}
