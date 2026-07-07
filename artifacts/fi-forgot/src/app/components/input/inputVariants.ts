import { motionUtilityClasses } from "@/app/design";

export const fiInputStates = ["default", "success", "error"] as const;

export type FiInputState = (typeof fiInputStates)[number];

const controlMotion = `${motionUtilityClasses.input} ${motionUtilityClasses.focus}`;

export const fiInputStateClasses: Record<FiInputState, string> = {
  default: "",
  success: "fi-input--success",
  error: "fi-input--error",
};

export const fiTextareaStateClasses: Record<FiInputState, string> = {
  default: "",
  success: "fi-textarea--success",
  error: "fi-textarea--error",
};

export const fiSelectStateClasses: Record<FiInputState, string> = {
  default: "",
  success: "fi-select--success",
  error: "fi-select--error",
};

export function getFiInputClassName(options: {
  state?: FiInputState;
  loading?: boolean;
  readOnly?: boolean;
  search?: boolean;
  className?: string;
}): string {
  const { state = "default", loading = false, readOnly = false, search = false, className = "" } = options;

  return [
    "fi-input",
    controlMotion,
    fiInputStateClasses[state],
    loading ? "fi-input--loading" : "",
    readOnly ? "fi-input--readonly" : "",
    search ? "fi-input--search" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiTextareaClassName(options: {
  state?: FiInputState;
  loading?: boolean;
  readOnly?: boolean;
  className?: string;
}): string {
  const { state = "default", loading = false, readOnly = false, className = "" } = options;

  return [
    "fi-textarea",
    controlMotion,
    fiTextareaStateClasses[state],
    loading ? "fi-textarea--loading" : "",
    readOnly ? "fi-textarea--readonly" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiSelectClassName(options: {
  state?: FiInputState;
  loading?: boolean;
  multiple?: boolean;
  className?: string;
}): string {
  const { state = "default", loading = false, multiple = false, className = "" } = options;

  return [
    "fi-select",
    controlMotion,
    fiSelectStateClasses[state],
    loading ? "fi-select--loading" : "",
    multiple ? "fi-select--multiple" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
