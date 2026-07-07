import { cn } from "@/lib/utils";
import { gridUtilityClasses } from "@/app/design";
import { buildDashboardRegionLabel } from "@/app/components/dashboard/accessibility";
import { getFiDashboardShellClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardShellProps {
  children: React.ReactNode;
  className?: string;
  statusMessage?: string;
}

export function FiDashboardShell({
  children,
  className,
  statusMessage,
}: FiDashboardShellProps) {
  return (
    <div className={cn(gridUtilityClasses.container, gridUtilityClasses.containerCanvas)}>
      <section
        className={cn(getFiDashboardShellClassName(className))}
        aria-label={buildDashboardRegionLabel()}
      >
        {statusMessage ? (
          <p className="fi-dashboard__status" aria-live="polite">
            {statusMessage}
          </p>
        ) : null}
        {children}
      </section>
    </div>
  );
}
