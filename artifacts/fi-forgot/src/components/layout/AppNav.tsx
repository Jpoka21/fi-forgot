import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCards } from "@/lib/data";
import { getCustomerPendingApprovals } from "@/lib/admin-data";
import { useBrowniePoints } from "@/lib/brownie-points-context";

const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const BORDER = "#E5E0D8";

const NAV = [
  { label: "Home",             path: "/dashboard",      emoji: "🏠" },
  { label: "Your People",      path: "/people",         emoji: "👥" },
  { label: "Upcoming Moments", path: "/moments",        emoji: "📅" },
  { label: "Quick Card",       path: "/quick-card",     emoji: "⚡" },
  { label: "Brownie Points",   path: "/brownie-points", emoji: "🏆" },
];

/* ── Account menu ──────────────────────────────────────────────────────────── */
function AccountMenu({ user, onLogout }: { user: { name: string; email: string } | null; onLogout: () => void }) {
  const [open, setOpen]     = useState(false);
  const [, navigate]        = useLocation();
  const ref                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        data-testid="btn-account-menu"
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 8 }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: open ? RED : `${INK}12`,
          color: open ? WHITE : INK,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
          transition: "all 0.15s",
        }}>
          {initial}
        </div>
        <ChevronDown size={12} style={{ color: MID }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: WHITE, borderRadius: 12, minWidth: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 300,
          border: `1px solid ${BORDER}`,
        }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", color: INK }}>{user?.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: MID }}>{user?.email}</p>
          </div>
          {[
            { label: "Account Settings", fn: () => alert("Coming soon") },
            { label: "Admin Panel",      fn: () => { setOpen(false); navigate("/admin"); } },
          ].map(item => (
            <button key={item.label} onClick={() => { item.fn(); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.84rem", color: INK, textAlign: "left" as const }}
              onMouseEnter={e => (e.currentTarget.style.background = BEIGE)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              data-testid="btn-logout"
              style={{ display: "block", width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.84rem", color: RED, fontWeight: 700, textAlign: "left" as const }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AppNav ────────────────────────────────────────────────────────────────── */
export default function AppNav() {
  const { user, logout }                          = useAuth();
  const [location]                                = useLocation();
  const { balance }                               = useBrowniePoints();
  const [approvalCount, setApprovalCount]         = useState(0);
  const [isMobile, setIsMobile]                   = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const cards   = getCards();
    const waiting = cards.filter(c => c.status === "Ready for approval").length;
    const pending = user?.email ? getCustomerPendingApprovals(user.email).length : 0;
    setApprovalCount(waiting + pending);
  }, [user?.email]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const px = isMobile ? 14 : 28;

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: BEIGE, borderBottom: `1px solid ${BORDER}` }}>

      {/* ── Brand / account bar ─────────────────────────────────────────── */}
      <div style={{ padding: `0 ${px}px`, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 3 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: INK, letterSpacing: "0.04em" }}>I FORGOT</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {approvalCount > 0 && (
            <Link href="/cards/review" style={{ textDecoration: "none" }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                background: RED, color: WHITE, borderRadius: 20,
                padding: "5px 12px", fontSize: "0.76rem", fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>
                {approvalCount} to review →
              </span>
            </Link>
          )}
          {balance > 0 && !isMobile && (
            <Link href="/brownie-points" style={{ textDecoration: "none" }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                background: BEIGE, border: `1px solid ${BORDER}`, borderRadius: 20,
                padding: "4px 11px", fontSize: "0.73rem", fontWeight: 700,
                color: "#92400E", cursor: "pointer", whiteSpace: "nowrap" as const,
              }}>
                🍪 {balance.toLocaleString()}
              </span>
            </Link>
          )}
          <AccountMenu user={user} onLogout={logout} />
        </div>
      </div>

      {/* ── Nav tabs ────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, overflowX: "auto" as const, scrollbarWidth: "none" as const }}>
        <div style={{ display: "flex", padding: `0 ${isMobile ? 6 : 20}px`, gap: 0, minWidth: "fit-content" }}>
          {NAV.map(item => {
            const active = location === item.path
              || (item.path !== "/dashboard" && location.startsWith(item.path + "/"));
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: isMobile ? "8px 9px" : "8px 14px",
                    fontSize: isMobile ? "0.74rem" : "0.82rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? INK : MID,
                    borderBottom: `2px solid ${active ? RED : "transparent"}`,
                    cursor: "pointer", whiteSpace: "nowrap" as const,
                    transition: "color 0.12s, border-color 0.12s",
                  }}
                >
                  <span style={{ fontSize: isMobile ? "0.82rem" : "0.88rem" }}>{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
