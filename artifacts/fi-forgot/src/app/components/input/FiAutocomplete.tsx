import { forwardRef, useId } from "react";

import { FiInput, type FiInputProps } from "@/app/components/input/FiInput";

export interface FiAutocompleteOption {
  value: string;
  label?: string;
}

export interface FiAutocompleteProps extends Omit<FiInputProps, "list"> {
  options: FiAutocompleteOption[];
  listId?: string;
}

export const FiAutocomplete = forwardRef<HTMLInputElement, FiAutocompleteProps>(
  ({ options, listId, ...props }, ref) => {
    const generatedId = useId();
    const resolvedListId = listId ?? generatedId;

    return (
      <>
        <FiInput ref={ref} list={resolvedListId} autoComplete="off" {...props} />
        <datalist id={resolvedListId}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
      </>
    );
  },
);

FiAutocomplete.displayName = "FiAutocomplete";

export type FiSearchInputProps = Omit<FiInputProps, "type">;

export const FiSearchInput = forwardRef<HTMLInputElement, FiSearchInputProps>(
  (props, ref) => <FiInput ref={ref} type="search" {...props} />,
);

FiSearchInput.displayName = "FiSearchInput";

export type FiEmailInputProps = Omit<FiInputProps, "type">;
export const FiEmailInput = forwardRef<HTMLInputElement, FiEmailInputProps>(
  (props, ref) => <FiInput ref={ref} type="email" autoComplete="email" {...props} />,
);
FiEmailInput.displayName = "FiEmailInput";

export type FiPasswordInputProps = Omit<FiInputProps, "type">;
export const FiPasswordInput = forwardRef<HTMLInputElement, FiPasswordInputProps>(
  (props, ref) => <FiInput ref={ref} type="password" autoComplete="current-password" {...props} />,
);
FiPasswordInput.displayName = "FiPasswordInput";

export type FiPhoneInputProps = Omit<FiInputProps, "type">;
export const FiPhoneInput = forwardRef<HTMLInputElement, FiPhoneInputProps>(
  (props, ref) => <FiInput ref={ref} type="tel" autoComplete="tel" {...props} />,
);
FiPhoneInput.displayName = "FiPhoneInput";

export type FiDateInputProps = Omit<FiInputProps, "type">;
export const FiDateInput = forwardRef<HTMLInputElement, FiDateInputProps>(
  (props, ref) => <FiInput ref={ref} type="date" {...props} />,
);
FiDateInput.displayName = "FiDateInput";
