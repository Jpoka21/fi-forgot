import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFiTextareaClassName,
  type FiInputState,
} from "@/app/components/input/inputVariants";
import { typographyUtilityClasses } from "@/app/design";

export interface FiTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: FiInputState;
  loading?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const FiTextarea = forwardRef<HTMLTextAreaElement, FiTextareaProps>(
  (
    {
      state = "default",
      loading = false,
      readOnly,
      disabled,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      className,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const currentLength = String(value ?? defaultValue ?? "").length;

    const textarea = (
      <textarea
        ref={ref}
        readOnly={readOnly}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-invalid={state === "error" || undefined}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={cn(
          getFiTextareaClassName({
            state,
            loading,
            readOnly: Boolean(readOnly),
            className,
          }),
        )}
        {...props}
      />
    );

    return (
      <>
        <div className={loading ? "fi-input-wrap" : undefined}>
          {textarea}
          {loading ? <Loader2 className="fi-input-wrap__spinner" aria-hidden /> : null}
        </div>
        {showCount && maxLength ? (
          <p className={typographyUtilityClasses.caption} aria-live="polite">
            {currentLength}/{maxLength}
          </p>
        ) : null}
      </>
    );
  },
);

FiTextarea.displayName = "FiTextarea";
