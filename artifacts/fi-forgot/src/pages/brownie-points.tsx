import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getApiHeaders } from "@/lib/data";

const BEIGE  = "#F2E6D3";
const INK    = "#1F1F1F";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const MID    = "#6B6B6B";
const BORDER = "#E5E0D8";
const RED    = "#E23B2E";

interface Transaction {
  id:          string;
  actionType:  string;
  points:      number;
  description: string;
  createdAt:   string;
}

const ACTION_EMOJI: Record<string, string> = {
  recipient_created:  "👤",
  birthday_added:     "🎂",
  anniversary_added:  "💕",
  fresh_update:       "✏️",
  fresh_update_first: "⭐",
  card_generate:      "✍️",
  card_send:          "📬",
  card_send_early:    "⚡",
  profile_complete:   "🏅",
};

const MILESTONES = [
  { threshold: 100,   label: "First 100",       desc: "Investing in the people who matter." },
  { threshold: 500,   label: "500 Club",         desc: "Building something real here." },
  { threshold: 1000,  label: "1K Milestone",     desc: "That's a lot of thoughtful moments." },
  { threshold: 2500,  label: "2,500 Strong",     desc: "The people in your life are lucky." },
  { threshold: 5000,  label: "5K Milestone",     desc: "A remarkable level of care." },
  { threshold: 10000, label: "10K Legend",        desc: "You've set the standard." },
];

function nextMilestone(lifetime: number): { threshold: number; label: string; desc: string } | null {
  return MILESTONES.find(m => m.threshold > lifetime) ?? null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BrowniePointsPage() {
  const [balance,  setBalance]  = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [recent,   setRecent]   = useState<Transaction[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) { setLoading(false); return; }
    fetch("/api/v2/brownie-points/balance", { headers })
      .then(r => r.json())
      .then((d: { balance: number; lifetime: number; recent: Transaction[] }) => {
        setBalance(d.balance ?? 0);
        setLifetime(d.lifetime ?? 0);
        setRecent(d.recent ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next     = nextMilestone(lifetime);
  const nextPct  = next ? Math.min(100, Math.round((lifetime / next.threshold) * 100)) : 100;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const px       = isMobile ? 16 : 32;

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: BEIGE, borderBottom: `1px solid ${BORDER}`, padding: `0 ${px}px`, height: 62, display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", color: MID, textDecoration: "none" }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 4 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: INK, letterSpacing: "0.04em" }}>I FORGOT</span>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: `40px ${px}px 80px`, boxSizing: "border-box" as const }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: MID }}>Loading…</div>
        ) : (
          <>
            {/* Hero balance card */}
            <div style={{ background: INK, borderRadius: 24, padding: "36px 32px", marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, fontSize: "8rem", opacity: 0.07, pointerEvents: "none" }}>🍪</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", color: SAGE, marginBottom: 10, textTransform: "uppercase" as const }}>
                Your Brownie Points
              </div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "5rem", color: WHITE, letterSpacing: "0.02em", lineHeight: 1 }}>
                {balance.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#9CA3AF", marginTop: 8 }}>
                {lifetime.toLocaleString()} lifetime earned
              </div>

              {/* Progress to next milestone */}
              {next && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9CA3AF", marginBottom: 6 }}>
                    <span>Next: {next.label}</span>
                    <span>{lifetime.toLocaleString()} / {next.threshold.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "#374151", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${nextPct}%`, background: SAGE, borderRadius: 3, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: 6 }}>{next.desc}</div>
                </div>
              )}
            </div>

            {/* How to earn */}
            <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "24px 24px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TrendingUp size={15} style={{ color: SAGE }} />
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.92rem", letterSpacing: "0.1em", color: INK }}>
                  HOW TO EARN
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px 20px" }}>
                {[
                  { emoji: "👤", label: "Add a new person",      pts: 15 },
                  { emoji: "🎂", label: "Add a birthday",        pts: 10 },
                  { emoji: "✏️", label: "Add a fresh update",    pts: "10 / day" },
                  { emoji: "⭐", label: "First update (bonus)",  pts: 25 },
                  { emoji: "✍️", label: "Generate a card draft", pts: 5  },
                  { emoji: "📬", label: "Approve & send a card", pts: 25 },
                  { emoji: "🏅", label: "Complete a profile",    pts: 100 },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: "0.84rem", color: MID }}>
                      {row.emoji} {row.label}
                    </span>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", color: SAGE, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                      +{row.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.92rem", letterSpacing: "0.1em", color: INK }}>
                  RECENT ACTIVITY
                </span>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center" as const, color: MID, fontSize: "0.86rem" }}>
                  No activity yet. Start by adding a recipient or generating a card.
                </div>
              ) : (
                <div>
                  {recent.map((tx, i) => (
                    <div key={tx.id} style={{
                      display:       "flex",
                      alignItems:    "center",
                      gap:           14,
                      padding:       "13px 22px",
                      borderBottom:  i < recent.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}>
                      <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>
                        {ACTION_EMOJI[tx.actionType] ?? "🍪"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.87rem", fontWeight: 600, color: INK, marginBottom: 1 }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: MID }}>
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: SAGE, letterSpacing: "0.06em", flexShrink: 0 }}>
                        +{tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
