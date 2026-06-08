/**
 * RelationshipTimeline
 *
 * Chronological view of everything we know about a recipient:
 *   - Profile gap answers (permanent, up to 13)
 *   - Fresh update answers (rotating, growing over time)
 *   - Event briefing answers (grouped by event + year)
 *   - Cards generated or sent
 *   - Important dates (birthday, anniversary)
 *
 * Sorted newest-first. Archived answers are excluded.
 * Fresh updates are visually prominent (sage green).
 *
 * Remounts (and refetches) when key changes — caller should
 * increment a counter on answer save to trigger a refresh.
 */

import { useState, useEffect, useCallback } from "react";
import { getApiHeaders } from "@/lib/data";

const SAGE    = "#5B8C6B";
const RED     = "#E23B2E";
const BLACK   = "#111111";
const GRAY    = "#6B6B6B";
const BEIGE   = "#F2E6D3";

type ItemType = "profile_gap" | "fresh_update" | "event_briefing" | "card" | "important_date";

interface TimelineItem {
  id:         string;
  date:       string;
  type:       ItemType;
  label:      string;
  summary:    string;
  source:     string;
  canArchive: boolean;
}

const TYPE_CFG: Record<ItemType, { badge: string; color: string; bg: string }> = {
  fresh_update:   { badge: "Fresh update",   color: SAGE,      bg: `${SAGE}14` },
  profile_gap:    { badge: "Profile",        color: "#444",    bg: "#44444412" },
  event_briefing: { badge: "Briefing",       color: RED,       bg: `${RED}12` },
  card:           { badge: "Card",           color: "#1D4ED8", bg: "#1D4ED812" },
  important_date: { badge: "Important date", color: "#B07D2A", bg: "#D8A72514" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RelationshipTimeline({ recipientId }: { recipientId: string }) {
  const [items,   setItems]   = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function handleArchive(itemId: string) {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    setItems(prev => prev.filter(i => i.id !== itemId)); // optimistic
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

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{
        background:  "#fff",
        border:      `1.5px solid ${BLACK}12`,
        boxShadow:   "0 1px 4px rgba(0,0,0,0.04)",
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
          Everything we know about this person, newest first.
        </p>
      </div>

      {/* Timeline items */}
      <div className="space-y-2">
        {items.map(item => {
          const cfg          = TYPE_CFG[item.type];
          const isFreshUpdate = item.type === "fresh_update";

          return (
            <div
              key={item.id}
              className="rounded-xl px-4 py-3"
              style={{
                background: isFreshUpdate ? `${SAGE}08` : BEIGE,
                border:     `1px solid ${isFreshUpdate ? SAGE + "35" : BLACK + "0D"}`,
              }}
            >
              {/* Row 1: badge + date + archive */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.badge}
                  </span>
                  <span className="text-xs" style={{ color: GRAY }}>
                    {formatDate(item.date)}
                  </span>
                </div>

                {item.canArchive && (
                  <button
                    onClick={() => handleArchive(item.id)}
                    className="text-xs px-2 py-0.5 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                    style={{ color: GRAY }}
                    title="Remove from timeline"
                  >
                    Archive
                  </button>
                )}
              </div>

              {/* Row 2: label + summary */}
              <div className="mt-1.5">
                <div
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: isFreshUpdate ? SAGE : BLACK }}
                >
                  {item.label}
                </div>
                {item.summary && (
                  <div className="text-sm" style={{ color: GRAY, lineHeight: 1.5 }}>
                    {item.summary}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
