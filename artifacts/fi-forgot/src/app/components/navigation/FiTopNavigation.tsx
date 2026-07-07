import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { FiNavItem } from "@/app/components/navigation/FiNavItem";
import type { FiNavigationItem } from "@/app/components/navigation/navigationDomain";
import { getFiTopNavigationClassName } from "@/app/components/navigation/navigationVariants";

export interface FiTopNavigationProps extends HTMLAttributes<HTMLElement> {
  label?: string;
}

export const FiTopNavigation = forwardRef<HTMLElement, FiTopNavigationProps>(
  ({ label = "Primary", className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(getFiTopNavigationClassName(className))}
      {...props}
    >
      <nav aria-label={label} className="fi-top-nav__inner" style={{ display: "contents" }}>
        {children}
      </nav>
    </header>
  ),
);

FiTopNavigation.displayName = "FiTopNavigation";

export interface FiTopNavBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export const FiTopNavBrand = forwardRef<HTMLAnchorElement, FiTopNavBrandProps>(
  ({ className, href = "/", children, ...props }, ref) => (
    <a ref={ref} href={href} className={cn("fi-top-nav__brand", className)} {...props}>
      {children}
    </a>
  ),
);

FiTopNavBrand.displayName = "FiTopNavBrand";

export const FiTopNavActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-top-nav__actions", className)} {...props} />
  ),
);

FiTopNavActions.displayName = "FiTopNavActions";

export interface FiTopNavListProps extends HTMLAttributes<HTMLUListElement> {
  items: FiNavigationItem[];
  onItemSelect?: (item: FiNavigationItem) => void;
}

export const FiTopNavList = forwardRef<HTMLUListElement, FiTopNavListProps>(
  ({ items, onItemSelect, className, ...props }, ref) => (
    <ul ref={ref} className={cn("fi-top-nav__list", className)} {...props}>
      {items.map((item) => (
        <li key={item.id}>
          <FiNavItem
            variant="top"
            label={item.label}
            href={item.href}
            icon={item.icon}
            badge={item.badge}
            active={item.active}
            disabled={item.disabled}
            onClick={onItemSelect ? () => onItemSelect(item) : undefined}
          />
        </li>
      ))}
    </ul>
  ),
);

FiTopNavList.displayName = "FiTopNavList";

export interface FiTopNavSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FiTopNavSection = forwardRef<HTMLDivElement, FiTopNavSectionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-top-nav__section", className)} {...props} />
  ),
);

FiTopNavSection.displayName = "FiTopNavSection";
