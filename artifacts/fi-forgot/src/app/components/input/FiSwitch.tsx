import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { motionUtilityClasses } from "@/app/design";

export interface FiSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
}

export function FiSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  className,
  id,
  onClick,
  ...props
}: FiSwitchProps) {
  const labelId = useId();
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const resolvedChecked = isControlled ? checked : internalChecked;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;

      const next = !resolvedChecked;
      if (!isControlled) setInternalChecked(next);
      onCheckedChange?.(next);
    },
    [disabled, isControlled, onClick, onCheckedChange, resolvedChecked],
  );

  return (
    <div className={cn("fi-switch", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={resolvedChecked}
        aria-labelledby={label ? labelId : undefined}
        disabled={disabled}
        className={cn("fi-switch__button", motionUtilityClasses.button, motionUtilityClasses.focus)}
        onClick={handleClick}
        {...props}
      >
        <span className="fi-switch__thumb" aria-hidden />
      </button>
      {label ? <span id={labelId} className="fi-switch__label">{label}</span> : null}
    </div>
  );
}
