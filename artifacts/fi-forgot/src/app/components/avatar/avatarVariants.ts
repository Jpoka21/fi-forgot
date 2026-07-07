import { radiusUtilityClasses } from "@/app/design";

export const fiAvatarSizes = ["xs", "sm", "md", "lg", "xl", "hero"] as const;

export type FiAvatarSize = (typeof fiAvatarSizes)[number];

export const fiAvatarVariants = ["user", "recipient", "initial", "system", "concierge"] as const;

export type FiAvatarVariant = (typeof fiAvatarVariants)[number];

export const fiAvatarStatusTypes = ["online", "away", "offline", "none"] as const;

export type FiAvatarStatus = (typeof fiAvatarStatusTypes)[number];

export const fiAvatarSizeClasses: Record<FiAvatarSize, string> = {
  xs: "fi-avatar--xs",
  sm: "fi-avatar--sm",
  md: "fi-avatar--md",
  lg: "fi-avatar--lg",
  xl: "fi-avatar--xl",
  hero: "fi-avatar--hero",
};

export const fiAvatarVariantClasses: Record<FiAvatarVariant, string> = {
  user: "",
  recipient: "",
  initial: "",
  system: "fi-avatar--system",
  concierge: "fi-avatar--concierge",
};

export function getFiAvatarClassName(options: {
  size?: FiAvatarSize;
  variant?: FiAvatarVariant;
  loading?: boolean;
  uploading?: boolean;
  className?: string;
}): string {
  const {
    size = "md",
    variant = "user",
    loading = false,
    uploading = false,
    className = "",
  } = options;

  return [
    "fi-avatar",
    radiusUtilityClasses.avatarClip,
    fiAvatarSizeClasses[size],
    fiAvatarVariantClasses[variant],
    loading ? "fi-avatar--loading" : "",
    uploading ? "fi-avatar--uploading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiAvatarGroupOverflowClassName(size: FiAvatarSize = "md"): string {
  return `fi-avatar-group__overflow fi-avatar-group__overflow--${size}`;
}
