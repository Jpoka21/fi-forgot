import { cn } from "@/lib/utils";

export function getFiAutopilotClassName(className?: string): string {
  return cn("fi-autopilot", className);
}

export function getFiAutopilotSectionClassName(className?: string): string {
  return cn("fi-autopilot__section", className);
}

export function getFiAutopilotHeroClassName(state: "active" | "paused" | "manual"): string {
  return cn("fi-autopilot__hero", `fi-autopilot__hero--${state}`);
}
