import { cn } from "@/lib/utils";

export function getFiRecipientsClassName(className?: string): string {
  return cn("fi-recipients", className);
}

export function getFiRecipientsSectionClassName(className?: string): string {
  return cn("fi-recipients__section", className);
}

export function getFiRecipientsCardClassName(selected?: boolean, urgent?: boolean): string {
  return cn(
    "fi-recipients__card",
    selected && "fi-recipients__card--selected",
    urgent && "fi-recipients__card--urgent",
  );
}
