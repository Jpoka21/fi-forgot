import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiNotificationBadge } from "@/app/components/badge/FiBadge";
import {
  buildNavigationMenuLabel,
} from "@/app/components/navigation/accessibility";
import type { FiNotificationMenuItemData } from "@/app/components/navigation/navigationDomain";
import { getFiMenuPanelClassName } from "@/app/components/navigation/navigationVariants";

export interface FiNotificationMenuProps extends HTMLAttributes<HTMLDivElement> {
  items: FiNotificationMenuItemData[];
  unreadCount?: number;
  menuLabel?: string;
  emptyLabel?: string;
  onItemSelect?: (item: FiNotificationMenuItemData) => void;
}

export const FiNotificationMenu = forwardRef<HTMLDivElement, FiNotificationMenuProps>(
  (
    {
      items,
      unreadCount = 0,
      menuLabel = "Notifications",
      emptyLabel = "No notifications",
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

    const handleSelect = (item: FiNotificationMenuItemData) => {
      item.onSelect?.();
      onItemSelect?.(item);
      setOpen(false);
    };

    return (
      <div ref={ref} className={cn("fi-menu fi-notification-menu", className)} {...props}>
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
            <Bell aria-hidden />
            <FiNotificationBadge value={unreadCount} showZero={false} />
          </button>

          {open ? (
            <div
              id={menuId}
              role="menu"
              className={getFiMenuPanelClassName()}
              aria-label={menuLabel}
            >
              <div className="fi-menu-panel__header">{menuLabel}</div>
              {items.length === 0 ? (
                <p className="fi-menu-panel__empty">{emptyLabel}</p>
              ) : (
                <ul className="fi-menu-panel__list">
                  {items.map((item) => (
                    <li key={item.id} role="none">
                      {item.href ? (
                        <a
                          role="menuitem"
                          href={item.href}
                          className="fi-menu-panel__item"
                          onClick={() => handleSelect(item)}
                        >
                          {item.title}
                          {item.description ? (
                            <span className="fi-menu-panel__item-description">
                              {item.description}
                            </span>
                          ) : null}
                        </a>
                      ) : (
                        <button
                          type="button"
                          role="menuitem"
                          className="fi-menu-panel__item"
                          onClick={() => handleSelect(item)}
                        >
                          {item.title}
                          {item.description ? (
                            <span className="fi-menu-panel__item-description">
                              {item.description}
                            </span>
                          ) : null}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

FiNotificationMenu.displayName = "FiNotificationMenu";
