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
  Zap,
} from "lucide-react";
import { useState } from "react";

const NAVY = "#071A33";
const GOLD = "#D8A725";
const RED = "#E23B2E";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recipients", label: "Recipients", icon: Users },
  { href: "/settings/reminders", label: "Reminders", icon: Bell },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
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
    <div className="flex flex-col h-full" style={{ background: NAVY }}>
      {/* Brand */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="text-xl font-serif font-bold text-white">&quot;F&quot; I Forgot</div>
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Relationship disaster prevention
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" data-testid="sidebar-nav">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${active ? "" : "hover:bg-white/5"}`}
                style={
                  active
                    ? {
                        background: "rgba(216,167,37,0.15)",
                        color: GOLD,
                        boxShadow: "0 0 0 1px rgba(216,167,37,0.3), inset 0 0 12px rgba(216,167,37,0.05)",
                      }
                    : { color: "rgba(255,255,255,0.6)" }
                }
              >
                <Icon size={17} />
                {label}
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: GOLD }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Autopilot status */}
      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
        >
          <Zap size={12} style={{ color: GOLD }} />
          <span>Autopilot</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-semibold">online</span>
          </div>
        </div>
      </div>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "rgba(216,167,37,0.3)", border: "1.5px solid rgba(216,167,37,0.5)" }}
          >
            {user?.name?.charAt(0) ?? "M"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name ?? "Mike Thompson"}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Family plan</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl shadow-lg text-white"
        style={{ background: NAVY }}
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform md:hidden`}
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0">
        <NavContent />
      </div>
    </>
  );
}
