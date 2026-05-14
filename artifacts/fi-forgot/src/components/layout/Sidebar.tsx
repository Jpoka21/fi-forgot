import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  Bell,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { B, CircleStamp } from "@/components/brand";

const navItems = [
  { href: "/dashboard",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/recipients",         label: "Recipients", icon: Users },
  { href: "/settings/reminders", label: "Reminders",  icon: Bell },
  { href: "/admin",              label: "Admin",      icon: ShieldCheck },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    setLocation("/");
  }

  const NavContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: B.black }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}
      >
        {/* Mini stamp logo */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "4px 8px",
            border: `2px solid ${B.red}`,
            borderRadius: 4,
            filter: "url(#fi-stamp)",
            lineHeight: 1,
            opacity: 0.92,
            gap: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.25rem",
              color: B.red,
              letterSpacing: "0.06em",
            }}
          >
            "F" I FORGOT
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.38rem",
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Relationship Damage Control
          </span>
        </div>
      </div>

      {/* ── Nav items ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" data-testid="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || location.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer"
                style={
                  active
                    ? {
                        background: `${B.red}18`,
                        color: B.white,
                        borderLeft: `3px solid ${B.red}`,
                        paddingLeft: "13px",
                      }
                    : {
                        color: "rgba(255,255,255,0.48)",
                        borderLeft: "3px solid transparent",
                        paddingLeft: "13px",
                      }
                }
              >
                <Icon
                  size={16}
                  style={{ color: active ? B.red : "rgba(255,255,255,0.35)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "0.9rem",
                    letterSpacing: "0.1em",
                    color: active ? B.white : "rgba(255,255,255,0.48)",
                  }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="ml-auto"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.55rem",
                      letterSpacing: "0.16em",
                      color: B.red,
                      textTransform: "uppercase" as const,
                      opacity: 0.8,
                    }}
                  >
                    ▶
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Autopilot status ───────────────────────────────────────────────── */}
      <div
        className="mx-3 mb-3 rounded-md px-4 py-3"
        style={{
          background: `${B.red}10`,
          border: `1px solid ${B.red}25`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#4ade80", boxShadow: "0 0 4px #4ade80" }}
          />
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Autopilot Online
          </span>
        </div>
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.35)",
            marginTop: 2,
            lineHeight: 1.3,
          }}
        >
          Crisis level: Low
        </div>
      </div>

      {/* ── Decorative stamp ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-center py-3 opacity-20">
        <CircleStamp type="averted" size={48} color={B.red} />
      </div>

      {/* ── User + logout ──────────────────────────────────────────────────── */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              background: B.red,
              color: B.white,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.9rem",
              border: `2px solid ${B.red}55`,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem" }}
            >
              {user?.name ?? "User"}
            </div>
            <div
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Relationship Autopilot
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.35)" }}
          data-testid="btn-logout"
        >
          <LogOut size={13} />
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
            }}
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen flex-shrink-0"
        style={{ background: B.black }}
      >
        <NavContent />
      </aside>

      {/* ── Mobile hamburger ────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: B.black, borderBottom: `2px solid ${B.red}` }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.1rem",
            letterSpacing: "0.06em",
            color: B.red,
          }}
        >
          "F" I FORGOT
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: "rgba(255,255,255,0.7)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute top-0 left-0 bottom-0 w-64 flex flex-col"
            style={{ background: B.black }}
          >
            <NavContent />
          </aside>
        </div>
      )}

      {/* ── Mobile top spacer ────────────────────────────────────────────────── */}
      <div className="md:hidden h-14" />
    </>
  );
}
