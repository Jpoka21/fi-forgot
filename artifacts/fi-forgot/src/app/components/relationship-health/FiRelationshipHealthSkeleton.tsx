import {
  FiLoadingRegion,
  FiSkeleton,
  FiSkeletonText,
} from "@/app/components/loading/FiSkeleton";

export interface FiRelationshipHealthSkeletonProps {
  label?: string;
}

export function FiRelationshipHealthSkeleton({
  label = "Loading relationship health",
}: FiRelationshipHealthSkeletonProps) {
  return (
    <FiLoadingRegion variant="card" label={label}>
      <div className="fi-relationship-health__skeleton-hero">
        <FiSkeleton shape="circle" width="md" />
        <div>
          <FiSkeletonText lines={3} />
        </div>
      </div>
      <FiSkeleton shape="block" />
      <FiSkeleton shape="rect" />
    </FiLoadingRegion>
  );
}
