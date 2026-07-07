import { type ReactNode } from "react";

import { FiButton } from "@/app/components/button/FiButton";
import { FiLoadingIndicator } from "@/app/components/feedback/FiLoadingIndicator";
import {
  FiDialog,
  FiDialogBody,
  FiDialogClose,
  FiDialogDescription,
  FiDialogFooter,
  FiDialogHeader,
  FiDialogTitle,
  type FiDialogProps,
} from "@/app/components/dialog/FiDialog";
import {
  confirmationDialogDefaults,
  deleteDialogDefaults,
  errorDialogDefaults,
  formDialogDefaults,
  informationDialogDefaults,
  loadingDialogDefaults,
  upgradeDialogDefaults,
} from "@/app/components/dialog/dialogDomain";

type FiPresetDialogProps = Omit<FiDialogProps, "variant" | "alert" | "children" | "title">;

export interface FiConfirmationDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
}

export function FiConfirmationDialog({
  title = confirmationDialogDefaults.title,
  description = confirmationDialogDefaults.description,
  confirmLabel = confirmationDialogDefaults.confirmLabel,
  cancelLabel = confirmationDialogDefaults.cancelLabel,
  onConfirm,
  confirmLoading = false,
  dismissible = true,
  onOpenChange,
  ...props
}: FiConfirmationDialogProps) {
  return (
    <FiDialog
      variant="confirmation"
      alert
      dismissible={dismissible}
      onOpenChange={onOpenChange}
      {...props}
    >
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogFooter>
        <FiButton variant="secondary" onClick={() => onOpenChange?.(false)}>
          {cancelLabel}
        </FiButton>
        <FiButton
          variant="primary"
          loading={confirmLoading}
          onClick={() => {
            onConfirm?.();
            onOpenChange?.(false);
          }}
        >
          {confirmLabel}
        </FiButton>
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiInformationDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  closeLabel?: string;
}

export function FiInformationDialog({
  title = informationDialogDefaults.title,
  description,
  closeLabel = informationDialogDefaults.closeLabel,
  onOpenChange,
  ...props
}: FiInformationDialogProps) {
  return (
    <FiDialog variant="information" onOpenChange={onOpenChange} {...props}>
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogFooter>
        <FiButton variant="primary" onClick={() => onOpenChange?.(false)}>
          {closeLabel}
        </FiButton>
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiFormDialogProps extends FiPresetDialogProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void;
  submitLoading?: boolean;
}

export function FiFormDialog({
  title,
  description,
  children,
  submitLabel = formDialogDefaults.submitLabel,
  cancelLabel = formDialogDefaults.cancelLabel,
  onSubmit,
  submitLoading = false,
  onOpenChange,
  ...props
}: FiFormDialogProps) {
  return (
    <FiDialog variant="form" onOpenChange={onOpenChange} {...props}>
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogBody>{children}</FiDialogBody>
      <FiDialogFooter>
        <FiButton variant="secondary" onClick={() => onOpenChange?.(false)}>
          {cancelLabel}
        </FiButton>
        <FiButton variant="primary" loading={submitLoading} onClick={onSubmit}>
          {submitLabel}
        </FiButton>
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiDeleteDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
}

export function FiDeleteDialog({
  title = deleteDialogDefaults.title,
  description = deleteDialogDefaults.description,
  confirmLabel = deleteDialogDefaults.confirmLabel,
  cancelLabel = deleteDialogDefaults.cancelLabel,
  onConfirm,
  confirmLoading = false,
  dismissible = true,
  onOpenChange,
  ...props
}: FiDeleteDialogProps) {
  return (
    <FiDialog
      variant="delete"
      alert
      dismissible={dismissible}
      onOpenChange={onOpenChange}
      {...props}
    >
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogFooter>
        <FiButton variant="secondary" onClick={() => onOpenChange?.(false)}>
          {cancelLabel}
        </FiButton>
        <FiButton
          variant="danger"
          loading={confirmLoading}
          onClick={() => {
            onConfirm?.();
            onOpenChange?.(false);
          }}
        >
          {confirmLabel}
        </FiButton>
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiUpgradeDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onUpgrade?: () => void;
}

export function FiUpgradeDialog({
  title = upgradeDialogDefaults.title,
  description = upgradeDialogDefaults.description,
  confirmLabel = upgradeDialogDefaults.confirmLabel,
  cancelLabel = upgradeDialogDefaults.cancelLabel,
  onUpgrade,
  onOpenChange,
  ...props
}: FiUpgradeDialogProps) {
  return (
    <FiDialog variant="upgrade" onOpenChange={onOpenChange} {...props}>
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogFooter>
        <FiButton variant="ghost" onClick={() => onOpenChange?.(false)}>
          {cancelLabel}
        </FiButton>
        <FiButton
          variant="primary"
          onClick={() => {
            onUpgrade?.();
            onOpenChange?.(false);
          }}
        >
          {confirmLabel}
        </FiButton>
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiErrorDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  closeLabel?: string;
  onRetry?: () => void;
}

export function FiErrorDialog({
  title = errorDialogDefaults.title,
  description = errorDialogDefaults.description,
  retryLabel = errorDialogDefaults.retryLabel,
  closeLabel = errorDialogDefaults.closeLabel,
  onRetry,
  onOpenChange,
  ...props
}: FiErrorDialogProps) {
  return (
    <FiDialog variant="error" alert onOpenChange={onOpenChange} {...props}>
      <FiDialogClose />
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogFooter>
        <FiButton variant="secondary" onClick={() => onOpenChange?.(false)}>
          {closeLabel}
        </FiButton>
        {onRetry ? (
          <FiButton variant="primary" onClick={onRetry}>
            {retryLabel}
          </FiButton>
        ) : null}
      </FiDialogFooter>
    </FiDialog>
  );
}

export interface FiLoadingDialogProps extends FiPresetDialogProps {
  title?: ReactNode;
  description?: ReactNode;
  loadingLabel?: string;
}

export function FiLoadingDialog({
  title = loadingDialogDefaults.title,
  description = loadingDialogDefaults.description,
  loadingLabel,
  dismissible = false,
  onOpenChange,
  ...props
}: FiLoadingDialogProps) {
  return (
    <FiDialog
      variant="loading"
      dismissible={dismissible}
      onOpenChange={onOpenChange}
      aria-busy
      {...props}
    >
      <FiDialogHeader>
        <FiDialogTitle>{title}</FiDialogTitle>
        {description ? <FiDialogDescription>{description}</FiDialogDescription> : null}
      </FiDialogHeader>
      <FiDialogBody>
        <FiLoadingIndicator label={loadingLabel ?? String(title)} showLabel />
      </FiDialogBody>
    </FiDialog>
  );
}
