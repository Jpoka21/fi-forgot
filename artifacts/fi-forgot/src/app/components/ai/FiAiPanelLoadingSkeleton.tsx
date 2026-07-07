import { FiAiGenerationSkeleton } from "@/app/components/loading/FiLoadingPresets";
import type { FiAiGenerationSkeletonProps } from "@/app/components/loading/FiLoadingPresets";

export type FiAiPanelLoadingSkeletonProps = FiAiGenerationSkeletonProps;

export function FiAiPanelLoadingSkeleton(props: FiAiPanelLoadingSkeletonProps) {
  return <FiAiGenerationSkeleton {...props} />;
}
