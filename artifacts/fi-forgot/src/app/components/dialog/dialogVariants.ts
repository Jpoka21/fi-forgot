import { motionUtilityClasses, radiusUtilityClasses, typographyUtilityClasses } from "@/app/design";

import type { FiDialogSize, FiDialogVariant } from "@/app/components/dialog/dialogDomain";

export const fiDialogSizeClasses: Record<FiDialogSize, string> = {
  sm: "fi-dialog--sm",
  md: "fi-dialog--md",
  lg: "fi-dialog--lg",
};

export const fiDialogVariantClasses: Record<FiDialogVariant, string> = {
  confirmation: "fi-dialog--confirmation",
  information: "fi-dialog--information",
  form: "fi-dialog--form",
  delete: "fi-dialog--delete",
  upgrade: "fi-dialog--upgrade",
  error: "fi-dialog--error",
  loading: "fi-dialog--loading",
};

export function getFiDialogClassName(options: {
  variant?: FiDialogVariant;
  size?: FiDialogSize;
  alert?: boolean;
  className?: string;
}): string {
  const {
    variant = "information",
    size = "md",
    alert = false,
    className = "",
  } = options;

  return [
    "fi-dialog",
    radiusUtilityClasses.dialog,
    typographyUtilityClasses.bodySm,
    fiDialogSizeClasses[size],
    fiDialogVariantClasses[variant],
    alert ? "fi-dialog--alert" : "",
    motionUtilityClasses.dialogEnter,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiDialogPanelClassName(className = ""): string {
  return ["fi-dialog__panel", className].filter(Boolean).join(" ");
}
