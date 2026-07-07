import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { motionUtilityClasses } from "@/app/design";

export interface FiSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  min?: number;
  max?: number;
  step?: number;
}

export const FiSlider = forwardRef<HTMLInputElement, FiSliderProps>(
  ({ className, min = 0, max = 100, step = 1, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      className={cn("fi-slider", motionUtilityClasses.input, motionUtilityClasses.focus, className)}
      {...props}
    />
  ),
);

FiSlider.displayName = "FiSlider";
