import type { Recipient } from "@/lib/data";

export const cardEditingDefaults = {
  previewLabel: "Your card",
  messageLabel: "Handwritten message",
  messageAriaLabel: "Edit card message",
  conciergeTitle: "Concierge polish",
  conciergeSubtitle: "Small refinements — your words stay yours.",
  memoryTitle: "Memories to weave in",
  memoryEmpty:
    "No saved moments yet. Log a real memory on their profile and it will appear here.",
  memoryInsertLabel: "Weave into message",
  compareTitle: "Original AI draft",
  compareClose: "Back to editing",
  saveDraftLabel: "Save draft",
  undoLabel: "Undo last change",
  compareLabel: "Compare to original",
  approveLabel: "Approve & send",
  rejectLabel: "Start over",
  artworkChangeLabel: "Change artwork",
  artworkLoadingLabel: "Finding artwork…",
  artworkPlaceholder: "Card artwork loading",
  selectionToolbarLabel: "Edit selected text",
} as const;

/** Full-card concierge quick actions */
export const conciergeEditActions = [
  {
    id: "warmer",
    label: "Make it warmer",
    instruction:
      "Make this card noticeably warmer and more heartfelt. Keep the same structure but increase emotional depth through specific details — not generic declarations.",
  },
  {
    id: "funnier",
    label: "Make it funnier",
    instruction:
      "Add genuine humor and light self-awareness without losing the heart of the message.",
  },
  {
    id: "shorter",
    label: "Shorten it",
    instruction: "Shorten this card significantly. Keep only the most important and impactful lines.",
  },
  {
    id: "heartfelt",
    label: "Make it more heartfelt",
    instruction:
      "Make this card more emotionally resonant and vulnerable. Go deeper on the specific references already in the card.",
  },
  {
    id: "like-me",
    label: "Make it sound more like me",
    instruction:
      "Rewrite so it sounds more natural and conversational — like the sender actually wrote it, not a greeting card company.",
  },
  {
    id: "memory",
    label: "Add a memory",
    instruction:
      "Weave in one specific personal memory or detail that makes this feel unmistakably about this recipient.",
  },
  {
    id: "ending",
    label: "Try another ending",
    instruction:
      "Keep the opening and body largely intact, but rewrite only the closing lines with a fresh, natural ending.",
  },
  {
    id: "less-generic",
    label: "Remove anything too generic",
    instruction:
      "Remove generic greeting-card phrases and replace them with specific, personal observations already implied in the card.",
  },
] as const;

export type ConciergeEditActionId = (typeof conciergeEditActions)[number]["id"];

/** Selection-scoped rewrite actions */
export const selectionEditActions = [
  {
    id: "rewrite",
    label: "Rewrite",
    instruction: "Rewrite the highlighted passage in a fresh way while matching the rest of the card.",
  },
  {
    id: "shorter",
    label: "Shorter",
    instruction: "Make the highlighted passage shorter and more punchy.",
  },
  {
    id: "warmer",
    label: "Warmer",
    instruction: "Make the highlighted passage warmer and more heartfelt.",
  },
  {
    id: "personal",
    label: "More personal",
    instruction: "Make the highlighted passage feel more specific and personal to this recipient.",
  },
  {
    id: "heartfelt",
    label: "More heartfelt",
    instruction: "Make the highlighted passage more emotionally resonant.",
  },
  {
    id: "simpler",
    label: "Simpler",
    instruction: "Simplify the highlighted passage — clearer words, fewer flourishes.",
  },
] as const;

export type SelectionEditActionId = (typeof selectionEditActions)[number]["id"];

export interface CardMemoryItem {
  id: string;
  text: string;
  source: string;
}

export interface CardDesignPreview {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
}

export function buildSelectionEditInstruction(
  selectedText: string,
  actionInstruction: string,
): string {
  return `Rewrite ONLY the following highlighted passage within the card. Keep everything else as intact as possible, adjusting only connecting words if needed.

Highlighted passage:
"${selectedText}"

Edit instruction: ${actionInstruction}`;
}

export function buildMemoryWeaveInstruction(recipientName: string, memoryText: string): string {
  return `Rewrite this card to naturally weave in the following real detail about ${recipientName}: "${memoryText}". Keep the same tone and occasion. Do not invent additional facts.`;
}

export function extractRecipientMemories(recipient?: Recipient | null): CardMemoryItem[] {
  if (!recipient) return [];

  const items: CardMemoryItem[] = [];
  const addField = (source: string, raw?: string) => {
    if (!raw?.trim()) return;
    raw
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
      .forEach((text, index) => {
        items.push({ id: `${source}-${index}`, text, source });
      });
  };

  addField("Favorite memory", recipient.favoriteMemories);
  addField("Inside joke", recipient.insideJokes);
  addField("Personality note", recipient.personalityNotes);
  if (recipient.interests?.length) {
    recipient.interests.forEach((interest, index) => {
      if (interest.trim()) {
        items.push({ id: `interest-${index}`, text: interest.trim(), source: "Interest" });
      }
    });
  }

  return items;
}
