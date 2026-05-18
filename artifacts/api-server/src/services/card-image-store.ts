// Short-lived in-memory store for card images embedded in demo emails.
// Images expire after 7 days — long enough for any recipient to open their email.

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredImage {
  data: Buffer;
  mime: string;
  expiresAt: number;
}

const store = new Map<string, StoredImage>();

export function storeCardImage(data: Buffer, mime: string): string {
  const id = crypto.randomUUID();
  store.set(id, { data, mime, expiresAt: Date.now() + TTL_MS });
  pruneExpired();
  return id;
}

export function getCardImage(id: string): StoredImage | null {
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
