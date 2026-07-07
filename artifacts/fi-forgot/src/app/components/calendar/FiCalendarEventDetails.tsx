import { Link } from "wouter";

import { FiCalendarBadge } from "@/app/components/badge/FiBadge";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiCalendarSectionClassName } from "@/app/components/calendar/calendarVariants";
import { trackCalendarEvent } from "@/app/calendar/calendarAnalytics";
import {
  calendarDefaults,
  formatCalendarDateLabel,
  getCalendarEventEmoji,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";

export interface FiCalendarEventDetailsProps {
  event: FiCalendarEvent | null;
  onClose?: () => void;
}

function buildPrimaryHref(event: FiCalendarEvent): string {
  if (event.hasCard) return "/cards/review";
  return `/briefings/${event.recipientId}/${encodeURIComponent(event.event)}`;
}

function buildPrimaryLabel(event: FiCalendarEvent): string {
  if (event.hasCard) return "Review card";
  if (event.briefingDone) return "Generate card";
  return "Write card";
}

export function FiCalendarEventDetails({ event, onClose }: FiCalendarEventDetailsProps) {
  if (!event) return null;

  const editHref = `/recipients/${event.recipientId}?edit=1`;
  const manageHref = `/relationship/${event.recipientId}`;

  return (
    <aside className={getFiCalendarSectionClassName()} aria-labelledby="fi-calendar-event-details">
      <div className="fi-calendar__details-header">
        <h3 id="fi-calendar-event-details" className="fi-calendar__month-label">
          {calendarDefaults.eventDetailsTitle}
        </h3>
        {onClose ? (
          <FiButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </FiButton>
        ) : null}
      </div>

      <div className="fi-calendar__details-body">
        <div className="fi-calendar__details-row">
          <span className="fi-calendar__section-label">Occasion</span>
          <strong>
            {getCalendarEventEmoji(event.event)} {event.event}
          </strong>
        </div>
        <div className="fi-calendar__details-row">
          <span className="fi-calendar__section-label">For</span>
          <strong>{event.recipientName}</strong>
          {event.relationship ? <span> · {event.relationship}</span> : null}
        </div>
        <div className="fi-calendar__details-row">
          <span className="fi-calendar__section-label">Date</span>
          <span>{formatCalendarDateLabel(event.dateStr)}</span>
        </div>
        <div className="fi-calendar__details-row">
          <span className="fi-calendar__section-label">Status</span>
          <FiCalendarBadge status={event.status} />
        </div>
        <div className="fi-calendar__details-row">
          <span className="fi-calendar__section-label">Briefing</span>
          <span>{event.briefingDone ? "Complete" : "Not started"}</span>
        </div>
      </div>

      <div className="fi-calendar-event-card__actions">
        <FiButton asChild variant="primary" size="sm">
          <a
            href={buildPrimaryHref(event)}
            onClick={() => trackCalendarEvent("calendar_event_selected", { eventId: event.id })}
          >
            {buildPrimaryLabel(event)}
          </a>
        </FiButton>
        <FiButton asChild variant="secondary" size="sm">
          <Link href={manageHref}>Open relationship</Link>
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={editHref}>{calendarDefaults.editEventLabel}</Link>
        </FiButton>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={manageHref}>{calendarDefaults.removeEventLabel}</Link>
        </FiButton>
      </div>
    </aside>
  );
}
