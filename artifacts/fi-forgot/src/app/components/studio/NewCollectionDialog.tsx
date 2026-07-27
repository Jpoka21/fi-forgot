import { useId, useState } from "react";
import { useLocation } from "wouter";
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
import { FiSelect } from "@/app/components/input/FiSelect";
import { FiTextarea } from "@/app/components/input/FiTextarea";
import { studioCollectionService } from "@/app/api/services/studioCollectionService";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import {
  EMPTY_CREATE_COLLECTION_FORM,
  STUDIO_COLLECTION_OCCASIONS,
  STUDIO_COLLECTION_RELATIONSHIPS,
  STUDIO_COLLECTION_STYLES,
  STUDIO_OCCASION_LABELS,
  STUDIO_RELATIONSHIP_LABELS,
  STUDIO_STYLE_LABELS,
  buildCreateCollectionPayload,
  studioCollectionsDefaults,
  validateCreateCollectionForm,
  type CreateCollectionFieldErrors,
  type CreateCollectionFormValues,
  type StudioCollection,
} from "@/app/studio/collectionsDomain";

export interface NewCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (collection: StudioCollection) => void;
}

export function NewCollectionDialog({ open, onOpenChange, onCreated }: NewCollectionDialogProps) {
  const [, navigate] = useLocation();
  const nameId = useId();
  const occasionId = useId();
  const relationshipId = useId();
  const styleId = useId();
  const descriptionId = useId();

  const [values, setValues] = useState<CreateCollectionFormValues>(EMPTY_CREATE_COLLECTION_FORM);
  const [fieldErrors, setFieldErrors] = useState<CreateCollectionFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setValues(EMPTY_CREATE_COLLECTION_FORM);
    setFieldErrors({});
    setSubmitError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && !submitting) {
      resetForm();
    }
    onOpenChange(next);
  }

  function updateField<K extends keyof CreateCollectionFormValues>(
    key: K,
    value: CreateCollectionFormValues[K],
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

    const validation = validateCreateCollectionForm(values);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await studioCollectionService.create(buildCreateCollectionPayload(values));
    if (!result.ok) {
      const message =
        result.data && typeof result.data === "object" && "error" in result.data
          ? String((result.data as { error: string }).error)
          : "Could not create collection. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
      return;
    }

    const created = result.data?.collection;
    if (!created) {
      setSubmitError("Could not create collection. Please try again.");
      setSubmitting(false);
      return;
    }

    onCreated?.(created);
    resetForm();
    onOpenChange(false);
    navigate(ROUTE_PATHS.studio.collectionById(created.id));
    setSubmitting(false);
  }

  return (
    <FiDialog open={open} onOpenChange={handleOpenChange} size="md">
      <form onSubmit={handleSubmit}>
        <FiDialogHeader>
          <FiDialogTitle>New Collection</FiDialogTitle>
          <FiDialogDescription>
            Group artwork for a defined publishing purpose.
          </FiDialogDescription>
        </FiDialogHeader>

        <FiDialogBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FiField
              label="Collection name"
              htmlFor={nameId}
              required
              errorText={fieldErrors.name}
            >
              <FiInput
                id={nameId}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Birthday — Grandmother"
                state={fieldErrors.name ? "error" : "default"}
                disabled={submitting}
              />
            </FiField>

            <FiField
              label="Occasion"
              htmlFor={occasionId}
              required
              errorText={fieldErrors.occasion}
            >
              <FiSelect
                id={occasionId}
                value={values.occasion}
                onChange={(event) =>
                  updateField("occasion", event.target.value as CreateCollectionFormValues["occasion"])
                }
                state={fieldErrors.occasion ? "error" : "default"}
                disabled={submitting}
              >
                <option value="">Select occasion</option>
                {STUDIO_COLLECTION_OCCASIONS.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {STUDIO_OCCASION_LABELS[occasion]}
                  </option>
                ))}
              </FiSelect>
            </FiField>

            <FiField
              label="Relationship"
              htmlFor={relationshipId}
              required
              errorText={fieldErrors.relationship}
            >
              <FiSelect
                id={relationshipId}
                value={values.relationship}
                onChange={(event) =>
                  updateField(
                    "relationship",
                    event.target.value as CreateCollectionFormValues["relationship"],
                  )
                }
                state={fieldErrors.relationship ? "error" : "default"}
                disabled={submitting}
              >
                <option value="">Select relationship</option>
                {STUDIO_COLLECTION_RELATIONSHIPS.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {STUDIO_RELATIONSHIP_LABELS[relationship]}
                  </option>
                ))}
              </FiSelect>
            </FiField>

            <FiField label="Style" htmlFor={styleId} errorText={fieldErrors.style}>
              <FiSelect
                id={styleId}
                value={values.style}
                onChange={(event) =>
                  updateField("style", event.target.value as CreateCollectionFormValues["style"])
                }
                state={fieldErrors.style ? "error" : "default"}
                disabled={submitting}
              >
                <option value="">Optional</option>
                {STUDIO_COLLECTION_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {STUDIO_STYLE_LABELS[style]}
                  </option>
                ))}
              </FiSelect>
            </FiField>

            <FiField label="Description" htmlFor={descriptionId}>
              <FiTextarea
                id={descriptionId}
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Planning notes for this collection"
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
            {studioCollectionsDefaults.cancelLabel}
          </FiButton>
          <FiButton type="submit" variant="primary" loading={submitting} disabled={submitting}>
            {studioCollectionsDefaults.createCollectionLabel}
          </FiButton>
        </FiDialogFooter>
      </form>
    </FiDialog>
  );
}
