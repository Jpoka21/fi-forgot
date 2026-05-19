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
  checkinHtml: string;
}

const label: React.CSSProperties = {
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

const card: React.CSSProperties = {
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

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    fetch(`/api/demo-preview/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setData(d as DemoPreview); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

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

  const { card: cardData, message, cardImageUrl, checkinHtml, recipientName, relationship, occasion, personality } = data;
  const occasionLabel = occasion.replace("Upcoming ", "").toLowerCase();

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
        <div style={{ ...card, ...cardPad, marginBottom: 14 }}>
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
        <div style={card}>
          <div style={{ padding: "16px 22px 0" }}>
            <span style={label}>① The Card We Chose</span>
          </div>
          {cardImageUrl ? (
            <img
              src={cardImageUrl}
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
        </div>

        {/* The Message */}
        <div style={{ ...card, ...cardPad }}>
          <span style={label}>What we'll write inside the card</span>
          <div style={{ background: "#fffdf8", border: "1px solid #e0d4c0", borderLeft: "4px solid #c4966a", borderRadius: "0 8px 8px 0", padding: "18px 22px" }}>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Inter', sans-serif", marginBottom: 10, fontWeight: "bold" }}>
              Handwritten inside the card
            </div>
            <div style={{ fontSize: "0.95rem", color: "#1a1a1a", lineHeight: 2, whiteSpace: "pre-line", fontFamily: "Georgia, serif" }}>
              {message}
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "0.7rem", color: "#b0a090", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
            The real card is printed on thick card stock and mailed in a hand-addressed envelope.
          </p>
        </div>

        {/* Why We Chose This */}
        <div style={{ ...card, ...cardPad }}>
          <span style={label}>② Why We Chose This</span>
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
        <div style={{ ...card, ...cardPad }}>
          <span style={label}>③ We Reach Out Before the Date</span>
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
