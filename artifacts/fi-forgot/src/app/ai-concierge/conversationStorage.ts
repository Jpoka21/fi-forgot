import type { ConciergeMessage } from "@/app/ai-concierge/aiConciergeDomain";

const CONVERSATION_KEY = "fi-forgot-concierge-conversation";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadConversationHistory(): ConciergeMessage[] {
  return readJson<ConciergeMessage[]>(CONVERSATION_KEY, []);
}

export function saveConversationHistory(messages: ConciergeMessage[]): void {
  writeJson(CONVERSATION_KEY, messages);
}

export function clearConversationHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONVERSATION_KEY);
}
