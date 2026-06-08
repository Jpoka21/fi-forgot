/**
 * RelationshipTimeline
 *
 * The relationship memory ledger — everything FiForgot knows about a recipient,
 * grouped by month/year, newest first.
 *
 * Item types:
 *   profile_gap     — profile answers, influence card generation (Used In Cards)
 *   fresh_update    — rotating life updates, influence card generation (Used In Cards)
 *   event_briefing  — briefing Q&A grouped by event+year (Reference Only)
 *   card            — generated/sent cards (Reference Only)
 *   important_date  — birthday, anniversary (Reference Only)
 *
 * Archived answers stay visible (reduced opacity + "Not Used For Cards" badge)
 * but are no longer fed to card generation.
 *
 * Auto-refreshes when window event "recipient-answer-saved" fires.
 */

import { useState, useEffect, useCallback } from "react";
import { getApiHeaders } from "@/lib/data";

const SAGE   = "#5B8C6B";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const GRAY   = "#6B6B6B";
const BEIGE  = "#F2E6D3";

type ItemType = "profile_gap" | "fresh_update" | "event_briefing" | "card" | "important_date";

interface TimelineItem {
  id:         string;
  date:       string;
  type:       ItemType;
  label:      string;
  summary:    string;
  source:     string;
  canArchive: boolean;
  isArchived: boolean;
}

// Visual config per type
const TYPE_CFG: Record<ItemType, { badge: string; color: string; bg: string }> = {
  fresh_update:   { badge: "Fresh update",   color: SAGE,      bg: `${SAGE}14` },
  profile_gap:    { badge: "Profile",        color: "#444",    bg: "#44444412" },
  event_briefing: { badge: "Briefing",       color: RED,       bg: `${RED}12` },
  card:           { badge: "Card",           color: "#1D4ED8", bg: "#1D4ED812" },
  important_date: { badge: "Important date", color: "#B07D2A", bg: "#D8A72514" },
};

// Which types are fed into card generation
const INFLUENCES_CARDS = new Set<ItemType>(["profile_gap", "fresh_update"]);

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMonthKey(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "0000-00";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  if (key === "0000-00") return "Unknown Date";
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Group sorted items into month buckets (preserves order within each month)
function groupByMonth(items: TimelineItem[]): { key: string; label: string; items: TimelineItem[] }[] {
  const buckets = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = getMonthKey(item.date);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, its]) => ({ key, label: getMonthLabel(key), items: its }));
}

// ── Confirmation modal ────────────────────────────────────────────────────────

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel:  () => void;
}

function ConfirmModal({ onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
        style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h3
            style={{
              fontFamily:    "'Bebas Neue', cursive",
              fontSize:      "1.15rem",
              letterSpacing: "0.06em",
              color:         BLACK,
            }}
          >
            Stop Using This Memory?
          </h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: GRAY }}>
            This memory will remain in the relationship history, but future cards will no longer use it.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100"
            style={{ border: `1.5px solid ${BLACK}18`, color: BLACK }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: RED,
              color:      "#fff",
            }}
          >
            Stop Using
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RelationshipTimeline({ recipientId }: { recipientId: string }) {
  const [items,            setItems]            = useState<TimelineItem[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [confirmingId,     setConfirmingId]     = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/v2/recipients/${recipientId}/timeline`, { headers });
      if (res.ok) {
        const data = await res.json() as { items: TimelineItem[] };
        setItems(data.items ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [recipientId]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  // Refresh whenever ProfileQuestionCard saves an answer
  useEffect(() => {
    const handler = () => fetchTimeline();
    window.addEventListener("recipient-answer-saved", handler);
    return () => window.removeEventListener("recipient-answer-saved", handler);
  }, [fetchTimeline]);

  async function handleArchiveConfirmed(itemId: string) {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    // Optimistic update: mark item as archived locally
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, isArchived: true } : i,
    ));

    try {
      await fetch(`/api/v2/recipients/${recipientId}/answers/${itemId}/archive`, {
        method: "PATCH",
        headers,
      });
    } catch {
      fetchTimeline(); // restore on failure
    }
  }

  if (loading || items.length === 0) return null;

  const groups = groupByMonth(items);

  return (
    <>
      {/* Confirmation modal (portal-style, fixed overlay) */}
      {confirmingId && (
        <ConfirmModal
          onConfirm={() => { handleArchiveConfirmed(confirmingId); setConfirmingId(null); }}
          onCancel={() => setConfirmingId(null)}
        />
      )}

      <div
        className="rounded-2xl p-5 space-y-5"
        style={{
          background: "#fff",
          border:     `1.5px solid ${BLACK}12`,
          boxShadow:  "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div>
          <h2
            style={{
              fontFamily:    "'Bebas Neue', cursive",
              fontSize:      "1.1rem",
              letterSpacing: "0.06em",
              color:         BLACK,
            }}
          >
            Relationship Timeline
          </h2>
          <p className="text-xs mt-0.5" style={{ color: GRAY }}>
            Everything we know about this person — the complete memory ledger.
          </p>
        </div>

        {/* Month groups */}
        {groups.map(group => (
          <div key={group.key} className="space-y-2">
            {/* Month/year header */}
            <div className="flex items-center gap-3 pt-1">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: GRAY }}
              >
                {group.label}
              </span>
              <div className="flex-1 h-px" style={{ background: `${BLACK}10` }} />
            </div>

            {/* Items in this month */}
            {group.items.map(item => {
              const cfg            = TYPE_CFG[item.type];
              const isFreshUpdate  = item.type === "fresh_update";
              const influencesCards = INFLUENCES_CARDS.has(item.type) && !item.isArchived;
              const isArchived     = item.isArchived;

              return (
                <div
                  key={item.id}
                  className="rounded-xl px-4 py-3 transition-opacity"
                  style={{
                    background: isFreshUpdate && !isArchived ? `${SAGE}08` : BEIGE,
                    border:     `1px solid ${isFreshUpdate && !isArchived ? SAGE + "35" : BLACK + "0D"}`,
                    opacity:    isArchived ? 0.55 : 1,
                  }}
                >
                  {/* Row 1: type badge + date + impact badge + stop-using */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type badge */}
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.badge}
                      </span>

                      {/* Date */}
                      <span className="text-xs" style={{ color: GRAY }}>
                        {formatDate(item.date)}
                      </span>

                      {/* Impact indicator */}
                      {isArchived ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#F2F2F2", color: "#999", fontStyle: "italic" }}
                        >
                          Not Used For Cards
                        </span>
                      ) : influencesCards ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${SAGE}18`, color: SAGE }}
                        >
                          Used In Cards
                        </span>
                      ) : (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#F5F5F5", color: "#888" }}
                        >
                          Reference Only
                        </span>
                      )}
                    </div>

                    {/* Stop Using button (only for active, archivable items) */}
                    {item.canArchive && !isArchived && (
                      <button
                        onClick={() => setConfirmingId(item.id)}
                        className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors hover:bg-gray-200"
                        style={{ color: GRAY, border: `1px solid ${BLACK}10` }}
                        title="Stop using this memory for future cards"
                      >
                        Stop Using
                      </button>
                    )}
                  </div>

                  {/* Row 2: label + optional sub-label + summary */}
                  <div className="mt-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isFreshUpdate && !isArchived ? SAGE : BLACK }}
                      >
                        {item.label}
                      </span>
                      {/* Fresh update sub-label */}
                      {isFreshUpdate && !isArchived && (
                        <span
                          className="text-xs"
                          style={{ color: SAGE, fontStyle: "italic" }}
                        >
                          Recent Life Update
                        </span>
                      )}
                    </div>

                    {item.summary && (
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: isArchived ? "#aaa" : GRAY, lineHeight: 1.5 }}
                      >
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {/* Archived status footer */}
                  {isArchived && (
                    <p className="text-xs mt-1.5" style={{ color: "#bbb" }}>
                      This memory stays in history but is no longer used when generating cards.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
