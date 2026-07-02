import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { PB, avatarPalette, personInitials } from "@/lib/personal-brand";

const sans = "'Plus Jakarta Sans', sans-serif";
const serif = "'Lora', Georgia, serif";

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

export function SectionHeader({
  title,
  sub,
  right,
  icon,
  style,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  icon?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      gap: 12, marginBottom: 14, ...style,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: icon ? 10 : 0, flex: 1, minWidth: 0 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `${PB.sage}10`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: PB.sage,
          }}>
            {icon}
          </div>
        )}
        <div>
          <h2 style={{
            fontFamily: serif, fontSize: "1.2rem", fontWeight: 600,
            color: PB.ink, margin: 0, lineHeight: 1.3,
          }}>
            {title}
          </h2>
          {sub && (
            <p style={{
              fontFamily: sans, fontSize: "0.88rem", color: PB.mid,
              margin: "6px 0 0", lineHeight: 1.5,
            }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

export function AppSection({
  title,
  sub,
  right,
  icon,
  children,
  card = false,
  style,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  card?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section style={{ marginBottom: 32, ...style }}>
      <SectionHeader title={title} sub={sub} right={right} icon={icon} />
      {card
        ? <SoftCard style={{ padding: "18px 20px" }}>{children}</SoftCard>
        : children}
    </section>
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

export function TextLink({
  children,
  onClick,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        fontFamily: sans,
        fontSize: "0.82rem", fontWeight: 600, color: PB.sage,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  variant = "fill",
  accent = PB.red,
  style,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "fill" | "outline";
  accent?: string;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const fill = variant === "fill";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 20px",
        borderRadius: 24,
        cursor: disabled ? "not-allowed" : "pointer",
        border: fill ? "none" : `1.5px solid ${accent}`,
        background: fill ? accent : PB.white,
        color: fill ? PB.white : accent,
        fontWeight: 600,
        fontSize: "0.9rem",
        fontFamily: sans,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Alias for playbook naming. */
export const PrimaryButton = PrimaryBtn;

export function SecondaryBtn({
  children,
  onClick,
  href,
  accent = PB.mid,
  style,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  accent?: string;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const btnStyle: CSSProperties = {
    padding: "11px 20px",
    borderRadius: 24,
    border: `1px solid ${PB.border}`,
    background: PB.white,
    color: accent,
    fontWeight: 600,
    fontSize: "0.86rem",
    fontFamily: sans,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        <button type="button" disabled={disabled} style={btnStyle}>
          {children}
        </button>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={btnStyle}>
      {children}
    </button>
  );
}

/** Alias for playbook naming. */
export const SecondaryButton = SecondaryBtn;
