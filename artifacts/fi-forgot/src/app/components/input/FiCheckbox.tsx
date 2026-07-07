import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { motionUtilityClasses } from "@/app/design";

export interface FiCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  indeterminate?: boolean;
}

export const FiCheckbox = forwardRef<HTMLInputElement, FiCheckboxProps>(
  ({ label, indeterminate = false, disabled, className, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const localRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      const node = localRef.current;
      if (node) node.indeterminate = indeterminate;
    }, [indeterminate]);

    const control = (
      <input
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        type="checkbox"
        disabled={disabled}
        className={cn("fi-checkbox__control", motionUtilityClasses.focus, className)}
        {...props}
      />
    );

    if (!label) return control;

    return (
      // eslint-disable-next-line jsx-a11y/label-has-for -- nested input with explicit id
      <label
        className={cn("fi-checkbox", disabled && "fi-checkbox--disabled", motionUtilityClasses.input)}
        htmlFor={id}
      >
        {control}
        <span className="fi-checkbox__label">{label}</span>
      </label>
    );
  },
);

FiCheckbox.displayName = "FiCheckbox";
