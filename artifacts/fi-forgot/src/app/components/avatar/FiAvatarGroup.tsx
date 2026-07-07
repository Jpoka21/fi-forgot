import { cn } from "@/lib/utils";
import {
  FiAvatar,
  type FiAvatarProps,
} from "@/app/components/avatar/FiAvatar";
import {
  avatarAccessibility,
  formatAvatarOverflowCount,
} from "@/app/components/avatar/accessibility";
import {
  getFiAvatarGroupOverflowClassName,
  type FiAvatarSize,
} from "@/app/components/avatar/avatarVariants";

export type FiAvatarGroupItem = Pick<FiAvatarProps, "src" | "alt" | "name">;

export interface FiAvatarGroupProps {
  items: FiAvatarGroupItem[];
  size?: FiAvatarSize;
  maxVisible?: number;
  className?: string;
  overflowLabel?: string;
}

export function FiAvatarGroup({
  items,
  size = "md",
  maxVisible = avatarAccessibility.maxGroupVisible,
  className,
  overflowLabel,
}: FiAvatarGroupProps) {
  const visibleItems = items.slice(0, maxVisible);
  const remaining = Math.max(items.length - maxVisible, 0);
  const overflowText = overflowLabel ?? `${formatAvatarOverflowCount(remaining)} more`;

  return (
    <div
      className={cn("fi-avatar-group", className)}
      aria-label={remaining > 0 ? `${items.length} people` : undefined}
    >
      {visibleItems.map((item, index) => (
        <FiAvatar
          key={`${item.alt}-${index}`}
          {...item}
          size={size}
          variant="recipient"
          className="fi-avatar-group__item"
        />
      ))}
      {remaining > 0 ? (
        <span
          className={getFiAvatarGroupOverflowClassName(size)}
          aria-label={overflowText}
          title={overflowText}
        >
          {formatAvatarOverflowCount(remaining)}
        </span>
      ) : null}
    </div>
  );
}
