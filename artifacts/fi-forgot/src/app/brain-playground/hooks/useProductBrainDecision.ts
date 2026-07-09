import { useCallback, useEffect, useState } from "react";

import { recipientService } from "@/app/api/services/recipientService";
import type { ProductBrainDecision } from "@/app/product-brain/productBrainDecisionTypes";

export type ProductBrainFetchStatus = "idle" | "loading" | "success" | "error";

function errorMessageFromResult(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export function useProductBrainDecision(recipientId: string | null) {
  const [status, setStatus] = useState<ProductBrainFetchStatus>("idle");
  const [decision, setDecision] = useState<ProductBrainDecision | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!recipientId) {
      setStatus("idle");
      setDecision(null);
      setErrorMessage(null);
      setFetchedAt(null);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const result = await recipientService.getBrainDecision(recipientId);

    if (result.ok && result.data) {
      setDecision(result.data as ProductBrainDecision);
      setStatus("success");
      setFetchedAt(new Date().toISOString());
      return;
    }

    setDecision(null);
    setStatus("error");
    setFetchedAt(null);
    setErrorMessage(
      errorMessageFromResult(
        result.error?.data,
        result.error?.message ?? "Failed to load Product Brain decision",
      ),
    );
  }, [recipientId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    status,
    decision,
    errorMessage,
    fetchedAt,
    refresh,
  };
}
