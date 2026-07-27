export interface StudioArtworkCandidate {
  id: string;
  collectionId: string;
  artworkSlotId: string;
  name: string;
  brief: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtworkCandidateFormValues {
  name: string;
  brief: string;
}

export const EMPTY_CREATE_ARTWORK_CANDIDATE_FORM: CreateArtworkCandidateFormValues = {
  name: "",
  brief: "",
};

export type CreateArtworkCandidateFieldErrors = Partial<
  Record<keyof CreateArtworkCandidateFormValues, string>
>;

export function validateCreateArtworkCandidateForm(
  values: CreateArtworkCandidateFormValues,
): { ok: true } | { ok: false; errors: CreateArtworkCandidateFieldErrors } {
  const errors: CreateArtworkCandidateFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Candidate name is required.";
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true };
}

export function buildCreateArtworkCandidatePayload(values: CreateArtworkCandidateFormValues) {
  return {
    name: values.name.trim(),
    brief: values.brief.trim() || undefined,
  };
}

export const artworkCandidatesDefaults = {
  addArtworkCandidateLabel: "Add Artwork Candidate",
  createArtworkCandidateLabel: "Create Artwork Candidate",
  cancelLabel: "Cancel",
  candidateNameLabel: "Candidate name",
  briefLabel: "Brief",
  candidatePositionLabel: (position: number) => `Candidate ${position}`,
  emptyCandidatesLabel: "No artwork candidates yet.",
} as const;
