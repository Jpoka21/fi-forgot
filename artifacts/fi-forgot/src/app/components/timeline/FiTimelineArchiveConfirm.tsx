import { FiConfirmationDialog } from "@/app/components/dialog/FiDialogPresets";
import { timelineUiDefaults } from "@/app/components/timeline/timelineDomain";

export interface FiTimelineArchiveConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function FiTimelineArchiveConfirm({
  open,
  onConfirm,
  onOpenChange,
}: FiTimelineArchiveConfirmProps) {
  return (
    <FiConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={timelineUiDefaults.archiveTitle}
      description={timelineUiDefaults.archiveDescription}
      confirmLabel={timelineUiDefaults.archiveConfirmLabel}
      cancelLabel={timelineUiDefaults.archiveCancelLabel}
      onConfirm={onConfirm}
    />
  );
}
