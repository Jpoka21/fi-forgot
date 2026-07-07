import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCards } from "@/lib/data";
import { getCustomerPendingApprovals } from "@/lib/admin-data";
import { PB } from "@/lib/personal-brand";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const BORDER = PB.border;

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

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
    return location === "/dashboard"
        || location === "/people"
        || location.startsWith("/relationship/")
        || location.startsWith("/briefings/");
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
        type="button"
        onClick={() => setOpen(o => !o)}
        data-testid="btn-account-menu"
        aria-label="Account menu"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: open ? WHITE : "transparent",
          border: `1px solid ${open ? BORDER : "transparent"}`,
          cursor: "pointer",
          minHeight: 44,
          padding: "4px 10px 4px 4px", borderRadius: 24,
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: open ? RED : `${RED}12`,
          color: open ? WHITE : RED,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: sans, fontSize: "0.85rem", fontWeight: 600,
          transition: "all 0.15s ease",
        }}>
          {initial}
        </div>
        <ChevronDown size={14} style={{ color: MID, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: WHITE, borderRadius: 14, minWidth: 220,
          boxShadow: "0 8px 32px rgba(31,31,31,0.1)", zIndex: 300,
          border: `1px solid ${BORDER}`, overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${BORDER}`, background: `${CREAM}80` }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: INK, fontFamily: sans }}>{user?.name}</p>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: MID, fontFamily: sans }}>{user?.email}</p>
          </div>
          {[
            { label: "Account settings", fn: () => { setOpen(false); navigate("/settings/account"); } },
            { label: "Relationship preferences", fn: () => { setOpen(false); navigate("/settings/relationship"); } },
            { label: "Billing", fn: () => { setOpen(false); navigate("/settings/billing"); } },
            { label: "Reminder settings", fn: () => { setOpen(false); navigate("/settings/reminders"); } },
            ...(isAdmin ? [{ label: "Admin panel", fn: () => { setOpen(false); navigate("/admin"); } }] : []),
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.fn(); setOpen(false); }}
              style={{
                display: "block", width: "100%", minHeight: 44, padding: "12px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.88rem", color: INK, textAlign: "left" as const,
                fontFamily: sans, fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = CREAM)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              data-testid="btn-logout"
              style={{
                display: "block", width: "100%", minHeight: 44, padding: "12px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.88rem", color: RED, fontWeight: 600, textAlign: "left" as const,
                fontFamily: sans,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${RED}08`)}
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

  const px = isMobile ? 16 : 24;

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(250,247,244,0.94)",
      backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${BORDER}`,
      fontFamily: sans,
    }}>
      {/* Brand row */}
      <div style={{
        maxWidth: 720, margin: "0 auto", width: "100%",
        padding: `0 ${px}px`, height: isMobile ? 56 : 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxSizing: "border-box" as const,
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ fontFamily: serif, fontSize: isMobile ? "1.1rem" : "1.2rem", fontWeight: 700, color: INK, letterSpacing: "0.02em", lineHeight: 1.1 }}>
            F.I. FORGOT
          </div>
          {!isMobile && (
            <div style={{ fontFamily: sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", color: MID, marginTop: 3 }}>
              RELATIONSHIP CONCIERGE
            </div>
          )}
        </Link>

        <AccountMenu user={user} onLogout={logout} isAdmin={isAdminUser(user)} />
      </div>

      {/* Navigation row */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        overflowX: "auto" as const,
        scrollbarWidth: "none" as const,
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", width: "100%",
          display: "flex", padding: isMobile ? `8px ${px}px 10px` : `10px ${px}px 12px`,
          gap: 8, boxSizing: "border-box" as const,
        }}>
          {NAV.map(item => {
            const active = isNavActive(location, item.path);
            const showBadge = item.path === "/cards/review" && approvalCount > 0;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  minHeight: 44,
                  padding: isMobile ? "10px 16px" : "10px 18px",
                  fontSize: "0.88rem",
                  fontWeight: active ? 600 : 500,
                  fontFamily: sans,
                  color: active ? INK : MID,
                  background: active ? WHITE : "transparent",
                  border: `1px solid ${active ? BORDER : "transparent"}`,
                  borderRadius: 24,
                  cursor: "pointer", whiteSpace: "nowrap" as const,
                  boxShadow: active ? "0 1px 8px rgba(31,31,31,0.05)" : "none",
                  transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
                }}>
                  <span>{item.label}</span>
                  {showBadge && (
                    <span style={{
                      minWidth: 20, height: 20, borderRadius: 10,
                      background: RED, color: WHITE,
                      fontSize: "0.7rem", fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 6px", fontFamily: sans,
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
    </header>
  );
}
