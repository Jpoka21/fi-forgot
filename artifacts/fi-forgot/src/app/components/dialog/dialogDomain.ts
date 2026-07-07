export const fiDialogVariants = [
  "confirmation",
  "information",
  "form",
  "delete",
  "upgrade",
  "error",
  "loading",
] as const;

export type FiDialogVariant = (typeof fiDialogVariants)[number];

export const fiDialogSizes = ["sm", "md", "lg"] as const;

export type FiDialogSize = (typeof fiDialogSizes)[number];

export const confirmationDialogDefaults = {
  title: "Are you sure?",
  description: "Please confirm before continuing.",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
} as const;

export const informationDialogDefaults = {
  title: "Information",
  description: "",
  closeLabel: "Close",
} as const;

export const deleteDialogDefaults = {
  title: "Delete this item?",
  description: "This action cannot be undone.",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
} as const;

export const upgradeDialogDefaults = {
  title: "Upgrade your plan",
  description: "Unlock more thoughtful relationship support with a premium plan.",
  confirmLabel: "View Plans",
  cancelLabel: "Not Now",
} as const;

export const errorDialogDefaults = {
  title: "Something went wrong",
  description: "Please try again in a moment.",
  retryLabel: "Try Again",
  closeLabel: "Close",
} as const;

export const loadingDialogDefaults = {
  title: "Working on it",
  description: "This may take a moment.",
} as const;

export const formDialogDefaults = {
  submitLabel: "Save",
  cancelLabel: "Cancel",
} as const;
