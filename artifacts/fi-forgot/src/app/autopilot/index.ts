export { useAutopilot } from "@/app/autopilot/hooks/useAutopilot";
export type { AutopilotController } from "@/app/autopilot/hooks/useAutopilot";

export {
  autopilotDefaults,
  AUTOPILOT_PAUSED_KEY,
  resolveAutopilotRuntimeState,
  autopilotStatusLabel,
  autopilotStatusDescription,
} from "@/app/autopilot/autopilotDomain";
export type {
  FiAutopilotRuntimeState,
  FiAutopilotCoverageSummary,
  FiAutopilotInsight,
  FiAutopilotActivityItem,
  FiAutopilotSnapshot,
} from "@/app/autopilot/autopilotDomain";

export { buildAutopilotSnapshot } from "@/app/autopilot/autopilotEngine";
export type { BuildAutopilotSnapshotOptions } from "@/app/autopilot/autopilotEngine";

export { trackAutopilotEvent } from "@/app/autopilot/autopilotAnalytics";
export type {
  FiAutopilotAnalyticsEvent,
  FiAutopilotAnalyticsPayload,
} from "@/app/autopilot/autopilotAnalytics";
