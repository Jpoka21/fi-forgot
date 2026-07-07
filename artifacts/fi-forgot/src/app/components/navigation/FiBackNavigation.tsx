import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
} from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { buildBackNavigationLabel } from "@/app/components/navigation/accessibility";
import { backNavigationDefaults } from "@/app/components/navigation/navigationDomain";
import { getFiBackNavigationClassName } from "@/app/components/navigation/navigationVariants";

type FiBackNavigationCommonProps = {
  label?: string;
  destination?: string;
};

export type FiBackNavigationProps =
  | (FiBackNavigationCommonProps &
      Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
        href: string;
      })
  | (FiBackNavigationCommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
        href?: undefined;
      });

export const FiBackNavigation = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  FiBackNavigationProps
>(
  (
    {
      label = backNavigationDefaults.label,
      destination,
      className,
      href,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const resolvedLabel = buildBackNavigationLabel(label, destination);
    const classNames = cn(getFiBackNavigationClassName(className));

    if (href) {
      return (
        <a
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          href={href}
          className={classNames}
          aria-label={ariaLabel ?? resolvedLabel}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          <ArrowLeft aria-hidden />
          <span>{label}</span>
        </a>
      );
    }

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        className={classNames}
        aria-label={ariaLabel ?? resolvedLabel}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <ArrowLeft aria-hidden />
        <span>{label}</span>
      </button>
    );
  },
);

FiBackNavigation.displayName = "FiBackNavigation";
