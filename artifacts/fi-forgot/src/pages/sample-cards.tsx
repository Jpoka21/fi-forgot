import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";

const RED    = "#E23B2E";
const NAVY   = "#071A33";
const DARK   = "#0a1f3d";
const DARKER = "#0c2244";
const BORDER = "rgba(255,255,255,0.09)";

const CATEGORIES = [
  "All",
  "Birthday",
  "Holiday",
  "Client Appreciation",
  "Referral Thank You",
  "Work Anniversary",
  "Congratulations",
  "Sympathy",
  "General Follow Up",
];

const TONES = ["Professional", "Warm", "Funny", "Luxury", "Short and Sweet"];

type SampleCard = {
  imageUrl: string;
  category: string;
  bestFor: string;
  occasions: string[];
  fallbackMessage: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function Eyebrow() {
  return (
    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.7rem", letterSpacing: "0.24em", color: RED, marginBottom: 10 }}>
      F* I FORGOT · FOR BUSINESS
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: "8px 18px", borderRadius: 50,
      border: active ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.15)",
      background: active ? RED : "rgba(255,255,255,0.04)",
      color: active ? "#fff" : "rgba(255,255,255,0.65)",
      fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.14em",
      cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease",
    }}>
      {label}
    </button>
  );
}

// ── Card tile ─────────────────────────────────────────────────────────────────

function CardTile({ card, onPreview }: { card: SampleCard; onPreview: (card: SampleCard) => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{
      background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.35)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
    >
      {/* Image */}
      <div style={{ background: "#e8e0d8", aspectRatio: "4/3", overflow: "hidden", position: "relative" }}>
        {!imgError ? (
          <img
            src={card.imageUrl}
            alt={card.category}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8e0d8, #d4c8bc)" }}>
            <span style={{ fontSize: "2.5rem", opacity: 0.4 }}>✉</span>
          </div>
        )}
        {/* Category badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(7,26,51,0.82)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20,
          padding: "4px 10px",
          fontFamily: "'Bebas Neue', cursive", fontSize: "0.58rem", letterSpacing: "0.14em", color: "#fff",
        }}>
          {card.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", fontFamily: "'Bebas Neue', cursive" }}>
          {card.bestFor}
        </div>
        <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0, fontStyle: "italic",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          "{card.fallbackMessage}"
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 6 }}>
          <button onClick={() => onPreview(card)} style={{
            width: "100%", padding: "9px 0", borderRadius: 5,
            background: RED, border: "none", color: "#fff",
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.1em",
            cursor: "pointer", transition: "opacity 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            PREVIEW CARD
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ card, onClose }: { card: SampleCard; onClose: () => void }) {
  const [tone, setTone] = useState("Warm");
  const [message, setMessage] = useState(card.fallbackMessage);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const generateMessage = useCallback(async (selectedTone: string) => {
    setLoading(true);
    try {
      const r = await fetch("/api/sample-card-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardImageUrl: card.imageUrl,
          category: card.category,
          tone: selectedTone,
          businessType: "Business",
          recipientType: "Client",
          relationshipContext: "",
        }),
      });
      const data = await r.json() as { message?: string };
      setMessage(data.message || card.fallbackMessage);
    } catch {
      setMessage(card.fallbackMessage);
    } finally {
      setLoading(false);
    }
  }, [card]);

  // Auto-generate when tone changes (not on first open)
  const handleToneChange = (newTone: string) => {
    setTone(newTone);
    void generateMessage(newTone);
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={handleBackdrop} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", overflowY: "auto",
    }}>
      <div style={{
        background: DARK, border: `1px solid ${BORDER}`, borderRadius: 16,
        maxWidth: 860, width: "100%", display: "flex", flexWrap: "wrap",
        overflow: "hidden", position: "relative", maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
          width: 34, height: 34, color: "#fff", fontSize: "1rem", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Left: image */}
        <div style={{ flex: "1 1 300px", minHeight: 280, background: "#e8e0d8" }}>
          {!imgError ? (
            <img
              src={card.imageUrl}
              alt={card.category}
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 280 }}
            />
          ) : (
            <div style={{ width: "100%", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8e0d8, #d4c8bc)" }}>
              <span style={{ fontSize: "4rem", opacity: 0.3 }}>✉</span>
            </div>
          )}
        </div>

        {/* Right: details */}
        <div style={{ flex: "1 1 300px", padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Category + best for */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.6rem", letterSpacing: "0.2em", color: RED, marginBottom: 6 }}>
              {card.category}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.04em", color: "#fff", lineHeight: 1.2 }}>
              {card.bestFor}
            </div>
          </div>

          {/* Sample message */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
              SAMPLE HANDWRITTEN MESSAGE
            </div>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 60 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2.5px solid ${RED}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Writing your message…</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <p style={{ fontFamily: "'Georgia', serif", fontSize: "0.93rem", color: "#ddd", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
                "{message}"
              </p>
            )}
          </div>

          {/* Tone selector */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
              ADJUST TONE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {TONES.map((t) => (
                <button key={t} onClick={() => handleToneChange(t)} style={{
                  padding: "6px 14px", borderRadius: 50,
                  border: tone === t ? `2px solid ${RED}` : "1px solid rgba(255,255,255,0.15)",
                  background: tone === t ? "rgba(226,59,46,0.15)" : "rgba(255,255,255,0.04)",
                  color: tone === t ? "#fff" : "rgba(255,255,255,0.55)",
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.68rem", letterSpacing: "0.1em",
                  cursor: "pointer", transition: "all 0.12s ease",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Regenerate */}
          <button onClick={() => generateMessage(tone)} disabled={loading} style={{
            padding: "11px", borderRadius: 5, border: `1px solid rgba(255,255,255,0.18)`,
            background: "rgba(255,255,255,0.06)", color: loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.1em",
            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.12s ease",
          }}>
            ↺ REGENERATE SAMPLE MESSAGE
          </button>

        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SampleCardsPage() {
  const [cards, setCards]             = useState<SampleCard[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState("All");
  const [selectedCard, setSelected]   = useState<SampleCard | null>(null);

  useEffect(() => {
    fetch("/api/sample-cards")
      .then((r) => r.json())
      .then((data: { cards?: SampleCard[] }) => {
        setCards(data.cards ?? []);
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? cards
    : cards.filter((c) => c.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: NAVY, color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ background: DARK, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px", height: 96, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: "#fff", letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 6 }}>BUSINESS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/business-demo" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>HOW IT WORKS</Link>
          <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>SIGN IN</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(180deg, ${DARK} 0%, ${NAVY} 100%)`, borderBottom: `1px solid ${BORDER}`, padding: "64px 24px 56px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow />
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.2rem, 6vw, 3.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 16, letterSpacing: "0.02em" }}>
            See the Cards Your<br />
            <span style={{ color: RED }}>Clients Could Receive</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
            Browse real card styles, sample messages, and the moments F* I Forgot can help you remember automatically.
          </p>
          <Link href="/business-demo" style={{
            display: "inline-block", textDecoration: "none",
            background: RED, color: "#fff",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
            padding: "14px 32px", borderRadius: 4,
          }}>
            SEE HOW IT WORKS — FOR FREE →
          </Link>
        </div>
      </div>

      {/* ── Category filters ── */}
      <div style={{ position: "sticky", top: 96, zIndex: 40, background: NAVY, borderBottom: `1px solid ${BORDER}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 10, overflowX: "auto", padding: "14px 0", scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setCategory(cat)} />
          ))}
        </div>
      </div>

      {/* ── Card gallery ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${RED}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>Loading cards from our library…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.3 }}>✉</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No cards found in this category yet.</p>
            <button onClick={() => setCategory("All")} style={{ marginTop: 16, background: "transparent", border: `1px solid ${RED}`, color: RED, fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.1em", padding: "8px 20px", borderRadius: 4, cursor: "pointer" }}>
              VIEW ALL CARDS
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", marginBottom: 28, letterSpacing: "0.06em", fontFamily: "'Bebas Neue', cursive" }}>
              {filtered.length} CARD{filtered.length !== 1 ? "S" : ""} {activeCategory !== "All" ? `· ${activeCategory.toUpperCase()}` : ""}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {filtered.map((card) => (
                <CardTile key={card.imageUrl} card={card} onPreview={setSelected} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── How it works ── */}
      <div style={{ background: DARKER, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.65rem", letterSpacing: "0.24em", color: RED, marginBottom: 10 }}>THE PROCESS</div>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", lineHeight: 1.1, margin: 0 }}>
              How F* I Forgot Chooses the Right Card
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { num: "01", title: "We remember the occasion", body: "You set the rules once. Birthdays, anniversaries, holidays — we track every client moment automatically." },
              { num: "02", title: "We choose a card that fits", body: "Our system matches the moment, relationship type, and your business tone to the right card style." },
              { num: "03", title: "We write and mail it", body: "Real handwritten-style cards are mailed automatically — or sent for your approval before they go out." },
            ].map(({ num, title, body }) => (
              <div key={num} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: RED, opacity: 0.5, lineHeight: 1, marginBottom: 12 }}>{num}</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: "#fff", letterSpacing: "0.04em", marginBottom: 10 }}>{title}</div>
                <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5vw, 3rem)", color: "#fff", lineHeight: 1.05, marginBottom: 16 }}>
            Ready to stop missing<br />
            <span style={{ color: RED }}>important client moments?</span>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 32 }}>
            F* I Forgot handles the cards. You focus on the relationships.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/business/signup" style={{
              display: "inline-block", textDecoration: "none",
              background: RED, color: "#fff",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
              padding: "15px 30px", borderRadius: 4,
            }}>
              START REMEMBERING CLIENTS — SIGN UP NOW →
            </Link>
            <Link href="/business-demo" style={{
              display: "inline-block", textDecoration: "none",
              background: "transparent", color: "rgba(255,255,255,0.7)",
              border: "2px solid rgba(255,255,255,0.2)",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
              padding: "15px 30px", borderRadius: 4,
            }}>
              SEE HOW IT WORKS
            </Link>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {selectedCard && <PreviewModal card={selectedCard} onClose={() => setSelected(null)} />}
    </div>
  );
}
