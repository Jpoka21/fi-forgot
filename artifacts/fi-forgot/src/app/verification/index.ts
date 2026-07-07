export {
  responsiveSurfaces,
  securityVerificationChecks,
  performanceVerificationSurfaces,
  systemVerificationDefaults,
  SYSTEM_API_INTEGRATION_POINTS,
  verificationBreakpoints,
  verificationCategories,
} from "@/app/verification/systemVerificationDomain";
export type {
  ResponsiveSurface,
  VerificationBreakpoint,
  VerificationCategory,
  VerificationCheckResult,
} from "@/app/verification/systemVerificationDomain";

export { runSystemVerification, summarizeVerification } from "@/app/verification/systemVerificationEngine";

export { trackVerificationEvent } from "@/app/verification/systemVerificationAnalytics";
export type {
  FiVerificationAnalyticsEvent,
  FiVerificationAnalyticsPayload,
} from "@/app/verification/systemVerificationAnalytics";

export { useSystemVerification } from "@/app/verification/hooks/useSystemVerification";
export type { SystemVerificationController } from "@/app/verification/hooks/useSystemVerification";
