import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

const NAVY   = "#0D1B35";
const DARK   = "#0a1f3d";
const RED    = "#E23B2E";
const WHITE  = "#FFFFFF";

const BIZ_TYPES = [
  "Real Estate", "Mortgage", "Insurance", "Financial Services",
  "Legal", "Medical / Wellness", "Contractor / Home Services", "Other",
];
const RELATIONSHIP_OPTS = [
  "Client", "Referral Partner", "VIP Customer", "Other",
];


const TONE_OPTS = ["Warm Professional", "Professional", "Friendly", "Casual", "Luxury / High End"];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);

// ── Structured date inputs ────────────────────────────────────────────────────

function MonthDayPicker({ value, onChange, onBlur }: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  // value format: "May 14"
  const parts  = value.split(" ");
  const month  = MONTHS.includes(parts[0]) ? parts[0] : "";
  const day    = parts[1] ?? "";

  const sel: React.CSSProperties = {
    border: "none", background: "transparent", fontSize: "0.85rem",
    color: "#1e293b", outline: "none", cursor: "pointer",
    fontFamily: "'Inter', sans-serif", padding: "1px 2px",
    appearance: "none" as const,
  };

  function emit(m: string, d: string) {
    onChange(m && d ? `${m} ${d}` : m || "");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <select
        value={month}
        onChange={e => emit(e.target.value, day)}
        onBlur={onBlur}
        style={{ ...sel, width: 46, color: month ? "#1e293b" : "#94a3b8" }}
      >
        <option value="">Mon</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        value={day}
        onChange={e => emit(month, e.target.value)}
        onBlur={onBlur}
        style={{ ...sel, width: 40, color: day ? "#1e293b" : "#94a3b8" }}
      >
        <option value="">DD</option>
        {DAYS.map(d => <option key={d} value={String(d)}>{d}</option>)}
      </select>
    </div>
  );
}

function MonthYearPicker({ value, onChange, onBlur }: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  // value format: "Jun 2022"
  const parts = (value ?? "").split(" ");
  const month = MONTHS.includes(parts[0]) ? parts[0] : "";
  const year  = parts[1] ?? "";

  const sel: React.CSSProperties = {
    border: "none", background: "transparent", fontSize: "0.85rem",
    color: "#1e293b", outline: "none", cursor: "pointer",
    fontFamily: "'Inter', sans-serif", padding: "1px 2px",
    appearance: "none" as const,
  };

  function emit(m: string, y: string) {
    onChange(m && y ? `${m} ${y}` : m || y || "");
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <select
        value={month}
        onChange={e => emit(e.target.value, year)}
        onBlur={onBlur}
        style={{ ...sel, width: 46, color: month ? "#1e293b" : "#94a3b8" }}
      >
        <option value="">Mon</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        value={year}
        onChange={e => emit(month, e.target.value)}
        onBlur={onBlur}
        style={{ ...sel, width: 50, color: year ? "#1e293b" : "#94a3b8" }}
      >
        <option value="">YYYY</option>
        {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
      </select>
    </div>
  );
}

function YearPicker({ value, onChange, onBlur }: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const sel: React.CSSProperties = {
    border: "none", background: "transparent", fontSize: "0.85rem",
    outline: "none", cursor: "pointer",
    fontFamily: "'Inter', sans-serif", padding: "1px 2px",
    appearance: "none" as const, width: "100%",
  };
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  return (
    <select value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
      style={{ ...sel, color: value ? "#1e293b" : "#94a3b8" }}>
      <option value="">Year…</option>
      {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
    </select>
  );
}

// ── Info Tooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 4, verticalAlign: "middle" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          cursor: "help", color: "#94a3b8", fontSize: "0.6rem", fontWeight: 700,
          border: "1.5px solid #94a3b8", borderRadius: "50%", width: 13, height: 13,
          display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          userSelect: "none",
        }}
      >i</span>
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff", fontSize: "0.72rem", padding: "8px 11px",
          borderRadius: 7, width: 210, lineHeight: 1.5, zIndex: 9999,
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)", whiteSpace: "normal",
          fontWeight: 400, letterSpacing: 0, textTransform: "none",
          fontFamily: "'Inter', sans-serif", pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
            border: "5px solid transparent", borderBottomColor: "#1e293b",
          }} />
          {text}
        </div>
      )}
    </span>
  );
}

// ── Events Picker ─────────────────────────────────────────────────────────────

const EVENT_DEFS = [
  { key: "autoBirthday",   icon: "🎂", label: "Birthday"              },
  { key: "autoHoliday",    icon: "🎄", label: "Holiday"               },
  { key: "autoAnniversary",icon: "📅", label: "Special Anniversary"   },
];

type EventsPickerRow = {
  autoBirthday: boolean;
  autoHoliday: boolean;
  autoAnniversary: boolean;
  anniversaryDate: string;
  anniversaryNote: string;
};
type EventsPickerPatch = Partial<EventsPickerRow>;

function AnnivDetail({ row, onUpdate, onSave }: {
  row: EventsPickerRow;
  onUpdate: (patch: EventsPickerPatch) => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); onSave(); }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onSave]);

  const hasDetail = row.anniversaryDate || row.anniversaryNote;
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Add anniversary details"
        style={{
          background: hasDetail ? "#f0fdf4" : "#f8fafc",
          border: `1px solid ${hasDetail ? "#bbf7d0" : "#e2e8f0"}`,
          borderRadius: 10, cursor: "pointer",
          padding: "2px 8px", fontSize: "0.68rem", lineHeight: 1.4,
          color: hasDetail ? "#15803d" : "#94a3b8",
          fontFamily: "'Inter', sans-serif", fontWeight: hasDetail ? 600 : 400,
          whiteSpace: "nowrap",
        }}
      >{hasDetail ? "✏ Edit Details" : "+ Add Details"}</button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9,
          padding: "12px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.13)", width: 260,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Special Anniversary Details
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748b", fontFamily: "'Inter', sans-serif", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</div>
            <MonthYearPicker value={row.anniversaryDate} onChange={v => onUpdate({ anniversaryDate: v })} onBlur={onSave} />
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748b", fontFamily: "'Inter', sans-serif", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>What are we celebrating?</div>
            <input
              value={row.anniversaryNote}
              onChange={e => onUpdate({ anniversaryNote: e.target.value })}
              onBlur={onSave}
              placeholder="e.g. Closed on their first home…"
              style={{
                width: "100%", border: "none", borderBottom: "1px solid #e2e8f0",
                background: "transparent", fontSize: "0.82rem", color: "#334155",
                outline: "none", fontFamily: "'Inter', sans-serif", padding: "2px 0",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              We will reference this when writing the card.
              <div style={{ fontWeight: 700, color: "#475569", marginTop: 5 }}>
                Not a wedding anniversary — think home closing, deal anniversary, 1-year client milestone, or any meaningful business date.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsPicker({ row, onUpdate, onSave }: {
  row: EventsPickerRow;
  onUpdate: (patch: EventsPickerPatch) => void;
  onSave: () => void;
}) {
  const activeCount = EVENT_DEFS.filter(e => (row as Record<string, boolean>)[e.key]).length;

  function toggle(key: string) {
    onUpdate({ [key]: !(row as Record<string, boolean>)[key] } as EventsPickerPatch);
    setTimeout(onSave, 0);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {/* Count badge */}
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, minWidth: 26, textAlign: "center",
          background: activeCount > 0 ? "#dcfce7" : "#f1f5f9",
          color: activeCount > 0 ? "#15803d" : "#94a3b8",
          borderRadius: 10, padding: "1px 5px",
          fontFamily: "'Inter', sans-serif", flexShrink: 0,
        }}>
          {activeCount}/{EVENT_DEFS.length}
        </span>

        {EVENT_DEFS.map(e => {
          const active = (row as Record<string, boolean>)[e.key];
          const isAnniv = e.key === "autoAnniversary";
          return (
            <div key={e.key} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
              <button
                onClick={() => toggle(e.key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  background: active ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}`,
                  borderRadius: 10, padding: "2px 8px",
                  fontSize: "0.7rem",
                  color: active ? "#15803d" : "#c4cdd8",
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  transition: "all 0.12s", fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={el => { (el.currentTarget as HTMLElement).style.borderColor = active ? "#86efac" : "#cbd5e1"; }}
                onMouseLeave={el => { (el.currentTarget as HTMLElement).style.borderColor = active ? "#bbf7d0" : "#e2e8f0"; }}
              >
                <span style={{ opacity: active ? 1 : 0.35, fontSize: "0.85rem" }}>{e.icon}</span>
                {e.label}
              </button>
              {isAnniv && active && (
                <AnnivDetail row={row} onUpdate={onUpdate} onSave={onSave} />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientRow {
  _rowId:   string;
  id?:      string;
  businessId: string;
  fullName: string;
  company:  string;
  relationship: string;
  relationshipOther: string;
  birthday: string;
  autoBirthday:   boolean;
  autoHoliday:    boolean;
  autoAnniversary: boolean;
  anniversaryDate: string;
  anniversaryNote: string;
  tone: string;
  requireApproval: boolean;
  notes: string;
  _dirty: boolean;
  _saving: boolean;
  _saved:  boolean;
  _isNew:  boolean;
}

interface HwFont { id: string; name: string; previewUrl?: string; }

interface BizSettings {
  bizType:       string;
  bizTypeOther:  string;
  tone:          string;
  cardSignature: string;
  cardFont:      string;
}

function newRow(businessId: string): ClientRow {
  return {
    _rowId: `row-${Date.now()}-${Math.random()}`,
    businessId,
    fullName: "", company: "", relationship: "", relationshipOther: "", birthday: "",
    autoBirthday: true, autoHoliday: true, autoAnniversary: false,
    anniversaryDate: "", anniversaryNote: "", tone: "", requireApproval: false,
    notes: "",
    _dirty: false, _saving: false, _saved: false, _isNew: true,
  };
}

function rowFromClient(c: Record<string, unknown>, businessId: string): ClientRow {
  return {
    _rowId: String(c.id ?? Math.random()),
    id: c.id as string | undefined,
    businessId,
    fullName: String(c.fullName ?? ""),
    company:  String(c.company ?? ""),
    relationship: String(c.relationship ?? ""),
    relationshipOther: String(c.relationshipOther ?? ""),
    birthday: String(c.birthday ?? ""),
    autoBirthday:   Boolean(c.autoBirthday   ?? true),
    autoHoliday:    Boolean(c.autoHoliday    ?? true),
    autoAnniversary: Boolean(c.autoAnniversary ?? false),
    anniversaryDate: String(c.anniversaryDate ?? ""),
    anniversaryNote: String(c.anniversaryNote ?? ""),
    tone: String(c.tone ?? ""),
    requireApproval: Boolean(c.requireApproval ?? false),
    notes: String(c.notes ?? ""),
    _dirty: false, _saving: false, _saved: true, _isNew: false,
  };
}

const SETTINGS_KEY = "fi_biz_settings";

function loadSettings(): BizSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
  } catch { return { bizType: "", bizTypeOther: "", tone: "Warm Professional", cardSignature: "", cardFont: "" }; }
}

function saveSettings(s: BizSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AccountMenu({ user, onLogout }: { user: { name: string; email: string } | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: "50%", background: open ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)", color: WHITE, cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {initial}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: WHITE, borderRadius: 12, minWidth: 220, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200 }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>{user?.email}</p>
          </div>
          {[
            { icon: "⚙️", label: "Account Settings", action: () => alert("Coming soon") },
            { icon: "💳", label: "Billing & Plan",   action: () => alert("Coming soon") },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.88rem", color: "#334155" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>{item.label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #f1f5f9" }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.88rem", color: RED, fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <span style={{ width: 20, textAlign: "center" }}>🚪</span>Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkspaceToggle() {
  const { workspaces, switchWorkspace } = useAuth();
  const [, setLocation] = useLocation();
  const personal = workspaces.find(w => w.type === "personal");
  function goPersonal() {
    if (personal) { switchWorkspace(personal.id); setLocation("/dashboard"); }
    else setLocation("/dashboard");
  }
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, gap: 2 }}>
      <button onClick={goPersonal}
        style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>Personal</span>
      </button>
      <div style={{ padding: "6px 14px", borderRadius: 6, background: RED }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: WHITE }}>Business</span>
      </div>
    </div>
  );
}

// ── Inline Cell Inputs ────────────────────────────────────────────────────────

const cellInput: React.CSSProperties = {
  width: "100%", border: "none", background: "transparent",
  fontSize: "0.88rem", color: "#1e293b", outline: "none",
  fontFamily: "'Inter', sans-serif", padding: "2px 0",
};

const cellSelect: React.CSSProperties = {
  ...cellInput, cursor: "pointer", appearance: "none" as const,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: checked ? RED : "#e2e8f0",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.15s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2,
        left: checked ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%", background: WHITE,
        transition: "left 0.15s",
      }} />
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const { isLoggedIn, user, activeWorkspace, workspaces, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Settings
  const stored = loadSettings();
  const [bizType,       setBizType]       = useState<string>(stored.bizType       ?? "");
  const [bizTypeOther,  setBizTypeOther]  = useState<string>(stored.bizTypeOther  ?? "");
  const [tone,          setTone]          = useState<string>(stored.tone          ?? "Warm Professional");
  const [cardSignature, setCardSignature] = useState<string>(stored.cardSignature ?? "");
  const [cardFont,      setCardFont]      = useState<string>(stored.cardFont      ?? "");
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [hwFonts,       setHwFonts]      = useState<HwFont[]>([]);
  const [fontsLoading,  setFontsLoading]  = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Rows
  const [rows,    setRows]    = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [saving,  setSaving]  = useState(false);

  const businessId = activeWorkspace?.businessId ?? "";

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) { setLocation("/business/signup"); return; }
    if (!activeWorkspace) return;
    if (activeWorkspace.type !== "business") {
      const biz = workspaces.find(w => w.type === "business");
      if (!biz) setLocation("/business/create-workspace");
    }
  }, [isLoggedIn, activeWorkspace]);

  // Load clients
  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    fetch(`/api/business-clients?businessId=${encodeURIComponent(businessId)}`)
      .then(r => r.json())
      .then((data: { clients?: Record<string, unknown>[] }) => {
        if (data.clients?.length) {
          setRows(data.clients.map(c => rowFromClient(c, businessId)));
        } else {
          setRows([newRow(businessId)]);
        }
      })
      .catch(() => setRows([newRow(businessId)]))
      .finally(() => setLoading(false));
  }, [businessId]);

  // Persist settings
  useEffect(() => {
    saveSettings({ bizType, bizTypeOther, tone, cardSignature, cardFont });
  }, [bizType, bizTypeOther, tone, cardSignature, cardFont]);

  // ── Row helpers ────────────────────────────────────────────────────────────

  function updateRow(rowId: string, patch: Partial<ClientRow>) {
    setRows(prev => prev.map(r => r._rowId === rowId ? { ...r, ...patch, _dirty: true, _saved: false } : r));
  }

  function addRow() {
    setRows(prev => [...prev, newRow(businessId)]);
    // Focus the new row's first cell after render
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>("[data-row-name]");
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 50);
  }

  function deleteRow(rowId: string) {
    setRows(prev => prev.filter(r => r._rowId !== rowId));
  }

  async function saveRow(row: ClientRow) {
    if (!row._dirty && !row._isNew) return;
    if (!row.fullName.trim()) return;
    setRows(prev => prev.map(r => r._rowId === row._rowId ? { ...r, _saving: true } : r));
    try {
      const method = row.id ? "PUT" : "POST";
      const url = row.id ? `/api/business-clients/${row.id}` : "/api/business-clients";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: row.businessId, fullName: row.fullName,
          company: row.company || undefined,
          relationship: row.relationship === "Other" && row.relationshipOther
            ? `Other (${row.relationshipOther})`
            : row.relationship || undefined,
          relationshipOther: row.relationshipOther || undefined,
          birthday: row.birthday || undefined,
          autoBirthday: row.autoBirthday, autoHoliday: row.autoHoliday,
          autoAnniversary: row.autoAnniversary,
          anniversaryDate: row.anniversaryDate || undefined,
          anniversaryNote: row.anniversaryNote || undefined,
          tone: row.tone || undefined,
          requireApproval: row.requireApproval,
          notes: row.notes || undefined,
        }),
      });
      if (res.ok) {
        const body = await res.json() as { client?: { id?: string } };
        const savedId = body.client?.id;
        setRows(prev => prev.map(r => r._rowId === row._rowId
          ? { ...r, id: savedId ?? r.id, _dirty: false, _saving: false, _saved: true, _isNew: false }
          : r));
      } else {
        setRows(prev => prev.map(r => r._rowId === row._rowId ? { ...r, _saving: false } : r));
      }
    } catch {
      setRows(prev => prev.map(r => r._rowId === row._rowId ? { ...r, _saving: false } : r));
    }
  }

  async function saveAll() {
    setSaving(true);
    const dirty = rows.filter(r => r._dirty || r._isNew).filter(r => r.fullName.trim());
    await Promise.all(dirty.map(saveRow));
    setSaving(false);
  }


  const filtered = rows.filter(r =>
    !search || r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.relationship.toLowerCase().includes(search.toLowerCase()) ||
    r.company.toLowerCase().includes(search.toLowerCase())
  );

  const dirtyCount = rows.filter(r => (r._dirty || r._isNew) && r.fullName.trim()).length;

  // ── Cell styles ────────────────────────────────────────────────────────────
  const TH: React.CSSProperties = {
    padding: "10px 10px", textAlign: "left",
    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#94a3b8",
    borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap",
    background: "#f8fafc", position: "sticky", top: 0, zIndex: 5,
  };
  const TD: React.CSSProperties = {
    padding: "7px 10px", borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  };
  const FOCUS_RING = "1px solid #cbd5e1";

  if (!isLoggedIn) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{ background: NAVY, padding: "0 28px", height: 96, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: WHITE, letterSpacing: "0.05em" }}>I FORGOT</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 6 }}>BUSINESS</span>
          </Link>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)" }}>YOUR CLIENTS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WorkspaceToggle />
          <AccountMenu user={user} onLogout={() => { logout(); setLocation("/business"); }} />
        </div>
      </header>

      {/* ── Settings Strip ──────────────────────────────────────────────────── */}
      <div style={{ background: DARK, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 28px", flexShrink: 0 }}>
        <button
          onClick={() => setSettingsOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          <span style={{ fontSize: "0.9rem" }}>⚙️</span>
          Business Settings
          <span style={{ fontSize: "0.65rem", opacity: 0.6, marginLeft: 2 }}>{settingsOpen ? "▲" : "▼"}</span>
          {bizType && (
            <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 8px", fontSize: "0.68rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.55)", marginLeft: 6 }}>
              {bizType}
            </span>
          )}
        </button>

        {settingsOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, paddingBottom: 18 }}>
            {/* Business Type */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Business Type</div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <select
                  value={bizType}
                  onChange={e => { setBizType(e.target.value); if (e.target.value !== "Other") setBizTypeOther(""); }}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 6, color: WHITE, padding: "7px 30px 7px 10px",
                    fontSize: "0.85rem", appearance: "none", cursor: "pointer", outline: "none",
                    minWidth: 180,
                  }}
                >
                  <option value="" style={{ background: NAVY, color: WHITE }}>Select…</option>
                  {BIZ_TYPES.map(t => <option key={t} value={t} style={{ background: NAVY, color: WHITE }}>{t}</option>)}
                </select>
                <span style={{
                  position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
                  pointerEvents: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: 1,
                }}>▾</span>
              </div>
              {bizType === "Other" && (
                <div style={{ position: "relative" }}>
                  <input
                    value={bizTypeOther}
                    onChange={e => setBizTypeOther(e.target.value)}
                    placeholder="Describe your business so the AI can personalise cards…"
                    style={{
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 6, color: WHITE, padding: "7px 10px",
                      fontSize: "0.82rem", outline: "none", width: 300,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  <div style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.3)", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
                    We will use this description when writing your cards.
                  </div>
                </div>
              )}
            </div>

            {/* Handwriting Style */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Handwriting Style</div>
              <button
                type="button"
                onClick={async () => {
                  setFontPickerOpen(true);
                  if (hwFonts.length === 0) {
                    setFontsLoading(true);
                    try {
                      const r = await fetch("/api/handwrytten-fonts");
                      const d = await r.json() as { fonts: HwFont[] };
                      setHwFonts(d.fonts ?? []);
                    } catch { /* leave empty */ }
                    setFontsLoading(false);
                  }
                }}
                style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 6, color: WHITE, padding: "7px 12px",
                  fontSize: "0.82rem", cursor: "pointer", textAlign: "left",
                  fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 8,
                  width: 220,
                }}
              >
                <span style={{ fontSize: "1rem" }}>✍️</span>
                <span style={{ flex: 1 }}>{cardFont ? (hwFonts.find(f => f.id === cardFont)?.name ?? cardFont) : "Choose a style…"}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>▾</span>
              </button>
              <div style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                The handwriting style used on every card.
              </div>
            </div>

            {/* Card Signature */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Card Signature</div>
              <input
                value={cardSignature}
                onChange={e => setCardSignature(e.target.value)}
                placeholder="e.g. With gratitude, The Smith Team"
                style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 6, color: WHITE, padding: "7px 10px",
                  fontSize: "0.82rem", outline: "none", width: 280,
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <div style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                We'll close every card with this signature.
              </div>
            </div>

            {/* Tone */}
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Default Tone</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TONE_OPTS.map(t => (
                  <button key={t} type="button" onClick={() => setTone(t)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: tone === t ? `1.5px solid ${RED}` : "1.5px solid rgba(255,255,255,0.15)", background: tone === t ? `${RED}22` : "rgba(255,255,255,0.05)", color: tone === t ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.12s" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{ background: WHITE, borderBottom: "1px solid #e2e8f0", padding: "12px 28px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.85rem" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: "0.88rem", background: "#f8fafc", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#94a3b8")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")} />
        </div>

        <span style={{ fontSize: "0.82rem", color: "#94a3b8", marginLeft: 4 }}>
          {rows.filter(r => r.fullName.trim()).length} client{rows.filter(r => r.fullName.trim()).length !== 1 ? "s" : ""}
        </span>

        <div style={{ flex: 1 }} />

        {dirtyCount > 0 && (
          <button onClick={saveAll} disabled={saving}
            style={{ padding: "8px 20px", borderRadius: 8, background: saving ? "#94a3b8" : RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.08em", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "SAVING…" : `SAVE ALL (${dirtyCount})`}
          </button>
        )}

        <button onClick={addRow}
          style={{ padding: "8px 18px", borderRadius: 8, background: NAVY, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + ADD ROW
        </button>
      </div>

      {/* ── Spreadsheet ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", background: WHITE }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#94a3b8", fontSize: "0.9rem" }}>
            Loading clients…
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 900 }}>
            <colgroup>
              <col style={{ width: 28 }} /><col style={{ width: 160 }} /><col style={{ width: 120 }} /><col style={{ width: 130 }} /><col style={{ width: 100 }} /><col style={{ width: 110 }} /><col style={{ width: 90 }} /><col style={{ width: 290 }} /><col style={{ width: 140 }} /><col style={{ width: 76 }} /><col /><col style={{ width: 34 }} />
            </colgroup>

            <thead>
              <tr>
                <th style={TH} />
                <th style={TH}>Full Name</th>
                <th style={TH}>Company</th>
                <th style={TH}>Relationship</th>
                <th style={TH}>Birthday</th>
                <th style={TH}>Send Cards For</th>
                <th style={TH}>
                  Tone
                  <InfoTooltip text="Override the global tone for this person. Leave blank to use your account default." />
                </th>
                <th style={{ ...TH, textAlign: "center" }}>
                  Approval
                  <InfoTooltip text="When on, you'll review and approve the card message before it's mailed. Great for VIP clients." />
                </th>
                <th style={TH}>Notes / Tags</th>
                <th style={TH} />
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, idx) => {
                const isUnsaved = row._dirty || row._isNew;
                const rowBg = isUnsaved ? "#fffbf0" : idx % 2 === 0 ? WHITE : "#fafafa";
                return (
                  <tr key={row._rowId}
                    style={{ background: rowBg, transition: "background 0.1s" }}
                    onMouseEnter={e => { if (!isUnsaved) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}>

                    {/* Status dot */}
                    <td style={{ ...TD, paddingLeft: 14, paddingRight: 4 }}>
                      {row._saving ? (
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1s infinite" }} />
                      ) : row._saved && !row._dirty ? (
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} title="Saved" />
                      ) : (
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} title="Unsaved changes" />
                      )}
                    </td>

                    {/* Full Name */}
                    <td style={TD}>
                      <input
                        data-row-name
                        value={row.fullName}
                        placeholder="Full Name"
                        onChange={e => updateRow(row._rowId, { fullName: e.target.value })}
                        onBlur={() => saveRow(row)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRow(); } }}
                        style={{ ...cellInput, fontWeight: row.fullName ? 600 : 400, color: row.fullName ? "#0f172a" : "#94a3b8" }}
                        onFocus={e => (e.currentTarget.parentElement!.style.outline = FOCUS_RING)}
                        onBlurCapture={e => (e.currentTarget.parentElement!.style.outline = "none")}
                      />
                    </td>

                    {/* Company */}
                    <td style={TD}>
                      <input value={row.company} placeholder="Company" onChange={e => updateRow(row._rowId, { company: e.target.value })} onBlur={() => saveRow(row)} style={{ ...cellInput, color: row.company ? "#1e293b" : "#94a3b8" }} />
                    </td>

                    {/* Relationship */}
                    <td style={TD}>
                      <select value={row.relationship}
                        onChange={e => { updateRow(row._rowId, { relationship: e.target.value, relationshipOther: "" }); }}
                        onBlur={() => saveRow(row)}
                        style={{ ...cellSelect, color: row.relationship ? "#1e293b" : "#94a3b8" }}>
                        <option value="">Type…</option>
                        {RELATIONSHIP_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {row.relationship === "Other" && (
                        <input
                          value={row.relationshipOther}
                          onChange={e => updateRow(row._rowId, { relationshipOther: e.target.value })}
                          onBlur={() => saveRow(row)}
                          placeholder="Describe…"
                          style={{ ...cellInput, marginTop: 3, fontSize: "0.75rem", color: row.relationshipOther ? "#1e293b" : "#94a3b8" }}
                        />
                      )}
                    </td>

                    {/* Birthday */}
                    <td style={TD}>
                      <MonthDayPicker
                        value={row.birthday}
                        onChange={v => updateRow(row._rowId, { birthday: v })}
                        onBlur={() => saveRow(row)}
                      />
                    </td>

                    {/* Events Picker */}
                    <td style={TD}>
                      <EventsPicker
                        row={row}
                        onUpdate={patch => updateRow(row._rowId, patch)}
                        onSave={() => saveRow(row)}
                      />
                    </td>

                    {/* Tone override */}
                    <td style={TD}>
                      <select
                        value={row.tone}
                        onChange={e => updateRow(row._rowId, { tone: e.target.value })}
                        onBlur={() => saveRow(row)}
                        style={{ ...cellSelect, color: row.tone ? "#1e293b" : "#94a3b8" }}
                      >
                        <option value="">{tone} ·default</option>
                        {TONE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>

                    {/* Require Approval */}
                    <td style={{ ...TD, textAlign: "center" }}>
                      <Toggle checked={row.requireApproval} onChange={v => { updateRow(row._rowId, { requireApproval: v }); }} />
                    </td>

                    {/* Notes */}
                    <td style={TD}>
                      <input value={row.notes} placeholder="Golf, 2 kids, referral source…" onChange={e => updateRow(row._rowId, { notes: e.target.value })} onBlur={() => saveRow(row)} style={{ ...cellInput, color: row.notes ? "#1e293b" : "#94a3b8" }} />
                    </td>

                    {/* Delete */}
                    <td style={{ ...TD, textAlign: "center", paddingRight: 14 }}>
                      <button onClick={() => deleteRow(row._rowId)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: "1rem", lineHeight: 1, padding: "2px 4px", borderRadius: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = RED)}
                        onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}>
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ── Add Row footer ── */}
        <div style={{ padding: "12px 28px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={addRow}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "none", border: "1.5px dashed #cbd5e1", borderRadius: 8, color: "#64748b", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.color = NAVY; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"; }}>
            + Add Row
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "8px 28px", display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "#94a3b8" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Saved
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "#94a3b8" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} /> Unsaved — tab out of a cell to save automatically
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>Press Enter to add a new row · Tab to move between cells</div>
      </div>

      {/* ── Font Picker Modal ── */}
      {fontPickerOpen && (
        <div
          onClick={() => setFontPickerOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.55)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, padding: "28px 28px 20px",
              width: 760, maxWidth: "95vw", maxHeight: "88vh",
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: NAVY, fontFamily: "'Inter', sans-serif" }}>
              Choose a Handwriting Style
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: -8, fontFamily: "'Inter', sans-serif" }}>
              Every card we send will be handwritten using real pens. Pick the style that fits your brand.
            </div>

            {fontsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>Loading styles…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, overflowY: "auto", paddingRight: 4 }}>
                {hwFonts.map((font, idx) => {
                  const selected = cardFont === font.id;
                  const isDefault = idx === 0;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => { setCardFont(font.id); setFontPickerOpen(false); }}
                      style={{
                        border: `2px solid ${selected ? RED : "#e2e8f0"}`,
                        borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                        background: selected ? "#fff5f5" : "#fff",
                        textAlign: "left", transition: "all 0.12s",
                        display: "flex", flexDirection: "column", gap: 10,
                      }}
                      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1"; }}
                      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY, fontFamily: "'Inter', sans-serif" }}>{font.name}</span>
                        {isDefault && <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 20, padding: "1px 7px", fontFamily: "'Inter', sans-serif" }}>Default</span>}
                        {selected && <span style={{ fontSize: "0.68rem", background: RED, color: "#fff", borderRadius: 20, padding: "1px 7px", fontFamily: "'Inter', sans-serif" }}>Selected</span>}
                      </div>
                      {font.previewUrl ? (
                        <img
                          src={font.previewUrl}
                          alt={`${font.name} handwriting sample`}
                          style={{ width: "100%", height: 160, objectFit: "contain", objectPosition: "center center" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextSibling as HTMLElement).style.display = "block"; }}
                        />
                      ) : null}
                      <div style={{
                        display: font.previewUrl ? "none" : "block",
                        fontFamily: "cursive", fontSize: "1.1rem", color: "#334155",
                        lineHeight: 1.5, paddingTop: 4,
                      }}>
                        Warm wishes and heartfelt thanks!
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid #f1f5f9" }}>
              {cardFont && (
                <button type="button" onClick={() => { setCardFont(""); setFontPickerOpen(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
                  Clear selection
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => setFontPickerOpen(false)}
                style={{ background: NAVY, color: WHITE, border: "none", borderRadius: 7, padding: "8px 20px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
