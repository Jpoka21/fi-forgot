import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiUserAvatar } from "@/app/components/avatar/FiAvatar";
import {
  buildNavigationMenuLabel,
} from "@/app/components/navigation/accessibility";
import type { FiUserMenuItemData } from "@/app/components/navigation/navigationDomain";
import { getFiMenuPanelClassName } from "@/app/components/navigation/navigationVariants";

export interface FiUserMenuProps extends HTMLAttributes<HTMLDivElement> {
  userName: string;
  userEmail?: string;
  avatarSrc?: string | null;
  items: FiUserMenuItemData[];
  menuLabel?: string;
  onItemSelect?: (item: FiUserMenuItemData) => void;
}

export const FiUserMenu = forwardRef<HTMLDivElement, FiUserMenuProps>(
  (
    {
      userName,
      userEmail,
      avatarSrc,
      items,
      menuLabel = "Account menu",
      onItemSelect,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
      const handlePointer = (event: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", handlePointer);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handlePointer);
        document.removeEventListener("keydown", handleKey);
      };
    }, []);

    const handleSelect = (item: FiUserMenuItemData) => {
      item.onSelect?.();
      onItemSelect?.(item);
      setOpen(false);
    };

    return (
      <div ref={ref} className={cn("fi-menu fi-user-menu", className)} {...props}>
        <div ref={rootRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="fi-menu__trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={buildNavigationMenuLabel(menuLabel, open)}
            onClick={() => setOpen((value) => !value)}
          >
            <FiUserAvatar src={avatarSrc} alt={userName} name={userName} size="sm" />
            <span>{userName}</span>
            <ChevronDown aria-hidden />
          </button>

          {open ? (
            <div
              id={menuId}
              role="menu"
              className={getFiMenuPanelClassName()}
              aria-label={menuLabel}
            >
              {userEmail ? (
                <div className="fi-menu-panel__header">{userEmail}</div>
              ) : null}
              <ul className="fi-menu-panel__list">
                {items.map((item) => (
                  <li key={item.id} role="none">
                    {item.href ? (
                      <a
                        role="menuitem"
                        href={item.href}
                        className={cn(
                          "fi-menu-panel__item",
                          item.destructive ? "fi-menu-panel__item--destructive" : "",
                        )}
                        onClick={() => handleSelect(item)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        className={cn(
                          "fi-menu-panel__item",
                          item.destructive ? "fi-menu-panel__item--destructive" : "",
                        )}
                        onClick={() => handleSelect(item)}
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

FiUserMenu.displayName = "FiUserMenu";

export type FiUserMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactNode;
};

export const FiUserMenuTrigger = forwardRef<HTMLButtonElement, FiUserMenuTriggerProps>(
  ({ label, className, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("fi-menu__trigger", className)} {...props}>
      {label}
    </button>
  ),
);

FiUserMenuTrigger.displayName = "FiUserMenuTrigger";
