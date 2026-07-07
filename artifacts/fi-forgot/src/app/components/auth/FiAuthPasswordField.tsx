import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { FiField } from "@/app/components/input/FiField";
import { FiInput } from "@/app/components/input/FiInput";
import { cn } from "@/lib/utils";

export interface FiAuthPasswordFieldProps {
  id: string;
  label: string;
  errorText?: string;
  helperText?: string;
  autoComplete?: "current-password" | "new-password";
  placeholder?: string;
  "data-testid"?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export const FiAuthPasswordField = forwardRef<HTMLInputElement, FiAuthPasswordFieldProps>(
  (
    {
      id,
      label,
      errorText,
      helperText,
      autoComplete = "current-password",
      placeholder = "••••••••",
      "data-testid": dataTestId,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);

    return (
      <FiField label={label} htmlFor={id} errorText={errorText} helperText={helperText}>
        <div className="fi-auth-password">
          <FiInput
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            data-testid={dataTestId}
            className={cn("fi-auth-password__input")}
            state={errorText ? "error" : "default"}
            {...props}
          />
          <button
            type="button"
            className="fi-auth-password__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            <span className="sr-only">{visible ? "Hide" : "Show"}</span>
          </button>
        </div>
      </FiField>
    );
  },
);

FiAuthPasswordField.displayName = "FiAuthPasswordField";
