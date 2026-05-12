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

const initialRecipients: Recipient[] = [
  {
    id: "1",
    name: "Sarah",
    relationship: "Wife",
    birthday: "1988-06-15",
    anniversaryDate: "2015-09-03",
    needsMothersDay: true,
    needsValentinesDay: true,
    needsChristmasHanukkah: true,
    customDates: [],
    tonePreference: "Romantic",
    personalityNotes: "Loves sunflowers, coffee, and long walks. Gets emotional at Hallmark commercials.",
    favoriteMemories: "Our first trip to Italy, the morning after we got engaged, her 30th birthday surprise.",
    insideJokes: "The 'spaghetti incident' of 2018. Never let her forget the plant named Gerald.",
    thingsToAvoid: "Anything too cheesy. She'll roll her eyes at excessive rhyming.",
    emotionalLevel: 4,
    deliveryPreference: "Mail it to me",
  },
  {
    id: "2",
    name: "Linda",
    relationship: "Mom",
    birthday: "1958-03-22",
    anniversaryDate: undefined,
    needsMothersDay: true,
    needsValentinesDay: false,
    needsChristmasHanukkah: true,
    customDates: [],
    tonePreference: "Sweet",
    personalityNotes: "Classic, loves gardening and church. Sentimental about family traditions.",
    favoriteMemories: "Sunday dinners, teaching me to drive, her famous lasagna.",
    insideJokes: "The time the cat knocked over the Christmas tree. Twice.",
    thingsToAvoid: "Anything too modern or trendy. Keep it timeless.",
    emotionalLevel: 3,
    deliveryPreference: "Mail it directly to her",
  },
  {
    id: "3",
    name: "Carol",
    relationship: "Mother in law",
    birthday: "1960-11-08",
    anniversaryDate: undefined,
    needsMothersDay: true,
    needsValentinesDay: false,
    needsChristmasHanukkah: true,
    customDates: [],
    tonePreference: "Simple",
    personalityNotes: "Warm but private. Appreciates effort more than grand gestures.",
    favoriteMemories: "Watching Sarah grow up. Family holidays together.",
    insideJokes: "Keep it professional — this is the mother-in-law.",
    thingsToAvoid: "Anything too personal or that implies too much familiarity. Keep it warm but measured.",
    emotionalLevel: 2,
    deliveryPreference: "Mail it directly to her",
  },
];

const initialCards: CardOrder[] = [
  {
    id: "c1",
    recipientId: "1",
    recipientName: "Sarah",
    holiday: "Mother's Day",
    dueDate: "2026-05-10",
    status: "Ready for approval",
    approvedMessage: undefined,
    adminNotes: "Sweet tone, sunflower theme",
    deliveryPreference: "Mail it to me",
  },
  {
    id: "c2",
    recipientId: "2",
    recipientName: "Linda",
    holiday: "Birthday",
    dueDate: "2026-03-15",
    status: "Card being drafted",
    approvedMessage: undefined,
    adminNotes: "Classic sweet message, no modern slang",
    deliveryPreference: "Mail it directly to her",
  },
  {
    id: "c3",
    recipientId: "1",
    recipientName: "Sarah",
    holiday: "Anniversary",
    dueDate: "2026-09-03",
    status: "Needs profile",
    approvedMessage: undefined,
    adminNotes: "",
    deliveryPreference: "Mail it to me",
  },
  {
    id: "c4",
    recipientId: "1",
    recipientName: "Sarah",
    holiday: "Valentine's Day",
    dueDate: "2026-02-14",
    status: "Approved",
    approvedMessage:
      "Sarah, every year with you feels like the first. You make ordinary days extraordinary. I love you more than I know how to say — so I paid professionals. Happy Valentine's Day.",
    adminNotes: "Romantic, approved by user",
    deliveryPreference: "Mail it to me",
  },
  {
    id: "c5",
    recipientId: "3",
    recipientName: "Carol",
    holiday: "Mother's Day",
    dueDate: "2026-05-10",
    status: "Mailed to her",
    approvedMessage:
      "Carol, thank you for raising the woman who makes my life better every single day. Happy Mother's Day.",
    adminNotes: "Simple, on brand",
    deliveryPreference: "Mail it directly to her",
  },
];

const STORAGE_KEY_RECIPIENTS = "fi_forgot_recipients";
const STORAGE_KEY_CARDS = "fi_forgot_cards";

function loadRecipients(): Recipient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECIPIENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(initialRecipients));
  return initialRecipients;
}

function loadCards(): CardOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(initialCards));
  return initialCards;
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
