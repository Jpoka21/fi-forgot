import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { B } from "@/components/brand";

interface CardInfo {
  bgColor: string;
  titleColor: string;
  accentColor: string;
  borderColor: string;
  title: string;
  seriesLabel: string;
  whyChosen: string;
}

interface DemoPreview {
  recipientName: string;
  relationship: string;
  occasion: string;
  personality: string;
  card: CardInfo;
  message: string;
  cardImageUrl: string | null;
  cardImageUrls: string[];
  checkinHtml: string;
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.65rem",
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "2px",
  fontWeight: "bold",
  fontFamily: "'Inter', Arial, sans-serif",
  paddingBottom: 14,
  marginBottom: 14,
  borderBottom: "2px solid #f0e8d8",
  display: "block",
};

const cardBox: React.CSSProperties = {
  background: "#fff",
  borderRadius: 10,
  border: "1px solid #e0d4c0",
  marginBottom: 14,
  overflow: "hidden",
};

const cardPad: React.CSSProperties = {
  padding: "20px 22px",
};

export default function DemoPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DemoPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    fetch(`/api/demo-preview/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        const preview = d as DemoPreview;
        setData(preview);
        setSelectedImage(preview.cardImageUrl);
        setMessageText(preview.message);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  async function refineMessage(action?: string, instruction?: string) {
    if (!data) return;
    setRefining(true);
    setRefineError("");
    try {
      const r = await fetch("/api/demo-preview/refine-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          action,
          instruction,
          recipientName: data.recipientName,
          relationship: data.relationship,
          occasion: data.occasion,
          personality: data.personality,
        }),
      });
      const json = await r.json() as { message?: string; error?: string };
      if (!r.ok) throw new Error(json.error ?? "ai_error");
      if (json.message) setMessageText(json.message);
      setCustomInstruction("");
    } catch {
      setRefineError("Couldn't refine right now — try again in a moment.");
    } finally {
      setRefining(false);
    }
  }

  if (loading) return (
    <div style={{ background: B.black, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem" }}>Loading your card preview…</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ background: B.black, minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>📭</div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
        This preview has expired or doesn't exist. Card previews are available for 7 days.
      </p>
      <a href="/try" style={{ color: B.red, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.12em", textDecoration: "none" }}>
        BUILD A NEW PREVIEW →
      </a>
    </div>
  );

  const { card: cardData, checkinHtml, recipientName, relationship, occasion, personality } = data;
  const occasionLabel = occasion.replace("Upcoming ", "").toLowerCase();
  const allImages = data.cardImageUrls ?? (selectedImage ? [selectedImage] : []);

  return (
    <div style={{ background: "#F2E6D3", minHeight: "100svh" }}>

      {/* Nav */}
      <div style={{ background: B.black, padding: "18px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.1em" }}>
            <span style={{ color: B.red }}>F*</span> I FORGOT
          </span>
          <a href="/" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>← back to home</a>
        </div>
      </div>

      {/* Sample banner */}
      <div style={{ background: B.red, padding: "7px 24px", textAlign: "center" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: "bold", color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
          SAMPLE CARD — Nothing is printed or mailed
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* Intro */}
        <div style={{ ...cardBox, ...cardPad, marginBottom: 14 }}>
          <p style={{ margin: "0 0 14px", fontSize: "0.95rem", color: "#444", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
            Based on what you told us, we built a sample {occasionLabel} card for{" "}
            <strong style={{ color: "#111" }}>{recipientName}</strong>, your {relationship.toLowerCase()}. Here's exactly what we made — and how we made it.
          </p>
          <div style={{ background: "#f8f3eb", borderLeft: "3px solid #c4966a", borderRadius: "0 6px 6px 0", padding: "12px 16px" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#555", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
              <strong style={{ color: "#111" }}>Quick note:</strong> Those 5 questions were just to get the demo started. When you sign up, we collect a lot more — mailing address, key dates, gift history, and deeper preferences — so every card is even more dialed in.
            </p>
          </div>
        </div>

        {/* The Card */}
        <div style={cardBox}>
          <div style={{ padding: "16px 22px 0" }}>
            <span style={sectionLabel}>① The Card We Chose</span>
          </div>

          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Card design"
              style={{ display: "block", width: "100%", lineHeight: 0 }}
            />
          ) : (
            <div style={{ background: cardData.bgColor, padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", color: cardData.accentColor }}>✉</div>
            </div>
          )}

          <div style={{ background: cardData.bgColor, padding: "16px 22px" }}>
            <div style={{ fontSize: "0.6rem", color: cardData.accentColor, textTransform: "uppercase", letterSpacing: "2px", fontWeight: "bold", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
              {cardData.seriesLabel}
            </div>
            <div style={{ fontSize: "1rem", color: cardData.titleColor, fontWeight: "bold", lineHeight: 1.25, fontFamily: "Georgia, serif" }}>
              {cardData.title}
            </div>
          </div>

          {/* Change card button */}
          {allImages.length > 1 && (
            <div style={{ padding: "12px 22px", borderTop: "1px solid #f0e8d8" }}>
              <button
                onClick={() => setShowCardPicker(p => !p)}
                style={{
                  background: "none",
                  border: "1px solid #c4966a",
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: "0.72rem",
                  fontFamily: "'Inter', sans-serif",
                  color: "#7a5c3a",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                {showCardPicker ? "Hide options" : `Browse ${allImages.length - 1} other card${allImages.length > 2 ? "s" : ""} →`}
              </button>
            </div>
          )}

          {/* Card picker grid */}
          {showCardPicker && (
            <div style={{ padding: "0 22px 18px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "0.72rem", color: "#888", fontFamily: "'Inter', sans-serif" }}>
                Tap a card to swap it in:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(url); setShowCardPicker(false); }}
                    style={{
                      padding: 0,
                      border: url === selectedImage ? `3px solid ${B.red}` : "3px solid transparent",
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "none",
                      position: "relative",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Card option ${i + 1}`}
                      style={{ display: "block", width: "100%", aspectRatio: "3/4", objectFit: "cover" }}
                    />
                    {url === selectedImage && (
                      <div style={{
                        position: "absolute", top: 4, right: 4,
                        background: B.red, color: "#fff", borderRadius: "50%",
                        width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", fontWeight: "bold",
                      }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* The Message */}
        <div style={{ ...cardBox, ...cardPad }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "2px solid #f0e8d8" }}>
            <span style={{ ...sectionLabel, paddingBottom: 0, marginBottom: 0, borderBottom: "none" }}>What we'll write inside the card</span>
            <button
              onClick={() => setEditingMessage(e => !e)}
              style={{
                background: editingMessage ? B.black : "none",
                border: `1px solid ${editingMessage ? B.black : "#c4966a"}`,
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: "0.68rem",
                fontFamily: "'Inter', sans-serif",
                color: editingMessage ? "#fff" : "#7a5c3a",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {editingMessage ? "Done" : "Edit message"}
            </button>
          </div>

          <div style={{ background: "#fffdf8", border: "1px solid #e0d4c0", borderLeft: "4px solid #c4966a", borderRadius: "0 8px 8px 0", padding: "18px 22px" }}>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Inter', sans-serif", marginBottom: 10, fontWeight: "bold" }}>
              Handwritten inside the card
            </div>
            {editingMessage ? (
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                disabled={refining}
                style={{
                  width: "100%",
                  minHeight: 160,
                  fontSize: "0.95rem",
                  color: "#1a1a1a",
                  lineHeight: 2,
                  fontFamily: "Georgia, serif",
                  border: "1px solid #c4966a",
                  borderRadius: 6,
                  padding: "10px 12px",
                  background: refining ? "#f8f3eb" : "#fff",
                  resize: "vertical",
                  boxSizing: "border-box",
                  opacity: refining ? 0.6 : 1,
                }}
              />
            ) : (
              <div style={{ fontSize: "0.95rem", color: "#1a1a1a", lineHeight: 2, whiteSpace: "pre-line", fontFamily: "Georgia, serif" }}>
                {messageText}
              </div>
            )}
          </div>

          {/* AI editing tools — shown when editing */}
          {editingMessage && (
            <div style={{ marginTop: 14, background: "#f8f3eb", borderRadius: 8, border: "1px solid #e8dcc8", padding: "14px 16px" }}>
              <div style={{ fontSize: "0.62rem", color: "#888", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "bold", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>
                ✦ AI editing tools
              </div>

              {/* Quick action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {([
                  { action: "funnier",  label: "😄 Make it funnier" },
                  { action: "sweeter",  label: "🥹 Make it sweeter" },
                  { action: "shorter",  label: "✂️ Make it shorter" },
                  { action: "formal",   label: "💼 More professional" },
                  { action: "personal", label: "💬 More personal" },
                ] as { action: string; label: string }[]).map(({ action, label }) => (
                  <button
                    key={action}
                    onClick={() => refineMessage(action)}
                    disabled={refining}
                    style={{
                      background: "#fff",
                      border: "1px solid #d4b896",
                      borderRadius: 20,
                      padding: "6px 12px",
                      fontSize: "0.72rem",
                      fontFamily: "'Inter', sans-serif",
                      color: "#5a3e28",
                      fontWeight: 500,
                      cursor: refining ? "not-allowed" : "pointer",
                      opacity: refining ? 0.5 : 1,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom instruction box */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={e => setCustomInstruction(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && customInstruction.trim()) refineMessage(undefined, customInstruction.trim()); }}
                  placeholder="Or type your own... e.g. mention fishing, add a joke about his cooking"
                  disabled={refining}
                  style={{
                    flex: 1,
                    fontSize: "0.78rem",
                    fontFamily: "'Inter', sans-serif",
                    padding: "8px 12px",
                    border: "1px solid #d4b896",
                    borderRadius: 6,
                    background: "#fff",
                    color: "#333",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={() => { if (customInstruction.trim()) refineMessage(undefined, customInstruction.trim()); }}
                  disabled={refining || !customInstruction.trim()}
                  style={{
                    background: B.red,
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 14px",
                    fontSize: "0.72rem",
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "0.08em",
                    color: "#fff",
                    cursor: refining || !customInstruction.trim() ? "not-allowed" : "pointer",
                    opacity: refining || !customInstruction.trim() ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {refining ? "Working…" : "Apply"}
                </button>
              </div>

              {refineError && (
                <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: B.red, fontFamily: "'Inter', sans-serif" }}>
                  {refineError}
                </p>
              )}
            </div>
          )}

          <p style={{ margin: "10px 0 0", fontSize: "0.7rem", color: "#b0a090", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
            The real card is printed on thick card stock and mailed in a hand-addressed envelope.
          </p>
        </div>

        {/* Why We Chose This */}
        <div style={{ ...cardBox, ...cardPad }}>
          <span style={sectionLabel}>② Why We Chose This</span>
          <div style={{ background: "#f8f3eb", borderRadius: 8, border: "1px solid #e8dcc8", padding: "16px 18px" }}>
            <table style={{ marginBottom: 10, borderCollapse: "collapse" }}>
              <tbody>
                {([["Recipient", `${recipientName} — ${relationship}`], ["Occasion", occasion], ["Personality", personality]] as [string, string][]).map(([l, v]) => (
                  <tr key={l}>
                    <td style={{ fontSize: "0.72rem", color: "#888", paddingRight: 14, paddingBottom: 4, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", verticalAlign: "top" }}>{l}</td>
                    <td style={{ fontSize: "0.78rem", color: "#111", fontWeight: 600, paddingBottom: 4, fontFamily: "'Inter', sans-serif" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#555", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", borderTop: "1px solid #e8dcc8", paddingTop: 10 }}>
              <strong style={{ color: "#111" }}>Our reasoning:</strong> {cardData.whyChosen}
            </p>
          </div>
        </div>

        {/* Pre-occasion check-in */}
        <div style={{ ...cardBox, ...cardPad }}>
          <span style={sectionLabel}>③ We Reach Out Before the Date</span>
          <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#555", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
            Two weeks before each occasion, you'll get a short email with 2 targeted questions — so the card always feels current, not like a copy-paste from last year.
          </p>
          <div style={{ background: "#f8f8f6", borderRadius: 8, border: "2px dashed #ddd", padding: "14px 18px" }}>
            <div style={{ fontSize: "0.62rem", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10, fontWeight: "bold", fontFamily: "'Inter', sans-serif" }}>
              ✉ What you'd receive 2 weeks before {recipientName}'s {occasionLabel}
            </div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "14px 16px", border: "1px solid #e8e8e8" }}>
              <div dangerouslySetInnerHTML={{ __html: checkinHtml }} />
            </div>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "#b0a090", fontFamily: "'Inter', sans-serif" }}>
            Those 2 answers are all we need. We handle everything else.
          </p>
        </div>

        {/* CTA */}
        <div style={{ background: B.black, borderRadius: 10, padding: "28px 22px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: "#fff", letterSpacing: "0.05em" }}>
            READY TO MAKE IT REAL?
          </p>
          <p style={{ margin: "0 0 22px", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            This is a sample. When you sign up, we track the dates, do the check-in, pick the real card, write the real message, and mail it.
          </p>
          <a href="/signup" style={{
            display: "inline-block",
            background: B.red,
            color: "#fff",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.1rem",
            letterSpacing: "0.12em",
            padding: "14px 36px",
            borderRadius: 6,
            textDecoration: "none",
          }}>
            START THE REAL THING →
          </a>
          <p style={{ margin: "14px 0 0", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
            Nothing in this demo is printed, purchased, or mailed to anyone.
          </p>
        </div>

      </div>
    </div>
  );
}
