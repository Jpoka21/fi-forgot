import { useEffect, useState } from "react";
import { useParams } from "wouter";

const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const GRAY  = "#888";

interface PreviewData {
  imageUrl:      string;
  cardName:      string;
  messageText:   string;
  recipientName: string;
  eventType:     string;
}

export default function CardPreviewPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData]       = useState<PreviewData | null>(null);
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    fetch(`/api/card-preview/${token}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(d => { setData(d as PreviewData); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [token]);

  return (
    <div style={{
      minHeight: "100dvh",
      background: BEIGE,
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${BLACK}12`,
        background: BEIGE,
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.4rem",
            letterSpacing: "0.06em",
            color: BLACK,
          }}>
            <span style={{ color: RED }}>F*</span> I FORGOT
          </span>
        </a>
        <a
          href="/try"
          style={{
            background: RED,
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          TRY IT FREE
        </a>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        padding: "24px 20px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 80, color: GRAY, fontSize: "0.9rem" }}>
            Loading preview…
          </div>
        )}

        {error && !loading && (
          <div style={{
            textAlign: "center",
            paddingTop: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{ fontSize: "2.5rem" }}>📬</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.08em", color: BLACK }}>
              PREVIEW EXPIRED
            </div>
            <div style={{ fontSize: "0.85rem", color: GRAY, maxWidth: 280 }}>
              Card previews are only available for 7 days. The sender will need to share a new link.
            </div>
            <a
              href="/try"
              style={{
                marginTop: 8,
                background: RED,
                color: "#fff",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              SEND YOUR OWN CARDS
            </a>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Label */}
            <div>
              <div style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                color: RED,
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                {data.eventType} card for {data.recipientName}
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(1.6rem, 6vw, 2rem)",
                letterSpacing: "0.06em",
                lineHeight: 1.1,
                color: BLACK,
              }}>
                HERE'S WHAT YOUR<br />
                <span style={{ color: RED }}>CARD LOOKS LIKE.</span>
              </div>
            </div>

            {/* Card image */}
            <div style={{
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
            }}>
              <img
                src={data.imageUrl}
                alt={data.cardName || "Card design"}
                style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 340, background: BEIGE }}
              />
              {data.cardName && (
                <div style={{
                  padding: "8px 14px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: GRAY,
                  borderTop: `1px solid ${BLACK}08`,
                }}>
                  {data.cardName}
                </div>
              )}
            </div>

            {/* Message */}
            <div style={{
              background: "#fff",
              borderRadius: 14,
              padding: "20px 20px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            }}>
              <div style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: GRAY,
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                Message Inside
              </div>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(1rem, 4.5vw, 1.15rem)",
                lineHeight: 1.7,
                color: BLACK,
                whiteSpace: "pre-wrap",
              }}>
                {data.messageText}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              background: BLACK,
              borderRadius: 14,
              padding: "22px 20px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.25rem",
                letterSpacing: "0.1em",
                color: "#fff",
                marginBottom: 6,
              }}>
                NEVER FORGET AGAIN.
              </div>
              <div style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 16,
                lineHeight: 1.5,
              }}>
                F* I Forgot sends personalized physical cards to the people you care about — automatically.
              </div>
              <a
                href="/try"
                style={{
                  display: "inline-block",
                  background: RED,
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 10,
                  padding: "12px 32px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                TRY IT FREE — 2 MIN
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
