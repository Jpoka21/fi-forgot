import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="text-xl font-serif font-bold text-[hsl(var(--sidebar-primary))]">&quot;F&quot; I Forgot</div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">Relationship disaster prevention</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1" data-testid="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || location.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))] font-bold text-sm">
            {user?.name?.charAt(0) ?? "M"}
          </div>
          <div>
            <div className="text-sm font-semibold text-sidebar-foreground">{user?.name ?? "Mike Thompson"}</div>
            <div className="text-xs text-sidebar-foreground/50">Family plan</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
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
        className="fixed top-4 left-4 z-50 md:hidden bg-[hsl(var(--sidebar))] text-sidebar-foreground p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="button-mobile-menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[hsl(var(--sidebar))] transform transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 min-h-screen bg-[hsl(var(--sidebar))] flex-shrink-0">
        <NavContent />
      </div>
    </>
  );
}
