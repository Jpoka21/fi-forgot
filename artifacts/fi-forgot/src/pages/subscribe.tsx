import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { PLANS, type Plan } from "@/lib/plan";

const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#ffffff";
const GRAY  = "#888";

interface StripePlan {
  planKey: Plan;
  priceId: string;
  unitAmount: number;
}

const PLAN_ORDER: Plan[] = ["basic", "standard", "premium"];

export default function SubscribePage() {
  const { user, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const [stripePlans, setStripePlans] = useState<StripePlan[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const DEV_BYPASS = import.meta.env.DEV;

  useEffect(() => {
    if (DEV_BYPASS) {
      setLoading(false);
      return;
    }
    fetch("/api/stripe/plans")
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r; })
      .then(r => r.json())
      .then(json => {
        const rows: StripePlan[] = (json.data ?? [])
          .filter((r: any) => r.metadata?.planKey)
          .map((r: any) => ({
            planKey: r.metadata.planKey as Plan,
            priceId: r.price_id as string,
            unitAmount: r.unit_amount as number,
          }));
        setStripePlans(rows);
      })
      .catch(() => setLoadError("Couldn't load plan details — Stripe may not be connected yet."))
      .finally(() => setLoading(false));
  }, [DEV_BYPASS]);

  async function handleSubscribe(planKey: Plan) {
    const email = user?.email;
    if (!email) {
      setLocation("/");
      return;
    }

    setCheckingOut(planKey);
    setCheckoutError(null);

    // Dev bypass: skip Stripe checkout during testing
    if (DEV_BYPASS) {
      upgradePlan(planKey);
      setLocation("/dashboard");
      return;
    }

    const match = stripePlans.find(p => p.planKey === planKey);
    if (!match) {
      setCheckoutError("This plan isn't available yet. Please try again shortly.");
      setCheckingOut(null);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: user.name, priceId: match.priceId, planKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError(err.message ?? "Something went wrong. Try again.");
      setCheckingOut(null);
    }
  }

  function handleSkip() {
    upgradePlan("basic");
    setLocation("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: BLACK, letterSpacing: "0.12em", margin: 0, cursor: "pointer" }}>
            F*I FORGOT
          </h1>
        </a>
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.1em", color: BLACK, margin: "12px 0 8px" }}>
          CHOOSE YOUR PLAN
        </p>
        <p style={{ color: GRAY, fontSize: "0.9rem", margin: 0 }}>
          Cancel anytime. No commitment.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {PLAN_ORDER.map((key, i) => {
          const plan = PLANS[key];
          const isPopular = key === "standard";
          const isChecking = checkingOut === key;
          const stripeReady = DEV_BYPASS || stripePlans.some(p => p.planKey === key);

          return (
            <div key={key} style={{ background: WHITE, borderRadius: 16, border: isPopular ? `2.5px solid ${RED}` : `1.5px solid ${BLACK}18`, padding: "32px 28px", display: "flex", flexDirection: "column", position: "relative", boxShadow: isPopular ? "0 8px 32px rgba(226,59,46,0.15)" : "0 2px 12px rgba(0,0,0,0.06)" }}>

              {isPopular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.1em", padding: "4px 18px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 6 }}>
                <span style={{ background: `${RED}14`, color: RED, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.1em", padding: "2px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                  {plan.label}
                </span>
              </div>

              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1.1, margin: "10px 0 4px" }}>
                {plan.price}
              </div>

              <p style={{ fontSize: "0.8rem", color: GRAY, margin: "0 0 20px", fontStyle: "italic" }}>
                {plan.tagline}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
                {plan.perks.map(perk => (
                  <li key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.85rem", color: BLACK }}>
                    <span style={{ color: RED, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>

              {loading ? (
                <div style={{ height: 48, borderRadius: 10, background: `${BLACK}10`, animation: "pulse 1.5s ease-in-out infinite" }} />
              ) : (
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={isChecking || checkingOut !== null}
                  style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: isPopular ? RED : BLACK, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: isChecking || checkingOut !== null ? "not-allowed" : "pointer", opacity: checkingOut !== null && !isChecking ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {isChecking ? "REDIRECTING..." : stripeReady ? `GET ${plan.label.toUpperCase()}` : "COMING SOON"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Errors */}
      {(loadError || checkoutError) && (
        <div style={{ maxWidth: 480, margin: "-24px auto 32px", padding: "0 20px", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: RED, background: `${RED}12`, padding: "12px 16px", borderRadius: 8 }}>
            {loadError ?? checkoutError}
          </p>
        </div>
      )}

      {/* Skip link */}
      <div style={{ textAlign: "center", paddingBottom: 48 }}>
        <button onClick={handleSkip} style={{ background: "none", border: "none", color: GRAY, fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
          Skip for now — explore the dashboard first
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
