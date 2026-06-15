import { useState, useEffect } from "react";
import { Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import { getRecipients, saveRecipient, deleteRecipient, Recipient } from "@/lib/data";
import { Plus, Trash2, ChevronRight, Heart, Lock, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PLANS, Plan, canActivateRecipient } from "@/lib/plan";

const RED   = "#E23B2E";
const BLACK = "#111111";
const BEIGE = "#F2E6D3";
const GRAY  = "#6B6B6B";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const { user, upgradePlan } = useAuth();

  const plan = (user?.plan ?? "basic") as Plan;
  const planConfig = PLANS[plan];
  const limit = planConfig.maxRecipients;
  const activeCount = recipients.filter((r) => r.active !== false).length;

  useEffect(() => {
    setRecipients(getRecipients());
  }, []);

  function handleDelete(id: string) {
    if (confirm("Remove this recipient? This cannot be undone.")) {
      deleteRecipient(id);
      setRecipients(getRecipients());
    }
  }

  function handleActivate(recipient: Recipient) {
    if (canActivateRecipient(plan, activeCount)) {
      saveRecipient({ ...recipient, active: true });
      setRecipients(getRecipients());
    } else {
      setActivatingId(recipient.id);
      setUpgradeOpen(true);
    }
  }

  function handleUpgrade(newPlan: Plan) {
    upgradePlan(newPlan);
    if (activatingId) {
      const r = recipients.find((r) => r.id === activatingId);
      if (r) {
        saveRecipient({ ...r, active: true });
      }
      setActivatingId(null);
    }
    setRecipients(getRecipients());
    setUpgradeOpen(false);
  }

  const limitText = limit === Infinity ? "unlimited" : String(limit);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.04em", color: BLACK }}>
              Recipients
            </h1>
            <p className="text-sm mt-0.5" style={{ color: GRAY }}>
              The people in your life who deserve better than a last-minute gas station run.
            </p>
          </div>
          <Link href="/recipients/new">
            <button
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: RED, color: "#fff" }}
              data-testid="button-add-recipient"
            >
              <Plus size={16} /> Add recipient
            </button>
          </Link>
        </div>

        {/* Plan usage bar */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center justify-between gap-4"
          style={{ background: "#fff", border: `1.5px solid ${BLACK}12`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${RED}12` }}>
              <Zap size={16} style={{ color: RED }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: BLACK }}>
                {planConfig.label} · {planConfig.price}
              </div>
              <div className="text-xs mt-0.5" style={{ color: GRAY }}>
                {activeCount} of {limitText} {limit === 1 ? "recipient" : "recipients"} active
              </div>
            </div>
          </div>
          {plan !== "premium" && (
            <button
              onClick={() => { setActivatingId(null); setUpgradeOpen(true); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 whitespace-nowrap"
              style={{ background: `${RED}12`, color: RED, border: `1px solid ${RED}25` }}
            >
              Upgrade plan
            </button>
          )}
        </div>

        {/* List */}
        {recipients.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "#fff", border: `1.5px solid ${BLACK}12` }}
          >
            <Heart size={40} className="mx-auto mb-4" style={{ color: `${BLACK}25` }} />
            <h2 className="font-semibold text-xl mb-2" style={{ color: BLACK }}>
              Add someone before future you ruins everything.
            </h2>
            <p className="text-sm mb-6" style={{ color: GRAY }}>
              Gas station cards are not a strategy. Add a recipient to get started.
            </p>
            <Link href="/recipients/new">
              <button
                className="text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: RED, color: "#fff" }}
                data-testid="button-add-first-recipient"
              >
                Add your first recipient
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recipients.map((r) => {
              const isActive = r.active !== false;
              return (
                <div
                  key={r.id}
                  className="rounded-xl p-5 transition-shadow"
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${isActive ? `${BLACK}15` : `${BLACK}08`}`,
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
                    opacity: isActive ? 1 : 0.8,
                  }}
                  data-testid={`card-recipient-${r.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative"
                      style={{ background: isActive ? BLACK : GRAY }}
                    >
                      {r.name.charAt(0)}
                      {!isActive && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "#fff", border: `1.5px solid ${GRAY}40` }}
                        >
                          <Lock size={9} style={{ color: GRAY }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <Link href={`/relationship/${r.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base" style={{ color: BLACK }}>{r.name}</span>
                        {isActive ? (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "#dcfce7", color: "#16a34a" }}
                          >
                            ✓ Active
                          </span>
                        ) : (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${BLACK}08`, color: GRAY }}
                          >
                            Paused
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: GRAY }}>{r.relationship}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.birthday && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: BEIGE, color: BLACK }}>
                            🎂 Birthday
                          </span>
                        )}
                        {r.anniversaryDate && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: BEIGE, color: BLACK }}>
                            💍 Anniversary
                          </span>
                        )}
                        {r.needsValentinesDay && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>
                            💝 Valentine's Day
                          </span>
                        )}
                        {r.needsMothersDay && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                            💜 Mother's Day
                          </span>
                        )}
                        {(r.selectedEvents?.length ?? 0) > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: BEIGE, color: GRAY }}>
                            {r.selectedEvents.length} events
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => handleActivate(r)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 flex items-center gap-1.5"
                          style={{ background: RED, color: "#fff" }}
                        >
                          <Zap size={11} /> Activate
                        </button>
                      )}
                      <Link href={`/relationship/${r.id}`}>
                        <button className="p-2 rounded-lg transition-colors hover:bg-gray-50">
                          <ChevronRight size={18} style={{ color: GRAY }} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        data-testid={`button-delete-recipient-${r.id}`}
                      >
                        <Trash2 size={16} style={{ color: GRAY }} />
                      </button>
                    </div>
                  </div>

                  {/* Paused notice */}
                  {!isActive && (
                    <div
                      className="mt-3 pt-3 flex items-center gap-2"
                      style={{ borderTop: `1px solid ${BLACK}08` }}
                    >
                      <Lock size={11} style={{ color: GRAY }} />
                      <span className="text-xs" style={{ color: GRAY }}>
                        Autopilot is off — upgrade your plan to start sending cards for {r.name}.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      {upgradeOpen && (
        <UpgradeModal
          currentPlan={plan}
          onUpgrade={handleUpgrade}
          onClose={() => { setUpgradeOpen(false); setActivatingId(null); }}
          activatingName={activatingId ? recipients.find((r) => r.id === activatingId)?.name : undefined}
        />
      )}
    </AppLayout>
  );
}

function UpgradeModal({
  currentPlan,
  onUpgrade,
  onClose,
  activatingName,
}: {
  currentPlan: Plan;
  onUpgrade: (plan: Plan) => void;
  onClose: () => void;
  activatingName?: string;
}) {
  const orderedPlans: Plan[] = ["basic", "standard", "premium"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        style={{ background: "#fff" }}
      >
        <div className="p-6">

          {/* Modal header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1.9rem",
                  letterSpacing: "0.05em",
                  color: BLACK,
                  lineHeight: 1,
                }}
              >
                Upgrade Your Plan
              </h2>
              {activatingName ? (
                <p className="text-sm mt-1.5" style={{ color: GRAY }}>
                  You've hit your recipient limit. Upgrade to activate autopilot for{" "}
                  <strong style={{ color: BLACK }}>{activatingName}</strong>.
                </p>
              ) : (
                <p className="text-sm mt-1.5" style={{ color: GRAY }}>
                  More recipients. More occasions. More wins.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 text-xl font-bold leading-none ml-4 flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mt-5">
            {orderedPlans.map((key) => {
              const config = PLANS[key];
              const isCurrent = key === currentPlan;
              const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(currentPlan);

              return (
                <div
                  key={key}
                  className="rounded-xl p-4 border-2 transition-all"
                  style={{
                    borderColor: isCurrent ? `${BLACK}20` : isUpgrade ? `${RED}25` : `${BLACK}08`,
                    background: isCurrent ? BEIGE : "#fafafa",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{
                            fontFamily: "'Bebas Neue', cursive",
                            fontSize: "1.1rem",
                            letterSpacing: "0.06em",
                            color: BLACK,
                          }}
                        >
                          {config.label}
                        </span>
                        {isCurrent && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${BLACK}10`, color: GRAY }}
                          >
                            Current plan
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 mb-2" style={{ color: GRAY }}>{config.tagline}</div>
                      <ul className="space-y-0.5">
                        {config.perks.map((perk) => (
                          <li key={perk} className="text-xs flex items-center gap-1.5" style={{ color: BLACK }}>
                            <span style={{ color: RED, fontWeight: 700 }}>✓</span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        style={{
                          fontFamily: "'Bebas Neue', cursive",
                          fontSize: "1.7rem",
                          color: BLACK,
                          lineHeight: 1,
                        }}
                      >
                        {config.price}
                      </span>
                      {!isCurrent && (
                        <button
                          onClick={() => onUpgrade(key)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
                          style={{
                            background: isUpgrade ? RED : `${BLACK}10`,
                            color: isUpgrade ? "#fff" : GRAY,
                          }}
                        >
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-center mt-4" style={{ color: `${GRAY}80` }}>
            No relationships were guaranteed in the making of this subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
