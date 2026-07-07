import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

import { SETTINGS_NAV_ITEMS, settingsVerificationDefaults } from "@/app/settings/settingsVerificationDomain";
import { FiSettingsErrorState, FiSettingsPageLoading } from "@/app/components/settings/FiSettingsStates";
import { getFiSettingsShellClassName } from "@/app/components/settings/settingsVariants";

export function FiSettingsNav() {
  const [location] = useLocation();

  return (
    <nav className="fi-settings-shell__nav" aria-label="Settings sections">
      <ul className="fi-settings-shell__nav-list">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const isActive =
            location === item.href ||
            (item.id === "reminders" && location === "/settings/reminders");

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`fi-settings-shell__nav-link${isActive ? " fi-settings-shell__nav-link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={item.description}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface FiSettingsShellProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  offline?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function FiSettingsShell({
  children,
  isLoading = false,
  error = null,
  onRetry,
  offline = false,
  loadingFallback,
  errorFallback,
}: FiSettingsShellProps) {
  return (
    <div className={getFiSettingsShellClassName()}>
      <FiSettingsNav />
      {offline ? (
        <output className="fi-settings-shell__offline">{settingsVerificationDefaults.offlineNotice}</output>
      ) : null}
      <main id="settings-main" className="fi-settings-shell__main" tabIndex={-1}>
        {isLoading
          ? loadingFallback ?? <FiSettingsPageLoading />
          : error
            ? errorFallback ?? <FiSettingsErrorState message={error} onRetry={onRetry} />
            : children}
      </main>
    </div>
  );
}
