import { useCallback, useEffect, useState } from "react";
import { studioArtworkCandidateService } from "@/app/api/services/studioArtworkCandidateService";
import type { StudioArtworkCandidate } from "@/app/studio/artworkCandidatesDomain";

export function useStudioArtworkCandidates(
  collectionId: string | undefined,
  slotId: string | undefined,
) {
  const [candidates, setCandidates] = useState<StudioArtworkCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!collectionId || !slotId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await studioArtworkCandidateService.list(collectionId, slotId);
    if (!result.ok) {
      setError("Could not load artwork candidates. Please try again.");
      setCandidates([]);
      setLoading(false);
      return;
    }

    setCandidates(result.data?.artworkCandidates ?? []);
    setLoading(false);
  }, [collectionId, slotId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addCandidate = useCallback((candidate: StudioArtworkCandidate) => {
    setCandidates((prev) => {
      const next = [...prev, candidate];
      next.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      return next;
    });
  }, []);

  return {
    candidates,
    loading,
    error,
    isEmpty: !loading && !error && candidates.length === 0,
    candidateCount: candidates.length,
    reload: load,
    addCandidate,
  };
}
