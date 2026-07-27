import { useCallback, useEffect, useState } from "react";
import { studioCollectionService } from "@/app/api/services/studioCollectionService";
import type { StudioCollection } from "@/app/studio/collectionsDomain";

export function useStudioCollectionsList() {
  const [collections, setCollections] = useState<StudioCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await studioCollectionService.list();
    if (!result.ok) {
      setError("Could not load collections. Please try again.");
      setCollections([]);
      setLoading(false);
      return;
    }
    setCollections(result.data?.collections ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addCollection = useCallback((collection: StudioCollection) => {
    setCollections((prev) => [collection, ...prev]);
  }, []);

  return {
    collections,
    loading,
    error,
    isEmpty: !loading && !error && collections.length === 0,
    reload: load,
    addCollection,
  };
}
