import { FiButton } from "@/app/components/button/FiButton";
import { FiDateInput } from "@/app/components/input/FiAutocomplete";
import { buildMonthCells, getTodayIso } from "@/app/calendar/calendarDomain";
import { getFiCalendarDayButtonClassName } from "@/app/components/calendar/calendarVariants";

export interface FiCalendarDatePickerProps {
  selectedDate: string;
  monthAnchor: Date;
  markedDates?: Set<string>;
  onSelectDate: (dateStr: string) => void;
  onMonthAnchorChange: (date: Date) => void;
}

export function FiCalendarDatePicker({
  selectedDate,
  monthAnchor,
  markedDates,
  onSelectDate,
  onMonthAnchorChange,
}: FiCalendarDatePickerProps) {
  const cells = buildMonthCells(monthAnchor);
  const today = getTodayIso();
  const monthLabel = monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section className="fi-calendar__date-picker" aria-label="Choose a date">
      <FiDateInput
        value={selectedDate}
        aria-label="Jump to date"
        onChange={(event) => {
          const value = event.target.value;
          if (!value) return;
          onSelectDate(value);
          const [year, month] = value.split("-").map(Number);
          if (year && month) {
            onMonthAnchorChange(new Date(year, month - 1, 1));
          }
        }}
      />

      <div className="fi-calendar__nav">
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onMonthAnchorChange(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))}
        >
          Previous
        </FiButton>
        <p className="fi-calendar__month-label">{monthLabel}</p>
        <FiButton
          variant="ghost"
          size="sm"
          onClick={() => onMonthAnchorChange(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))}
        >
          Next
        </FiButton>
      </div>

      <div className="fi-calendar__month-grid" role="grid" aria-label={`Date picker for ${monthLabel}`}>
        {cells.map((cell) => (
          <button
            key={`picker-${cell.iso}`}
            type="button"
            className={getFiCalendarDayButtonClassName({
              selected: cell.iso === selectedDate,
              today: cell.iso === today,
              outside: !cell.inCurrentMonth,
            })}
            aria-pressed={cell.iso === selectedDate}
            onClick={() => onSelectDate(cell.iso)}
          >
            <span className="fi-calendar__day-number">{cell.date.getDate()}</span>
            {markedDates?.has(cell.iso) ? <span className="fi-calendar__event-indicator" aria-hidden /> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
