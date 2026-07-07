import type { FiCalendarBadgeStatus } from "@/app/components/badge/badgeDomain";

export const calendarDefaults = {
  title: "Upcoming occasions",
  description: "Birthdays, anniversaries, holidays, and meaningful moments in one place.",
  searchPlaceholder: "Search people or occasions",
  searchAriaLabel: "Search calendar events",
  refreshLabel: "Refresh",
  errorLabel: "We could not load your calendar right now.",
  dayAgendaTitle: "Daily agenda",
  weekTitle: "Weekly view",
  monthTitle: "Monthly view",
  noEventsDay: "Nothing scheduled for this day.",
  needsAttentionLabel: "Needs attention",
  readyLabel: "Ready to go",
  urgentSummary: (count: number) =>
    `${count} occasion${count === 1 ? "" : "s"} need${count === 1 ? "s" : ""} attention this week`,
  caughtUpSummary: "Nothing urgent — you're ahead of the game.",
  addPeopleLabel: "Go to Your People",
  createEventLabel: "Add someone",
  editEventLabel: "Edit occasion",
  removeEventLabel: "Manage occasions",
  eventDetailsTitle: "Event details",
} as const;

export const calendarFilterOptions = [
  "all",
  "week",
  "month",
  "birthdays",
  "anniversaries",
] as const;

export type FiCalendarFilter = (typeof calendarFilterOptions)[number];

export const calendarFilterLabels: Record<FiCalendarFilter, string> = {
  all: "All",
  week: "Next 7 days",
  month: "Next 30 days",
  birthdays: "Birthdays",
  anniversaries: "Anniversaries",
};

export const calendarViewOptions = ["agenda", "month", "week", "day"] as const;
export type FiCalendarView = (typeof calendarViewOptions)[number];

export const calendarViewLabels: Record<FiCalendarView, string> = {
  agenda: "Agenda",
  month: "Month",
  week: "Week",
  day: "Day",
};

export interface FiCalendarAgendaGroups {
  needsAttention: FiCalendarEvent[];
  readyToGo: FiCalendarEvent[];
}

export interface FiCalendarEvent {
  id: string;
  recipientId: string;
  recipientName: string;
  relationship?: string;
  event: string;
  dateStr: string;
  daysAway: number;
  briefingDone: boolean;
  hasCard: boolean;
  cardApproved: boolean;
  status: FiCalendarBadgeStatus;
}

export function countUrgentNeedsAction(events: FiCalendarEvent[]): number {
  return events.filter((event) => !event.hasCard && event.daysAway <= 7).length;
}

export const calendarEventEmojis: Record<string, string> = {
  Birthday: "🎂",
  Anniversary: "💕",
  "Mother's Day": "🌷",
  "Father's Day": "🎩",
  "Valentine's Day": "❤️",
  Christmas: "🎄",
  Hanukkah: "🕎",
  Thanksgiving: "🍂",
  Easter: "🐣",
  "New Year's": "🥂",
};

export function getCalendarEventEmoji(event: string): string {
  return calendarEventEmojis[event] ?? "🎉";
}

export function formatCalendarDateLabel(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return toIsoDate(new Date());
}

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export interface FiCalendarMonthCell {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
}

export function buildMonthCells(anchor: Date): FiCalendarMonthCell[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const cells: FiCalendarMonthCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    cells.push({
      date,
      iso: toIsoDate(date),
      inCurrentMonth: date.getMonth() === month,
    });
  }

  return cells;
}

export function buildWeekCells(anchor: Date): FiCalendarMonthCell[] {
  const start = startOfDay(anchor);
  start.setDate(start.getDate() - start.getDay());
  const cells: FiCalendarMonthCell[] = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    cells.push({
      date,
      iso: toIsoDate(date),
      inCurrentMonth: true,
    });
  }

  return cells;
}

export function resolveCalendarEventStatus(input: {
  hasCard: boolean;
  cardApproved: boolean;
}): FiCalendarBadgeStatus {
  if (input.cardApproved) return "sent";
  if (input.hasCard) return "draft";
  return "upcoming";
}
