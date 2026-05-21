import { useState, useEffect } from "react";
import { useParams } from "wouter";

const NAVY = "#071A33";
const RED  = "#E23B2E";
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
}

const EVENT_ICON: Record<string, string> = {
  "Birthday": "🎂",
  "Happy Holidays": "🎁",
  "Anniversary": "🏆",
};

function fmt(dateStr: string): string {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return dateStr; }
}

export default function BusinessApprovePage() {
  const { token } = useParams<{ token: string }>();
  const [item,    setItem]    = useState<QueueItem | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<"approved" | "sent" | "rejected" | null>(null);
  const [acting,  setActing]  = useState(false);

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
        }
      })
      .catch(() => setError("Failed to load this approval link."))
      .finally(() => setLoading(false));
  }, [token]);

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
    <div style={{ minHeight: "100svh", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "#fff", letterSpacing: "0.12em" }}>
          <span style={{ color: RED }}>F*</span> I FORGOT
        </div>
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          Business Dashboard — Card Review
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 36, maxWidth: 560, width: "100%" }}>

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
            <div style={{ marginBottom: 28 }}>
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

            {/* Message editor */}
            <div style={{ marginBottom: 28 }}>
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

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                disabled={acting || !message.trim()}
                onClick={() => act("approve")}
                style={{
                  flex: 3, padding: "14px 0", borderRadius: 8, border: "none", cursor: acting ? "not-allowed" : "pointer",
                  background: GREEN, color: "#fff", fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, fontSize: "0.9rem", opacity: acting ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {acting ? "Processing…" : "✅ Approve & Send"}
              </button>
              <button
                disabled={acting}
                onClick={() => act("reject")}
                style={{
                  flex: 1, padding: "14px 0", borderRadius: 8,
                  border: `1.5px solid ${RED}`, cursor: acting ? "not-allowed" : "pointer",
                  background: "transparent", color: RED, fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, fontSize: "0.9rem", opacity: acting ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                ❌ Reject
              </button>
            </div>
            <p style={{ marginTop: 14, fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
              Approving will queue this card for mailing on {fmt(item.mailDate)}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
