import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { FiButton } from "@/app/components/button/FiButton";
import { FiTextarea } from "@/app/components/input/FiTextarea";
import { timelineUiDefaults } from "@/app/components/timeline/timelineDomain";

export interface FiTimelineInlineEditProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
}

export function FiTimelineInlineEdit({
  initialValue,
  onSave,
  onCancel,
}: FiTimelineInlineEditProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const element = textareaRef.current;
    if (element) {
      element.selectionStart = element.selectionEnd = element.value.length;
    }
  }, []);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialValue) {
      onCancel();
      return;
    }

    setSaving(true);
    await onSave(trimmed);
    setSaving(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") onCancel();
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleSave();
    }
  };

  return (
    <div className="fi-timeline-inline-edit">
      <FiTextarea
        ref={textareaRef}
        value={value}
        rows={3}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="fi-timeline-item__actions">
        <FiButton
          variant="primary"
          size="sm"
          loading={saving}
          disabled={!value.trim()}
          onClick={() => void handleSave()}
        >
          {timelineUiDefaults.editSaveLabel}
        </FiButton>
        <FiButton variant="ghost" size="sm" disabled={saving} onClick={onCancel}>
          {timelineUiDefaults.editCancelLabel}
        </FiButton>
        <span className="fi-timeline-inline-edit__hint">{timelineUiDefaults.editHint}</span>
      </div>
    </div>
  );
}
