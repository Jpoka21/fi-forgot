import { useCallback, useEffect, useMemo, useState } from "react";

import { trackCalendarEvent } from "@/app/calendar/calendarAnalytics";
import {
  calendarDefaults,
  countUrgentNeedsAction,
  getTodayIso,
  type FiCalendarEvent,
  type FiCalendarFilter,
  type FiCalendarView,
} from "@/app/calendar/calendarDomain";
import {
  filterCalendarEvents,
  getEventsForDate,
  groupEventsForAgenda,
  loadCalendarEvents,
  searchCalendarEvents,
} from "@/app/calendar/calendarEngine";
import { getRecipients } from "@/lib/data";

export interface UseRelationshipCalendarOptions {
  enabled?: boolean;
  defaultView?: FiCalendarView;
}

export function useRelationshipCalendar(options: UseRelationshipCalendarOptions = {}) {
  const { enabled = true, defaultView = "agenda" } = options;

  const [events, setEvents] = useState<FiCalendarEvent[]>([]);
  const [view, setView] = useState<FiCalendarView>(defaultView);
  const [filter, setFilter] = useState<FiCalendarFilter>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FiCalendarEvent | null>(null);
  const [hasRecipients, setHasRecipients] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const refresh = useCallback(
    async (optionsArg: { silent?: boolean } = {}) => {
      if (!enabled) return;

      if (optionsArg.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextEvents = loadCalendarEvents();
        setEvents(nextEvents);
        setHasRecipients(getRecipients().length > 0);
        setError(null);
        trackCalendarEvent(optionsArg.silent ? "calendar_refreshed" : "calendar_loaded", {
          count: nextEvents.length,
          view,
        });
      } catch (refreshError) {
        setError(calendarDefaults.errorLabel);
        trackCalendarEvent("calendar_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, view],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredEvents = useMemo(() => {
    const filtered = filterCalendarEvents(events, filter);
    return searchCalendarEvents(filtered, debouncedQuery);
  }, [events, filter, debouncedQuery]);

  const selectedDayEvents = useMemo(
    () => getEventsForDate(filteredEvents, selectedDate),
    [filteredEvents, selectedDate],
  );

  const agendaGroups = useMemo(
    () => groupEventsForAgenda(filteredEvents),
    [filteredEvents],
  );

  const urgentCount = useMemo(
    () => countUrgentNeedsAction(filteredEvents),
    [filteredEvents],
  );

  const showEmpty = !isLoading && !error && !hasRecipients;
  const showFilterEmpty =
    !isLoading && !error && hasRecipients && filteredEvents.length === 0 && debouncedQuery.trim().length === 0;
  const showSearchEmpty =
    !isLoading && !error && hasRecipients && filteredEvents.length === 0 && debouncedQuery.trim().length > 0;

  const changeView = useCallback((nextView: FiCalendarView) => {
    setView(nextView);
    trackCalendarEvent("calendar_view_changed", { view: nextView });
  }, []);

  const selectEvent = useCallback((event: FiCalendarEvent | null) => {
    setSelectedEvent(event);
    if (event) {
      trackCalendarEvent("calendar_event_selected", { eventId: event.id });
    }
  }, []);

  return {
    events,
    filteredEvents,
    selectedDayEvents,
    agendaGroups,
    urgentCount,
    selectedEvent,
    hasRecipients,
    view,
    filter,
    query,
    debouncedQuery,
    selectedDate,
    monthAnchor,
    weekAnchor,
    isLoading,
    isRefreshing,
    error,
    showEmpty,
    showFilterEmpty,
    showSearchEmpty,
    setFilter,
    setQuery,
    setSelectedDate,
    setMonthAnchor,
    setWeekAnchor,
    changeView,
    selectEvent,
    refresh,
  };
}

export type RelationshipCalendarController = ReturnType<typeof useRelationshipCalendar>;
