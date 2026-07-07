import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { getSearchShortcutHint } from "@/app/search/hooks/useSearchKeyboardShortcut";

export type FiGlobalSearchTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const FiGlobalSearchTrigger = forwardRef<HTMLButtonElement, FiGlobalSearchTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("fi-global-search-trigger", className)}
      aria-label={`Open search (${getSearchShortcutHint()})`}
      {...props}
    >
      <Search aria-hidden />
    </button>
  ),
);

FiGlobalSearchTrigger.displayName = "FiGlobalSearchTrigger";
