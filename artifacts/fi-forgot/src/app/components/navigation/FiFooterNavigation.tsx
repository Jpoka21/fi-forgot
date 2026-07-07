import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { FiNavItem } from "@/app/components/navigation/FiNavItem";
import type { FiNavigationItem } from "@/app/components/navigation/navigationDomain";
import { getFiFooterNavigationClassName } from "@/app/components/navigation/navigationVariants";

export interface FiFooterNavigationProps extends HTMLAttributes<HTMLElement> {
  label?: string;
  items: FiNavigationItem[];
  onItemSelect?: (item: FiNavigationItem) => void;
}

export const FiFooterNavigation = forwardRef<HTMLElement, FiFooterNavigationProps>(
  (
    {
      label = "Footer",
      items,
      onItemSelect,
      className,
      ...props
    },
    ref,
  ) => (
    <nav
      ref={ref}
      className={cn(getFiFooterNavigationClassName(className))}
      aria-label={label}
      {...props}
    >
      {items.map((item) => (
        <FiNavItem
          key={item.id}
          variant="footer"
          label={item.label}
          href={item.href}
          active={item.active}
          disabled={item.disabled}
          onClick={onItemSelect ? () => onItemSelect(item) : undefined}
        />
      ))}
    </nav>
  ),
);

FiFooterNavigation.displayName = "FiFooterNavigation";
