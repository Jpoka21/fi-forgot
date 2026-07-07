import { FiCalendarEventCard } from "@/app/components/calendar/FiCalendarEventCard";
import { getFiAutopilotSectionClassName } from "@/app/components/autopilot/autopilotVariants";
import type { FiCalendarEvent } from "@/app/calendar/calendarDomain";

export interface FiAutopilotUpcomingAutomatedProps {
  events: FiCalendarEvent[];
}

export function FiAutopilotUpcomingAutomated({ events }: FiAutopilotUpcomingAutomatedProps) {
  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-upcoming">
      <h2 id="fi-autopilot-upcoming" className="fi-autopilot__section-title">
        Upcoming automated cards
      </h2>
      <p className="fi-autopilot__section-copy">
        What your concierge is preparing on your behalf.
      </p>
      {events.length > 0 ? (
        <ul className="fi-autopilot__list">
          {events.map((event) => (
            <li key={event.id}>
              <FiCalendarEventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="fi-autopilot__section-copy">No automated cards on the horizon right now.</p>
      )}
    </section>
  );
}
