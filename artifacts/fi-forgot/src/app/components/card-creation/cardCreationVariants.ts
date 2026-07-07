import { cn } from "@/lib/utils";

export function getFiCardCreationClassName(className?: string): string {
  return cn("fi-card-creation", className);
}

export function getFiCardCreationSectionClassName(className?: string): string {
  return cn("fi-card-creation__section", className);
}

export function getFiCardCreationPanelClassName(className?: string): string {
  return cn("fi-card-creation__panel", className);
}
