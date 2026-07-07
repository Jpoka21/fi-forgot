import { useMemo, useState } from "react";

import { trackAdminEvent } from "@/app/admin/adminAnalytics";
import { COPY_REGISTRY, adminDefaults } from "@/app/admin/adminDomain";
import {
  appendCopyHistory,
  readCopyHistory,
  readCopyOverrides,
  resolveCopyValue,
  writeCopyOverrides,
  type CopyHistoryEntry,
} from "@/app/admin/adminEngine";
import { FiButton } from "@/app/components/button/FiButton";
import { FiTextarea } from "@/app/components/input/FiTextarea";
import { FiAnalyticsCard, FiCardContent, FiCardHeader, FiCardTitle } from "@/app/components/card/FiCard";

export function FiAdminCopyManagement() {
  const [selectedId, setSelectedId] = useState(COPY_REGISTRY[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [overrides, setOverrides] = useState(() => readCopyOverrides());
  const [history, setHistory] = useState<CopyHistoryEntry[]>(() => readCopyHistory());

  const selected = useMemo(
    () => COPY_REGISTRY.find((entry) => entry.id === selectedId) ?? COPY_REGISTRY[0],
    [selectedId],
  );

  const currentValue = selected ? resolveCopyValue(selected, overrides) : "";

  const loadDraft = (copyId: string) => {
    setSelectedId(copyId);
    const entry = COPY_REGISTRY.find((item) => item.id === copyId);
    if (!entry) return;
    setDraft(resolveCopyValue(entry, overrides));
  };

  const saveDraft = () => {
    if (!selected) return;
    const next = { ...overrides, [selected.id]: draft };
    setOverrides(next);
    writeCopyOverrides(next);
    trackAdminEvent("admin_copy_saved", { id: selected.id });
  };

  const publishLocally = () => {
    if (!selected) return;
    saveDraft();
    const nextHistory = appendCopyHistory(selected.id, draft);
    setHistory(nextHistory);
    trackAdminEvent("admin_copy_published", { id: selected.id });
  };

  return (
    <section aria-labelledby="admin-copy-title">
      <header className="fi-admin__panel-header">
        <h2 id="admin-copy-title" className="fi-admin__panel-title">
          {adminDefaults.copyTitle}
        </h2>
        <p className="fi-admin__panel-subtitle">{adminDefaults.copySubtitle}</p>
      </header>

      <div className="fi-admin__copy-layout">
        <FiAnalyticsCard>
          <FiCardHeader>
            <FiCardTitle>Copy browser</FiCardTitle>
          </FiCardHeader>
          <FiCardContent>
            <ul className="fi-admin__results" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {COPY_REGISTRY.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="fi-admin__result"
                    onClick={() => loadDraft(entry.id)}
                    aria-current={entry.id === selectedId ? "true" : undefined}
                  >
                    <span>
                      <strong>{entry.label}</strong>
                      <div className="fi-admin__metric-label">{entry.group}</div>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </FiCardContent>
        </FiAnalyticsCard>

        <div className="fi-admin__copy-editor">
          {selected ? (
            <>
              <p className="fi-admin__metric-label">
                {selected.surface} · default: {selected.defaultValue}
              </p>
              <FiTextarea
                value={draft || currentValue}
                onChange={(event) => setDraft(event.target.value)}
                rows={6}
                aria-label={`Edit ${selected.label}`}
              />
              <div className="fi-admin__filters">
                <FiButton variant="secondary" onClick={saveDraft}>
                  {adminDefaults.publishDraftLabel}
                </FiButton>
                <FiButton variant="primary" onClick={publishLocally}>
                  {adminDefaults.publishLabel}
                </FiButton>
              </div>
              <FiAnalyticsCard>
                <FiCardHeader>
                  <FiCardTitle>{adminDefaults.previewLabel}</FiCardTitle>
                </FiCardHeader>
                <FiCardContent>
                  <p>{draft || currentValue}</p>
                </FiCardContent>
              </FiAnalyticsCard>
              <FiAnalyticsCard>
                <FiCardHeader>
                  <FiCardTitle>{adminDefaults.versionHistoryLabel}</FiCardTitle>
                </FiCardHeader>
                <FiCardContent>
                  {history.filter((entry) => entry.copyId === selected.id).length === 0 ? (
                    <p className="fi-admin__metric-label">No published versions yet.</p>
                  ) : (
                    <ul className="fi-admin__results" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {history
                        .filter((entry) => entry.copyId === selected.id)
                        .map((entry) => (
                          <li key={entry.id} className="fi-admin__metric-label">
                            {new Date(entry.publishedAt).toLocaleString()}: {entry.value}
                          </li>
                        ))}
                    </ul>
                  )}
                </FiCardContent>
              </FiAnalyticsCard>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
