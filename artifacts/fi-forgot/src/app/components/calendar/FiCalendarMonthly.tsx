import { FiButton } from "@/app/components/button/FiButton";
import { FiCalendarEventIndicators } from "@/app/components/calendar/FiCalendarEventIndicator";
import { getFiCalendarDayButtonClassName } from "@/app/components/calendar/calendarVariants";
import {
  buildMonthCells,
  calendarDefaults,
  getTodayIso,
  type FiCalendarEvent,
} from "@/app/calendar/calendarDomain";
import { getEventsForDate, shiftMonth } from "@/app/calendar/calendarEngine";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface FiCalendarMonthlyProps {
  monthAnchor: Date;
  selectedDate: string;
  events: FiCalendarEvent[];
  onMonthAnchorChange: (date: Date) => void;
  onSelectDate: (dateStr: string) => void;
}

export function FiCalendarMonthly({
  monthAnchor,
  selectedDate,
  events,
  onMonthAnchorChange,
  onSelectDate,
}: FiCalendarMonthlyProps) {
  const cells = buildMonthCells(monthAnchor);
  const monthLabel = monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = getTodayIso();

  return (
    <section className="fi-calendar__month" aria-labelledby="fi-calendar-month-title">
      <div className="fi-calendar__nav">
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onMonthAnchorChange(shiftMonth(monthAnchor, -1))}
          aria-label="Previous month"
        >
          Previous
        </FiButton>
        <h3 id="fi-calendar-month-title" className="fi-calendar__month-label">
          {calendarDefaults.monthTitle}: {monthLabel}
        </h3>
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onMonthAnchorChange(shiftMonth(monthAnchor, 1))}
          aria-label="Next month"
        >
          Next
        </FiButton>
      </div>

      <div className="fi-calendar__weekdays" aria-hidden>
        {weekdayLabels.map((label) => (
          <div key={label} className="fi-calendar__weekday">
            {label}
          </div>
        ))}
      </div>

      <div className="fi-calendar__month-grid" role="grid" aria-label={`Calendar for ${monthLabel}`}>
        {cells.map((cell) => {
          const dayEvents = getEventsForDate(events, cell.iso);

          return (
            <button
              key={cell.iso}
              type="button"
              className={getFiCalendarDayButtonClassName({
                selected: cell.iso === selectedDate,
                today: cell.iso === today,
                outside: !cell.inCurrentMonth,
              })}
              aria-pressed={cell.iso === selectedDate}
              aria-label={`${cell.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${dayEvents.length ? `, ${dayEvents.length} events` : ""}`}
              onClick={() => onSelectDate(cell.iso)}
            >
              <span className="fi-calendar__day-number">{cell.date.getDate()}</span>
              <FiCalendarEventIndicators statuses={dayEvents.map((event) => event.status)} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
