import { forwardRef, type InputHTMLAttributes } from "react";
import { Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFiInputClassName,
  type FiInputState,
} from "@/app/components/input/inputVariants";

export type FiInputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "date"
  | "search"
  | "url"
  | "number";

export interface FiInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: FiInputType;
  state?: FiInputState;
  loading?: boolean;
}

export const FiInput = forwardRef<HTMLInputElement, FiInputProps>(
  (
    {
      type = "text",
      state = "default",
      loading = false,
      readOnly,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isSearch = type === "search";
    const inputClassName = getFiInputClassName({
      state,
      loading,
      readOnly: Boolean(readOnly),
      search: isSearch,
      className,
    });

    const input = (
      <input
        ref={ref}
        type={type}
        readOnly={readOnly}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-invalid={state === "error" || undefined}
        className={cn(inputClassName)}
        {...props}
      />
    );

    if (!isSearch && !loading) return input;

    return (
      <div className="fi-input-wrap">
        {isSearch ? (
          <Search className="fi-input-wrap__icon fi-input-wrap__icon--leading" aria-hidden />
        ) : null}
        {input}
        {loading ? (
          <Loader2 className="fi-input-wrap__spinner" aria-hidden />
        ) : null}
      </div>
    );
  },
);

FiInput.displayName = "FiInput";
