import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCards } from "@/lib/data";
import { getCustomerPendingApprovals } from "@/lib/admin-data";

const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const BORDER = "#E5E0D8";

const NAV = [
  { label: "Home",    path: "/dashboard" },
  { label: "Cards",   path: "/cards/review" },
  { label: "Account", path: "/settings/reminders" },
];

const ADMIN_EMAILS = ["james.massaro21@gmail.com", "james@fiforgot.com"];
const ADMIN_FRAGS  = ["massaro", "admin"];

function isAdminUser(user: { email?: string; name?: string } | null): boolean {
  if (!user) return false;
  const email = user.email?.toLowerCase() ?? "";
  const name  = (user.name ?? "").toLowerCase();
  return ADMIN_EMAILS.includes(user.email ?? "")
      || ADMIN_FRAGS.some(f => email.includes(f) || name.includes(f));
}

function isNavActive(location: string, path: string): boolean {
  if (path === "/dashboard") {
    return location === "/dashboard" || location.startsWith("/relationship/");
  }
  if (path === "/cards/review") {
    return location.startsWith("/cards/");
  }
  if (path === "/settings/reminders") {
    return location.startsWith("/settings/");
  }
  return location === path;
}

/* ── Account menu ──────────────────────────────────────────────────────────── */
function AccountMenu({
  user,
  onLogout,
  isAdmin,
}: {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  isAdmin: boolean;
}) {
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
        aria-label="Account menu"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          padding: "4px 6px", borderRadius: 8,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: open ? RED : `${INK}12`,
          color: open ? WHITE : INK,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.82rem", fontWeight: 700,
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
            { label: "Reminder settings", fn: () => { setOpen(false); navigate("/settings/reminders"); } },
            ...(isAdmin ? [{ label: "Admin panel", fn: () => { setOpen(false); navigate("/admin"); } }] : []),
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { item.fn(); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "9px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.84rem", color: INK, textAlign: "left" as const,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = BEIGE)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              data-testid="btn-logout"
              style={{
                display: "block", width: "100%", padding: "9px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.84rem", color: RED, fontWeight: 700, textAlign: "left" as const,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AppNav ────────────────────────────────────────────────────────────────── */
export default function AppNav() {
  const { user, logout }                  = useAuth();
  const [location]                        = useLocation();
  const [approvalCount, setApprovalCount] = useState(0);
  const [isMobile, setIsMobile]           = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const cards   = getCards();
    const waiting = cards.filter(c => c.status === "Ready for approval").length;
    const pending = user?.email ? getCustomerPendingApprovals(user.email).length : 0;
    setApprovalCount(waiting + pending);
  }, [user?.email, location]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const px = isMobile ? 14 : 28;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: BEIGE, borderBottom: `1px solid ${BORDER}`,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        padding: `0 ${px}px`, height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem",
            color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 3,
          }}>
            F*
          </span>
          <span style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem",
            color: INK, letterSpacing: "0.04em",
          }}>
            I FORGOT
          </span>
        </Link>

        <AccountMenu user={user} onLogout={logout} isAdmin={isAdminUser(user)} />
      </div>

      <div style={{
        borderTop: `1px solid ${BORDER}`,
        overflowX: "auto" as const,
        scrollbarWidth: "none" as const,
      }}>
        <div style={{
          display: "flex", padding: `0 ${isMobile ? 6 : 20}px`,
          gap: 0, minWidth: "fit-content",
        }}>
          {NAV.map(item => {
            const active = isNavActive(location, item.path);
            const showBadge = item.path === "/cards/review" && approvalCount > 0;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: isMobile ? "10px 12px" : "10px 18px",
                  fontSize: isMobile ? "0.8rem" : "0.86rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? INK : MID,
                  borderBottom: `2px solid ${active ? RED : "transparent"}`,
                  cursor: "pointer", whiteSpace: "nowrap" as const,
                  transition: "color 0.12s, border-color 0.12s",
                }}>
                  <span>{item.label}</span>
                  {showBadge && (
                    <span style={{
                      minWidth: 18, height: 18, borderRadius: 9,
                      background: RED, color: WHITE,
                      fontSize: "0.68rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 5px",
                    }}>
                      {approvalCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
