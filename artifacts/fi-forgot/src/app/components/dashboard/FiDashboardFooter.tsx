import { Link } from "wouter";

import { dashboardDefaults } from "@/app/dashboard/dashboardDomain";
import type { PersonalSettings } from "@/lib/data";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardFooterProps {
  personalSettings: PersonalSettings;
  onOpenFontPicker: () => void;
}

export function FiDashboardFooter({
  personalSettings,
  onOpenFontPicker,
}: FiDashboardFooterProps) {
  return (
    <footer className={getFiDashboardSectionClassName()}>
      <div className="fi-dashboard__footer">
        <p className="fi-dashboard__footer-copy">
          {personalSettings.automationMode === "autopilot"
            ? dashboardDefaults.footerReassuranceAutopilot
            : dashboardDefaults.footerReassuranceManual}
        </p>
        <p className="fi-dashboard__footer-copy">{dashboardDefaults.footerReassuranceClosing}</p>
        <div className="fi-dashboard__footer-links">
          <Link href={dashboardDefaults.reminderPreferencesHref} className="fi-dashboard__footer-link">
            {dashboardDefaults.reminderPreferencesLabel}
          </Link>
          <button
            type="button"
            className="fi-dashboard__footer-link fi-dashboard__footer-link-button"
            onClick={onOpenFontPicker}
          >
            {dashboardDefaults.cardStyleLabel}
          </button>
        </div>
      </div>
    </footer>
  );
}
