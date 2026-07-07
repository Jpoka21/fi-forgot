import { AlertTriangle, ShieldCheck } from "lucide-react";

import { ADMIN_TABS, adminDefaults } from "@/app/admin/adminDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAnalyticsCard, FiCardContent } from "@/app/components/card/FiCard";

export function FiAdminAccessDenied() {
  return (
    <div className="fi-admin__access">
      <div className="fi-admin__brand-icon" style={{ margin: "0 auto 1rem" }} aria-hidden>
        <AlertTriangle size={24} />
      </div>
      <h2 className="fi-admin__panel-title">{adminDefaults.accessDeniedTitle}</h2>
      <p className="fi-admin__panel-subtitle">{adminDefaults.accessDeniedDescription}</p>
    </div>
  );
}

export function FiAdminHeader({
  userEmail,
  activeLabel,
  activeDescription,
  autopilotStatus,
  lastSyncLabel,
  syncing,
  confirmReset,
  resetting,
  onSync,
  onReset,
  onCancelReset,
}: {
  userEmail?: string;
  activeLabel: string;
  activeDescription: string;
  autopilotStatus: string | null;
  lastSyncLabel: string | null;
  syncing: boolean;
  confirmReset: boolean;
  resetting: boolean;
  onSync: () => void;
  onReset: () => void;
  onCancelReset: () => void;
}) {
  return (
    <header className="fi-admin__header">
      <div className="fi-admin__header-inner">
        <div className="fi-admin__brand">
          <div className="fi-admin__brand-icon" aria-hidden>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="fi-admin__title-row">
              <h1 className="fi-admin__title">{adminDefaults.title}</h1>
              <span className="fi-admin__badge">{adminDefaults.internalBadge}</span>
            </div>
            <p className="fi-admin__subtitle">
              Logged in as {userEmail ?? "admin"} · {adminDefaults.subtitle}
            </p>
          </div>
        </div>

        <div className="fi-admin__actions">
          {autopilotStatus ? (
            <span className="fi-admin__status-pill fi-admin__status-pill--autopilot">{autopilotStatus}</span>
          ) : null}
          {lastSyncLabel ? (
            <span className="fi-admin__status-pill fi-admin__status-pill--sync">{lastSyncLabel}</span>
          ) : null}
          <FiButton variant="secondary" size="sm" onClick={onSync} loading={syncing}>
            {syncing ? "Syncing…" : "Sync"}
          </FiButton>
          {confirmReset ? (
            <>
              <span className="fi-admin__subtitle" style={{ color: "var(--fi-color-red, #c45c4a)" }}>
                Wipe everything?
              </span>
              <FiButton variant="primary" size="sm" onClick={onReset} loading={resetting}>
                {resetting ? "Wiping…" : "Yes, wipe it all"}
              </FiButton>
              <FiButton variant="ghost" size="sm" onClick={onCancelReset}>
                Cancel
              </FiButton>
            </>
          ) : (
            <FiButton variant="ghost" size="sm" onClick={onReset}>
              Reset Data
            </FiButton>
          )}
          <div className="fi-admin__tab-context">
            <div style={{ fontWeight: 600, color: "var(--fi-color-ink, #1c1410)" }}>{activeLabel}</div>
            <div>{activeDescription}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function FiAdminNav({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <nav className="fi-admin__nav" aria-label="Admin sections">
      <div className="fi-admin__nav-inner" role="tablist">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`fi-admin__tab${active ? " fi-admin__tab--active" : ""}`}
              onClick={() => onChange(id)}
              data-testid={`admin-tab-${id}`}
            >
              <Icon size={15} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function FiAdminShell({
  children,
  userEmail,
  activeTab,
  activeLabel,
  activeDescription,
  autopilotStatus,
  lastSyncLabel,
  syncing,
  confirmReset,
  resetting,
  onTabChange,
  onSync,
  onReset,
  onCancelReset,
}: {
  children: React.ReactNode;
  userEmail?: string;
  activeTab: string;
  activeLabel: string;
  activeDescription: string;
  autopilotStatus: string | null;
  lastSyncLabel: string | null;
  syncing: boolean;
  confirmReset: boolean;
  resetting: boolean;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  onReset: () => void;
  onCancelReset: () => void;
}) {
  return (
    <div className="fi-admin">
      <FiAdminHeader
        userEmail={userEmail}
        activeLabel={activeLabel}
        activeDescription={activeDescription}
        autopilotStatus={autopilotStatus}
        lastSyncLabel={lastSyncLabel}
        syncing={syncing}
        confirmReset={confirmReset}
        resetting={resetting}
        onSync={onSync}
        onReset={onReset}
        onCancelReset={onCancelReset}
      />
      <FiAdminNav activeTab={activeTab} onChange={onTabChange} />
      <main id="admin-main" className="fi-admin__main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

export function FiAdminLoadingState() {
  return (
    <FiAnalyticsCard>
      <FiCardContent>
        <p className="fi-admin__panel-subtitle" aria-busy="true">
          {adminDefaults.loadingLabel}
        </p>
      </FiCardContent>
    </FiAnalyticsCard>
  );
}
