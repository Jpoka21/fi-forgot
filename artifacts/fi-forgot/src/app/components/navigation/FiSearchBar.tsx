import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/utils";
import { FiSearchInput } from "@/app/components/input/FiAutocomplete";
import { searchBarDefaults } from "@/app/components/navigation/navigationDomain";
import { getFiSearchBarClassName } from "@/app/components/navigation/navigationVariants";

export interface FiSearchBarProps extends ComponentPropsWithoutRef<typeof FiSearchInput> {
  wrapperClassName?: string;
}

export const FiSearchBar = forwardRef<HTMLInputElement, FiSearchBarProps>(
  (
    {
      wrapperClassName,
      className,
      placeholder = searchBarDefaults.placeholder,
      "aria-label": ariaLabel = searchBarDefaults.ariaLabel,
      ...props
    },
    ref,
  ) => (
    <div className={cn(getFiSearchBarClassName(wrapperClassName))}>
      <FiSearchInput
        ref={ref}
        className={className}
        placeholder={placeholder}
        aria-label={ariaLabel}
        {...props}
      />
    </div>
  ),
);

FiSearchBar.displayName = "FiSearchBar";
