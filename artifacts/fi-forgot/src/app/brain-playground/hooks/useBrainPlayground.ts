import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";

import { useProductBrainDecision } from "@/app/brain-playground/hooks/useProductBrainDecision";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { getRecipients, type Recipient } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";

function readRecipientIdFromQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("recipientId")?.trim() ?? "";
}

export function useBrainPlayground() {
  const { authReady } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>(() => getRecipients());
  const [location, setLocation] = useLocation();
  const [selectedRecipientId, setSelectedRecipientId] = useState(readRecipientIdFromQuery);

  useEffect(() => {
    if (authReady) {
      setRecipients(getRecipients());
    }
  }, [authReady]);

  useEffect(() => {
    setSelectedRecipientId(readRecipientIdFromQuery());
  }, [location]);

  const selectRecipient = useCallback(
    (recipientId: string) => {
      const base = ROUTE_PATHS.brainPlayground;
      const next = recipientId
        ? `${base}?recipientId=${encodeURIComponent(recipientId)}`
        : base;
      setLocation(next);
    },
    [setLocation],
  );

  const brain = useProductBrainDecision(selectedRecipientId || null);

  const queryRecipientUnknown =
    selectedRecipientId.length > 0 &&
    !recipients.some((recipient) => recipient.id === selectedRecipientId);

  return {
    recipients,
    selectedRecipientId,
    selectRecipient,
    queryRecipientUnknown,
    ...brain,
  };
}
