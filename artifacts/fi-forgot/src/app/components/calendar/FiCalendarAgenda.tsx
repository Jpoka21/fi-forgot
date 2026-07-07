import { Link } from "wouter";

import { FiCalendarEventCard } from "@/app/components/calendar/FiCalendarEventCard";
import { getFiCalendarSectionClassName } from "@/app/components/calendar/calendarVariants";
import {
  calendarDefaults,
  type FiCalendarAgendaGroups,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";

export interface FiCalendarAgendaProps {
  groups: FiCalendarAgendaGroups;
  selectedEventId?: string | null;
  onSelectEvent?: (event: FiCalendarEvent) => void;
}

function AgendaSection({
  title,
  events,
  selectedEventId,
  onSelectEvent,
}: {
  title: string;
  events: FiCalendarEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (event: FiCalendarEvent) => void;
}) {
  if (events.length === 0) return null;

  return (
    <section className={getFiCalendarSectionClassName()} aria-label={title}>
      <h3 className="fi-calendar__agenda-section-title">{title}</h3>
      <ul className="fi-calendar__events-list">
        {events.map((event) => (
          <li key={event.id}>
            <div
              role="button"
              tabIndex={0}
              className={`fi-calendar__agenda-select${selectedEventId === event.id ? " fi-calendar__agenda-select--active" : ""}`}
              onClick={() => onSelectEvent?.(event)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                  keyboardEvent.preventDefault();
                  onSelectEvent?.(event);
                }
              }}
            >
              <FiCalendarEventCard event={event} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FiCalendarAgenda({ groups, selectedEventId, onSelectEvent }: FiCalendarAgendaProps) {
  return (
    <div className="fi-calendar__agenda">
      <AgendaSection
        title={calendarDefaults.needsAttentionLabel}
        events={groups.needsAttention}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
      />
      <AgendaSection
        title={calendarDefaults.readyLabel}
        events={groups.readyToGo}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}

export interface FiCalendarFilterEmptyProps {
  hasRecipients: boolean;
}

export function FiCalendarFilterEmpty({ hasRecipients }: FiCalendarFilterEmptyProps) {
  if (!hasRecipients) {
    return (
      <div className="fi-calendar__empty">
        <p className="fi-calendar__description">Add people to start tracking upcoming occasions.</p>
        <Link href="/people">{calendarDefaults.addPeopleLabel}</Link>
      </div>
    );
  }

  return (
    <div className="fi-calendar__empty" role="status">
      <p className="fi-calendar__description">Nothing in this window. You&apos;re all caught up!</p>
    </div>
  );
}
