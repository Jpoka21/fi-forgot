// In-memory store for demo preview pages.
// Keyed by UUID, expires after 7 days — long enough for any lead to revisit.

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface DemoPreviewData {
  recipientName: string;
  relationship: string;
  occasion: string;
  personality: string;
  card: {
    bgColor: string;
    titleColor: string;
    accentColor: string;
    borderColor: string;
    title: string;
    seriesLabel: string;
    whyChosen: string;
  };
  message: string;
  cardImageUrl: string | null;
  cardImageUrls: string[];
  checkinHtml: string;
  createdAt: number;
  expiresAt: number;
}

const store = new Map<string, DemoPreviewData>();

export function storeDemoPreview(data: Omit<DemoPreviewData, "createdAt" | "expiresAt">): string {
  const id = crypto.randomUUID();
  const now = Date.now();
  store.set(id, { ...data, createdAt: now, expiresAt: now + TTL_MS });
  pruneExpired();
  return id;
}

export function getDemoPreview(id: string): DemoPreviewData | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return null;
  }
  return entry;
}

function pruneExpired(): void {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now > entry.expiresAt) store.delete(id);
  }
}
