import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const GREEN = "#16a34a";
const GOLD  = "#D8A725";

// ── Handwrytten custom card print specifications ────────────────────────────
// Source: Handwrytten API docs + custom card upload requirements
// Standard card sizes supported by Handwrytten:
const HW_SIZES = [
  { name: "A2 Folded (5.5\" × 4.25\")", wIn: 5.5,  hIn: 4.25, label: "landscape" },
  { name: "Portrait (5\" × 7\")",        wIn: 5.0,  hIn: 7.0,  label: "portrait"  },
  { name: "Square (5\" × 5\")",          wIn: 5.0,  hIn: 5.0,  label: "square"    },
] as const;

const MIN_DPI         = 300;   // Handwrytten minimum for print quality
const WARN_DPI        = 200;   // Below this is degraded but potentially printable
const BLEED_IN        = 0.125; // 1/8" bleed on each side
const SAFE_ZONE_IN    = 0.25;  // Safe zone inset from trim edge

interface RawCard {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  handwryttenCardId: string | null;
  active: boolean;
}

type PrintStatus = "pass" | "warn" | "fail" | "loading" | "error";

interface CardAudit {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  handwryttenCardId: string | null;
  active: boolean;
  status: PrintStatus;
  width: number;
  height: number;
  aspectRatio: number;
  bestFitSize: (typeof HW_SIZES)[number] | null;
  effectiveDpi: number;
  qualityScore: number;
  colorMode: string;
  issues: string[];
  recommendations: string[];
  expanded: boolean;
}

function detectBestFitSize(w: number, h: number): (typeof HW_SIZES)[number] {
  const ratio = w / h;
  let best: (typeof HW_SIZES)[number] = HW_SIZES[0];
  let bestDiff = Infinity;
  for (const size of HW_SIZES) {
    const sizeRatio = size.wIn / size.hIn;
    const diff = Math.abs(ratio - sizeRatio);
    if (diff < bestDiff) { bestDiff = diff; best = size; }
    // Also check flipped orientation
    const flippedRatio = size.hIn / size.wIn;
    const diffFlipped = Math.abs(ratio - flippedRatio);
    if (diffFlipped < bestDiff) { bestDiff = diffFlipped; best = size; }
  }
  return best;
}

function calcEffectiveDpi(w: number, h: number, size: (typeof HW_SIZES)[number]): number {
  // Use the longer dimension aligned to the longer print dimension
  const printLong  = Math.max(size.wIn, size.hIn);
  const printShort = Math.min(size.wIn, size.hIn);
  const imgLong    = Math.max(w, h);
  const imgShort   = Math.min(w, h);
  const dpiLong  = imgLong  / printLong;
  const dpiShort = imgShort / printShort;
  return Math.round(Math.min(dpiLong, dpiShort)); // bottleneck dimension
}

function auditCard(raw: RawCard, w: number, h: number): Omit<CardAudit, "expanded"> {
  const bestFit = detectBestFitSize(w, h);
  const effectiveDpi = calcEffectiveDpi(w, h, bestFit);
  const qualityScore = Math.min(100, Math.round((effectiveDpi / MIN_DPI) * 100));

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Resolution check
  if (effectiveDpi < WARN_DPI) {
    issues.push(`Resolution too low: ~${effectiveDpi} DPI at ${bestFit.name}. Minimum is ${MIN_DPI} DPI.`);
    recommendations.push(`Regenerate this card at a higher resolution. Source image must be at least ${Math.ceil(bestFit.wIn * MIN_DPI)} × ${Math.ceil(bestFit.hIn * MIN_DPI)} px.`);
  } else if (effectiveDpi < MIN_DPI) {
    issues.push(`Resolution borderline: ~${effectiveDpi} DPI at ${bestFit.name}. May print slightly soft.`);
    recommendations.push(`Ideally regenerate at ≥${MIN_DPI} DPI. Minimum output: ${Math.ceil(bestFit.wIn * MIN_DPI)} × ${Math.ceil(bestFit.hIn * MIN_DPI)} px.`);
  }

  // Absolute minimum pixel check (must be at least WARN_DPI equivalent)
  const minPx = Math.ceil(Math.min(bestFit.wIn, bestFit.hIn) * WARN_DPI);
  if (Math.min(w, h) < minPx) {
    issues.push(`Image too small: shortest side is ${Math.min(w, h)}px (minimum ${minPx}px for any usable print quality).`);
  }

  // Aspect ratio check — flag significant deviation from standard sizes
  const ratio = w / h;
  const bestRatio = bestFit.wIn / bestFit.hIn;
  const altRatio  = bestFit.hIn / bestFit.wIn;
  const closestRatioDiff = Math.min(Math.abs(ratio - bestRatio), Math.abs(ratio - altRatio));
  if (closestRatioDiff > 0.12) {
    issues.push(`Non-standard aspect ratio (${w}:${h} ≈ ${ratio.toFixed(2)}). Closest match is ${bestFit.name}. Card may be cropped or letterboxed during printing.`);
    recommendations.push(`Crop or regenerate at a ${bestFit.label} aspect ratio matching ${bestFit.name}.`);
  }

  // Bleed note — can't verify programmatically, always flag for manual review
  const bleedPx = Math.round(effectiveDpi * BLEED_IN);
  const safePx  = Math.round(effectiveDpi * SAFE_ZONE_IN);
  if (effectiveDpi >= WARN_DPI) {
    recommendations.push(
      `Verify manually: bleed should extend ${BLEED_IN}" (≈${bleedPx}px at current DPI) beyond trim. ` +
      `Keep all text and key art ≥${SAFE_ZONE_IN}" (≈${safePx}px) from the trim edge.`
    );
  }

  // Color mode — web images are always RGB; note conversion
  const colorMode = "RGB (web)";
  recommendations.push("Color mode is RGB. Handwrytten converts to CMYK at print time — slight color shift possible on saturated colors. No action required.");

  const status: PrintStatus =
    effectiveDpi >= MIN_DPI && closestRatioDiff <= 0.12 ? "pass" :
    effectiveDpi >= WARN_DPI ? "warn" :
    "fail";

  return {
    ...raw,
    status,
    width: w,
    height: h,
    aspectRatio: ratio,
    bestFitSize: bestFit,
    effectiveDpi,
    qualityScore,
    colorMode,
    issues,
    recommendations,
  };
}

function StatusBadge({ status }: { status: PrintStatus }) {
  if (status === "pass") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: GREEN, padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      <CheckCircle size={11} /> PASS
    </span>
  );
  if (status === "warn") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef9c3", color: "#a16207", padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      <AlertTriangle size={11} /> WARNING
    </span>
  );
  if (status === "fail") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fee2e2", color: RED, padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      <XCircle size={11} /> FAIL
    </span>
  );
  if (status === "loading") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      Analyzing…
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fee2e2", color: RED, padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      ERROR
    </span>
  );
}

function ScoreBar({ score, status }: { score: number; status: PrintStatus }) {
  const color = status === "pass" ? GREEN : status === "warn" ? GOLD : RED;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color, fontFamily: "'Inter', sans-serif", minWidth: 30 }}>{score}</span>
    </div>
  );
}

function SummaryCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div style={{ background: "white", border: "1.5px solid hsl(40,20%,88%)", borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function loadImage(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load"));
    img.src = url;
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  just_because:                       "Just Because",
  humor:                              "Humor & Funny",
  home_purchase_anniversary:          "Home Purchase Anniversary",
  business_relationship_anniversary:  "Business Relationship Anniversary",
  closing_anniversary:                "Closing Anniversary",
  general_milestone:                  "General Business Milestone",
  holiday:                            "Holiday",
};

export function AdminPrintAudit() {
  const [audits, setAudits]   = useState<CardAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<"all" | "pass" | "warn" | "fail">("all");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed]   = useState(0);
  const [total, setTotal]         = useState(0);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAudits([]);
    setAnalyzing(true);
    setAnalyzed(0);

    try {
      const res  = await fetch("/api/admin/print-audit");
      const data = await res.json() as { cards?: RawCard[]; error?: string };
      if (!res.ok || !data.cards) throw new Error(data.error ?? "Failed to load cards");

      const cards = data.cards;
      setTotal(cards.length);
      setLoading(false);

      // Seed with loading state
      setAudits(cards.map(c => ({ ...c, status: "loading" as PrintStatus, width: 0, height: 0, aspectRatio: 0, bestFitSize: null, effectiveDpi: 0, qualityScore: 0, colorMode: "RGB", issues: [], recommendations: [], expanded: false })));

      // Analyze images in batches of 6
      const BATCH = 6;
      const results: CardAudit[] = [...cards.map(c => ({ ...c, status: "loading" as PrintStatus, width: 0, height: 0, aspectRatio: 0, bestFitSize: null, effectiveDpi: 0, qualityScore: 0, colorMode: "RGB", issues: [], recommendations: [], expanded: false }))];

      for (let i = 0; i < cards.length; i += BATCH) {
        const batch = cards.slice(i, i + BATCH);
        await Promise.all(batch.map(async (card, batchIdx) => {
          const idx = i + batchIdx;
          try {
            const { w, h } = await loadImage(card.imageUrl);
            results[idx] = { ...auditCard(card, w, h), expanded: false };
          } catch {
            results[idx] = { ...results[idx], status: "error" as PrintStatus, issues: ["Could not load image — URL may be broken or expired."], recommendations: ["Regenerate this card to get a fresh image URL."] };
          }
          setAnalyzed(prev => prev + 1);
        }));
        setAudits([...results]);
      }
      setAnalyzing(false);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => { void runAudit(); }, [runAudit]);

  function toggleExpand(id: string) {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, expanded: !a.expanded } : a));
  }

  const done  = audits.filter(a => a.status !== "loading");
  const pass  = done.filter(a => a.status === "pass").length;
  const warn  = done.filter(a => a.status === "warn").length;
  const fail  = done.filter(a => a.status === "fail" || a.status === "error").length;
  const avgScore = done.length > 0
    ? Math.round(done.reduce((s, a) => s + a.qualityScore, 0) / done.length)
    : 0;

  const filtered = audits.filter(a =>
    filter === "all" ? true :
    filter === "pass" ? a.status === "pass" :
    filter === "warn" ? a.status === "warn" :
    a.status === "fail" || a.status === "error"
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY, margin: 0, letterSpacing: "-0.01em" }}>
              Print Readiness Audit
            </h2>
            <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "4px 0 0" }}>
              Checks every AI card library image against Handwrytten's printing requirements (300 DPI minimum at print size).
            </p>
          </div>
          <button
            onClick={() => void runAudit()}
            disabled={analyzing || loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1.5px solid hsl(40,20%,80%)`, background: "white", color: NAVY, fontSize: "0.8rem", fontWeight: 600, cursor: analyzing || loading ? "default" : "pointer", opacity: analyzing || loading ? 0.5 : 1 }}
          >
            <RefreshCw size={13} className={analyzing ? "animate-spin" : ""} />
            Re-run Audit
          </button>
        </div>
      </div>

      {/* Spec reference */}
      <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Info size={14} style={{ color: "#0284c7", flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: "0.73rem", color: "#0369a1", lineHeight: 1.5 }}>
          <strong>Handwrytten print specs:</strong> 300 DPI minimum · 0.125" bleed required · 0.25" safe zone from trim ·
          Standard sizes: 5.5"×4.25" (A2 landscape), 5"×7" (portrait) · Color: RGB accepted (converted to CMYK at print).
          Resolution is calculated by fitting the image to its nearest standard card size.
        </div>
      </div>

      {/* Progress bar while analyzing */}
      {analyzing && (
        <div style={{ background: "white", border: "1.5px solid hsl(40,20%,88%)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: NAVY }}>Analyzing images…</span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{analyzed} / {total}</span>
          </div>
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${total > 0 ? (analyzed / total) * 100 : 0}%`, height: "100%", background: NAVY, borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: 14, marginBottom: 20, color: RED, fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {/* Summary row */}
      {!loading && done.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <SummaryCard label="Total Cards" value={audits.length} color={NAVY} sub={`${done.length} analyzed`} />
          <SummaryCard label="Print-Ready" value={pass} color={GREEN} sub="≥ 300 DPI · correct ratio" />
          <SummaryCard label="Warnings" value={warn} color={GOLD} sub="200–299 DPI · may print soft" />
          <SummaryCard label="Failures" value={fail} color={RED} sub="< 200 DPI or broken" />
          <SummaryCard label="Avg Quality Score" value={`${avgScore}/100`} color={avgScore >= 80 ? GREEN : avgScore >= 60 ? GOLD : RED} sub="300 DPI = 100" />
        </div>
      )}

      {/* Filter bar */}
      {!loading && done.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {(["all", "pass", "warn", "fail"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filter === f ? NAVY : "hsl(40,20%,80%)"}`, background: filter === f ? NAVY : "white", color: filter === f ? "white" : "#64748b", fontSize: "0.73rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}
            >
              {f === "all" ? `All (${done.length})` :
               f === "pass" ? `Pass (${pass})` :
               f === "warn" ? `Warn (${warn})` :
               `Fail (${fail})`}
            </button>
          ))}
        </div>
      )}

      {/* Card table */}
      {!loading && filtered.length === 0 && !analyzing && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: "0.85rem" }}>
          No cards to display.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(card => (
          <div
            key={card.id}
            style={{ background: "white", border: `1.5px solid ${card.status === "fail" || card.status === "error" ? "#fca5a5" : card.status === "warn" ? "#fde68a" : "hsl(40,20%,88%)"}`, borderRadius: 12, overflow: "hidden" }}
          >
            {/* Row header */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
              onClick={() => card.status !== "loading" && toggleExpand(card.id)}
            >
              {/* Thumbnail */}
              <img
                src={card.imageUrl}
                alt={card.title}
                style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: "1px solid hsl(40,20%,90%)", background: "#f8f6f0" }}
              />

              {/* Name + category */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {card.title}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 1 }}>
                  {CATEGORY_LABELS[card.category] ?? card.category}
                  {card.handwryttenCardId && <span style={{ marginLeft: 6, color: "#94a3b8" }}>HW #{card.handwryttenCardId}</span>}
                  {!card.active && <span style={{ marginLeft: 6, background: "#f1f5f9", color: "#94a3b8", padding: "1px 5px", borderRadius: 4, fontSize: "0.62rem", fontWeight: 600 }}>INACTIVE</span>}
                </div>
              </div>

              {/* Dimensions */}
              <div style={{ textAlign: "center", minWidth: 80, display: "none" }} className="md:block">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY }}>
                  {card.width && card.height ? `${card.width}×${card.height}` : "—"}
                </div>
                <div style={{ fontSize: "0.63rem", color: "#94a3b8" }}>px</div>
              </div>

              {/* DPI */}
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: card.effectiveDpi >= MIN_DPI ? GREEN : card.effectiveDpi >= WARN_DPI ? GOLD : RED }}>
                  {card.status === "loading" ? "…" : card.effectiveDpi > 0 ? `${card.effectiveDpi}` : "—"}
                </div>
                <div style={{ fontSize: "0.63rem", color: "#94a3b8" }}>DPI</div>
              </div>

              {/* Quality score bar */}
              <div style={{ minWidth: 100, display: "none" }} className="md:block">
                <ScoreBar score={card.qualityScore} status={card.status} />
              </div>

              {/* Status badge */}
              <div style={{ minWidth: 80, textAlign: "right", flexShrink: 0 }}>
                <StatusBadge status={card.status} />
              </div>

              {/* Expand toggle */}
              <div style={{ flexShrink: 0 }}>
                {card.expanded ? <ChevronUp size={14} style={{ color: "#94a3b8" }} /> : <ChevronDown size={14} style={{ color: "#94a3b8" }} />}
              </div>
            </div>

            {/* Expanded detail */}
            {card.expanded && card.status !== "loading" && (
              <div style={{ borderTop: "1px solid hsl(40,20%,92%)", padding: "14px 16px", background: "hsl(40,50%,99%)" }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

                  {/* Image preview */}
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    style={{ width: 140, height: 110, objectFit: "contain", borderRadius: 8, border: "1.5px solid hsl(40,20%,88%)", background: "#f8f6f0", flexShrink: 0 }}
                  />

                  {/* Metrics grid */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                      {[
                        { label: "Dimensions",      value: `${card.width} × ${card.height} px` },
                        { label: "Aspect Ratio",    value: `${card.aspectRatio.toFixed(3)}` },
                        { label: "Best-Fit Size",   value: card.bestFitSize?.name ?? "—" },
                        { label: "Effective DPI",   value: `${card.effectiveDpi} DPI` },
                        { label: "Quality Score",   value: `${card.qualityScore} / 100` },
                        { label: "Color Mode",      value: card.colorMode },
                        { label: "Bleed (0.125\")", value: card.effectiveDpi > 0 ? `≈ ${Math.round(card.effectiveDpi * BLEED_IN)} px` : "—" },
                        { label: "Safe Zone",       value: card.effectiveDpi > 0 ? `≈ ${Math.round(card.effectiveDpi * SAFE_ZONE_IN)} px inset` : "—" },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: "white", border: "1px solid hsl(40,20%,90%)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: NAVY, marginTop: 2 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Issues */}
                    {card.issues.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Issues</div>
                        {card.issues.map((issue, i) => (
                          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4 }}>
                            <XCircle size={12} style={{ color: RED, flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: "0.76rem", color: "#374151", lineHeight: 1.45 }}>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {card.recommendations.length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Recommendations</div>
                        {card.recommendations.map((rec, i) => (
                          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4 }}>
                            <Info size={12} style={{ color: "#0369a1", flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: "0.76rem", color: "#374151", lineHeight: 1.45 }}>{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {card.status === "pass" && card.issues.length === 0 && (
                      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                        <CheckCircle size={13} style={{ color: GREEN }} />
                        <span style={{ fontSize: "0.78rem", color: GREEN, fontWeight: 600 }}>This card meets Handwrytten's print requirements.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && done.length > 0 && (
        <div style={{ marginTop: 20, padding: "12px 16px", background: "hsl(40,50%,97%)", border: "1px solid hsl(40,20%,88%)", borderRadius: 10, fontSize: "0.72rem", color: "#64748b" }}>
          <strong style={{ color: NAVY }}>Note on bleed and safe zones:</strong> Bleed and safe-zone compliance cannot be verified automatically from pixel data alone — it requires visual inspection of where design elements sit relative to the trim edge. Flag any card for manual review before approving it for customer orders.
        </div>
      )}
    </div>
  );
}
