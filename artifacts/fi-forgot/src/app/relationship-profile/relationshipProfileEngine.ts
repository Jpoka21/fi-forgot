import type { Recipient } from "@/lib/data";
import {
  DATE_SENSITIVE_EVENTS,
  HOLIDAY_EVENTS,
  type TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2, day: 14 },
  "Mother's Day": { month: 5, day: 12 },
  "Father's Day": { month: 6, day: 16 },
  Thanksgiving: { month: 11, day: 28 },
  Christmas: { month: 12, day: 25 },
  Hanukkah: { month: 12, day: 26 },
  "New Year's": { month: 1, day: 1 },
  Easter: { month: 4, day: 20 },
};

export function isTrackedEvent(event: string, recipient: Recipient): boolean {
  if (event === "Birthday") return !!recipient.birthday;
  if (event === "Anniversary") return !!(recipient.anniversaryDate ?? recipient.marriageDate);
  if (event === "Work Anniversary" || event === "Graduation" || event === "Just Because") {
    return (recipient.selectedEvents ?? []).includes(event);
  }
  const found = HOLIDAY_EVENTS.find((item) => item.label === event);
  return found ? !!recipient[found.flag] : false;
}

export function getProfileEventDate(event: string, recipient: Recipient): string | null {
  const now = new Date();
  const year = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = (stored: string) => {
    const parts = stored.split("-").map(Number);
    let date = new Date(year, (parts[1] ?? 1) - 1, parts[2] ?? 1);
    if (date < now) date = new Date(year + 1, (parts[1] ?? 1) - 1, parts[2] ?? 1);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  if (event === "Birthday" && recipient.birthday) return next(recipient.birthday);
  if (event === "Anniversary") {
    const source = recipient.anniversaryDate ?? recipient.marriageDate;
    if (source) return next(source);
  }
  const custom = recipient.customDates?.find((item) => item.label === event);
  if (custom?.date) return next(custom.date);
  const fixed = HOLIDAY_DATES[event];
  if (fixed) return next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  return null;
}

export function daysUntil(dateStr: string): number {
  const date = new Date(`${dateStr}T12:00:00`);
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export function buildTrackedEventData(recipient: Recipient): TrackedEventData[] {
  const today = new Date();
  const withDate: TrackedEventData[] = [];
  const noDate: TrackedEventData[] = [];

  for (const event of recipient.selectedEvents ?? []) {
    const dateStr = getProfileEventDate(event, recipient);
    if (!dateStr) {
      noDate.push({ event, dateStr: null, daysAway: null });
      continue;
    }
    const eventDate = new Date(`${dateStr}T12:00:00`);
    if (eventDate < today) continue;
    withDate.push({ event, dateStr, daysAway: daysUntil(dateStr) });
  }

  withDate.sort((a, b) => (a.daysAway ?? 0) - (b.daysAway ?? 0));
  return [...withDate, ...noDate];
}

export function getAllOccasionOptions() {
  return [
    ...DATE_SENSITIVE_EVENTS,
    ...HOLIDAY_EVENTS.map((item) => ({ label: item.label, emoji: item.emoji })),
  ];
}

export { DATE_SENSITIVE_EVENTS, HOLIDAY_EVENTS };
