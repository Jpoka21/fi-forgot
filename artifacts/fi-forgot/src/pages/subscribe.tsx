import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { PLANS, type Plan } from "@/lib/plan";
import { PB } from "@/lib/personal-brand";
import { SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import { Check, Heart, Loader2 } from "lucide-react";

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

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
          .filter((r: { metadata?: { planKey?: string }; price_id?: string; unit_amount?: number }) => r.metadata?.planKey)
          .map((r: { metadata: { planKey: string }; price_id: string; unit_amount: number }) => ({
            planKey: r.metadata.planKey as Plan,
            priceId: r.price_id,
            unitAmount: r.unit_amount,
          }));
        setStripePlans(rows);
      })
      .catch(() => setLoadError("We couldn't load plan details right now. Please try again in a moment."))
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
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setCheckingOut(null);
    }
  }

  function handleSkip() {
    upgradePlan("basic");
    setLocation("/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: PB.cream,
      fontFamily: sans,
      color: PB.ink,
    }}>
      <header style={{
        textAlign: "center",
        padding: "48px 24px 28px",
        maxWidth: 560,
        margin: "0 auto",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 700, color: PB.ink, letterSpacing: "0.02em" }}>
            F.I. FORGOT
          </div>
          <div style={{ fontFamily: sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", color: PB.mid, marginTop: 4 }}>
            RELATIONSHIP CONCIERGE
          </div>
        </Link>
        <h1 style={{
          fontFamily: serif,
          fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
          fontWeight: 600,
          color: PB.ink,
          margin: "28px 0 10px",
          lineHeight: 1.25,
        }}>
          Choose how much we help
        </h1>
        <p style={{ fontSize: "0.95rem", color: PB.mid, margin: 0, lineHeight: 1.6 }}>
          Every plan includes handwritten cards, gentle reminders, and your approval before anything is sent.
          Cancel anytime.
        </p>
      </header>

      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 20px 48px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
      }}>
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const isPopular = key === "standard";
          const isChecking = checkingOut === key;
          const stripeReady = DEV_BYPASS || stripePlans.some(p => p.planKey === key);

          return (
            <SoftCard
              key={key}
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: isPopular ? `1.5px solid ${PB.red}` : `1px solid ${PB.border}`,
                boxShadow: isPopular ? "0 4px 20px rgba(226,59,46,0.08)" : undefined,
              }}
            >
              {isPopular && (
                <div style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: PB.red,
                  color: PB.white,
                  fontFamily: sans,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "5px 14px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                }}>
                  Most chosen
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <span style={{
                  background: `${PB.red}10`,
                  color: PB.red,
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  padding: "4px 10px",
                  borderRadius: 20,
                }}>
                  {plan.label}
                </span>
              </div>

              <div style={{
                fontFamily: serif,
                fontSize: "2rem",
                fontWeight: 600,
                color: PB.ink,
                lineHeight: 1.1,
                margin: "8px 0 6px",
              }}>
                {plan.price}
              </div>

              <p style={{ fontSize: "0.88rem", color: PB.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
                {plan.tagline}
              </p>

              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexGrow: 1,
              }}>
                {plan.perks.map(perk => (
                  <li key={perk} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.86rem", color: PB.ink }}>
                    <Check size={16} style={{ color: PB.sage, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                    {perk}
                  </li>
                ))}
              </ul>

              {loading ? (
                <div style={{
                  height: 48,
                  borderRadius: 24,
                  background: `${PB.ink}08`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Loader2 size={20} color={PB.mid} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <PrimaryBtn
                  onClick={() => handleSubscribe(key)}
                  disabled={isChecking || checkingOut !== null || !stripeReady}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    opacity: checkingOut !== null && !isChecking ? 0.6 : 1,
                  }}
                >
                  {isChecking ? "Taking you to checkout…" : stripeReady ? `Choose ${plan.label}` : "Coming soon"}
                </PrimaryBtn>
              )}
            </SoftCard>
          );
        })}
      </div>

      {(loadError || checkoutError) && (
        <div style={{ maxWidth: 480, margin: "-16px auto 24px", padding: "0 20px", textAlign: "center" }}>
          <p style={{
            fontSize: "0.88rem",
            color: PB.red,
            background: `${PB.red}08`,
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px solid ${PB.red}20`,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {loadError ?? checkoutError}
          </p>
        </div>
      )}

      <div style={{ textAlign: "center", paddingBottom: 48, maxWidth: 400, margin: "0 auto" }}>
        <SecondaryBtn onClick={handleSkip} style={{ fontSize: "0.86rem" }}>
          Explore first — decide later
        </SecondaryBtn>
        <p style={{ fontSize: "0.8rem", color: PB.mid, marginTop: 14, lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Heart size={14} color={PB.sage} />
          You can change your plan anytime from Account.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
