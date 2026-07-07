import { type ReactNode } from "react";
import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Search,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import {
  FiEmptyStateIcon,
  FiEmptyStateLayout,
  type FiEmptyStateLayoutProps,
} from "@/app/components/empty-state/FiEmptyState";
import {
  emptyStateDefaults,
  type FiEmptyStateVariant,
} from "@/app/components/empty-state/emptyStateDomain";

const emptyStateIcons: Record<FiEmptyStateVariant, ReactNode> = {
  dashboard: <LayoutDashboard />,
  timeline: <Users />,
  calendar: <Calendar />,
  search: <Search />,
  notification: <Bell />,
  recipient: <UserPlus />,
  billing: <CreditCard />,
  aiConcierge: <Sparkles />,
  admin: <Shield />,
};

export type FiEmptyStatePresetProps = Omit<
  FiEmptyStateLayoutProps,
  "variant" | "title" | "description" | "illustration"
> & {
  title?: ReactNode;
  description?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryHref?: string;
  secondaryHref?: string;
  showIcon?: boolean;
};

function createDomainEmptyState(variant: FiEmptyStateVariant) {
  const defaults = emptyStateDefaults[variant];

  return function DomainEmptyState({
    title = defaults.title,
    description = defaults.description,
    primaryLabel = defaults.primaryLabel,
    secondaryLabel = defaults.secondaryLabel,
    onPrimaryAction,
    onSecondaryAction,
    primaryHref,
    secondaryHref,
    showIcon = true,
    contained = true,
    ...props
  }: FiEmptyStatePresetProps) {
    const primaryAction = primaryHref ? (
      <FiButton asChild variant="primary">
        <a href={primaryHref}>{primaryLabel}</a>
      </FiButton>
    ) : (
      <FiButton variant="primary" onClick={onPrimaryAction}>
        {primaryLabel}
      </FiButton>
    );

    const secondaryAction =
      secondaryLabel && (secondaryHref || onSecondaryAction) ? (
        secondaryHref ? (
          <FiButton asChild variant="ghost">
            <a href={secondaryHref}>{secondaryLabel}</a>
          </FiButton>
        ) : (
          <FiButton variant="ghost" onClick={onSecondaryAction}>
            {secondaryLabel}
          </FiButton>
        )
      ) : null;

    return (
      <FiEmptyStateLayout
        variant={variant}
        contained={contained}
        title={title}
        description={description}
        illustration={
          showIcon ? <FiEmptyStateIcon>{emptyStateIcons[variant]}</FiEmptyStateIcon> : undefined
        }
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        {...props}
      />
    );
  };
}

export const FiDashboardEmptyState = createDomainEmptyState("dashboard");
export const FiTimelineEmptyState = createDomainEmptyState("timeline");
export const FiCalendarEmptyState = createDomainEmptyState("calendar");
export const FiSearchEmptyState = createDomainEmptyState("search");
export const FiNotificationEmptyState = createDomainEmptyState("notification");
export const FiRecipientEmptyState = createDomainEmptyState("recipient");
export const FiBillingEmptyState = createDomainEmptyState("billing");
export const FiAiConciergeEmptyState = createDomainEmptyState("aiConcierge");
export const FiAdminEmptyState = createDomainEmptyState("admin");
