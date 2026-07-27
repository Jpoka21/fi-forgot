import { useCallback, useEffect, useState } from "react";
import { studioArtworkSlotService } from "@/app/api/services/studioArtworkSlotService";
import type { StudioArtworkSlot } from "@/app/studio/artworkSlotsDomain";

export function useStudioArtworkSlots(collectionId: string | undefined) {
  const [slots, setSlots] = useState<StudioArtworkSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!collectionId) {
      setSlots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await studioArtworkSlotService.list(collectionId);
    if (!result.ok) {
      setError("Could not load artwork slots. Please try again.");
      setSlots([]);
      setLoading(false);
      return;
    }

    setSlots(result.data?.artworkSlots ?? []);
    setLoading(false);
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const addSlot = useCallback((slot: StudioArtworkSlot) => {
    setSlots((prev) => {
      const next = [...prev, slot];
      next.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      return next;
    });
  }, []);

  return {
    slots,
    loading,
    error,
    isEmpty: !loading && !error && slots.length === 0,
    slotCount: slots.length,
    reload: load,
    addSlot,
  };
}
