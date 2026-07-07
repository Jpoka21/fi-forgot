import { useMemo } from "react";

import { buildCommunicationHistory } from "@/app/notification/communicationHistoryEngine";
import {
  communicationHistoryTabs,
  type CommunicationHistoryTab,
} from "@/app/notification/notificationsPageDomain";
import { getCards, getPersonalSettings } from "@/lib/data";

export function useCommunicationHistory(activeTab: CommunicationHistoryTab = "email") {
  const history = useMemo(() => {
    const cards = getCards();
    const settings = getPersonalSettings();
    return buildCommunicationHistory(cards, settings);
  }, []);

  const entries = history[activeTab];

  return {
    tabs: communicationHistoryTabs,
    history,
    entries,
    activeTab,
  };
}

export type CommunicationHistoryController = ReturnType<typeof useCommunicationHistory>;
