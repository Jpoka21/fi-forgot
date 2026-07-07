import { forwardRef, type SelectHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFiSelectClassName,
  type FiInputState,
} from "@/app/components/input/inputVariants";

export interface FiSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  state?: FiInputState;
  loading?: boolean;
}

export const FiSelect = forwardRef<HTMLSelectElement, FiSelectProps>(
  (
    {
      state = "default",
      loading = false,
      disabled,
      multiple,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <div className={loading ? "fi-input-wrap" : undefined}>
        <select
          ref={ref}
          multiple={multiple}
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          aria-busy={loading || undefined}
          aria-invalid={state === "error" || undefined}
          className={cn(
            getFiSelectClassName({
              state,
              loading,
              multiple: Boolean(multiple),
              className,
            }),
          )}
          {...props}
        >
          {children}
        </select>
        {loading ? <Loader2 className="fi-input-wrap__spinner" aria-hidden /> : null}
      </div>
    );
  },
);

FiSelect.displayName = "FiSelect";

export interface FiMultiSelectProps extends FiSelectProps {
  multiple: true;
}

export const FiMultiSelect = forwardRef<HTMLSelectElement, FiMultiSelectProps>(
  (props, ref) => <FiSelect ref={ref} {...props} />,
);

FiMultiSelect.displayName = "FiMultiSelect";
