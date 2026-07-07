export {
  FiDialog,
  FiDialogBody,
  FiDialogClose,
  FiDialogDescription,
  FiDialogFooter,
  FiDialogHeader,
  FiDialogTitle,
} from "@/app/components/dialog/FiDialog";
export type {
  FiDialogCloseProps,
  FiDialogProps,
  FiDialogTitleProps,
} from "@/app/components/dialog/FiDialog";

export {
  FiConfirmationDialog,
  FiDeleteDialog,
  FiErrorDialog,
  FiFormDialog,
  FiInformationDialog,
  FiLoadingDialog,
  FiUpgradeDialog,
} from "@/app/components/dialog/FiDialogPresets";
export type {
  FiConfirmationDialogProps,
  FiDeleteDialogProps,
  FiErrorDialogProps,
  FiFormDialogProps,
  FiInformationDialogProps,
  FiLoadingDialogProps,
  FiUpgradeDialogProps,
} from "@/app/components/dialog/FiDialogPresets";

export {
  confirmationDialogDefaults,
  deleteDialogDefaults,
  errorDialogDefaults,
  fiDialogSizes,
  fiDialogVariants,
  formDialogDefaults,
  informationDialogDefaults,
  loadingDialogDefaults,
  upgradeDialogDefaults,
} from "@/app/components/dialog/dialogDomain";
export type { FiDialogSize, FiDialogVariant } from "@/app/components/dialog/dialogDomain";

export {
  fiDialogSizeClasses,
  fiDialogVariantClasses,
  getFiDialogClassName,
  getFiDialogPanelClassName,
} from "@/app/components/dialog/dialogVariants";

export {
  buildDialogAriaLabel,
  dialogAccessibility,
  dialogAccessibilityChecks,
  verifyDialogAccessibility,
} from "@/app/components/dialog/accessibility";
