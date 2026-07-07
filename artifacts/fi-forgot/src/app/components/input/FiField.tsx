import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { buildDescribedBy } from "@/app/components/input/accessibility";
import { typographyUtilityClasses } from "@/app/design";

export interface FiFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  htmlFor?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

function mergeDescribedBy(existing: string | undefined, next: string | undefined): string | undefined {
  if (!next) return existing;
  if (!existing) return next;
  const parts = new Set(`${existing} ${next}`.split(/\s+/));
  return [...parts].join(" ");
}

export function FiField({
  label,
  htmlFor,
  helperText,
  errorText,
  required = false,
  children,
  className,
  ...props
}: FiFieldProps) {
  const helperId = useId();
  const errorId = useId();
  const describedBy = buildDescribedBy(
    helperText ? helperId : undefined,
    errorText ? errorId : undefined,
  );

  const enhancedChild = Children.map(children, (child) => {
    if (!isValidElement(child) || !describedBy) return child;

    const element = child as ReactElement<{ "aria-describedby"?: string }>;
    return cloneElement(element, {
      "aria-describedby": mergeDescribedBy(element.props["aria-describedby"], describedBy),
    });
  });

  return (
    <div className={cn("fi-field", className)} {...props}>
      {label ? (
        // eslint-disable-next-line jsx-a11y/label-has-for -- associates external control via htmlFor
        <label
          className={cn("fi-field__label", typographyUtilityClasses.label)}
          htmlFor={htmlFor}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {enhancedChild}
      {helperText ? (
        <p id={helperId} className={cn("fi-field__helper", typographyUtilityClasses.helper)}>
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className={cn("fi-field__error", typographyUtilityClasses.error)} role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

export function useFiFieldIds() {
  const helperId = useId();
  const errorId = useId();
  return { helperId, errorId };
}

export function useFiFieldDescribedBy(helperId?: string, errorId?: string, extra?: string) {
  return buildDescribedBy(helperId, errorId, extra);
}
