import type { ReactNode } from "react";

import { FiAiGenerationProgress } from "@/app/components/progress/FiStepProgress";
import { FiLoadingIndicator } from "@/app/components/feedback/FiLoadingIndicator";
import {
  FiLoadingRegion,
  FiSkeleton,
  FiSkeletonRow,
  FiSkeletonText,
  type FiLoadingRegionProps,
} from "@/app/components/loading/FiSkeleton";
import {
  aiGenerationLoadingMessages,
  loadingSkeletonDefaults,
  type FiLoadingSkeletonVariant,
} from "@/app/components/loading/loadingDomain";
import type { FiAiGenerationStepId } from "@/app/components/progress/progressDomain";

export type FiLoadingSkeletonPresetProps = Omit<FiLoadingRegionProps, "variant" | "children"> & {
  itemCount?: number;
};

function createLoadingSkeletonPreset(
  variant: FiLoadingSkeletonVariant,
  renderContent: (itemCount: number) => ReactNode,
) {
  const defaults = loadingSkeletonDefaults[variant];

  return function LoadingSkeletonPreset({
    label = defaults.label,
    itemCount = 3,
    ...props
  }: FiLoadingSkeletonPresetProps) {
    return (
      <FiLoadingRegion variant={variant} label={label} {...props}>
        {renderContent(itemCount)}
      </FiLoadingRegion>
    );
  };
}

export const FiPageSkeleton = createLoadingSkeletonPreset("page", () => (
  <>
    <div className="fi-loading-skeleton__header">
      <FiSkeleton width="sm" />
      <FiSkeleton width="md" shape="line" className="fi-skeleton--line" />
      <FiSkeleton width="lg" />
    </div>
    <div className="fi-loading-skeleton__body">
      <FiSkeleton shape="block" />
      <FiSkeletonText lines={4} />
      <FiSkeleton shape="rect" />
    </div>
  </>
));

export const FiCardLoadingSkeleton = createLoadingSkeletonPreset("card", () => (
  <div className="fi-loading-skeleton__card">
    <FiSkeleton shape="rect" />
    <FiSkeleton width="md" />
    <FiSkeletonText lines={2} />
    <FiSkeleton shape="button" width="sm" />
  </div>
));

export const FiListSkeleton = createLoadingSkeletonPreset("list", (itemCount) => (
  <div className="fi-loading-skeleton__items">
    {Array.from({ length: itemCount }, (_, index) => (
      <FiSkeletonRow key={index} lines={2} />
    ))}
  </div>
));

export const FiCalendarSkeleton = createLoadingSkeletonPreset("calendar", () => (
  <>
    <div className="fi-loading-skeleton__calendar-header">
      <FiSkeleton width="sm" />
      <FiSkeleton shape="button" width="xs" />
    </div>
    <div className="fi-loading-skeleton__weekdays">
      {Array.from({ length: 7 }, (_, index) => (
        <FiSkeleton key={index} width="full" />
      ))}
    </div>
    <div className="fi-loading-skeleton__grid">
      {Array.from({ length: 35 }, (_, index) => (
        <FiSkeleton key={index} shape="block" className="fi-loading-skeleton__cell" />
      ))}
    </div>
  </>
));

export const FiTimelineSkeleton = createLoadingSkeletonPreset("timeline", (itemCount) => (
  <div className="fi-loading-skeleton__items">
    {Array.from({ length: itemCount }, (_, index) => (
      <div key={index} className="fi-loading-skeleton__entry">
        <FiSkeleton width="sm" />
        <FiSkeletonText lines={3} />
      </div>
    ))}
  </div>
));

export const FiSearchSkeleton = createLoadingSkeletonPreset("search", (itemCount) => (
  <>
    <FiSkeleton shape="button" width="full" />
    <div className="fi-loading-skeleton__results">
      <FiLoadingIndicator size="sm" label="Searching" showLabel={false} />
      {Array.from({ length: itemCount }, (_, index) => (
        <FiSkeletonRow key={index} showAvatar={false} lines={2} />
      ))}
    </div>
  </>
));

export const FiRecipientSkeleton = createLoadingSkeletonPreset("recipient", () => (
  <>
    <div className="fi-loading-skeleton__hero">
      <FiSkeleton shape="avatar" width="xs" />
      <div className="fi-loading-skeleton__hero-content">
        <FiSkeleton width="md" />
        <FiSkeleton width="lg" />
        <FiSkeleton width="sm" />
      </div>
    </div>
    <div className="fi-loading-skeleton__actions">
      <FiSkeleton shape="button" />
      <FiSkeleton shape="button" width="sm" />
    </div>
    <div className="fi-loading-skeleton__timeline-preview">
      <FiSkeleton width="sm" />
      <FiSkeleton shape="block" />
    </div>
  </>
));

export const FiBillingSkeleton = createLoadingSkeletonPreset("billing", (itemCount) => (
  <>
    <div className="fi-loading-skeleton__summary">
      <FiSkeleton width="md" />
      <FiSkeletonText lines={2} />
      <FiSkeleton shape="button" width="sm" />
    </div>
    <div className="fi-loading-skeleton__rows">
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} className="fi-loading-skeleton__row">
          <FiSkeleton width="md" />
          <FiSkeleton width="sm" />
        </div>
      ))}
    </div>
  </>
));

export type FiAiGenerationSkeletonProps = FiLoadingSkeletonPresetProps & {
  message?: string;
  messageIndex?: number;
  stepId?: FiAiGenerationStepId;
  showProgress?: boolean;
};

export function FiAiGenerationSkeleton({
  label = loadingSkeletonDefaults.aiGeneration.label,
  message,
  messageIndex = 0,
  stepId,
  showProgress = true,
  ...props
}: FiAiGenerationSkeletonProps) {
  const resolvedMessage =
    message ?? aiGenerationLoadingMessages[messageIndex % aiGenerationLoadingMessages.length];

  return (
    <FiLoadingRegion variant="aiGeneration" label={label} {...props}>
      <div className="fi-loading-skeleton__draft">
        <p className="fi-loading-skeleton__message">{resolvedMessage}</p>
        <FiSkeletonText lines={5} />
        {showProgress ? (
          <FiAiGenerationProgress stepId={stepId} showStepList={false} />
        ) : null}
      </div>
    </FiLoadingRegion>
  );
}

export const FiDashboardSkeleton = createLoadingSkeletonPreset("dashboard", () => (
  <>
    <div className="fi-loading-skeleton__welcome">
      <FiSkeleton width="md" />
      <FiSkeleton width="lg" />
    </div>
    <div className="fi-loading-skeleton__hero">
      <FiSkeleton width="sm" />
      <FiSkeleton shape="block" />
      <FiSkeletonText lines={2} />
    </div>
    <div className="fi-loading-skeleton__quick-actions">
      <FiSkeleton shape="button" />
      <FiSkeleton shape="button" />
      <FiSkeleton shape="button" width="sm" />
    </div>
    <div className="fi-loading-skeleton__cards">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="fi-loading-skeleton__card">
          <FiSkeleton shape="avatar" width="xs" />
          <FiSkeleton width="md" />
          <FiSkeletonText lines={2} />
        </div>
      ))}
    </div>
  </>
));
