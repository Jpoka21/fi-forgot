import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const GREEN = "#16a34a";

interface QueueItem {
  id: string;
  clientName: string;
  eventType: string;
  occasionDate: string;
  mailDate: string;
  cardMessage: string;
  clientCompany: string | null;
  status: string;
  cardFont: string | null;
  cardSignature: string | null;
  contextNote: string | null;
}

interface CardPreview {
  id: string | number;
  name: string;
  category?: string;
  imageUrl?: string;
}

const EVENT_ICON: Record<string, string> = {
  "Birthday": "🎂",
  "Happy Holidays": "🎁",
  "Anniversary": "🏆",
};

const EDIT_ACTIONS = [
  { label: "Make warmer",    action: "warmer",    instruction: "Make this card noticeably warmer and more heartfelt. Keep the same structure but increase the emotional depth." },
  { label: "Make funnier",   action: "funnier",   instruction: "Make this card funnier and more self-aware. Add a touch of humor that still feels genuine." },
  { label: "Make shorter",   action: "shorter",   instruction: "Shorten this card significantly. Keep only the most important and impactful lines." },
  { label: "More emotional", action: "emotional", instruction: "Make this card more emotionally raw and vulnerable. Really go there." },
  { label: "Rewrite",        action: "rewrite",   instruction: "Completely rewrite this card in a fresh way while keeping the same recipient, occasion, and tone." },
] as const;

function fmt(dateStr: string): string {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

export default function BusinessApprovePage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const [item,          setItem]          = useState<QueueItem | null>(null);
  const [message,       setMessage]       = useState("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [result,        setResult]        = useState<"approved" | "sent" | "rejected" | null>(null);
  const [acting,        setActing]        = useState(false);
  const [cardPreview,   setCardPreview]   = useState<CardPreview | null>(null);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [regenLoading,  setRegenLoading]  = useState(false);
  const [excludedIds,   setExcludedIds]   = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/business-approval/${token}`)
      .then(r => r.json())
      .then((d: { item?: QueueItem; error?: string }) => {
        if (d.error) { setError(d.error); }
        else if (d.item) {
          if (d.item.status !== "pending") {
            setResult(d.item.status as "approved" | "sent" | "rejected");
          }
          setItem(d.item);
          setMessage(d.item.cardMessage);
          // Fetch the card design preview — pass contextNote so AI can pick the right design
          const previewParams = new URLSearchParams({ eventType: d.item.eventType });
          if (d.item.contextNote) previewParams.set("contextNote", d.item.contextNote);
          fetch(`/api/business-cards/pick-card?${previewParams.toString()}`)
            .then(r => r.json())
            .then((p: { card?: CardPreview }) => { if (p.card) setCardPreview(p.card); })
            .catch(() => {});
        }
      })
      .catch(() => setError("Failed to load this approval link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function regenCard() {
    if (!item || regenLoading) return;
    const newExcluded = cardPreview ? [...excludedIds, String(cardPreview.id)] : excludedIds;
    setExcludedIds(newExcluded);
    setRegenLoading(true);
    setCardPreview(null);
    try {
      const params = new URLSearchParams({ eventType: item.eventType });
      if (item.contextNote) params.set("contextNote", item.contextNote);
      if (newExcluded.length) params.set("excludeIds", newExcluded.join(","));
      const r = await fetch(`/api/business-cards/pick-card?${params.toString()}`);
      const d = await r.json() as { card?: CardPreview };
      if (d.card) setCardPreview(d.card);
    } catch {}
    setRegenLoading(false);
  }

  async function applyEdit(instruction: string, actionKey: string) {
    if (!item || editingAction) return;
    setEditingAction(actionKey);
    try {
      const r = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: item.clientName,
          holiday: item.eventType,
          tone: "professional",
          currentCardText: message,
          instruction,
        }),
      });
      if (r.ok) {
        const d = await r.json() as { text?: string };
        if (d.text) setMessage(d.text);
      }
    } catch {}
    setEditingAction(null);
  }

  async function act(action: "approve" | "reject") {
    if (!token || acting) return;
    setActing(true);
    try {
      const r = await fetch(`/api/business-approval/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, message: action === "approve" ? message : undefined }),
      });
      const d = await r.json() as { status?: string; error?: string };
      if (d.error) { alert(d.error); return; }
      setResult(d.status as "approved" | "sent" | "rejected");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setActing(false);
    }
  }

  const icon = item ? (EVENT_ICON[item.eventType] ?? "✉️") : "✉️";

  return (
    <div style={{ minHeight: "100svh", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 16px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: "center", position: "relative", width: "100%", maxWidth: 600 }}>
        <button
          onClick={() => navigate("/business/dashboard")}
          style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
            padding: 0, letterSpacing: "0.03em",
          }}
        >
          ← Dashboard
        </button>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "#fff", letterSpacing: "0.12em" }}>
          <span style={{ color: RED }}>F*</span> I FORGOT
        </div>
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          Business Dashboard — Card Review
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 36, maxWidth: 600, width: "100%" }}>

        {loading && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", padding: "40px 0" }}>
            Loading…
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: 8 }}>Link not found</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>{error}</div>
          </div>
        )}

        {!loading && item && result === "rejected" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>❌</div>
            <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Card rejected</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
              The {item.eventType.toLowerCase()} card for <strong style={{ color: "#fff" }}>{item.clientName}</strong> will not be mailed.
            </div>
          </div>
        )}

        {!loading && item && (result === "approved" || result === "sent") && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✅</div>
            <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
              {result === "sent" ? "Card approved & queued for mailing!" : "Card approved!"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem" }}>
              {result === "sent"
                ? `The ${item.eventType.toLowerCase()} card for ${item.clientName} is on its way.`
                : `The ${item.eventType.toLowerCase()} card for ${item.clientName} has been approved. We'll handle the rest.`}
            </div>
            <div style={{ marginTop: 16, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
              Mailing on {fmt(item.mailDate)}
            </div>
          </div>
        )}

        {!loading && item && result === null && (
          <>
            {/* Client + event header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: "1.6rem" }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
                    {item.eventType} card for {item.clientName}
                  </div>
                  {item.clientCompany && (
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>{item.clientCompany}</div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                <div style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Occasion</span>
                  <div style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{fmt(item.occasionDate)}</div>
                </div>
                <div style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mails On</span>
                  <div style={{ color: RED, fontWeight: 700, marginTop: 2 }}>{fmt(item.mailDate)}</div>
                </div>
              </div>
            </div>

            {/* Card design preview */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                  Selected Card Design
                </div>
                {excludedIds.length < 4 && (
                  <button
                    onClick={regenCard}
                    disabled={regenLoading || acting || !!editingAction}
                    style={{
                      background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 20,
                      color: regenLoading ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600,
                      padding: "4px 12px", cursor: regenLoading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 5, transition: "all 0.12s",
                    }}
                  >
                    {regenLoading
                      ? <><span style={{ display: "inline-block", width: 9, height: 9, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Picking…</>
                      : "↻ Try another card"}
                  </button>
                )}
              </div>

              {regenLoading ? (
                <div style={{ height: 160, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
                  Finding a different card…
                </div>
              ) : cardPreview?.imageUrl ? (
                <div
                  onClick={() => setLightboxOpen(true)}
                  style={{ cursor: "zoom-in", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", position: "relative", width: "100%" }}
                >
                  <img
                    src={cardPreview.imageUrl}
                    alt={cardPreview.name}
                    style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "contain", background: "#1a2744" }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "18px 14px 10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.82rem" }}>{cardPreview.name}</div>
                      {cardPreview.category && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", fontFamily: "'Inter', sans-serif" }}>{cardPreview.category}</div>}
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "4px 9px", fontSize: "0.68rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, flexShrink: 0 }}>
                      🔍 View full size
                    </div>
                  </div>
                </div>
              ) : cardPreview ? (
                <div style={{ height: 120, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  {icon}
                </div>
              ) : null}
            </div>

            {/* Lightbox */}
            {lightboxOpen && cardPreview?.imageUrl && (
              <div
                onClick={() => setLightboxOpen(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
              >
                <img
                  src={cardPreview.imageUrl}
                  alt={cardPreview.name}
                  style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
                />
                {/* Close button */}
                <button
                  onClick={e => { e.stopPropagation(); setLightboxOpen(false); }}
                  style={{
                    position: "absolute", top: 20, right: 20,
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff", fontSize: "1.1rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Inter', sans-serif", lineHeight: 1,
                  }}
                >
                  ✕
                </button>
                <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>
                  Click anywhere to close
                </div>
              </div>
            )}

            {/* Message editor */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                Card Message — edit freely before approving
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8, color: "#fff", fontFamily: "Georgia, serif",
                  fontSize: "0.9rem", lineHeight: 1.7, padding: "14px 16px",
                  resize: "vertical", outline: "none",
                }}
              />
            </div>

            {/* AI editing tools */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {EDIT_ACTIONS.map(({ label, action, instruction }) => {
                const busy = editingAction === action;
                return (
                  <button
                    key={action}
                    disabled={!!editingAction || acting}
                    onClick={() => applyEdit(instruction, action)}
                    style={{
                      padding: "6px 14px", borderRadius: 20,
                      border: "1.5px solid rgba(255,255,255,0.18)",
                      background: busy ? "rgba(255,255,255,0.12)" : "transparent",
                      color: busy ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600,
                      cursor: editingAction || acting ? "not-allowed" : "pointer",
                      transition: "all 0.12s",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    {busy && <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
                    {busy ? "Rewriting…" : label}
                  </button>
                );
              })}
            </div>

            {/* Signature preview */}
            {item.cardSignature && (
              <div style={{ marginBottom: 24, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                Signature: {item.cardSignature}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                disabled={acting || !!editingAction || !message.trim()}
                onClick={() => act("approve")}
                style={{
                  flex: 3, padding: "14px 0", borderRadius: 8, border: "none", cursor: acting ? "not-allowed" : "pointer",
                  background: GREEN, color: "#fff", fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, fontSize: "0.9rem", opacity: acting || editingAction ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {acting ? "Processing…" : "✅ Approve & Send"}
              </button>
              <button
                disabled={acting || !!editingAction}
                onClick={() => act("reject")}
                style={{
                  flex: 1, padding: "14px 0", borderRadius: 8,
                  border: `1.5px solid ${RED}`, cursor: acting ? "not-allowed" : "pointer",
                  background: "transparent", color: RED, fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, fontSize: "0.9rem", opacity: acting || editingAction ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                ❌ Reject
              </button>
            </div>
            <p style={{ marginTop: 14, fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
              Approving will queue this card for mailing on {fmt(item.mailDate)}.
            </p>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
      </div>
    </div>
  );
}
