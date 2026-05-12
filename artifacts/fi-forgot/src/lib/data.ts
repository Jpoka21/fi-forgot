export type Relationship =
  | "Wife"
  | "Girlfriend"
  | "Mom"
  | "Mother in law"
  | "Daughter"
  | "Grandmother"
  | "Sister"
  | "Other important woman";

export type Tone =
  | "Sweet"
  | "Funny"
  | "Romantic"
  | "Simple"
  | "Religious"
  | "From the kids"
  | "Apology style";

export type DeliveryPreference = "Mail it to me" | "Mail it directly to her";

export type CardStatus =
  | "Needs profile"
  | "Card being drafted"
  | "Ready for approval"
  | "Approved"
  | "Mailed to me"
  | "Mailed to her"
  | "Delivered"
  | "Given";

export interface CustomDate {
  id: string;
  label: string;
  date: string;
}

export interface Recipient {
  id: string;
  name: string;
  relationship: Relationship;
  birthday?: string;
  anniversaryDate?: string;
  needsMothersDay: boolean;
  needsValentinesDay: boolean;
  needsChristmasHanukkah: boolean;
  customDates: CustomDate[];
  tonePreference: Tone;
  personalityNotes: string;
  kidsNames: string;
  favoriteMemories: string;
  insideJokes: string;
  thingsToAvoid: string;
  emotionalLevel: number;
  deliveryPreference: DeliveryPreference;
}

export interface CardOrder {
  id: string;
  recipientId: string;
  recipientName: string;
  holiday: string;
  dueDate: string;
  status: CardStatus;
  approvedMessage?: string;
  adminNotes?: string;
  deliveryPreference: DeliveryPreference;
}

const DATA_VERSION = "3";
const STORAGE_KEY_RECIPIENTS = "fi_forgot_recipients";
const STORAGE_KEY_CARDS = "fi_forgot_cards";
const STORAGE_KEY_VERSION = "fi_forgot_data_version";

function ensureDataVersion() {
  const v = localStorage.getItem(STORAGE_KEY_VERSION);
  if (v !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY_RECIPIENTS);
    localStorage.removeItem(STORAGE_KEY_CARDS);
    localStorage.setItem(STORAGE_KEY_VERSION, DATA_VERSION);
  }
}

function loadRecipients(): Recipient[] {
  ensureDataVersion();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECIPIENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function loadCards(): CardOrder[] {
  ensureDataVersion();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getRecipients(): Recipient[] {
  return loadRecipients();
}

export function getRecipient(id: string): Recipient | undefined {
  return loadRecipients().find((r) => r.id === id);
}

export function saveRecipient(recipient: Recipient): void {
  const all = loadRecipients();
  const idx = all.findIndex((r) => r.id === recipient.id);
  if (idx >= 0) {
    all[idx] = recipient;
  } else {
    all.push(recipient);
  }
  localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(all));
}

export function deleteRecipient(id: string): void {
  const all = loadRecipients().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(all));
}

export function getCards(): CardOrder[] {
  return loadCards();
}

export function updateCard(card: CardOrder): void {
  const all = loadCards();
  const idx = all.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    all[idx] = card;
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(all));
  }
}

export function defaultDelivery(relationship: Relationship): DeliveryPreference {
  if (relationship === "Wife" || relationship === "Girlfriend") {
    return "Mail it to me";
  }
  return "Mail it directly to her";
}

export const STATUS_COLORS: Record<CardStatus, string> = {
  "Needs profile": "bg-amber-100 text-amber-800 border-amber-200",
  "Card being drafted": "bg-blue-100 text-blue-800 border-blue-200",
  "Ready for approval": "bg-purple-100 text-purple-800 border-purple-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  "Mailed to me": "bg-teal-100 text-teal-800 border-teal-200",
  "Mailed to her": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Delivered: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Given: "bg-gray-100 text-gray-800 border-gray-200",
};

export const ALL_STATUSES: CardStatus[] = [
  "Needs profile",
  "Card being drafted",
  "Ready for approval",
  "Approved",
  "Mailed to me",
  "Mailed to her",
  "Delivered",
  "Given",
];

export const RELATIONSHIPS: Relationship[] = [
  "Wife",
  "Girlfriend",
  "Mom",
  "Mother in law",
  "Daughter",
  "Grandmother",
  "Sister",
  "Other important woman",
];

export const TONES: Tone[] = [
  "Sweet",
  "Funny",
  "Romantic",
  "Simple",
  "Religious",
  "From the kids",
  "Apology style",
];
