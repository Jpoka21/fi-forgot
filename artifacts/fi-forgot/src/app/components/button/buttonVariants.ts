import { motionUtilityClasses } from "@/app/design";

export const fiButtonVariants = [
  "primary",
  "secondary",
  "tertiary",
  "ghost",
  "link",
  "danger",
  "success",
] as const;

export type FiButtonVariant = (typeof fiButtonVariants)[number];

export const fiButtonSizes = ["sm", "md", "lg", "icon"] as const;

export type FiButtonSize = (typeof fiButtonSizes)[number];

const baseClass = `fi-btn ${motionUtilityClasses.button} ${motionUtilityClasses.focus}`;

export const fiButtonVariantClasses: Record<FiButtonVariant, string> = {
  primary: `${baseClass} fi-btn--primary`,
  secondary: `${baseClass} fi-btn--secondary`,
  tertiary: `${baseClass} fi-btn--tertiary`,
  ghost: `${baseClass} fi-btn--ghost`,
  link: `${baseClass} fi-btn--link`,
  danger: `${baseClass} fi-btn--danger`,
  success: `${baseClass} fi-btn--success`,
};

export const fiButtonSizeClasses: Record<FiButtonSize, string> = {
  sm: "fi-btn--sm",
  md: "fi-btn--md",
  lg: "fi-btn--lg",
  icon: "fi-btn--icon",
};

export function getFiButtonClassName(options: {
  variant?: FiButtonVariant;
  size?: FiButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}): string {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    className = "",
  } = options;

  return [
    fiButtonVariantClasses[variant],
    fiButtonSizeClasses[size],
    fullWidth ? "fi-btn--full" : "",
    loading ? "fi-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
