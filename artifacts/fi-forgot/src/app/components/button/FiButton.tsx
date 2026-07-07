import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFiButtonClassName,
  type FiButtonSize,
  type FiButtonVariant,
} from "@/app/components/button/buttonVariants";

export interface FiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FiButtonVariant;
  size?: FiButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const FiButton = forwardRef<HTMLButtonElement, FiButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      children,
      disabled,
      type = "button",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isIconOnly = size === "icon" && !children;
    const resolvedSize = isIconOnly ? "icon" : size;

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          getFiButtonClassName({
            variant,
            size: resolvedSize,
            fullWidth,
            loading,
            className,
          }),
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...props}
      >
        {loading ? (
          <Loader2 className="fi-btn__spinner" aria-hidden />
        ) : null}
        <span className="fi-btn__label">
          {leftIcon ? (
            <span className="fi-btn__icon fi-btn__icon--leading" aria-hidden>
              {leftIcon}
            </span>
          ) : null}
          {children}
          {rightIcon ? (
            <span className="fi-btn__icon fi-btn__icon--trailing" aria-hidden>
              {rightIcon}
            </span>
          ) : null}
        </span>
      </Comp>
    );
  },
);

FiButton.displayName = "FiButton";
