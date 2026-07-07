import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { FiSearchHighlight } from "@/app/components/search/FiSearchHighlight";
import { getFiSearchResultItemClassName } from "@/app/components/search/searchVariants";

export interface FiSearchResultItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  id: string;
  label: string;
  description?: string;
  group?: string;
  query?: string;
  selected?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  onSelect?: () => void;
}

export const FiSearchResultItem = forwardRef<HTMLButtonElement, FiSearchResultItemProps>(
  (
    {
      id,
      label,
      description,
      group,
      query = "",
      selected = false,
      icon,
      action,
      onSelect,
      className,
      onClick,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(getFiSearchResultItemClassName({ selected, className }))}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSelect?.();
      }}
      {...props}
    >
      <span className="fi-search-result-item__label">
        {icon ? <span aria-hidden>{icon}</span> : null}
        {query ? <FiSearchHighlight text={label} query={query} /> : label}
      </span>
      {description ? (
        <span className="fi-search-result-item__description">
          {query ? <FiSearchHighlight text={description} query={query} /> : description}
        </span>
      ) : null}
      {group ? <span className="fi-search-result-item__group">{group}</span> : null}
      {action}
    </button>
  ),
);

FiSearchResultItem.displayName = "FiSearchResultItem";
