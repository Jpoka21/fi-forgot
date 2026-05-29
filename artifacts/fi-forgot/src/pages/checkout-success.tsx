import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import type { Plan } from "@/lib/plan";

const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#ffffff";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const { upgradePlan } = useAuth();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan") as Plan | null;

    if (plan && ["basic", "standard", "premium"].includes(plan)) {
      upgradePlan(plan);
    }

    const timer = setTimeout(() => setLocation("/dashboard"), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 24 }}>
      <div style={{ background: WHITE, borderRadius: 20, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${RED}14`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2rem" }}>
          ✉️
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.1em", color: BLACK, margin: "0 0 8px" }}>
          YOU'RE ALL SET
        </h1>
        <p style={{ color: "#555", fontSize: "1rem", margin: "0 0 28px", lineHeight: 1.6 }}>
          Your subscription is active. The people in your life are officially covered.
        </p>
        <p style={{ color: "#888", fontSize: "0.8rem" }}>
          Taking you to your dashboard…
        </p>
        <button
          onClick={() => setLocation("/dashboard")}
          style={{ marginTop: 20, background: RED, color: WHITE, border: "none", borderRadius: 10, padding: "14px 32px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: "pointer" }}>
          GO TO DASHBOARD
        </button>
      </div>
    </div>
  );
}
