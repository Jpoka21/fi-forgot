import { FiCalendarEventCard } from "@/app/components/calendar/FiCalendarEventCard";
import {
  calendarDefaults,
  formatCalendarDateLabel,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";

export interface FiCalendarDailyAgendaProps {
  dateStr: string;
  events: FiCalendarEvent[];
}

export function FiCalendarDailyAgenda({ dateStr, events }: FiCalendarDailyAgendaProps) {
  return (
    <section className="fi-calendar__day-agenda" aria-labelledby="fi-calendar-day-agenda-title">
      <h3 id="fi-calendar-day-agenda-title" className="fi-calendar__month-label">
        {calendarDefaults.dayAgendaTitle}: {formatCalendarDateLabel(dateStr)}
      </h3>

      {events.length === 0 ? (
        <p className="fi-calendar__section-label">{calendarDefaults.noEventsDay}</p>
      ) : (
        <ul className="fi-calendar__events-list">
          {events.map((event) => (
            <li key={event.id}>
              <FiCalendarEventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
