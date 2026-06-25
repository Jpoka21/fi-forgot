import type { CSSProperties, ReactNode } from "react";
import { PB, avatarPalette, personInitials } from "@/lib/personal-brand";

export function PersonAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const palette = avatarPalette(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: palette.bg, color: palette.fg,
      flexShrink: 0, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.38, fontWeight: 800,
      letterSpacing: "0.03em",
    }}>
      {personInitials(name)}
    </div>
  );
}

export function SectionTitle({
  title,
  sub,
  right,
  style,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, ...style }}>
      <div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: PB.ink, margin: 0 }}>
          {title}
        </h2>
        {sub && (
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: PB.mid, margin: "4px 0 0", lineHeight: 1.4 }}>
            {sub}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

export function SoftCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: PB.white, borderRadius: 14, border: `1px solid ${PB.border}`,
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)", ...style,
    }}>
      {children}
    </div>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  variant = "fill",
  accent = PB.red,
  style,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "fill" | "outline";
  accent?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const fill = variant === "fill";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 16px", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer",
        border: fill ? "none" : `1.5px solid ${accent}`,
        background: fill ? accent : PB.white,
        color: fill ? PB.white : accent,
        fontWeight: 700, fontSize: "0.8rem", opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
