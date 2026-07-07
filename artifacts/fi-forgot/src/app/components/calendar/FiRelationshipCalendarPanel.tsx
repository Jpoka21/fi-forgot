import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { buildCalendarRegionLabel } from "@/app/components/calendar/accessibility";
import { FiCalendarAgenda, FiCalendarFilterEmpty } from "@/app/components/calendar/FiCalendarAgenda";
import { FiCalendarDailyAgenda } from "@/app/components/calendar/FiCalendarDailyAgenda";
import { FiCalendarDatePicker } from "@/app/components/calendar/FiCalendarDatePicker";
import { FiCalendarPanelEmptyState } from "@/app/components/calendar/FiCalendarEmptyState";
import { FiCalendarErrorState } from "@/app/components/calendar/FiCalendarErrorState";
import { FiCalendarEventDetails } from "@/app/components/calendar/FiCalendarEventDetails";
import { FiCalendarFilters } from "@/app/components/calendar/FiCalendarFilters";
import { FiCalendarMonthly } from "@/app/components/calendar/FiCalendarMonthly";
import { FiCalendarSearch } from "@/app/components/calendar/FiCalendarSearch";
import { FiCalendarLoadingSkeleton } from "@/app/components/calendar/FiCalendarSkeleton";
import { FiCalendarWeekly } from "@/app/components/calendar/FiCalendarWeekly";
import {
  getFiCalendarContainerClassName,
  getFiCalendarViewTabClassName,
} from "@/app/components/calendar/calendarVariants";
import {
  calendarDefaults,
  calendarViewLabels,
  calendarViewOptions,
} from "@/app/calendar/calendarDomain";
import { getEventDates } from "@/app/calendar/calendarEngine";
import {
  useRelationshipCalendar,
  type RelationshipCalendarController,
} from "@/app/calendar/hooks/useRelationshipCalendar";

export interface FiRelationshipCalendarPanelProps {
  className?: string;
  onAddDate?: () => void;
  calendar?: RelationshipCalendarController;
  showHeader?: boolean;
}

export function FiRelationshipCalendarPanel({
  className,
  onAddDate,
  calendar: calendarProp,
  showHeader = true,
}: FiRelationshipCalendarPanelProps) {
  const internalCalendar = useRelationshipCalendar({ enabled: !calendarProp });
  const calendar = calendarProp ?? internalCalendar;
  const markedDates = getEventDates(calendar.filteredEvents);

  const statusMessage = calendar.isLoading
    ? "Loading calendar"
    : calendar.isRefreshing
      ? "Refreshing calendar"
      : calendar.showSearchEmpty
        ? "No matching calendar events"
        : calendar.showEmpty
          ? "No recipients added"
          : calendar.showFilterEmpty
            ? "No events in this filter"
            : `${calendar.filteredEvents.length} upcoming events`;

  return (
    <section
      className={cn(getFiCalendarContainerClassName(className))}
      aria-label={buildCalendarRegionLabel(calendar.filteredEvents.length)}
    >
      {showHeader ? (
        <header className="fi-calendar__header">
          <h2 className="fi-calendar__title">{calendarDefaults.title}</h2>
          <p className="fi-calendar__description">{calendarDefaults.description}</p>
        </header>
      ) : null}

      <div className="fi-calendar__toolbar">
        <div className="fi-calendar__view-tabs" role="tablist" aria-label="Calendar view">
          {calendarViewOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={calendar.view === option}
              className={getFiCalendarViewTabClassName({ active: calendar.view === option })}
              onClick={() => calendar.changeView(option)}
            >
              {calendarViewLabels[option]}
            </button>
          ))}
        </div>
        <FiButton
          variant="ghost"
          size="sm"
          loading={calendar.isRefreshing}
          onClick={() => void calendar.refresh({ silent: true })}
        >
          {calendarDefaults.refreshLabel}
        </FiButton>
      </div>

      <div className="fi-calendar__controls">
        <FiCalendarSearch value={calendar.query} onChange={calendar.setQuery} />
        <FiCalendarFilters filter={calendar.filter} onFilterChange={calendar.setFilter} />
      </div>

      <p className="fi-calendar__status" aria-live="polite">
        {statusMessage}
      </p>

      {calendar.error ? (
        <FiCalendarErrorState message={calendar.error} onRetry={() => void calendar.refresh()} />
      ) : null}

      {calendar.isLoading ? <FiCalendarLoadingSkeleton /> : null}

      {calendar.showEmpty && !calendar.error && !calendar.isLoading ? (
        <FiCalendarPanelEmptyState onAddDate={onAddDate} />
      ) : null}

      {calendar.showFilterEmpty && !calendar.error && !calendar.isLoading ? (
        <FiCalendarFilterEmpty hasRecipients={calendar.hasRecipients} />
      ) : null}

      {calendar.showSearchEmpty && !calendar.error && !calendar.isLoading ? (
        <FiCalendarFilterEmpty hasRecipients={calendar.hasRecipients} />
      ) : null}

      {!calendar.isLoading
        && !calendar.error
        && !calendar.showEmpty
        && !calendar.showFilterEmpty
        && !calendar.showSearchEmpty ? (
        <div className="fi-calendar__layout">
          <div>
            {calendar.view === "agenda" ? (
              <FiCalendarAgenda
                groups={calendar.agendaGroups}
                selectedEventId={calendar.selectedEvent?.id}
                onSelectEvent={calendar.selectEvent}
              />
            ) : null}

            {calendar.view === "month" ? (
              <FiCalendarMonthly
                monthAnchor={calendar.monthAnchor}
                selectedDate={calendar.selectedDate}
                events={calendar.filteredEvents}
                onMonthAnchorChange={calendar.setMonthAnchor}
                onSelectDate={calendar.setSelectedDate}
              />
            ) : null}

            {calendar.view === "week" ? (
              <FiCalendarWeekly
                weekAnchor={calendar.weekAnchor}
                selectedDate={calendar.selectedDate}
                events={calendar.filteredEvents}
                onWeekAnchorChange={calendar.setWeekAnchor}
                onSelectDate={calendar.setSelectedDate}
              />
            ) : null}

            {calendar.view === "day" ? (
              <FiCalendarDailyAgenda
                dateStr={calendar.selectedDate}
                events={calendar.selectedDayEvents}
              />
            ) : null}
          </div>

          <aside>
            {calendar.view !== "agenda" ? (
              <>
                <FiCalendarDatePicker
                  selectedDate={calendar.selectedDate}
                  monthAnchor={calendar.monthAnchor}
                  markedDates={markedDates}
                  onSelectDate={calendar.setSelectedDate}
                  onMonthAnchorChange={calendar.setMonthAnchor}
                />
                {calendar.view !== "day" ? (
                  <FiCalendarDailyAgenda
                    dateStr={calendar.selectedDate}
                    events={calendar.selectedDayEvents}
                  />
                ) : null}
              </>
            ) : (
              <FiCalendarEventDetails
                event={calendar.selectedEvent}
                onClose={() => calendar.selectEvent(null)}
              />
            )}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
