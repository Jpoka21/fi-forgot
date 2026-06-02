import { useState, useEffect, useRef, useCallback } from "react";
import { Image, RefreshCw, Trash2, ToggleLeft, ToggleRight, ChevronDown, Zap, CheckCircle, XCircle, BarChart2, Loader2 } from "lucide-react";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const GOLD  = "#D8A725";
const GREEN = "#16a34a";

const CATEGORY_LABELS: Record<string, string> = {
  birthday:                           "Birthday",
  personal_anniversary:               "Personal Anniversary",
  thank_you:                          "Thank You",
  graduation:                         "Graduation",
  holiday_personal:                   "Holiday (Personal / Family)",
  just_because:                       "Just Because",
  thinking_of_you:                    "Thinking of You",
  encouragement:                      "Encouragement",
  congratulations_personal:           "Congratulations",
  new_baby:                           "New Baby",
  get_well:                           "Get Well",
  miss_you:                           "Miss You",
  humor:                              "Humor & Funny",
  home_purchase_anniversary:          "Home Purchase Anniversary",
  business_relationship_anniversary:  "Business Relationship Anniversary",
  closing_anniversary:                "Closing Anniversary",
  general_milestone:                  "General Business Milestone",
  holiday:                            "Holiday (Business)",
};

const CATEGORY_TARGETS: Record<string, number> = {
  birthday:                           12,
  personal_anniversary:               8,
  thank_you:                          8,
  graduation:                         6,
  holiday_personal:                   8,
  just_because:                       25,
  thinking_of_you:                    8,
  encouragement:                      8,
  congratulations_personal:           6,
  new_baby:                           6,
  get_well:                           6,
  miss_you:                           6,
  humor:                              15,
  home_purchase_anniversary:          12,
  business_relationship_anniversary:  10,
  closing_anniversary:                8,
  general_milestone:                  5,
  holiday:                            5,
};

interface LibraryCard {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  imageUrl: string;
  handwryttenCardId: string | null;
  tags: string[];
  style: string | null;
  tone: string | null;
  primaryColor: string | null;
  seasonal: boolean;
  active: boolean;
  timesShown: number;
  timesSelected: number;
  timesRejected: number;
  createdAt: string;
}

interface CategoryStat {
  key: string;
  label: string;
  target: number;
  count: number;
  activeCount: number;
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1rem", fontWeight: 700, color, fontFamily: "'Inter', sans-serif" }}>{value}</div>
      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>{label}</div>
    </div>
  );
}

function CardTile({
  card,
  onToggle,
  onDelete,
  onRegenerate,
}: {
  card: LibraryCard;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [regenBusy,   setRegenBusy]   = useState(false);
  const [deleteBusy,  setDeleteBusy]  = useState(false);
  const [toggleBusy,  setToggleBusy]  = useState(false);
  const [imgError,    setImgError]    = useState(false);

  async function handleToggle() {
    setToggleBusy(true);
    await onToggle(card.id, !card.active);
    setToggleBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${card.title}"? This cannot be undone.`)) return;
    setDeleteBusy(true);
    await onDelete(card.id);
    setDeleteBusy(false);
  }

  async function handleRegen() {
    if (!confirm(`Regenerate "${card.title}"? This costs ~$0.25 and replaces the existing image.`)) return;
    setRegenBusy(true);
    await onRegenerate(card.id);
    setRegenBusy(false);
  }

  const rate = card.timesShown > 0
    ? Math.round((card.timesSelected / card.timesShown) * 100)
    : null;

  return (
    <div style={{
      background: card.active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${card.active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
      borderRadius: 12,
      overflow: "hidden",
      opacity: card.active ? 1 : 0.55,
      transition: "opacity 0.2s",
    }}>
      {/* Card image */}
      <div style={{ position: "relative", aspectRatio: "2/3", background: "rgba(255,255,255,0.04)", cursor: "pointer" }}
           onClick={() => setExpanded(e => !e)}>
        {card.imageUrl && !imgError ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image size={28} color="rgba(255,255,255,0.2)" />
          </div>
        )}
        {/* Active badge */}
        <div style={{
          position: "absolute", top: 6, right: 6,
          background: card.active ? GREEN : "rgba(0,0,0,0.6)",
          borderRadius: 4, padding: "2px 6px",
          fontSize: "0.6rem", fontWeight: 700, color: "#fff",
          fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {card.active ? "Active" : "Off"}
        </div>
        {/* Selection rate */}
        {rate !== null && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 6px",
            fontSize: "0.6rem", fontWeight: 700, color: GOLD,
            fontFamily: "'Inter', sans-serif",
          }}>
            {rate}% pick
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{
          fontSize: "0.75rem", fontWeight: 700, color: "#fff",
          fontFamily: "'Inter', sans-serif", marginBottom: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {card.title}
        </div>
        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", marginBottom: 8, textTransform: "capitalize" }}>
          {card.subcategory.replace(/_/g, " ")} · {card.style ?? ""}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 10, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
          <StatBadge label="Shown"    value={card.timesShown}    color="rgba(255,255,255,0.7)" />
          <StatBadge label="Picked"   value={card.timesSelected} color={GREEN} />
          <StatBadge label="Rejected" value={card.timesRejected} color={RED} />
        </div>

        {/* Tags (expand/collapse) */}
        {expanded && card.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {card.tags.map(t => (
              <span key={t} style={{
                fontSize: "0.55rem", background: "rgba(216,167,37,0.15)", color: GOLD,
                borderRadius: 3, padding: "2px 5px", fontFamily: "'Inter', sans-serif",
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleToggle}
            disabled={toggleBusy}
            title={card.active ? "Deactivate" : "Activate"}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {toggleBusy ? <Loader2 size={13} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} /> :
              card.active ? <ToggleRight size={13} color={GREEN} /> : <ToggleLeft size={13} color="rgba(255,255,255,0.4)" />}
          </button>
          <button
            onClick={handleRegen}
            disabled={regenBusy}
            title="Regenerate image (~$0.25)"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {regenBusy ? <Loader2 size={13} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} /> :
              <RefreshCw size={13} color={GOLD} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteBusy}
            title="Delete card"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {deleteBusy ? <Loader2 size={13} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} /> :
              <Trash2 size={13} color={RED} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCardLibrary() {
  const [cards,       setCards]       = useState<LibraryCard[]>([]);
  const [categories,  setCategories]  = useState<CategoryStat[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filterCat,   setFilterCat]   = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [generating,  setGenerating]  = useState(false);
  const [genBackground, setGenBackground] = useState(false);
  const [genLog,      setGenLog]      = useState<string[]>([]);
  const [genTarget,   setGenTarget]   = useState<string>("all");
  const [upgrading,   setUpgrading]   = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState({ done: 0, total: 0 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat !== "all") params.set("category", filterCat);
      if (filterActive !== "all") params.set("active", filterActive);
      const [cardsRes, catsRes] = await Promise.all([
        fetch(`/api/admin/card-library?${params.toString()}`).then(r => r.json()),
        fetch("/api/admin/card-library/categories").then(r => r.json()),
      ]);
      setCards((cardsRes.cards ?? []) as LibraryCard[]);
      setCategories((catsRes.categories ?? []) as CategoryStat[]);
    } catch {}
    setLoading(false);
  }, [filterCat, filterActive]);

  useEffect(() => { loadCards(); }, [loadCards]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [genLog]);

  // Poll category counts every 4 s while generation runs in background.
  // Stops when count is stable for 2 consecutive checks.
  function startPolling() {
    if (pollRef.current) return;
    let lastTotal = -1;
    let stableCount = 0;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/card-library/categories");
        const data = await res.json() as { categories: CategoryStat[] };
        const cats = data.categories ?? [];
        const total = cats.reduce((s: number, c: CategoryStat) => s + c.count, 0);
        setCategories(cats);
        if (total !== lastTotal) {
          setGenLog(l => [...l, `⏳ ${total} cards in library…`]);
          lastTotal = total;
          stableCount = 0;
        } else {
          stableCount++;
          if (stableCount >= 2) {
            stopPolling();
            setGenLog(l => [...l, `✓ Done — ${total} cards total. Refreshing…`]);
            setGenerating(false);
            setGenBackground(false);
            await loadCards();
          }
        }
      } catch { /* ignore transient errors */ }
    }, 4_000);
  }

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function handleGenerate() {
    if (!confirm(
      genTarget === "all"
        ? "Generate all 40 cards (~$10)? This will skip cards that already exist."
        : `Generate cards for "${CATEGORY_LABELS[genTarget] ?? genTarget}"? Costs ~$0.25 per new card.`
    )) return;

    setGenerating(true);
    setGenBackground(false);
    setGenLog([]);
    stopPolling();

    const body: { categories?: string[]; force: boolean } = { force: false };
    if (genTarget !== "all") body.categories = [genTarget];

    let gotDone = false;

    try {
      const resp = await fetch("/api/admin/card-library/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith(": ")) continue; // keepalive comment
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as { type: string; message?: string; result?: object };
            if (payload.message) setGenLog(l => [...l, payload.message!]);
            if (payload.type === "done") {
              gotDone = true;
              const r = payload.result as { succeeded: unknown[]; failed: unknown[]; skipped: unknown[] };
              setGenLog(l => [...l,
                `✓ ${r.succeeded.length} generated, ${r.skipped.length} skipped, ${r.failed.length} failed`,
              ]);
            }
          } catch {}
        }
      }
    } catch {
      // Stream cut by proxy — generation continues on server
    }

    if (gotDone) {
      // Stream completed cleanly
      await loadCards();
      setGenerating(false);
      setGenBackground(false);
    } else {
      // Proxy cut the connection — switch to polling mode
      setGenBackground(true);
      setGenLog(l => [...l, "⚡ Connection timed out — generation is still running on the server. Checking for new cards every 4 seconds…"]);
      startPolling();
    }
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/card-library/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setCards(cs => cs.map(c => c.id === id ? { ...c, active } : c));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/card-library/${id}`, { method: "DELETE" });
    setCards(cs => cs.filter(c => c.id !== id));
    await loadCards();
  }

  async function handleRegenerate(id: string) {
    const r = await fetch(`/api/admin/card-library/${id}/regenerate`, { method: "POST" });
    if (r.ok) {
      const d = await r.json() as { card?: { imageUrl: string } };
      if (d.card) setCards(cs => cs.map(c => c.id === id ? { ...c, imageUrl: d.card!.imageUrl } : c));
    }
  }

  async function handleUpgradeAll() {
    if (!confirm(
      `Upgrade all ${cards.length} cards to 300 DPI (1500×2100px)?\n\n` +
      `This regenerates every card image and re-uploads to Handwrytten.\n` +
      `Estimated time: ${Math.round(cards.length * 0.5)} – ${cards.length} minutes.\n` +
      `Estimated cost: ~$${(cards.length * 0.25).toFixed(0)}.`
    )) return;

    setUpgrading(true);
    setUpgradeProgress({ done: 0, total: cards.length });

    // Regenerate one at a time to avoid overwhelming the API
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      try {
        const r = await fetch(`/api/admin/card-library/${card.id}/regenerate`, { method: "POST" });
        if (r.ok) {
          const d = await r.json() as { card?: { imageUrl: string } };
          if (d.card) setCards(cs => cs.map(c => c.id === card.id ? { ...c, imageUrl: d.card!.imageUrl } : c));
        }
      } catch { /* continue on error */ }
      setUpgradeProgress({ done: i + 1, total: cards.length });
    }

    setUpgrading(false);
    await loadCards();
  }

  const totalCards   = categories.reduce((s, c) => s + c.count, 0);
  const activeCards  = categories.reduce((s, c) => s + c.activeCount, 0);
  const totalShown   = cards.reduce((s, c) => s + c.timesShown, 0);
  const totalPicked  = cards.reduce((s, c) => s + c.timesSelected, 0);

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          AI Card Library
        </h2>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
          Reusable AI-generated cards for all anniversary and holiday events. Generate once, reuse forever.
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Cards", value: totalCards, color: "#fff" },
          { label: "Active", value: activeCards, color: GREEN },
          { label: "Times Shown", value: totalShown, color: "rgba(255,255,255,0.7)" },
          { label: "Times Picked", value: totalPicked, color: GOLD },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category progress */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>
          Category Coverage
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.map(cat => {
            const pct = Math.min(100, Math.round((cat.count / cat.target) * 100));
            return (
              <div key={cat.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: "#fff", fontFamily: "'Inter', sans-serif" }}>{cat.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
                    {cat.count} / {cat.target}
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${pct}%`,
                    background: pct === 100 ? GREEN : pct > 50 ? GOLD : RED,
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate panel */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>
          Generate Cards
        </h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
              Category
            </label>
            <select
              value={genTarget}
              onChange={e => setGenTarget(e.target.value)}
              disabled={generating}
              style={{ width: "100%", background: "#0d2444", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", padding: "8px 10px", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}
            >
              <option value="all">All Categories (~$10 / 40 cards)</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || upgrading}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: generating ? "rgba(255,255,255,0.05)" : GOLD,
              color: generating ? "rgba(255,255,255,0.4)" : NAVY,
              border: "none", borderRadius: 8, padding: "8px 18px",
              fontWeight: 700, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem",
              cursor: generating || upgrading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {generating
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {genBackground ? "Watching…" : "Generating…"}</>
              : <><Zap size={14} /> Generate</>}
          </button>
          <button
            onClick={handleUpgradeAll}
            disabled={generating || upgrading || cards.length === 0}
            title="Regenerate every card at 1500×2100px (300 DPI) and re-upload to Handwrytten"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: upgrading ? "rgba(255,255,255,0.05)" : "#1d4ed8",
              color: upgrading ? "rgba(255,255,255,0.4)" : "#fff",
              border: "none", borderRadius: 8, padding: "8px 18px",
              fontWeight: 700, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem",
              cursor: generating || upgrading || cards.length === 0 ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {upgrading
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {upgradeProgress.done}/{upgradeProgress.total} upgraded…</>
              : <><RefreshCw size={14} /> Upgrade All to 300 DPI</>}
          </button>
        </div>

        {upgrading && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}>
                Upgrading to 300 DPI — regenerating images and re-uploading to Handwrytten…
              </span>
              <span style={{ fontSize: "0.72rem", color: "#93c5fd", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                {upgradeProgress.done} / {upgradeProgress.total}
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${upgradeProgress.total > 0 ? (upgradeProgress.done / upgradeProgress.total) * 100 : 0}%`,
                height: "100%", background: "#3b82f6", borderRadius: 3, transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        {genBackground && (
          <div style={{
            marginTop: 14, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(216,167,37,0.12)", border: "1px solid rgba(216,167,37,0.3)",
            borderRadius: 8, padding: "10px 14px",
          }}>
            <Loader2 size={14} color={GOLD} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            <span style={{ fontSize: "0.75rem", color: GOLD, fontFamily: "'Inter', sans-serif" }}>
              Generation is running on the server — cards will appear as they finish. Do not click Generate again.
            </span>
          </div>
        )}

        {genLog.length > 0 && (
          <div
            ref={logRef}
            style={{
              marginTop: 10, background: "#030d1a", borderRadius: 8, padding: "12px 14px",
              maxHeight: 160, overflowY: "auto", fontSize: "0.72rem",
              fontFamily: "'Courier New', monospace", color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
            }}
          >
            {genLog.map((line, i) => (
              <div key={i} style={{
                color: line.startsWith("✓") ? GREEN
                     : line.startsWith("Failed") ? RED
                     : line.startsWith("⏳") ? GOLD
                     : line.startsWith("⚡") ? "rgba(255,255,255,0.45)"
                     : undefined,
              }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ background: "#0d2444", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", padding: "7px 10px", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          style={{ background: "#0d2444", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", padding: "7px 10px", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}
        >
          <option value="all">Active &amp; Inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        <button
          onClick={loadCards}
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "7px 14px", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}
        >
          Refresh
        </button>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", alignSelf: "center" }}>
          {cards.length} card{cards.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Card grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
          Loading…
        </div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <BarChart2 size={36} color="rgba(255,255,255,0.15)" style={{ marginBottom: 12 }} />
          <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
            No cards yet — generate the library above to get started.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {cards.map(card => (
            <CardTile
              key={card.id}
              card={card}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
