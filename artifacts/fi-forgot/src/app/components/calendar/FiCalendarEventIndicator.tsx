import type { FiCalendarBadgeStatus } from "@/app/components/badge/badgeDomain";

export interface FiCalendarEventIndicatorProps {
  status?: FiCalendarBadgeStatus;
  label?: string;
}

export function FiCalendarEventIndicator({ status = "upcoming", label }: FiCalendarEventIndicatorProps) {
  const statusClass =
    status === "sent"
      ? "fi-calendar__event-indicator--sent"
      : status === "draft"
        ? "fi-calendar__event-indicator--draft"
        : "";

  return (
    <span
      className={["fi-calendar__event-indicator", statusClass].filter(Boolean).join(" ")}
      aria-hidden={!label}
      title={label}
    />
  );
}

export function FiCalendarEventIndicators({
  statuses,
}: {
  statuses: FiCalendarBadgeStatus[];
}) {
  const visible = statuses.slice(0, 3);

  return (
    <div className="fi-calendar__event-indicators" aria-hidden>
      {visible.map((status, index) => (
        <FiCalendarEventIndicator key={`${status}-${index}`} status={status} />
      ))}
    </div>
  );
}
