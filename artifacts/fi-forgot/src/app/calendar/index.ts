export {
  buildMonthCells,
  buildWeekCells,
  calendarDefaults,
  calendarEventEmojis,
  calendarFilterLabels,
  calendarFilterOptions,
  calendarViewLabels,
  calendarViewOptions,
  countUrgentNeedsAction,
  formatCalendarDateLabel,
  getCalendarEventEmoji,
  getTodayIso,
  resolveCalendarEventStatus,
  startOfDay,
  toIsoDate,
} from "@/app/calendar/calendarDomain";
export type {
  FiCalendarEvent,
  FiCalendarFilter,
  FiCalendarAgendaGroups,
  FiCalendarMonthCell,
  FiCalendarView,
} from "@/app/calendar/calendarDomain";

export {
  filterCalendarEvents,
  getEventDates,
  getEventsForDate,
  groupEventsByDate,
  groupEventsForAgenda,
  isSameMonth,
  loadCalendarEvents,
  searchCalendarEvents,
  shiftMonth,
  shiftWeek,
} from "@/app/calendar/calendarEngine";

export {
  subscribeToCalendarAnalytics,
  trackCalendarEvent,
} from "@/app/calendar/calendarAnalytics";
export type {
  FiCalendarAnalyticsEvent,
  FiCalendarAnalyticsPayload,
} from "@/app/calendar/calendarAnalytics";

export { useRelationshipCalendar } from "@/app/calendar/hooks/useRelationshipCalendar";
export type {
  RelationshipCalendarController,
  UseRelationshipCalendarOptions,
} from "@/app/calendar/hooks/useRelationshipCalendar";
