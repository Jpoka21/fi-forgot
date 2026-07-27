import { useId, useState } from "react";
import { FiButton } from "@/app/components/button/FiButton";
import {
  FiDialog,
  FiDialogBody,
  FiDialogDescription,
  FiDialogFooter,
  FiDialogHeader,
  FiDialogTitle,
} from "@/app/components/dialog/FiDialog";
import { FiField } from "@/app/components/input/FiField";
import { FiInput } from "@/app/components/input/FiInput";
import { FiTextarea } from "@/app/components/input/FiTextarea";
import { studioArtworkSlotService } from "@/app/api/services/studioArtworkSlotService";
import {
  ARTWORK_SLOT_QUANTITY_DEFAULT,
} from "@/app/studio/artworkSlotsConstants";
import {
  EMPTY_CREATE_ARTWORK_SLOT_FORM,
  artworkSlotsDefaults,
  buildCreateArtworkSlotPayload,
  validateCreateArtworkSlotForm,
  type CreateArtworkSlotFieldErrors,
  type CreateArtworkSlotFormValues,
  type StudioArtworkSlot,
} from "@/app/studio/artworkSlotsDomain";

export interface AddArtworkSlotDialogProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (slot: StudioArtworkSlot) => void;
}

export function AddArtworkSlotDialog({
  collectionId,
  open,
  onOpenChange,
  onCreated,
}: AddArtworkSlotDialogProps) {
  const nameId = useId();
  const briefId = useId();
  const quantityId = useId();

  const [values, setValues] = useState<CreateArtworkSlotFormValues>(EMPTY_CREATE_ARTWORK_SLOT_FORM);
  const [fieldErrors, setFieldErrors] = useState<CreateArtworkSlotFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setValues(EMPTY_CREATE_ARTWORK_SLOT_FORM);
    setFieldErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && !submitting) {
      resetForm();
    }
    onOpenChange(next);
  }

  function updateField<K extends keyof CreateArtworkSlotFormValues>(
    key: K,
    value: CreateArtworkSlotFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const validation = validateCreateArtworkSlotForm(values);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await studioArtworkSlotService.create(
      collectionId,
      buildCreateArtworkSlotPayload(values),
    );

    if (!result.ok) {
      const message =
        result.data && typeof result.data === "object" && "error" in result.data
          ? String((result.data as { error: string }).error)
          : "Could not create artwork slot. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
      return;
    }

    const created = result.data?.artworkSlot;
    if (!created) {
      setSubmitError("Could not create artwork slot. Please try again.");
      setSubmitting(false);
      return;
    }

    onCreated?.(created);
    resetForm();
    onOpenChange(false);
    setSubmitting(false);
  }

  return (
    <FiDialog open={open} onOpenChange={handleOpenChange} size="md">
      <form onSubmit={handleSubmit}>
        <FiDialogHeader>
          <FiDialogTitle>Add Artwork Slot</FiDialogTitle>
          <FiDialogDescription>
            Describe artwork this collection needs.
          </FiDialogDescription>
        </FiDialogHeader>

        <FiDialogBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FiField
              label={artworkSlotsDefaults.slotNameLabel}
              htmlFor={nameId}
              required
              errorText={fieldErrors.name}
            >
              <FiInput
                id={nameId}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Birthday Cake Scene"
                state={fieldErrors.name ? "error" : "default"}
                disabled={submitting}
              />
            </FiField>

            <FiField label={artworkSlotsDefaults.briefLabel} htmlFor={briefId}>
              <FiTextarea
                id={briefId}
                value={values.brief}
                onChange={(event) => updateField("brief", event.target.value)}
                placeholder="Describe the visual need for this slot"
                rows={3}
                disabled={submitting}
              />
            </FiField>

            <FiField
              label={artworkSlotsDefaults.quantityLabel}
              htmlFor={quantityId}
              required
              errorText={fieldErrors.quantity}
              helperText={`Default is ${ARTWORK_SLOT_QUANTITY_DEFAULT}.`}
            >
              <FiInput
                id={quantityId}
                type="number"
                min={1}
                max={100}
                value={values.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                state={fieldErrors.quantity ? "error" : "default"}
                disabled={submitting}
              />
            </FiField>

            {submitError ? (
              <p className="fi-field__error" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
        </FiDialogBody>

        <FiDialogFooter>
          <FiButton
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {artworkSlotsDefaults.cancelLabel}
          </FiButton>
          <FiButton type="submit" variant="primary" loading={submitting} disabled={submitting}>
            {artworkSlotsDefaults.createArtworkSlotLabel}
          </FiButton>
        </FiDialogFooter>
      </form>
    </FiDialog>
  );
}
