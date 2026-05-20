import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

const NAVY = "#0D1B35";
const RED = "#E23B2E";
const WHITE = "#FFFFFF";

interface Client {
  id: string;
  businessId: string;
  fullName: string;
  company?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  homePurchaseAnniversary?: string | null;
  clientSince?: string | null;
  customEvents?: string | null;
  kidsNames?: string | null;
  pets?: string | null;
  interests?: string | null;
  notes?: string | null;
  tags?: string | null;
  relationship?: string | null;
  autoBirthday?: boolean;
  autoHoliday?: boolean;
  autoAnniversary?: boolean;
  requireApproval?: boolean;
  automationsOn?: boolean;
  lastCardSent?: string | null;
}

const SAMPLE_CLIENTS: Client[] = [
  { id: "sample-1", businessId: "", fullName: "John Smith", relationship: "Buyer", birthday: "May 14", lastCardSent: "Christmas 2025", automationsOn: true, tags: "Golf, Kids" },
  { id: "sample-2", businessId: "", fullName: "Sarah Johnson", relationship: "Seller", birthday: "Aug 3", lastCardSent: "Birthday 2025", automationsOn: true, tags: "Luxury" },
  { id: "sample-3", businessId: "", fullName: "Michael Davis", relationship: "Past Client", birthday: "Dec 20", lastCardSent: "Holiday 2025", automationsOn: false, tags: "Investor" },
];

const ACTIVITY = [
  { icon: "✓", text: "Birthday card sent to John Smith", time: "2 hours ago" },
  { icon: "✓", text: "Anniversary card scheduled for Sarah Johnson", time: "Yesterday" },
  { icon: "✓", text: "Holiday cards queued for 42 clients", time: "3 days ago" },
];

// ── Account Menu ─────────────────────────────────────────────────────────────

interface AccountMenuProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

function AccountMenu({ user, onLogout }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: open ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.15)",
          border: "2px solid rgba(255,255,255,0.2)",
          color: WHITE, cursor: "pointer",
          fontSize: "0.82rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: WHITE, borderRadius: 12, minWidth: 220,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          zIndex: 200, overflow: "hidden",
        }}>
          {/* Account info */}
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: NAVY, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, flexShrink: 0 }}>
                {initial}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon: "⚙️", label: "Account Settings", action: () => alert("Account settings coming soon!") },
            { icon: "💳", label: "Billing & Plan", action: () => alert("Billing coming soon!") },
            { icon: "🔔", label: "Notifications", action: () => alert("Notifications coming soon!") },
            { icon: "❓", label: "Help & Support", action: () => window.open("mailto:support@fiforgot.com") },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px",
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left", fontSize: "0.88rem", color: "#334155",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Sign out */}
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "6px 0" }}>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px",
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left", fontSize: "0.88rem", color: RED, fontWeight: 600,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Workspace Switcher ────────────────────────────────────────────────────────

function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (workspaces.length <= 1) return null;

  function handleSelect(id: string, type: string) {
    switchWorkspace(id);
    setOpen(false);
    setLocation(type === "business" ? "/business/dashboard" : "/dashboard");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, padding: "6px 12px",
          color: WHITE, cursor: "pointer", fontSize: "0.85rem",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
        <span style={{ fontWeight: 600 }}>{activeWorkspace?.name ?? "Workspace"}</span>
        <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: WHITE, borderRadius: 10, minWidth: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          zIndex: 200, overflow: "hidden",
        }}>
          <p style={{ margin: 0, padding: "10px 14px 6px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>Switch Workspace</p>
          {workspaces.map(ws => (
            <button key={ws.id} onClick={() => handleSelect(ws.id, ws.type)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 14px",
              background: ws.id === activeWorkspace?.id ? "#f1f5f9" : "transparent",
              border: "none", cursor: "pointer", textAlign: "left",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: ws.type === "business" ? NAVY : "#e0e7ff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700,
                color: ws.type === "business" ? WHITE : "#6366f1",
              }}>
                {ws.type === "business" ? "B" : "P"}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: NAVY }}>{ws.name}</p>
                <p style={{ margin: 0, fontSize: "0.74rem", color: "#94a3b8", textTransform: "capitalize" }}>{ws.type}</p>
              </div>
              {ws.id === activeWorkspace?.id && <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: "0.8rem" }}>✓</span>}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px 14px" }}>
            <Link href="/business/create-workspace" style={{ fontSize: "0.82rem", color: RED, fontWeight: 600, textDecoration: "none" }}>
              + Add Business Workspace
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Client Panel ──────────────────────────────────────────────────────────

interface AddClientPanelProps {
  open: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  businessId: string;
}

function AddClientPanel({ open, onClose, onSaved, businessId }: AddClientPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customEvents, setCustomEvents] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (!open) { setExpanded(false); setCustomEvents([]); } }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const payload: Record<string, unknown> = { businessId };
    fd.forEach((v, k) => { if (v) payload[k] = String(v); });
    if (customEvents.length) payload.customEvents = customEvents.join(", ");

    setSaving(true);
    try {
      const res = await fetch(`/api/business-clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { client } = await res.json();
        onSaved(client);
        formRef.current?.reset();
        onClose();
      }
    } finally { setSaving(false); }
  }

  function addCustomEvent() {
    const name = window.prompt("Event name (e.g. Work Anniversary, Pet Birthday):");
    if (name?.trim()) setCustomEvents(prev => [...prev, name.trim()]);
  }

  const inp = (name: string, label: string, placeholder?: string, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: 5 }}>{label}</label>
      <input name={name} type={type} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: "0.95rem", background: "#f8fafc", boxSizing: "border-box" as const }} />
    </div>
  );

  const chk = (name: string, label: string, defaultChecked = true) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", fontSize: "0.92rem", color: "#334155" }}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} style={{ width: 16, height: 16, accentColor: RED }} />
      {label}
    </label>
  );

  const sec = (t: string) => (
    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", margin: "24px 0 14px", borderTop: "1px solid #f1f5f9", paddingTop: 18 }}>{t}</p>
  );

  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 99 }} />}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(480px, 100vw)", background: WHITE,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.18)", zIndex: 100,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: NAVY }}>Add New Client</h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", marginTop: 2 }}>Only Full Name is required</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "#94a3b8", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
          <form ref={formRef} onSubmit={handleSubmit} id="add-client-form">
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: 5 }}>Full Name *</label>
              <input name="fullName" required placeholder="Jane Doe" autoFocus
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: "0.95rem", background: "#f8fafc", boxSizing: "border-box" as const }} />
            </div>
            {inp("birthday", "Birthday", "e.g. May 14")}
            {inp("address", "Address", "123 Main St, Austin TX 78701")}

            {!expanded && (
              <button type="button" onClick={() => setExpanded(true)} style={{ width: "100%", padding: "10px", marginTop: 8, background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, color: "#475569", fontSize: "0.88rem", cursor: "pointer", fontWeight: 600 }}>
                + Add More Details
              </button>
            )}

            {expanded && (
              <>
                {sec("Basic Information")}
                {inp("company", "Company", "Smith Realty")}
                {inp("email", "Email", "jane@example.com", "email")}
                {inp("phone", "Phone", "(555) 555-5555", "tel")}
                {inp("relationship", "Relationship", "Buyer / Seller / Past Client")}

                {sec("Important Dates")}
                {inp("homePurchaseAnniversary", "Home Purchase Anniversary", "e.g. June 2023")}
                {inp("clientSince", "Client Since", "e.g. 2021")}

                {customEvents.map((ev, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: 5 }}>{ev}</label>
                    <input placeholder="Date" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: "0.95rem", background: "#f8fafc", boxSizing: "border-box" as const }} />
                  </div>
                ))}
                <button type="button" onClick={addCustomEvent} style={{ padding: "7px 14px", marginBottom: 8, background: "none", border: "1.5px dashed #cbd5e1", borderRadius: 6, color: "#64748b", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
                  + Add Custom Event
                </button>

                {sec("Relationship Notes")}
                {inp("kidsNames", "Kids' Names", "Emma, Liam")}
                {inp("pets", "Pets", "Max (golden retriever)")}
                {inp("interests", "Interests", "Golf, Travel, Wine")}
                {inp("tags", "Tags", "VIP, Referral Source")}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: 5 }}>Notes</label>
                  <textarea name="notes" rows={3} placeholder="Anything else worth remembering…"
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: "0.95rem", background: "#f8fafc", boxSizing: "border-box" as const, resize: "vertical" }} />
                </div>

                {sec("Automation Settings")}
                {chk("autoBirthday", "Birthday Cards")}
                {chk("autoHoliday", "Holiday Cards")}
                {chk("autoAnniversary", "Anniversary Cards", false)}
                {chk("requireApproval", "Require Approval Before Sending")}
              </>
            )}
          </form>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", background: WHITE, display: "flex", gap: 10, flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", border: "none", borderRadius: 8, color: "#475569", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="submit" form="add-client-form" disabled={saving} style={{ flex: 2, padding: "11px", background: saving ? "#94a3b8" : RED, border: "none", borderRadius: 8, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "SAVING…" : "ADD CLIENT"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const { isLoggedIn, user, activeWorkspace, workspaces, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [clients, setClients] = useState<Client[]>(SAMPLE_CLIENTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) { setLocation("/business/signup"); return; }
    if (!activeWorkspace) return;
    if (activeWorkspace.type !== "business") {
      // If they have a business workspace, switch to it
      const biz = workspaces.find(w => w.type === "business");
      if (!biz) { setLocation("/business/create-workspace"); return; }
    }
  }, [isLoggedIn, activeWorkspace]);

  // Load clients from API
  useEffect(() => {
    const bizId = activeWorkspace?.businessId;
    if (!bizId) { setLoading(false); return; }
    fetch(`/api/business-clients?businessId=${encodeURIComponent(bizId)}`)
      .then(r => r.json())
      .then(data => { if (data.clients?.length > 0) setClients(data.clients); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeWorkspace?.businessId]);

  function handleClientSaved(client: Client) {
    setClients(prev => [...prev.filter(c => !c.id.startsWith("sample-")), client]);
  }

  const businessWorkspace = workspaces.find(w => w.type === "business") ?? activeWorkspace;
  const filtered = clients.filter(c =>
    !search ||
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (c.tags || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.relationship || "").toLowerCase().includes(search.toLowerCase())
  );

  const cell: React.CSSProperties = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "0.92rem", color: "#334155", verticalAlign: "middle" };
  const th: React.CSSProperties = { padding: "10px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", borderBottom: "2px solid #f1f5f9", whiteSpace: "nowrap" };

  if (!isLoggedIn) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{
        background: NAVY, padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: WHITE, letterSpacing: "0.05em" }}>
              <span style={{ color: RED }}>F*</span>I FORGOT
            </span>
          </Link>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)" }}>
            YOUR CLIENTS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.85rem" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.08)", color: WHITE, fontSize: "0.88rem", outline: "none", width: 180 }} />
          </div>

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />

          {/* Import CSV */}
          <button onClick={() => alert("CSV import coming soon!")}
            style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
            Import CSV
          </button>

          {/* Add Client */}
          <button onClick={() => setPanelOpen(true)}
            style={{ padding: "7px 16px", borderRadius: 8, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.08em", cursor: "pointer" }}>
            + ADD CLIENT
          </button>

          {/* User menu */}
          <AccountMenu user={user} onLogout={() => { logout(); setLocation("/business"); }} />
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, padding: "28px 28px 48px", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Sub-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: NAVY }}>
              {businessWorkspace?.name ?? "My Business"}
              {businessWorkspace?.businessType && (
                <span style={{ marginLeft: 10, fontSize: "0.78rem", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {businessWorkspace.businessType}
                </span>
              )}
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
              {filtered.length} client{filtered.length !== 1 ? "s" : ""} {search ? "found" : "total"}
            </p>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "#dcfce7", color: "#16a34a", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            ● AUTOMATIONS ACTIVE
          </span>
        </div>

        {/* Client table */}
        <div style={{ background: WHITE, borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={th}>Name</th>
                  <th style={th}>Relationship</th>
                  <th style={th}>Birthday</th>
                  <th style={th}>Last Card</th>
                  <th style={th}>Automations</th>
                  <th style={th}>Tags</th>
                  <th style={{ ...th, width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ ...cell, textAlign: "center", color: "#94a3b8", padding: "48px 16px" }}>
                    {search ? "No clients match your search." : "No clients yet. Click + Add Client to get started."}
                  </td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={cell}>
                      <div style={{ fontWeight: 600, color: NAVY }}>{c.fullName}</div>
                      {c.email && <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{c.email}</div>}
                    </td>
                    <td style={cell}>
                      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: "#f1f5f9", fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}>
                        {c.relationship || "—"}
                      </span>
                    </td>
                    <td style={{ ...cell, color: "#475569" }}>{c.birthday || "—"}</td>
                    <td style={{ ...cell, color: "#475569" }}>{c.lastCardSent || "—"}</td>
                    <td style={cell}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, background: c.automationsOn !== false ? "#dcfce7" : "#f1f5f9", color: c.automationsOn !== false ? "#16a34a" : "#94a3b8" }}>
                        {c.automationsOn !== false ? "● ON" : "○ OFF"}
                      </span>
                    </td>
                    <td style={cell}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(c.tags || "").split(",").filter(Boolean).map(tag => (
                          <span key={tag} style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, background: "#eff6ff", color: "#3b82f6", fontSize: "0.75rem", fontWeight: 500 }}>{tag.trim()}</span>
                        ))}
                        {!c.tags && <span style={{ color: "#e2e8f0" }}>—</span>}
                      </div>
                    </td>
                    <td style={{ ...cell, textAlign: "center" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: "1.1rem", padding: 4 }} title="More options">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample clients notice */}
        {clients.every(c => c.id.startsWith("sample-")) && (
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>💡</span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#1d4ed8" }}>
                <strong>These are sample clients</strong> — add your real clients to get started.
              </p>
            </div>
            <button onClick={() => setPanelOpen(true)} style={{ padding: "8px 18px", borderRadius: 8, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.08em", cursor: "pointer", flexShrink: 0 }}>
              ADD YOUR FIRST CLIENT
            </button>
          </div>
        )}

        {/* Recently Remembered */}
        <div style={{ background: WHITE, borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "22px 24px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "0.92rem", fontWeight: 700, color: NAVY, letterSpacing: "0.04em", textTransform: "uppercase" }}>Recently Remembered</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#f8fafc" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0 }}>{a.icon}</span>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", flex: 1 }}>{a.text}</p>
                <span style={{ fontSize: "0.78rem", color: "#cbd5e1", flexShrink: 0, marginTop: 1 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddClientPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={handleClientSaved}
        businessId={activeWorkspace?.businessId ?? ""}
      />
    </div>
  );
}
