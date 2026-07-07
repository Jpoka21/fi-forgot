import {
  calendarFilterLabels,
  resolveCalendarEventStatus,
  startOfDay,
  toIsoDate,
  type FiCalendarAgendaGroups,
  type FiCalendarEvent,
  type FiCalendarFilter,
} from "@/app/calendar/calendarDomain";
import { getBriefingsForRecipient, getCards, getRecipients } from "@/lib/data";
import { getEventDateForRecipient } from "@/lib/personal-brand";

export function loadCalendarEvents(horizonDays = 90): FiCalendarEvent[] {
  const recipients = getRecipients();
  const cards = getCards();
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + horizonDays);
  const thisYear = today.getFullYear();
  const events: FiCalendarEvent[] = [];

  for (const recipient of recipients) {
    const briefings = getBriefingsForRecipient(recipient.id);

    for (const event of recipient.selectedEvents ?? []) {
      const dateStr = getEventDateForRecipient(event, recipient);
      if (!dateStr) continue;

      const eventDate = startOfDay(new Date(`${dateStr}T12:00:00`));
      if (eventDate < today || eventDate > cutoff) continue;

      const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
      const briefingDone = briefings.some((briefing) => briefing.event === event && briefing.year === thisYear);
      const card = cards.find((item) => item.recipientId === recipient.id && item.holiday === event);
      const hasCard = Boolean(
        card && (card.status === "Ready for approval" || card.status === "Approved"),
      );
      const cardApproved = card?.status === "Approved";

      events.push({
        id: `${recipient.id}-${event}-${dateStr}`,
        recipientId: recipient.id,
        recipientName: recipient.name,
        relationship: recipient.relationship,
        event,
        dateStr,
        daysAway,
        briefingDone,
        hasCard,
        cardApproved,
        status: resolveCalendarEventStatus({ hasCard, cardApproved }),
      });
    }
  }

  return events.sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.daysAway - b.daysAway);
}

export function filterCalendarEvents(events: FiCalendarEvent[], filter: FiCalendarFilter): FiCalendarEvent[] {
  switch (filter) {
    case "week":
      return events.filter((event) => event.daysAway <= 7);
    case "month":
      return events.filter((event) => event.daysAway <= 30);
    case "birthdays":
      return events.filter((event) => event.event === "Birthday");
    case "anniversaries":
      return events.filter((event) => event.event === "Anniversary");
    default:
      return events;
  }
}

export function searchCalendarEvents(events: FiCalendarEvent[], query: string): FiCalendarEvent[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return events;

  return events.filter((event) => {
    const haystack = [
      event.recipientName,
      event.relationship ?? "",
      event.event,
      calendarFilterLabels.all,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getEventsForDate(events: FiCalendarEvent[], dateStr: string): FiCalendarEvent[] {
  return events.filter((event) => event.dateStr === dateStr);
}

export function groupEventsByDate(events: FiCalendarEvent[]): Map<string, FiCalendarEvent[]> {
  const grouped = new Map<string, FiCalendarEvent[]>();

  for (const event of events) {
    const existing = grouped.get(event.dateStr) ?? [];
    existing.push(event);
    grouped.set(event.dateStr, existing);
  }

  return grouped;
}

export function groupEventsForAgenda(events: FiCalendarEvent[]): FiCalendarAgendaGroups {
  return {
    needsAttention: events.filter((event) => !event.hasCard),
    readyToGo: events.filter((event) => event.hasCard),
  };
}

export function getEventDates(events: FiCalendarEvent[]): Set<string> {
  return new Set(events.map((event) => event.dateStr));
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function shiftMonth(anchor: Date, delta: number): Date {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1);
}

export function shiftWeek(anchor: Date, delta: number): Date {
  const next = new Date(anchor);
  next.setDate(next.getDate() + delta * 7);
  return next;
}

export function getTodayIso(): string {
  return toIsoDate(new Date());
}
