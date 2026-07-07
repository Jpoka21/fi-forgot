import { FiButton } from "@/app/components/button/FiButton";
import { FiCalendarEventCard } from "@/app/components/calendar/FiCalendarEventCard";
import { getFiCalendarDayButtonClassName } from "@/app/components/calendar/calendarVariants";
import { getEventsForDate, shiftWeek } from "@/app/calendar/calendarEngine";
import {
  buildWeekCells,
  calendarDefaults,
  getTodayIso,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";

export interface FiCalendarWeeklyProps {
  weekAnchor: Date;
  selectedDate: string;
  events: FiCalendarEvent[];
  onWeekAnchorChange: (date: Date) => void;
  onSelectDate: (dateStr: string) => void;
}

export function FiCalendarWeekly({
  weekAnchor,
  selectedDate,
  events,
  onWeekAnchorChange,
  onSelectDate,
}: FiCalendarWeeklyProps) {
  const cells = buildWeekCells(weekAnchor);
  const today = getTodayIso();
  const weekLabel = `${cells[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${cells[6]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <section className="fi-calendar__week" aria-labelledby="fi-calendar-week-title">
      <div className="fi-calendar__nav">
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onWeekAnchorChange(shiftWeek(weekAnchor, -1))}
          aria-label="Previous week"
        >
          Previous
        </FiButton>
        <h3 id="fi-calendar-week-title" className="fi-calendar__month-label">
          {calendarDefaults.weekTitle}: {weekLabel}
        </h3>
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onWeekAnchorChange(shiftWeek(weekAnchor, 1))}
          aria-label="Next week"
        >
          Next
        </FiButton>
      </div>

      <div className="fi-calendar__week-grid">
        {cells.map((cell) => {
          const dayEvents = getEventsForDate(events, cell.iso);

          return (
            <div key={cell.iso} className="fi-calendar__week-column">
              <button
                type="button"
                className={getFiCalendarDayButtonClassName({
                  selected: cell.iso === selectedDate,
                  today: cell.iso === today,
                })}
                aria-pressed={cell.iso === selectedDate}
                onClick={() => onSelectDate(cell.iso)}
              >
                <span className="fi-calendar__week-day-header">
                  {cell.date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="fi-calendar__day-number">{cell.date.getDate()}</span>
              </button>
              <div className="fi-calendar__week-day-body">
                {dayEvents.map((event) => (
                  <FiCalendarEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
