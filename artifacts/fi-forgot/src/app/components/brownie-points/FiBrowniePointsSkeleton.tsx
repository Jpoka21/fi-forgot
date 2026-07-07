import {
  FiLoadingRegion,
  FiSkeleton,
  FiSkeletonText,
} from "@/app/components/loading/FiSkeleton";

export interface FiBrowniePointsSkeletonProps {
  label?: string;
}

export function FiBrowniePointsSkeleton({
  label = "Loading Brownie Points",
}: FiBrowniePointsSkeletonProps) {
  return (
    <FiLoadingRegion variant="card" label={label}>
      <div className="fi-brownie-points__skeleton-hero">
        <FiSkeleton shape="block" />
        <FiSkeletonText lines={2} />
      </div>
      <FiSkeleton shape="rect" />
      <FiSkeleton shape="rect" />
    </FiLoadingRegion>
  );
}
