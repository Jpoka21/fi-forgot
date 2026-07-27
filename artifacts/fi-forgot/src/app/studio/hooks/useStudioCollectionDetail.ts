import { useCallback, useEffect, useState } from "react";
import { studioCollectionService } from "@/app/api/services/studioCollectionService";
import type { StudioCollection } from "@/app/studio/collectionsDomain";

export function useStudioCollectionDetail(id: string | undefined) {
  const [collection, setCollection] = useState<StudioCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    const result = await studioCollectionService.getById(id);
    if (result.status === 404) {
      setNotFound(true);
      setCollection(null);
      setLoading(false);
      return;
    }
    if (!result.ok) {
      setError("Could not load this collection. Please try again.");
      setCollection(null);
      setLoading(false);
      return;
    }
    setCollection(result.data?.collection ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    collection,
    loading,
    error,
    notFound,
    reload: load,
  };
}
