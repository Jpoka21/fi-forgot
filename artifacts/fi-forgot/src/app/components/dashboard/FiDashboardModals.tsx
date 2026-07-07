import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import type { CardOrder, PersonalSettings } from "@/lib/data";
import { savePersonalSettings } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { Plan, PLANS } from "@/lib/plan";
import { FiButton } from "@/app/components/button/FiButton";

interface HwFont {
  id: string;
  name: string;
  previewUrl?: string;
}

export interface FiDashboardModalsProps {
  cards: CardOrder[];
  viewingCardId: string | null;
  onCloseCard: () => void;
  fontPickerOpen: boolean;
  onCloseFontPicker: () => void;
  personalSettings: PersonalSettings;
  onSettingsChange: (settings: PersonalSettings) => void;
  upgradeOpen: boolean;
  onCloseUpgrade: () => void;
  plan: Plan;
  cardsUsed: number;
  cardsTotal: number;
}

export function FiDashboardModals({
  cards,
  viewingCardId,
  onCloseCard,
  fontPickerOpen,
  onCloseFontPicker,
  personalSettings,
  onSettingsChange,
  upgradeOpen,
  onCloseUpgrade,
  plan,
  cardsUsed,
  cardsTotal,
}: FiDashboardModalsProps) {
  const { upgradePlan } = useAuth();
  const [hwFonts, setHwFonts] = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);

  useEffect(() => {
    if (!fontPickerOpen || hwFonts.length > 0) return;
    setFontsLoading(true);
    fetch("/api/handwrytten-fonts")
      .then((response) => response.json())
      .then((data: { fonts?: HwFont[] }) => {
        if (data.fonts) setHwFonts(data.fonts);
      })
      .catch(() => undefined)
      .finally(() => setFontsLoading(false));
  }, [fontPickerOpen, hwFonts.length]);

  function updateSettings<K extends keyof PersonalSettings>(key: K, value: PersonalSettings[K]) {
    const next = { ...personalSettings, [key]: value };
    onSettingsChange(next);
    savePersonalSettings(next);
  }

  const card = viewingCardId ? cards.find((item) => item.id === viewingCardId) : null;

  return (
    <>
      {card ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${card.holiday} card for ${card.recipientName}`}
          onClick={onCloseCard}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 600,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "var(--fi-color-surface-primary, #fff)",
              borderRadius: 18,
              width: "100%",
              maxWidth: 480,
              maxHeight: "86vh",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{card.holiday} · {card.recipientName}</div>
              </div>
              <button type="button" onClick={onCloseCard} aria-label="Close">
                ✕
              </button>
            </div>
            <div style={{ margin: "14px 22px 0", display: "flex", gap: 8, alignItems: "center" }}>
              <CheckCircle2 size={14} aria-hidden />
              <span>Queued to mail</span>
            </div>
            <div style={{ padding: "18px 22px 28px" }}>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {card.approvedMessage || "No message on file."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {fontPickerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Card style and signature"
          onClick={onCloseFontPicker}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "var(--fi-color-surface-primary, #fff)",
              borderRadius: 16,
              padding: "26px",
              width: 680,
              maxWidth: "94vw",
              maxHeight: "86vh",
              overflowY: "auto",
            }}
          >
            <h2 className="fi-dashboard__section-title">Card style & signature</h2>
            <p className="fi-dashboard__section-copy">
              Choose how your cards are signed and handwritten.
            </p>
            <label htmlFor="fi-dashboard-signature" style={{ display: "block", marginBottom: 6 }}>
              Signed as
            </label>
            <input
              id="fi-dashboard-signature"
              value={personalSettings.cardSignature ?? ""}
              onChange={(event) => updateSettings("cardSignature", event.target.value)}
              placeholder="e.g. Love, James"
              style={{ width: "100%", marginBottom: 16 }}
            />
            {fontsLoading ? (
              <p>Loading styles…</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {hwFonts.map((font, index) => {
                  const selected = personalSettings.cardFont === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        updateSettings("cardFont", font.id);
                        onCloseFontPicker();
                      }}
                      style={{
                        border: `2px solid ${selected ? "var(--fi-color-accent)" : "var(--fi-color-border)"}`,
                        borderRadius: 12,
                        padding: "14px 16px",
                        textAlign: "left",
                      }}
                    >
                      <span>{font.name}</span>
                      {index === 0 ? <span> Default</span> : null}
                      {selected ? <span> Selected</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <FiButton variant="primary" size="sm" onClick={onCloseFontPicker}>
                Done
              </FiButton>
            </div>
          </div>
        </div>
      ) : null}

      {upgradeOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Upgrade plan"
          onClick={(event) => {
            if (event.target === event.currentTarget) onCloseUpgrade();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--fi-color-surface-primary, #fff)",
              borderRadius: "22px 22px 0 0",
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px 24px 36px",
            }}
          >
            <h2 className="fi-dashboard__section-title">Need more cards?</h2>
            <p className="fi-dashboard__section-copy">
              You've used {cardsUsed} of {cardsTotal} card slots. Upgrade to cover more occasions.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {(["basic", "standard", "premium"] as Plan[]).map((key) => {
                const config = PLANS[key];
                const isCurrent = key === plan;
                const orderedPlans: Plan[] = ["basic", "standard", "premium"];
                const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(plan);
                return (
                  <div
                    key={key}
                    style={{
                      borderRadius: 12,
                      padding: 16,
                      border: `2px solid ${isCurrent ? "var(--fi-color-border)" : "var(--fi-color-accent)"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <strong>{config.label}</strong>
                        <ul>
                          {config.perks.map((perk) => (
                            <li key={perk}>{perk}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span>{config.price}</span>
                        {!isCurrent ? (
                          <FiButton
                            variant={isUpgrade ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => {
                              upgradePlan(key);
                              onCloseUpgrade();
                            }}
                          >
                            {isUpgrade ? "Upgrade" : "Downgrade"}
                          </FiButton>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
