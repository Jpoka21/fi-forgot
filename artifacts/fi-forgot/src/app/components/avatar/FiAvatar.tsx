import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from "react";
import { Upload, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { avatarPalette, personInitials } from "@/lib/personal-brand";
import {
  getFiAvatarClassName,
  type FiAvatarSize,
  type FiAvatarStatus,
  type FiAvatarVariant,
} from "@/app/components/avatar/avatarVariants";

export interface FiAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  name?: string;
  size?: FiAvatarSize;
  variant?: FiAvatarVariant;
  status?: FiAvatarStatus;
  loading?: boolean;
  uploading?: boolean;
}

type ImageLoadState = "idle" | "loading" | "loaded" | "error";

export const FiAvatar = forwardRef<HTMLDivElement, FiAvatarProps>(
  (
    {
      src,
      alt,
      name = "",
      size = "md",
      variant = "user",
      status = "none",
      loading = false,
      uploading = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [imageState, setImageState] = useState<ImageLoadState>(src ? "loading" : "error");

    useEffect(() => {
      setImageState(src ? "loading" : "error");
    }, [src]);

    const initials = useMemo(() => personInitials(name), [name]);
    const palette = useMemo(() => avatarPalette(name || alt), [name, alt]);
    const showPhoto = Boolean(src) && imageState === "loaded" && !loading;
    const showInitials = !showPhoto && !loading && initials.length > 0 && variant !== "concierge";
    const showConciergeMark = variant === "concierge" && !showPhoto && !loading;
    const showPlaceholder = !showPhoto && !showInitials && !showConciergeMark && !loading;

    const initialsStyle = showInitials
      ? { backgroundColor: palette.bg, color: palette.fg }
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          getFiAvatarClassName({ size, variant, loading, uploading, className }),
        )}
        style={style}
        aria-label={showPhoto ? undefined : alt}
        aria-busy={loading || uploading || undefined}
        {...props}
      >
        {showPhoto ? (
          <img
            src={src ?? undefined}
            alt={alt}
            className="fi-avatar__image"
            onLoad={() => setImageState("loaded")}
            onError={() => setImageState("error")}
          />
        ) : null}

        {showInitials ? (
          <span className="fi-avatar__initials" style={initialsStyle} aria-hidden>
            {initials}
          </span>
        ) : null}

        {showConciergeMark ? (
          <span className="fi-avatar__initials" aria-hidden>
            FI
          </span>
        ) : null}

        {showPlaceholder ? (
          <span className="fi-avatar__placeholder" aria-hidden>
            <User className="fi-avatar__placeholder-icon" />
          </span>
        ) : null}

        {uploading ? (
          <span className="fi-avatar__upload-overlay" aria-hidden>
            <Upload className="fi-avatar__upload-icon" />
          </span>
        ) : null}

        {status !== "none" ? (
          <span
            className={cn("fi-avatar__status", `fi-avatar__status--${status}`)}
            aria-hidden
          />
        ) : null}
      </div>
    );
  },
);

FiAvatar.displayName = "FiAvatar";

export const FiUserAvatar = forwardRef<HTMLDivElement, Omit<FiAvatarProps, "variant">>(
  (props, ref) => <FiAvatar ref={ref} variant="user" {...props} />,
);
FiUserAvatar.displayName = "FiUserAvatar";

export const FiRecipientAvatar = forwardRef<HTMLDivElement, Omit<FiAvatarProps, "variant">>(
  (props, ref) => <FiAvatar ref={ref} variant="recipient" {...props} />,
);
FiRecipientAvatar.displayName = "FiRecipientAvatar";

export const FiInitialAvatar = forwardRef<HTMLDivElement, Omit<FiAvatarProps, "variant">>(
  (props, ref) => <FiAvatar ref={ref} variant="initial" {...props} />,
);
FiInitialAvatar.displayName = "FiInitialAvatar";

export const FiConciergeAvatar = forwardRef<HTMLDivElement, Omit<FiAvatarProps, "variant">>(
  ({ alt = "F.I. Forgot concierge", ...props }, ref) => (
    <FiAvatar ref={ref} variant="concierge" alt={alt} {...props} />
  ),
);
FiConciergeAvatar.displayName = "FiConciergeAvatar";

export const FiSystemAvatar = forwardRef<HTMLDivElement, Omit<FiAvatarProps, "variant">>(
  (props, ref) => <FiAvatar ref={ref} variant="system" {...props} />,
);
FiSystemAvatar.displayName = "FiSystemAvatar";
