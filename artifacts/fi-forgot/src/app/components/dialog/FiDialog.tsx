import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FiDialogSize, FiDialogVariant } from "@/app/components/dialog/dialogDomain";
import {
  getFiDialogClassName,
  getFiDialogPanelClassName,
} from "@/app/components/dialog/dialogVariants";

interface FiDialogContextValue {
  titleId: string;
  descriptionId: string;
  onClose?: () => void;
  dismissible: boolean;
}

const FiDialogContext = createContext<FiDialogContextValue | null>(null);

function useFiDialogContext(): FiDialogContextValue {
  const context = useContext(FiDialogContext);
  if (!context) {
    throw new Error("FiDialog compound components must be used within FiDialog");
  }
  return context;
}

export interface FiDialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, "open"> {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  variant?: FiDialogVariant;
  size?: FiDialogSize;
  alert?: boolean;
}

export const FiDialog = forwardRef<HTMLDialogElement, FiDialogProps>(
  (
    {
      open,
      onOpenChange,
      dismissible = true,
      variant = "information",
      size = "md",
      alert = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useImperativeHandle(ref, () => innerRef.current as HTMLDialogElement);

    useEffect(() => {
      const dialog = innerRef.current;
      if (!dialog) return;

      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open]);

    useEffect(() => {
      const dialog = innerRef.current;
      if (!dialog) return;

      const handleCancel = (event: Event) => {
        if (!dismissible) {
          event.preventDefault();
          return;
        }
        onOpenChange?.(false);
      };

      const handleClose = () => onOpenChange?.(false);

      dialog.addEventListener("cancel", handleCancel);
      dialog.addEventListener("close", handleClose);
      return () => {
        dialog.removeEventListener("cancel", handleCancel);
        dialog.removeEventListener("close", handleClose);
      };
    }, [dismissible, onOpenChange]);

    const handleClose = () => {
      if (!dismissible) return;
      onOpenChange?.(false);
      innerRef.current?.close();
    };

    return (
      <FiDialogContext.Provider
        value={{ titleId, descriptionId, onClose: handleClose, dismissible }}
      >
        <dialog
          ref={innerRef}
          className={cn(getFiDialogClassName({ variant, size, alert, className }))}
          role={alert ? "alertdialog" : "dialog"}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          {...props}
        >
          <div className={getFiDialogPanelClassName()}>{children}</div>
        </dialog>
      </FiDialogContext.Provider>
    );
  },
);

FiDialog.displayName = "FiDialog";

export const FiDialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-dialog__header", className)} {...props} />
  ),
);

FiDialogHeader.displayName = "FiDialogHeader";

export interface FiDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const FiDialogTitle = forwardRef<HTMLHeadingElement, FiDialogTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useFiDialogContext();
    return (
      <h2 ref={ref} id={titleId} className={cn("fi-dialog__title", className)} {...props} />
    );
  },
);

FiDialogTitle.displayName = "FiDialogTitle";

export const FiDialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId } = useFiDialogContext();
  return (
    <p ref={ref} id={descriptionId} className={cn("fi-dialog__description", className)} {...props} />
  );
});

FiDialogDescription.displayName = "FiDialogDescription";

export const FiDialogBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-dialog__body", className)} {...props} />
  ),
);

FiDialogBody.displayName = "FiDialogBody";

export const FiDialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-dialog__footer", className)} {...props} />
  ),
);

FiDialogFooter.displayName = "FiDialogFooter";

export interface FiDialogCloseProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const FiDialogClose = forwardRef<HTMLButtonElement, FiDialogCloseProps>(
  ({ label = "Close dialog", className, onClick, ...props }, ref) => {
    const { onClose, dismissible } = useFiDialogContext();
    if (!dismissible) return null;

    return (
      <button
        ref={ref}
        type="button"
        className={cn("fi-dialog__close", className)}
        aria-label={label}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) onClose?.();
        }}
        {...props}
      >
        <X aria-hidden />
      </button>
    );
  },
);

FiDialogClose.displayName = "FiDialogClose";
