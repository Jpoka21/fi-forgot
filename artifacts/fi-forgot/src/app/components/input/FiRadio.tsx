import {
  type ReactNode,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { motionUtilityClasses } from "@/app/design";

export interface FiRadioGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: ReactNode;
}

export function FiRadioGroup({
  legend,
  className,
  children,
  ...props
}: FiRadioGroupProps) {
  return (
    <fieldset className={cn("fi-radio-group", className)} {...props}>
      {legend ? <legend className="fi-radio-group__legend">{legend}</legend> : null}
      {children}
    </fieldset>
  );
}

export interface FiRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function FiRadio({ label, disabled, className, id, ...props }: FiRadioProps) {
  return (
    <label className={cn("fi-radio", disabled && "fi-checkbox--disabled")} htmlFor={id}>
      <input
        id={id}
        type="radio"
        disabled={disabled}
        className={cn("fi-radio__control", motionUtilityClasses.focus, className)}
        {...props}
      />
      <span className="fi-radio__label">{label}</span>
    </label>
  );
}
