/**
 * "F" I Forgot — Brand Component Library
 * Single source of truth: brand-kit-v1.png
 *
 * Colors:   Disaster Red #D32F2F | Ink Black #111111 | Paper Beige #F2E6D3 | Damage Gray #6B6B6B
 * Type:     Bebas Neue (stamps/headlines) | Plus Jakarta Sans (body) | Caveat (handwriting)
 * Tone:     Funny. Dependable. Slightly chaotic. Relationship damage control.
 *
 * Usage:
 *   import { BrandLogo, CircleStamp, StickyNote, BrandButton, ... } from "@/components/brand";
 */

import { ReactNode } from "react";
import { Link } from "wouter";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
export const B = {
  red:    "#D32F2F",
  redDark: "#9B1C1C",
  black:  "#111111",
  beige:  "#F2E6D3",
  beigeD: "#E8D4B8",
  gray:   "#6B6B6B",
  yellow: "#FFF176",
  white:  "#FFFFFF",
} as const;

// ─── Stamp distress SVG filter — inject once near app root ───────────────────
// Place <StampDistressFilter /> once in App.tsx or main layout.
// All stamp elements reference filter="url(#fi-stamp)" automatically.
export function StampDistressFilter() {
  return (
    <svg
      width={0}
      height={0}
      style={{ position: "absolute", pointerEvents: "none", overflow: "hidden" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="fi-stamp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.05 0.07"
            numOctaves="4"
            seed="9"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="fi-stamp-heavy" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.07 0.09"
            numOctaves="4"
            seed="14"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

// ─── BrandLogo ────────────────────────────────────────────────────────────────
// The primary "F" I FORGOT stamp logo. Three variants from the brand kit.
export function BrandLogo({
  size = "md",
  variant = "stamp",
  inverted = false,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "stamp" | "inline" | "compact";
  inverted?: boolean;
}) {
  const col = inverted ? B.white : B.red;
  const sub = inverted ? "rgba(255,255,255,0.65)" : B.black;
  const bdr = inverted ? "rgba(255,255,255,0.55)" : B.red;

  const cfg = {
    sm: { main: "1.5rem", body: "0.45rem", pad: "5px 10px", bw: "2px",   gap: 1 },
    md: { main: "2.2rem", body: "0.58rem", pad: "8px 14px", bw: "2.5px", gap: 2 },
    lg: { main: "3.8rem", body: "0.78rem", pad: "12px 22px", bw: "3px",  gap: 3 },
  }[size];

  if (variant === "inline") {
    return (
      <span
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: cfg.main,
          color: col,
          letterSpacing: "0.03em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: B.red }}>"F"</span>
        {inverted ? <span style={{ color: B.white }}> I FORGOT</span> : " I FORGOT"}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1, gap: cfg.gap }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: cfg.main,
            color: col,
            letterSpacing: "0.03em",
          }}
        >
          <span style={{ color: B.red }}>"F"</span> I FORGOT
        </span>
        <span
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: cfg.body,
            color: sub,
            letterSpacing: "0.02em",
          }}
        >
          Relationship Damage Control
        </span>
      </div>
    );
  }

  // stamp variant — bordered rectangle with distress filter
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        padding: cfg.pad,
        border: `${cfg.bw} solid ${bdr}`,
        borderRadius: 5,
        filter: "url(#fi-stamp)",
        lineHeight: 1,
        gap: cfg.gap,
        opacity: 0.92,
      }}
    >
      <span
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: cfg.main,
          color: col,
          letterSpacing: "0.06em",
        }}
      >
        "F" I FORGOT
      </span>
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: cfg.body,
          fontWeight: 800,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          color: sub,
        }}
      >
        Relationship Damage Control
      </span>
    </div>
  );
}

// ─── CircleStamp ──────────────────────────────────────────────────────────────
// Circular distressed brand stamps. (Crisis Averted / Card Deployed / Relationship Saved)
type StampType = "crisis" | "deployed" | "saved" | "averted";

const CIRCLE_STAMP: Record<StampType, { top: string; bottom: string; icon: string }> = {
  crisis:   { top: "CRISIS",        bottom: "AVERTED",      icon: "!" },
  deployed: { top: "CARD DEPLOYED", bottom: "SUCCESSFULLY", icon: "✉" },
  saved:    { top: "RELATIONSHIP",  bottom: "SAVED",        icon: "♥" },
  averted:  { top: "DISASTER",      bottom: "AVERTED",      icon: "✓" },
};

export function CircleStamp({
  type = "crisis",
  size = 80,
  color = B.red,
}: {
  type?: StampType;
  size?: number;
  color?: string;
}) {
  const { top, bottom, icon } = CIRCLE_STAMP[type];
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 5;
  const r2 = r - 6;
  const uid = `stamp-${type}-${size}`;

  // Arc paths for text
  const arcTop    = `M ${cx - r2 * 0.82} ${cy} A ${r2 * 0.82} ${r2 * 0.82} 0 0 1 ${cx + r2 * 0.82} ${cy}`;
  const arcBottom = `M ${cx - r2 * 0.82} ${cy} A ${r2 * 0.82} ${r2 * 0.82} 0 0 0 ${cx + r2 * 0.82} ${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: "url(#fi-stamp)", opacity: 0.87, flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={r}  fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={color} strokeWidth="1"   strokeDasharray="2.5 2" />

      {/* Center icon */}
      <text
        x={cx} y={cy + size * 0.1}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="900"
        fontFamily="sans-serif"
      >
        {icon}
      </text>

      {/* Top arc label */}
      <path id={`${uid}-top`} d={arcTop} fill="none" />
      <text fontSize={size * 0.115} fontWeight="900" fill={color} fontFamily="'Bebas Neue', cursive" letterSpacing="1.5">
        <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>

      {/* Bottom arc label */}
      <path id={`${uid}-bot`} d={arcBottom} fill="none" />
      <text fontSize={size * 0.115} fontWeight="900" fill={color} fontFamily="'Bebas Neue', cursive" letterSpacing="1.5">
        <textPath href={`#${uid}-bot`} startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>
    </svg>
  );
}

// ─── RectStamp ────────────────────────────────────────────────────────────────
// Rectangular badge in the stamp style. Matches the logo border look.
export function RectStamp({
  children,
  rotate = 0,
  color = B.red,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  rotate?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const cfg = {
    sm: { pad: "3px 10px",  fs: "0.7rem",  bw: "2px",   ls: "0.14em" },
    md: { pad: "5px 14px",  fs: "0.85rem", bw: "2.5px", ls: "0.16em" },
    lg: { pad: "8px 20px",  fs: "1.1rem",  bw: "3px",   ls: "0.18em" },
  }[size];

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        padding: cfg.pad,
        border: `${cfg.bw} solid ${color}`,
        borderRadius: 3,
        fontFamily: "'Bebas Neue', cursive",
        fontSize: cfg.fs,
        letterSpacing: cfg.ls,
        textTransform: "uppercase" as const,
        color,
        lineHeight: 1.3,
        opacity: 0.88,
        filter: "url(#fi-stamp)",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

// ─── WarningBadge ─────────────────────────────────────────────────────────────
// Small pill badges for status indicators throughout the app.
type BadgeVariant = "crisis" | "deployed" | "saved" | "pending" | "neutral";

const BADGE_CONFIG: Record<BadgeVariant, { bg: string; text: string; border: string; icon: string }> = {
  crisis:   { bg: "#FEE2E2", text: B.red,    border: `${B.red}55`,   icon: "⚠" },
  deployed: { bg: "#DCFCE7", text: "#166534", border: "#16653455",    icon: "✓" },
  saved:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#1D4ED855",    icon: "♥" },
  pending:  { bg: "#FEF9C3", text: "#854D0E", border: "#854D0E55",    icon: "⏳" },
  neutral:  { bg: B.beige,   text: B.black,  border: `${B.black}22`, icon: "●" },
};

export function WarningBadge({
  variant = "crisis",
  label,
  size = "sm",
}: {
  variant?: BadgeVariant;
  label?: string;
  size?: "sm" | "md";
}) {
  const s = BADGE_CONFIG[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "sm" ? "3px 9px" : "5px 12px",
        background: s.bg,
        color: s.text,
        border: `1.5px solid ${s.border}`,
        borderRadius: 999,
        fontSize: size === "sm" ? "0.6rem" : "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        fontFamily: "'Bebas Neue', cursive",
        whiteSpace: "nowrap",
      }}
    >
      <span>{s.icon}</span>
      {label}
    </span>
  );
}

// ─── StickyNote ───────────────────────────────────────────────────────────────
// Yellow sticky note with handwritten Caveat font.
export function StickyNote({
  children,
  rotate = -2,
  className = "",
  style: overrideStyle = {},
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        background: "#FFF176",
        padding: "14px 18px 18px",
        borderRadius: "2px 2px 2px 2px",
        boxShadow: "2px 4px 10px rgba(0,0,0,0.18), inset 0 -3px 0 rgba(0,0,0,0.07)",
        transform: `rotate(${rotate}deg)`,
        fontFamily: "'Caveat', cursive",
        fontSize: "1.1rem",
        color: B.black,
        lineHeight: 1.5,
        minWidth: 110,
        position: "relative" as const,
        ...overrideStyle,
      }}
    >
      {/* Top tape strip */}
      <div
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 16,
          background: "rgba(255,255,176,0.6)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
        }}
      />
      {children}
    </div>
  );
}

// ─── SectionDivider ───────────────────────────────────────────────────────────
// Red horizontal rule with optional label or stamp.
export function SectionDivider({
  label,
  stamp,
}: {
  label?: string;
  stamp?: StampType;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "4px 0",
        userSelect: "none",
      }}
    >
      <div style={{ flex: 1, height: 2, background: `${B.red}28`, borderRadius: 1 }} />
      {stamp ? (
        <CircleStamp type={stamp} size={52} />
      ) : label ? (
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            color: B.gray,
            whiteSpace: "nowrap",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
      ) : (
        <span style={{ color: B.red, fontSize: "0.8rem", opacity: 0.5 }}>✦</span>
      )}
      <div style={{ flex: 1, height: 2, background: `${B.red}28`, borderRadius: 1 }} />
    </div>
  );
}

// ─── BrandButton ──────────────────────────────────────────────────────────────
// Primary, secondary, outline, and ghost variants.
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const BTN_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: B.red,    color: B.white, border: "none",                    boxShadow: `0 3px 0 ${B.redDark}, 0 6px 16px ${B.red}30` },
  secondary: { background: B.beige,  color: B.black, border: `2px solid ${B.black}`,    boxShadow: `0 3px 0 ${B.black}22` },
  outline:   { background: "transparent", color: B.red, border: `2.5px solid ${B.red}`, boxShadow: "none" },
  ghost:     { background: "transparent", color: B.black, border: "none",               boxShadow: "none" },
  danger:    { background: B.black,  color: B.white, border: "none",                    boxShadow: `0 3px 0 #000` },
};

export function BrandButton({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  className = "",
  testId,
  type = "button",
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  testId?: string;
  type?: "button" | "submit" | "reset";
}) {
  const pad = { sm: "7px 16px", md: "11px 24px", lg: "15px 36px" }[size];
  const fs  = { sm: "0.72rem",  md: "0.82rem",   lg: "0.95rem"  }[size];

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: pad,
    borderRadius: 5,
    fontSize: fs,
    fontWeight: 800,
    fontFamily: "'Bebas Neue', cursive",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.12s ease",
    textDecoration: "none",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.55 : 1,
    userSelect: "none",
    ...BTN_STYLES[variant],
  };

  if (href && !disabled) {
    return (
      <Link href={href} style={style} className={className} data-testid={testId}>
        {children}
      </Link>
    );
  }

  return (
    <button
      style={style}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={testId}
      type={type}
    >
      {children}
    </button>
  );
}

// ─── EmergencyAlert ───────────────────────────────────────────────────────────
// Alert/warning banner. Crisis (red), success (green), warning (yellow).
type AlertVariant = "crisis" | "success" | "warning";

export function EmergencyAlert({
  title,
  body,
  variant = "crisis",
  action,
}: {
  title: string;
  body?: string;
  variant?: AlertVariant;
  action?: ReactNode;
}) {
  const s = {
    crisis:  { bg: "#FFF5F5", border: B.red,    icon: "⚠", ib: B.red,     ic: B.white },
    success: { bg: "#F0FFF4", border: "#16A34A", icon: "✓", ib: "#16A34A", ic: B.white },
    warning: { bg: "#FFFBEB", border: "#D97706", icon: "!", ib: "#D97706", ic: B.white },
  }[variant];

  return (
    <div
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: s.ib,
          color: s.ic,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: "0.9rem",
          flexShrink: 0,
          fontFamily: "sans-serif",
        }}
      >
        {s.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.95rem",
            letterSpacing: "0.12em",
            color: s.border,
            textTransform: "uppercase" as const,
            marginBottom: body ? 3 : 0,
          }}
        >
          {title}
        </div>
        {body && (
          <div style={{ fontSize: "0.8rem", color: B.gray, lineHeight: 1.5 }}>{body}</div>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

// ─── IconCard ─────────────────────────────────────────────────────────────────
// Icon + headline + body + optional handwritten note. Used in How It Works etc.
export function IconCard({
  icon,
  title,
  body,
  note,
  num,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  note?: string;
  num?: string | number;
}) {
  return (
    <div
      style={{
        background: B.beige,
        border: `1.5px solid ${B.black}14`,
        borderRadius: 12,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      {num !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "4rem",
            color: `${B.black}09`,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {num}
        </div>
      )}
      {icon && <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>{icon}</div>}
      <div
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "1.1rem",
          color: B.black,
          letterSpacing: "0.07em",
          textTransform: "uppercase" as const,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.65 }}>{body}</div>
      {note && (
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "0.95rem",
            color: B.red,
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

// ─── CtaBanner ────────────────────────────────────────────────────────────────
// Full-width CTA section with optional secondary link.
export function CtaBanner({
  headline,
  sub,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  headline: string;
  sub?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div
      style={{
        background: B.beige,
        border: `2px solid ${B.black}10`,
        borderTop: `4px solid ${B.red}`,
        borderRadius: 14,
        padding: "clamp(28px, 6vw, 56px) clamp(20px, 6vw, 56px)",
        textAlign: "center" as const,
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      {/* Background stamp watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          right: -20,
          transform: "translateY(-50%) rotate(-10deg)",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "8rem",
          color: B.red,
          opacity: 0.04,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        SEND IT
      </div>

      <h2
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
          color: B.black,
          letterSpacing: "0.04em",
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        {headline}
      </h2>
      {sub && (
        <p
          style={{
            color: B.gray,
            fontSize: "0.9rem",
            marginBottom: 28,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <BrandButton href={primaryHref} variant="primary" size="lg">
          {primaryLabel}
        </BrandButton>
        {secondaryLabel && secondaryHref && (
          <BrandButton href={secondaryHref} variant="secondary" size="lg">
            {secondaryLabel}
          </BrandButton>
        )}
      </div>
    </div>
  );
}

// ─── TaglineBar ────────────────────────────────────────────────────────────────
// Bottom strip from brand kit: dark red bar with icons + taglines.
const TAGLINES = [
  { icon: "♥", text: "WE NEVER MISS A DATE" },
  { icon: "📅", text: "SET IT ONCE, WE HANDLE IT" },
  { icon: "🔒", text: "YOUR SECRET WEAPON" },
  { icon: "♥", text: "SAVE TIME. SAVE YOUR BUTT." },
];

export function TaglineBar() {
  return (
    <div
      style={{
        background: "#7B0A0A",
        padding: "11px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "6px 28px",
      }}
    >
      {TAGLINES.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: "0.75rem", opacity: 0.65, color: B.white }}>{t.icon}</span>
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {t.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── PaperSection ─────────────────────────────────────────────────────────────
// Full-width section with paper beige background. Wraps content consistently.
export function PaperSection({
  children,
  id,
  dark = false,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={className}
      style={{
        background: dark ? B.black : B.beige,
        color: dark ? B.white : B.black,
        padding: "clamp(48px, 8vw, 96px) clamp(16px, 5vw, 40px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

// ─── SectionHeading ───────────────────────────────────────────────────────────
// Consistent Bebas Neue section heading used across all pages.
export function SectionHeading({
  children,
  sub,
  align = "center",
  inverted = false,
}: {
  children: ReactNode;
  sub?: string;
  align?: "left" | "center";
  inverted?: boolean;
}) {
  return (
    <div style={{ textAlign: align, marginBottom: "clamp(28px, 5vw, 48px)" }}>
      <h2
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          color: inverted ? B.white : B.black,
          letterSpacing: "0.04em",
          lineHeight: 1,
          margin: 0,
        }}
      >
        {children}
      </h2>
      {sub && (
        <p
          style={{
            marginTop: 10,
            fontSize: "0.9rem",
            color: inverted ? "rgba(255,255,255,0.55)" : B.gray,
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
