import { useState, useEffect, useCallback } from "react";
import { Tag, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const GOLD  = "#D8A725";
const GREEN = "#16a34a";
const DIM   = "rgba(255,255,255,0.4)";
const DIM2  = "rgba(255,255,255,0.08)";

const V2_FIELDS = [
  { key: "occasion",     label: "Occasion[]" },
  { key: "relationship", label: "Relationship[]" },
  { key: "interests",    label: "Interests[]" },
  { key: "season",       label: "Season" },
  { key: "audience",     label: "Audience" },
  { key: "gender_lean",  label: "Gender Lean" },
  { key: "style",        label: "Style" },
  { key: "tone",         label: "Tone" },
];

const CATEGORIES = [
  { key: "all",                               label: "All Categories" },
  { key: "birthday",                          label: "Birthday" },
  { key: "personal_anniversary",              label: "Personal Anniversary" },
  { key: "thank_you",                         label: "Thank You" },
  { key: "thinking_of_you",                   label: "Thinking of You" },
  { key: "encouragement",                     label: "Encouragement" },
  { key: "congratulations_personal",          label: "Congratulations" },
  { key: "new_baby",                          label: "New Baby" },
  { key: "get_well",                          label: "Get Well" },
  { key: "miss_you",                          label: "Miss You" },
  { key: "humor",                             label: "Humor" },
  { key: "graduation",                        label: "Graduation" },
  { key: "just_because",                      label: "Just Because" },
  { key: "holiday_personal",                  label: "Holiday (Personal)" },
  { key: "home_purchase_anniversary",         label: "Home Purchase Anniversary" },
  { key: "business_relationship_anniversary", label: "Business Relationship Anniversary" },
  { key: "closing_anniversary",               label: "Closing Anniversary" },
  { key: "general_milestone",                 label: "General Milestone" },
  { key: "holiday",                           label: "Holiday (Business)" },
];

interface LibraryCardV2 {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  style: string | null;
  tone: string | null;
  tags: string[];
  occasion:     string[];
  relationship: string[];
  interests:    string[];
  season:       string | null;
  audience:     string | null;
  genderLean:   string | null;
}

interface AuditSummary {
  total:               number;
  missingOccasion:     number;
  missingRelationship: number;
  missingInterests:    number;
  missingSeason:       number;
  missingAudience:     number;
  missingGenderLean:   number;
  missingStyle:        number;
  missingTone:         number;
}

interface MetadataSuggestion {
  occasion:       string[];
  relationship:   string[];
  interests:      string[];
  season:         string;
  audience:       string;
  genderLean:     string;
  styleCanonical: string | null;
  toneCanonical:  string | null;
}

function completeness(card: LibraryCardV2): number {
  let filled = 0;
  if ((card.occasion     ?? []).length > 0) filled++;
  if ((card.relationship ?? []).length > 0) filled++;
  if ((card.interests    ?? []).length > 0) filled++;
  if (card.season)    filled++;
  if (card.audience)  filled++;
  if (card.genderLean) filled++;
  return Math.round((filled / 6) * 100);
}

/* ── Per-card row ─────────────────────────────────────────────────────────── */
function CardRow({ card, onApplySuggestion }: {
  card: LibraryCardV2;
  onApplySuggestion: (id: string, suggestion: MetadataSuggestion) => Promise<void>;
}) {
  const [expanded,   setExpanded]   = useState(false);
  const [suggestion, setSuggestion] = useState<MetadataSuggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [applying,   setApplying]   = useState(false);
  const [applied,    setApplied]    = useState(false);

  const pct = completeness(card);

  async function fetchSuggestion() {
    setSuggesting(true);
    try {
      const r = await fetch(`/api/admin/card-library/suggest/${card.id}`);
      const d = await r.json() as { suggestion?: MetadataSuggestion };
      setSuggestion(d.suggestion ?? null);
    } catch { /* non-fatal */ }
    setSuggesting(false);
  }

  async function handleApply() {
    if (!suggestion) return;
    setApplying(true);
    await onApplySuggestion(card.id, suggestion);
    setApplied(true);
    setApplying(false);
  }

  const pctColor = pct === 100 ? GREEN : pct >= 50 ? GOLD : RED;

  return (
    <div style={{ borderBottom: `1px solid ${DIM2}` }}>
      {/* Row header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer" }}
        onClick={() => {
          setExpanded(e => !e);
          if (!expanded && !suggestion && !suggesting) fetchSuggestion();
        }}
      >
        {/* Image thumb */}
        <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 5, overflow: "hidden", background: DIM2 }}>
          <img src={card.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Title + subcategory */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {card.title}
          </div>
          <div style={{ fontSize: "0.65rem", color: DIM, textTransform: "capitalize" }}>
            {card.subcategory.replace(/_/g, " ")}
          </div>
        </div>

        {/* V2 field dots */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {[
            (card.occasion     ?? []).length > 0,
            (card.relationship ?? []).length > 0,
            (card.interests    ?? []).length > 0,
            !!card.season,
            !!card.audience,
            !!card.genderLean,
          ].map((filled, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: filled ? GREEN : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>

        {/* Completeness % */}
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: pctColor, minWidth: 36, textAlign: "right" }}>
          {pct}%
        </div>

        {/* Expand toggle */}
        <div style={{ color: DIM, flexShrink: 0 }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ paddingBottom: 16, paddingLeft: 48 }}>
          {/* Current V2 values */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Occasion",     val: (card.occasion     ?? []).join(", ") || "—" },
              { label: "Relationship", val: (card.relationship ?? []).join(", ") || "—" },
              { label: "Interests",    val: (card.interests    ?? []).join(", ") || "—" },
              { label: "Season",       val: card.season     || "—" },
              { label: "Audience",     val: card.audience   || "—" },
              { label: "Gender Lean",  val: card.genderLean || "—" },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: DIM2, borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: "0.55rem", color: DIM, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: "0.72rem", color: val === "—" ? "rgba(255,255,255,0.2)" : "#fff", fontStyle: val === "—" ? "italic" : "normal" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {suggesting && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: DIM }}>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Generating suggestions…
            </div>
          )}

          {suggestion && !applied && (
            <div style={{ background: "rgba(216,167,37,0.08)", border: `1px solid ${GOLD}30`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: "0.65rem", color: GOLD, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <Sparkles size={11} /> Suggested Metadata
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Occasion",      val: suggestion.occasion.join(", ")     || "—" },
                  { label: "Relationship",  val: suggestion.relationship.join(", ") || "—" },
                  { label: "Interests",     val: suggestion.interests.join(", ")    || "—" },
                  { label: "Season",        val: suggestion.season    || "—" },
                  { label: "Audience",      val: suggestion.audience  || "—" },
                  { label: "Gender Lean",   val: suggestion.genderLean || "—" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontSize: "0.55rem", color: DIM, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: "0.71rem", color: "#fff" }}>{val}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                style={{
                  background: applying ? DIM2 : GOLD, color: applying ? DIM : NAVY,
                  border: "none", borderRadius: 6, padding: "6px 14px",
                  fontSize: "0.72rem", fontWeight: 700, cursor: applying ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                {applying
                  ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Applying…</>
                  : "Apply These Suggestions"}
              </button>
            </div>
          )}

          {applied && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: GREEN }}>
              <CheckCircle2 size={13} /> Metadata applied successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function AdminCardMetadata() {
  const [summary,      setSummary]      = useState<AuditSummary | null>(null);
  const [cards,        setCards]        = useState<LibraryCardV2[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterMissing,setFilterMissing]= useState("all");
  const [applyingAll,  setApplyingAll]  = useState(false);
  const [allProgress,  setAllProgress]  = useState({ done: 0, total: 0 });

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat     !== "all") params.set("category", filterCat);
      if (filterMissing !== "all") params.set("missing",  filterMissing);
      const r = await fetch(`/api/admin/card-library/metadata-audit?${params}`);
      const d = await r.json() as { summary: AuditSummary; cards: LibraryCardV2[] };
      setSummary(d.summary);
      setCards(d.cards);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterCat, filterMissing]);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  async function applyCardSuggestion(id: string, suggestion: MetadataSuggestion) {
    await fetch(`/api/admin/card-library/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occasion:     suggestion.occasion,
        relationship: suggestion.relationship,
        interests:    suggestion.interests,
        season:       suggestion.season,
        audience:     suggestion.audience,
        genderLean:   suggestion.genderLean,
      }),
    });
    setCards(cs => cs.map(c => c.id === id ? {
      ...c,
      occasion:     suggestion.occasion,
      relationship: suggestion.relationship,
      interests:    suggestion.interests,
      season:       suggestion.season,
      audience:     suggestion.audience,
      genderLean:   suggestion.genderLean,
    } : c));
    if (summary) {
      setSummary({
        ...summary,
        missingOccasion:     summary.missingOccasion     - (suggestion.occasion.length     > 0 ? 1 : 0),
        missingRelationship: summary.missingRelationship - (suggestion.relationship.length > 0 ? 1 : 0),
        missingInterests:    summary.missingInterests    - (suggestion.interests.length    > 0 ? 1 : 0),
        missingSeason:       summary.missingSeason       - (suggestion.season    ? 1 : 0),
        missingAudience:     summary.missingAudience     - (suggestion.audience  ? 1 : 0),
        missingGenderLean:   summary.missingGenderLean   - (suggestion.genderLean ? 1 : 0),
      });
    }
  }

  async function handleBackfillAll() {
    if (!confirm(
      `Auto-suggest and apply metadata to all ${cards.length} visible cards?\n\n` +
      "This will fetch AI suggestions for each card and write them to the database. " +
      "Existing V2 metadata will be overwritten."
    )) return;

    setApplyingAll(true);
    setAllProgress({ done: 0, total: cards.length });

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      try {
        const r = await fetch(`/api/admin/card-library/suggest/${card.id}`);
        const d = await r.json() as { suggestion?: MetadataSuggestion };
        if (d.suggestion) await applyCardSuggestion(card.id, d.suggestion);
      } catch { /* continue */ }
      setAllProgress({ done: i + 1, total: cards.length });
    }

    setApplyingAll(false);
    await loadAudit();
  }

  const completePct = summary
    ? Math.round(((summary.total - summary.missingOccasion) / Math.max(1, summary.total)) * 100)
    : 0;

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
          Card Metadata V2
        </h2>
        <p style={{ margin: 0, fontSize: "0.8rem", color: DIM, fontFamily: "'Inter', sans-serif" }}>
          Audit and backfill occasion, relationship, interests, season, audience, and gender_lean fields. Existing card selection is not affected.
        </p>
      </div>

      {/* Summary tiles */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total Cards",     value: summary.total,               color: "#fff" },
            { label: "Missing Occasion",value: summary.missingOccasion,     color: summary.missingOccasion     > 0 ? RED  : GREEN },
            { label: "Missing Relation",value: summary.missingRelationship, color: summary.missingRelationship > 0 ? RED  : GREEN },
            { label: "Missing Interests",value: summary.missingInterests,   color: summary.missingInterests    > 0 ? GOLD : GREEN },
            { label: "Missing Season",  value: summary.missingSeason,       color: summary.missingSeason       > 0 ? GOLD : GREEN },
            { label: "Missing Audience",value: summary.missingAudience,     color: summary.missingAudience     > 0 ? GOLD : GREEN },
            { label: "Missing Gender",  value: summary.missingGenderLean,   color: summary.missingGenderLean   > 0 ? GOLD : GREEN },
            { label: "Occasions Set",   value: summary.total - summary.missingOccasion, color: GREEN },
          ].map(s => (
            <div key={s.label} style={{ background: DIM2, border: `1px solid ${DIM2}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color, fontFamily: "'Inter', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: "0.6rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Overall progress bar */}
      {summary && (
        <div style={{ background: DIM2, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }}>Overall V2 Completeness (occasion field)</span>
            <span style={{ fontSize: "0.78rem", color: DIM }}>{summary.total - summary.missingOccasion} / {summary.total} cards</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${completePct}%`, background: completePct === 100 ? GREEN : completePct > 50 ? GOLD : RED, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Filters + backfill all */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.65rem", color: DIM, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</label>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ background: "#0d2444", border: `1px solid ${DIM2}`, borderRadius: 7, color: "#fff", padding: "7px 10px", fontSize: "0.78rem" }}>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.65rem", color: DIM, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Show cards missing</label>
          <select value={filterMissing} onChange={e => setFilterMissing(e.target.value)}
            style={{ background: "#0d2444", border: `1px solid ${DIM2}`, borderRadius: 7, color: "#fff", padding: "7px 10px", fontSize: "0.78rem" }}>
            <option value="all">All cards</option>
            {V2_FIELDS.map(f => <option key={f.key} value={f.key}>Missing {f.label}</option>)}
          </select>
        </div>
        <button
          onClick={handleBackfillAll}
          disabled={applyingAll || loading || cards.length === 0}
          style={{
            marginTop: "auto",
            background: applyingAll ? DIM2 : "#7c3aed",
            color: applyingAll ? DIM : "#fff",
            border: "none", borderRadius: 7, padding: "8px 16px",
            fontSize: "0.78rem", fontWeight: 700, cursor: applyingAll ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
          {applyingAll
            ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> {allProgress.done}/{allProgress.total} cards…</>
            : <><Sparkles size={13} /> Auto-Backfill All ({cards.length} cards)</>}
        </button>
      </div>

      {/* Card list */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", color: DIM, fontSize: "0.85rem" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Loading cards…
        </div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: DIM }}>
          <CheckCircle2 size={32} color={GREEN} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: "0.9rem" }}>All cards in this filter have complete metadata.</div>
        </div>
      ) : (
        <div style={{ background: DIM2, borderRadius: 12, padding: "4px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 0 8px", borderBottom: `1px solid ${DIM2}`, marginBottom: 2 }}>
            <span style={{ fontSize: "0.62rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, paddingLeft: 48 }}>Card</span>
            <span style={{ fontSize: "0.62rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 80 }}>Occ · Rel · Int · Sea · Aud · Gen</span>
            <span style={{ fontSize: "0.62rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 36, textAlign: "right" }}>%</span>
            <span style={{ width: 20 }} />
          </div>
          {cards.map(card => (
            <CardRow
              key={card.id}
              card={card}
              onApplySuggestion={applyCardSuggestion}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
