import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import type { FiNavItemVariant } from "@/app/components/navigation/navigationDomain";
import { getFiNavItemClassName } from "@/app/components/navigation/navigationVariants";

type FiNavItemCommonProps = {
  variant?: FiNavItemVariant;
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  label: ReactNode;
};

export type FiNavItemProps =
  | (FiNavItemCommonProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
        href: string;
      })
  | (FiNavItemCommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
        href?: undefined;
      });

export const FiNavItem = forwardRef<HTMLAnchorElement | HTMLButtonElement, FiNavItemProps>(
  (
    {
      variant = "sidebar",
      active = false,
      disabled = false,
      icon,
      badge,
      label,
      className,
      href,
      ...props
    },
    ref,
  ) => {
    const classNames = cn(
      getFiNavItemClassName({ variant, active, disabled, className }),
    );

    const content = (
      <>
        {icon ? (
          <span className="fi-nav-item__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="fi-nav-item__label">{label}</span>
        {badge ? <span className="fi-nav-item__badge">{badge}</span> : null}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          href={href}
          className={classNames}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        className={classNames}
        disabled={disabled}
        aria-current={active ? "page" : undefined}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

FiNavItem.displayName = "FiNavItem";
