import {
  FiLoadingRegion,
  FiSkeleton,
} from "@/app/components/loading/FiSkeleton";

export interface FiConciergeSuggestionsSkeletonProps {
  label?: string;
  itemCount?: number;
}

export function FiConciergeSuggestionsSkeleton({
  label = "Loading concierge suggestions",
  itemCount = 3,
}: FiConciergeSuggestionsSkeletonProps) {
  return (
    <FiLoadingRegion variant="card" label={label}>
      <div className="fi-concierge-suggestions__skeleton-list">
        {Array.from({ length: itemCount }, (_, index) => (
          <FiSkeleton key={index} shape="block" />
        ))}
      </div>
    </FiLoadingRegion>
  );
}
