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
import { studioArtworkCandidateService } from "@/app/api/services/studioArtworkCandidateService";
import {
  EMPTY_CREATE_ARTWORK_CANDIDATE_FORM,
  artworkCandidatesDefaults,
  buildCreateArtworkCandidatePayload,
  validateCreateArtworkCandidateForm,
  type CreateArtworkCandidateFieldErrors,
  type CreateArtworkCandidateFormValues,
  type StudioArtworkCandidate,
} from "@/app/studio/artworkCandidatesDomain";

export interface AddArtworkCandidateDialogProps {
  collectionId: string;
  slotId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (candidate: StudioArtworkCandidate) => void;
}

export function AddArtworkCandidateDialog({
  collectionId,
  slotId,
  open,
  onOpenChange,
  onCreated,
}: AddArtworkCandidateDialogProps) {
  const nameId = useId();
  const briefId = useId();

  const [values, setValues] = useState<CreateArtworkCandidateFormValues>(
    EMPTY_CREATE_ARTWORK_CANDIDATE_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<CreateArtworkCandidateFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setValues(EMPTY_CREATE_ARTWORK_CANDIDATE_FORM);
    setFieldErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && !submitting) {
      resetForm();
    }
    onOpenChange(next);
  }

  function updateField<K extends keyof CreateArtworkCandidateFormValues>(
    key: K,
    value: CreateArtworkCandidateFormValues[K],
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

    const validation = validateCreateArtworkCandidateForm(values);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await studioArtworkCandidateService.create(
      collectionId,
      slotId,
      buildCreateArtworkCandidatePayload(values),
    );

    if (!result.ok) {
      const message =
        result.data && typeof result.data === "object" && "error" in result.data
          ? String((result.data as { error: string }).error)
          : "Could not create artwork candidate. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
      return;
    }

    const created = result.data?.artworkCandidate;
    if (!created) {
      setSubmitError("Could not create artwork candidate. Please try again.");
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
          <FiDialogTitle>Add Artwork Candidate</FiDialogTitle>
          <FiDialogDescription>
            Record a proposed artwork option for this slot.
          </FiDialogDescription>
        </FiDialogHeader>

        <FiDialogBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FiField
              label={artworkCandidatesDefaults.candidateNameLabel}
              htmlFor={nameId}
              required
              errorText={fieldErrors.name}
            >
              <FiInput
                id={nameId}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Warm watercolor bouquet"
                state={fieldErrors.name ? "error" : "default"}
                disabled={submitting}
              />
            </FiField>

            <FiField label={artworkCandidatesDefaults.briefLabel} htmlFor={briefId}>
              <FiTextarea
                id={briefId}
                value={values.brief}
                onChange={(event) => updateField("brief", event.target.value)}
                placeholder="Describe this candidate option"
                rows={3}
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
            {artworkCandidatesDefaults.cancelLabel}
          </FiButton>
          <FiButton type="submit" variant="primary" loading={submitting} disabled={submitting}>
            {artworkCandidatesDefaults.createArtworkCandidateLabel}
          </FiButton>
        </FiDialogFooter>
      </form>
    </FiDialog>
  );
}
