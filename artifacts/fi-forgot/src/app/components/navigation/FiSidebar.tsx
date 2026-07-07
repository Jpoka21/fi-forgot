import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { FiNavItem } from "@/app/components/navigation/FiNavItem";
import type { FiNavigationItem, FiSidebarMode } from "@/app/components/navigation/navigationDomain";
import { getFiSidebarClassName } from "@/app/components/navigation/navigationVariants";

export interface FiSidebarProps extends HTMLAttributes<HTMLElement> {
  mode?: FiSidebarMode;
  label?: string;
}

export const FiSidebar = forwardRef<HTMLElement, FiSidebarProps>(
  ({ mode = "expanded", label = "Primary", className, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(getFiSidebarClassName({ mode, className }))}
      aria-label={label}
      {...props}
    >
      {children}
    </aside>
  ),
);

FiSidebar.displayName = "FiSidebar";

export const FiSidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-sidebar__header", className)} {...props} />
  ),
);
FiSidebarHeader.displayName = "FiSidebarHeader";

export const FiSidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-sidebar__content", className)} {...props} />
  ),
);
FiSidebarContent.displayName = "FiSidebarContent";

export const FiSidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-sidebar__footer", className)} {...props} />
  ),
);
FiSidebarFooter.displayName = "FiSidebarFooter";

export interface FiSidebarNavProps extends HTMLAttributes<HTMLElement> {
  items: FiNavigationItem[];
  onItemSelect?: (item: FiNavigationItem) => void;
}

export const FiSidebarNav = forwardRef<HTMLElement, FiSidebarNavProps>(
  ({ items, onItemSelect, className, ...props }, ref) => (
    <nav ref={ref} className={cn("fi-sidebar__nav", className)} {...props}>
      {items.map((item) => (
        <FiNavItem
          key={item.id}
          variant="sidebar"
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

FiSidebarNav.displayName = "FiSidebarNav";

export interface FiSidebarBrandProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
}

export const FiSidebarBrand = forwardRef<HTMLDivElement, FiSidebarBrandProps>(
  ({ title, subtitle, className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-sidebar__brand", className)} {...props}>
      <div className="fi-top-nav__brand">{title}</div>
      {subtitle ? <p className="fi-sidebar__brand-subtitle">{subtitle}</p> : null}
    </div>
  ),
);

FiSidebarBrand.displayName = "FiSidebarBrand";
