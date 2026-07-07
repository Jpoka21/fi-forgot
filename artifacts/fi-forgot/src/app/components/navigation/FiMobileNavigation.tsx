import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { FiNavItem } from "@/app/components/navigation/FiNavItem";
import type { FiNavigationItem } from "@/app/components/navigation/navigationDomain";
import { getFiMobileNavigationClassName } from "@/app/components/navigation/navigationVariants";

export interface FiMobileNavigationProps extends HTMLAttributes<HTMLElement> {
  label?: string;
  items: FiNavigationItem[];
  onItemSelect?: (item: FiNavigationItem) => void;
}

export const FiMobileNavigation = forwardRef<HTMLElement, FiMobileNavigationProps>(
  (
    {
      label = "Mobile",
      items,
      onItemSelect,
      className,
      ...props
    },
    ref,
  ) => (
    <nav
      ref={ref}
      className={cn(getFiMobileNavigationClassName(className))}
      aria-label={label}
      {...props}
    >
      {items.map((item) => (
        <FiNavItem
          key={item.id}
          variant="mobile"
          label={item.label}
          href={item.href}
          icon={item.icon}
          badge={item.badge}
          active={item.active}
          disabled={item.disabled}
          onClick={onItemSelect ? () => onItemSelect(item) : undefined}
        />
      ))}
    </nav>
  ),
);

FiMobileNavigation.displayName = "FiMobileNavigation";
