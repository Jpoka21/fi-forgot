import {
  forwardRef,
  useEffect,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  commandPaletteDefaults,
  type FiCommandPaletteItemData,
} from "@/app/components/navigation/navigationDomain";
import { getFiCommandPaletteClassName } from "@/app/components/navigation/navigationVariants";

export interface FiCommandPaletteProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  items?: FiCommandPaletteItemData[];
  selectedId?: string;
  onItemSelect?: (item: FiCommandPaletteItemData) => void;
  placeholder?: string;
  emptyLabel?: string;
  hint?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;
}

export const FiCommandPalette = forwardRef<HTMLDivElement, FiCommandPaletteProps>(
  (
    {
      open,
      onOpenChange,
      query = "",
      onQueryChange,
      items = [],
      selectedId,
      onItemSelect,
      placeholder = commandPaletteDefaults.placeholder,
      emptyLabel = commandPaletteDefaults.emptyLabel,
      hint = commandPaletteDefaults.shortcutHint,
      inputProps,
      className,
      ...props
    },
    ref,
  ) => {
    const dialogId = useId();
    const titleId = useId();

    useEffect(() => {
      if (!open) return;
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") onOpenChange?.(false);
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [open, onOpenChange]);

    if (!open) return null;

    const groups = items.reduce<Record<string, FiCommandPaletteItemData[]>>((acc, item) => {
      const key = item.group ?? "Results";
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});

    return (
      <div
        ref={ref}
        className="fi-command-palette-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onOpenChange?.(false);
        }}
        {...props}
      >
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(getFiCommandPaletteClassName(className))}
        >
          <span id={titleId} className="sr-only">
            Command palette
          </span>
          <div className="fi-command-palette__input-wrap">
            <Search aria-hidden />
            <input
              {...inputProps}
              className="fi-command-palette__input"
              value={query}
              placeholder={placeholder}
              aria-label={placeholder}
              autoFocus
              onChange={(event) => onQueryChange?.(event.target.value)}
            />
          </div>

          <div className="fi-command-palette__list" role="listbox" aria-label="Search results">
            {items.length === 0 ? (
              <p className="fi-command-palette__empty">{emptyLabel}</p>
            ) : (
              Object.entries(groups).map(([group, groupItems]) => (
                <div key={group}>
                  <p className="fi-command-palette__group-label">{group}</p>
                  {groupItems.map((item) => (
                    <FiCommandPaletteItemButton
                      key={item.id}
                      item={item}
                      selected={selectedId === item.id}
                      onSelect={() => {
                        onItemSelect?.(item);
                        onOpenChange?.(false);
                      }}
                    />
                  ))}
                </div>
              ))
            )}
          </div>

          {hint ? <p className="fi-command-palette__hint">{hint}</p> : null}
        </div>
      </div>
    );
  },
);

FiCommandPalette.displayName = "FiCommandPalette";

function FiCommandPaletteItemButton({
  item,
  selected,
  onSelect,
}: {
  item: FiCommandPaletteItemData;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className="fi-command-palette__item"
      onClick={onSelect}
    >
      <span className="fi-command-palette__item-label">{item.label}</span>
      {item.description ? (
        <span className="fi-command-palette__item-description">{item.description}</span>
      ) : null}
    </button>
  );
}

export interface FiCommandPaletteItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  selected?: boolean;
}

export const FiCommandPaletteItem = forwardRef<HTMLButtonElement, FiCommandPaletteItemProps>(
  ({ label, description, selected = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      className={cn("fi-command-palette__item", className)}
      {...props}
    >
      <span className="fi-command-palette__item-label">{label}</span>
      {description ? (
        <span className="fi-command-palette__item-description">{description}</span>
      ) : null}
    </button>
  ),
);

FiCommandPaletteItem.displayName = "FiCommandPaletteItem";
