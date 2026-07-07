import { FiCalendarBadge } from "@/app/components/badge/FiBadge";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiCalendarEventCardClassName } from "@/app/components/calendar/calendarVariants";
import { trackCalendarEvent } from "@/app/calendar/calendarAnalytics";
import {
  formatCalendarDateLabel,
  getCalendarEventEmoji,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";

export interface FiCalendarEventCardProps {
  event: FiCalendarEvent;
}

function buildEventHref(event: FiCalendarEvent): string {
  if (event.hasCard) return "/cards/review";
  return `/briefings/${event.recipientId}/${encodeURIComponent(event.event)}`;
}

function buildActionLabel(event: FiCalendarEvent): string {
  if (event.hasCard) return "Review card";
  if (event.briefingDone) return "Generate card";
  return "Write card";
}

export function FiCalendarEventCard({ event }: FiCalendarEventCardProps) {
  const href = buildEventHref(event);
  const actionLabel = buildActionLabel(event);

  return (
    <article className={getFiCalendarEventCardClassName()}>
      <div className="fi-calendar-event-card__header">
        <h3 className="fi-calendar-event-card__title">
          {getCalendarEventEmoji(event.event)} {event.event}
        </h3>
        <FiCalendarBadge status={event.status} />
      </div>
      <p className="fi-calendar-event-card__meta">
        {event.recipientName}
        {event.relationship ? ` · ${event.relationship}` : ""}
      </p>
      <p className="fi-calendar-event-card__description">
        {formatCalendarDateLabel(event.dateStr)}
        {event.daysAway <= 1 ? "" : ` · in ${event.daysAway} days`}
      </p>
      <div className="fi-calendar-event-card__actions">
        <FiButton asChild variant="secondary" size="sm">
          <a
            href={`/relationship/${event.recipientId}`}
            onClick={() =>
              trackCalendarEvent("calendar_event_selected", { eventId: event.id })
            }
          >
            Open profile
          </a>
        </FiButton>
        <FiButton asChild variant="primary" size="sm">
          <a
            href={href}
            onClick={() =>
              trackCalendarEvent("calendar_event_selected", { eventId: event.id })
            }
          >
            {actionLabel}
          </a>
        </FiButton>
      </div>
    </article>
  );
}
