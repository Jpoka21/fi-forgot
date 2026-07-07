import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiRelationshipCalendarPanel } from "@/app/components/calendar/FiRelationshipCalendarPanel";
import { getFiCalendarClassName } from "@/app/components/calendar/calendarVariants";
import { calendarDefaults } from "@/app/calendar/calendarDomain";
import { useRelationshipCalendar } from "@/app/calendar/hooks/useRelationshipCalendar";

export function FiCalendarPage() {
  const calendar = useRelationshipCalendar({ defaultView: "agenda" });

  return (
    <div className={getFiCalendarClassName()}>
      <header className="fi-calendar__page-header">
        <div>
          <h1 className="fi-calendar__page-title">{calendarDefaults.title}</h1>
          {calendar.urgentCount > 0 ? (
            <p className="fi-calendar__urgent-summary">{calendarDefaults.urgentSummary(calendar.urgentCount)}</p>
          ) : calendar.filteredEvents.length > 0 ? (
            <p className="fi-calendar__description">{calendarDefaults.caughtUpSummary}</p>
          ) : null}
        </div>
        <FiButton asChild variant="secondary" size="sm">
          <Link href="/recipients/new">{calendarDefaults.createEventLabel}</Link>
        </FiButton>
      </header>

      <FiRelationshipCalendarPanel
        calendar={calendar}
        showHeader={false}
        onAddDate={() => {
          window.location.href = "/people";
        }}
      />
    </div>
  );
}
