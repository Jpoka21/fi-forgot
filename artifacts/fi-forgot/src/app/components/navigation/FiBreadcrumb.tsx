import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFiBreadcrumbClassName } from "@/app/components/navigation/navigationVariants";

export interface FiBreadcrumbProps extends HTMLAttributes<HTMLElement> {
  label?: string;
}

export const FiBreadcrumb = forwardRef<HTMLElement, FiBreadcrumbProps>(
  ({ label = "Breadcrumb", className, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label={label}
      className={cn(getFiBreadcrumbClassName(className))}
      {...props}
    >
      {children}
    </nav>
  ),
);

FiBreadcrumb.displayName = "FiBreadcrumb";

export const FiBreadcrumbList = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn("fi-breadcrumb__list", className)} {...props} />
  ),
);

FiBreadcrumbList.displayName = "FiBreadcrumbList";

export const FiBreadcrumbItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("fi-breadcrumb__item", className)} {...props} />
  ),
);

FiBreadcrumbItem.displayName = "FiBreadcrumbItem";

export const FiBreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a ref={ref} className={cn("fi-breadcrumb__link", className)} {...props} />
));

FiBreadcrumbLink.displayName = "FiBreadcrumbLink";

export const FiBreadcrumbPage = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("fi-breadcrumb__page", className)}
      aria-current="page"
      {...props}
    />
  ),
);

FiBreadcrumbPage.displayName = "FiBreadcrumbPage";

export interface FiBreadcrumbSeparatorProps extends LiHTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
}

export const FiBreadcrumbSeparator = forwardRef<HTMLLIElement, FiBreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("fi-breadcrumb__separator", className)}
      aria-hidden
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  ),
);

FiBreadcrumbSeparator.displayName = "FiBreadcrumbSeparator";

export const FiBreadcrumbEllipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("fi-breadcrumb__ellipsis", className)} aria-hidden {...props}>
      <MoreHorizontal />
      <span className="sr-only">More</span>
    </span>
  ),
);

FiBreadcrumbEllipsis.displayName = "FiBreadcrumbEllipsis";
