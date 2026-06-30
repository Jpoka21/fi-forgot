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
import { PB } from "@/lib/personal-brand";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const BORDER = PB.border;
const SAGE   = PB.sage;

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

const navItems = [
  { href: "/dashboard",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/recipients",         label: "Recipients", icon: Users },
  { href: "/settings/reminders", label: "Reminders",  icon: Bell },
  { href: "/admin",              label: "Admin",      icon: ShieldCheck },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout, workspaces, switchWorkspace } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasBusiness = workspaces.some(w => w.type === "business");
  const businessWorkspace = workspaces.find(w => w.type === "business");

  function goToBusiness() {
    if (businessWorkspace) {
      switchWorkspace(businessWorkspace.id);
      setMobileOpen(false);
      setLocation("/business/dashboard");
    } else {
      setLocation("/business/create-workspace");
    }
  }

  function handleLogout() {
    logout();
    setLocation("/");
  }

  const NavContent = () => (
    <div className="flex flex-col h-full" style={{ background: CREAM, fontFamily: sans }}>
      {/* Brand */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 700, color: INK, letterSpacing: "0.02em" }}>
          F.I. FORGOT
        </div>
        <div style={{ fontFamily: sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", color: MID, marginTop: 4 }}>
          RELATIONSHIP CONCIERGE
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1" data-testid="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || location.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                style={{
                  background: active ? WHITE : "transparent",
                  color: active ? INK : MID,
                  border: `1px solid ${active ? BORDER : "transparent"}`,
                  boxShadow: active ? "0 1px 8px rgba(31,31,31,0.05)" : "none",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? RED : MID, flexShrink: 0 }}
                  strokeWidth={1.75}
                />
                <span style={{ fontSize: "0.88rem" }}>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Workspace toggle */}
      {(hasBusiness || true) && (
        <div className="mx-3 mb-3">
          <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: MID, marginBottom: 8, paddingLeft: 4 }}>
            Workspace
          </p>
          <div style={{ display: "flex", background: WHITE, borderRadius: 10, padding: 4, gap: 4, border: `1px solid ${BORDER}` }}>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: RED, textAlign: "center", cursor: "default" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: WHITE, fontFamily: sans }}>
                Personal
              </span>
            </div>
            <button
              type="button"
              onClick={goToBusiness}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "transparent", border: "none", textAlign: "center", cursor: "pointer", transition: "background 0.15s", fontFamily: sans }}
              onMouseEnter={e => (e.currentTarget.style.background = `${INK}06`)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "0.78rem", fontWeight: 500, color: MID }}>
                {businessWorkspace ? businessWorkspace.name.split(" ")[0] : "Business"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Quiet status */}
      <div
        className="mx-3 mb-3 rounded-xl px-4 py-3"
        style={{ background: `${SAGE}10`, border: `1px solid ${SAGE}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: SAGE }}
          />
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: INK, fontFamily: sans }}>
            Everything is on track
          </span>
        </div>
        <p style={{ fontSize: "0.78rem", color: MID, margin: "6px 0 0", lineHeight: 1.45, fontFamily: sans }}>
          We're quietly handling your occasions.
        </p>
      </div>

      {/* User + logout */}
      <div className="px-4 py-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${RED}12`, color: RED, fontFamily: sans, fontSize: "0.85rem", fontWeight: 600 }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: INK, fontSize: "0.85rem", fontFamily: sans }}>
              {user?.name ?? "User"}
            </div>
            <div style={{ fontSize: "0.75rem", color: MID, marginTop: 2, fontFamily: sans }}>
              Personal workspace
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: MID, background: "transparent", border: "none", cursor: "pointer", fontFamily: sans }}
          onMouseEnter={e => (e.currentTarget.style.background = `${INK}06`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          data-testid="btn-logout"
        >
          <LogOut size={15} />
          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 min-h-screen flex-shrink-0"
        style={{ background: CREAM, borderRight: `1px solid ${BORDER}` }}
      >
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          background: "rgba(250,247,244,0.94)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${BORDER}`,
          height: 56,
          fontFamily: sans,
        }}
      >
        <div>
          <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 700, color: INK }}>
            F.I. FORGOT
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: INK, background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(31,31,31,0.25)" }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="absolute top-0 left-0 bottom-0 w-72 flex flex-col"
            style={{ background: CREAM, borderRight: `1px solid ${BORDER}`, boxShadow: "4px 0 24px rgba(31,31,31,0.08)" }}
          >
            <NavContent />
          </aside>
        </div>
      )}

      {/* Mobile top spacer */}
      <div className="md:hidden" style={{ height: 56 }} />
    </>
  );
}
