import { cn } from "@/lib/utils";
import { gridUtilityClasses } from "@/app/design";
import { buildRelationshipProfileRegionLabel } from "@/app/components/relationship-profile/accessibility";
import { getFiRelationshipProfileShellClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileShellProps {
  children: React.ReactNode;
  recipientName?: string;
  className?: string;
}

export function FiRelationshipProfileShell({
  children,
  recipientName,
  className,
}: FiRelationshipProfileShellProps) {
  return (
    <div className={cn(gridUtilityClasses.container, gridUtilityClasses.containerStandard)}>
      <section
        className={cn(getFiRelationshipProfileShellClassName(className))}
        aria-label={buildRelationshipProfileRegionLabel(recipientName)}
      >
        {children}
      </section>
    </div>
  );
}
