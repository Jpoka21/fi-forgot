export type Relationship =
  | "Wife"
  | "Girlfriend"
  | "Husband"
  | "Boyfriend"
  | "Mom"
  | "Dad"
  | "Mother in law"
  | "Father in law"
  | "Daughter"
  | "Son"
  | "Grandmother"
  | "Grandfather"
  | "Sister"
  | "Brother"
  | "Friend"
  | "Employee"
  | "Client"
  | "Other";

export type Tone =
  | "Sweet"
  | "Funny"
  | "Romantic"
  | "Simple"
  | "Religious"
  | "From the kids"
  | "Apology style";

export type DeliveryPreference = "Mail it to me" | "Mail it directly to her";

export type AutopilotMode =
  | "full_autopilot"
  | "preview_before_mailing"
  | "require_approval";

export type CardStatus =
  | "Needs profile"
  | "Card being drafted"
  | "Ready for approval"
  | "Approved"
  | "Mailed to me"
  | "Mailed to her"
  | "Delivered"
  | "Given";

export type ChildGender = "boy" | "girl" | "nonbinary";

export interface Child {
  id: string;
  name: string;
  gender: ChildGender;
  birthdate?: string; // ISO "YYYY-MM-DD" — age auto-computes from this
}

export interface BriefingAnswer {
  questionKey: string;
  question: string;
  answer: string;
}

export interface EventBriefing {
  id: string;
  recipientId: string;
  recipientName: string;
  event: string;
  year: number;
  completedAt: string; // ISO datetime
  answers: BriefingAnswer[];
}

export type BriefingQuestionType = "text" | "textarea" | "boolean" | "children" | "date";

export interface BriefingQuestion {
  key: string;
  question: string;
  placeholder?: string;
  type: BriefingQuestionType;
  hint?: string;
  optional?: boolean;
}

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
  marriageDate?: string; // ISO date — years married auto-computes
  children: Child[]; // replaces kidsNames — birthdates allow auto age calculation
  needsMothersDay: boolean;
  needsFathersDay: boolean;
  needsValentinesDay: boolean;
  needsChristmasHanukkah: boolean;
  needsThanksgiving: boolean;
  needsNewYears: boolean;
  needsEaster: boolean;
  selectedEvents: string[];
  customDates: CustomDate[];
  tonePreference: Tone;
  personalityNotes: string;
  favoriteMemories: string;
  insideJokes: string;
  thingsToAvoid: string;
  emotionalLevel: number;
  deliveryPreference: DeliveryPreference;
  autopilotMode: AutopilotMode;
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

// ─── Helper functions ───────────────────────────────────────────────────────

/** Get age in full years from an ISO birthdate string */
export function getAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return Math.max(0, age);
}

/** Get years married/together from an ISO date string */
export function getYearsTogether(marriageDate: string): number {
  return getAge(marriageDate);
}

/** Summarize children for card context */
export function childrenSummary(children: Child[]): string {
  if (!children.length) return "";
  return children
    .map((c) => {
      const age = c.birthdate ? `(${getAge(c.birthdate)})` : "";
      return `${c.name} ${age}`.trim();
    })
    .join(", ");
}

/** Get upcoming anniversary / birthday within N days */
export function daysUntilNextOccurrence(monthDay: string): number {
  // monthDay format "MM-DD"
  const [month, day] = monthDay.split("-").map(Number);
  const today = new Date();
  const thisYear = new Date(today.getFullYear(), month - 1, day);
  const nextYear = new Date(today.getFullYear() + 1, month - 1, day);
  const target = thisYear >= today ? thisYear : nextYear;
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Event-specific briefing questions ──────────────────────────────────────

export const EVENT_QUESTIONS: Record<string, BriefingQuestion[]> = {
  "Mother's Day": [
    {
      key: "children",
      question: "Who are her children?",
      type: "children",
      hint: "We'll use names, genders, and ages to make the card feel personal. Ages update automatically each year from their birthdate.",
    },
    {
      key: "proudest_moment",
      question: "What's been her proudest mom moment this past year?",
      placeholder: "Started a new school, first soccer goal, just being an amazing mom...",
      type: "textarea",
      optional: true,
    },
    {
      key: "big_change",
      question: "Any big changes for the family this year?",
      placeholder: "New baby, moving, kid starting school, tough stretch she pushed through...",
      type: "textarea",
      optional: true,
    },
    {
      key: "first_mothers_day",
      question: "Is this her first Mother's Day as a mom?",
      type: "boolean",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else we should know for this card?",
      placeholder: "Specific feeling you want her to have, something only you'd say...",
      type: "textarea",
      optional: true,
    },
  ],
  "Father's Day": [
    {
      key: "children",
      question: "Who are his children?",
      type: "children",
      hint: "Ages update automatically each year from their birthdate.",
    },
    {
      key: "proudest_moment",
      question: "What's been his proudest dad moment this past year?",
      placeholder: "Coached the team, was there for a hard day, just always shows up...",
      type: "textarea",
      optional: true,
    },
    {
      key: "big_change",
      question: "Any big changes for the family this year?",
      type: "textarea",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else we should know for this card?",
      type: "textarea",
      optional: true,
    },
  ],
  "Birthday": [
    {
      key: "milestone",
      question: "Is this a milestone birthday? (Turning 30, 40, 50, 60...)",
      type: "boolean",
    },
    {
      key: "milestone_age",
      question: "Which milestone?",
      placeholder: "Turning 40",
      type: "text",
      optional: true,
    },
    {
      key: "this_year",
      question: "What's something she's been really into or going through this year?",
      placeholder: "New job, travel plans, a hobby she picked up, something she's proud of...",
      type: "textarea",
      optional: true,
    },
    {
      key: "birthday_plans",
      question: "Any special plans for her birthday?",
      placeholder: "Dinner, trip, surprise party, keeping it low-key...",
      type: "text",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything specific you want to make sure is in the card?",
      type: "textarea",
      optional: true,
    },
  ],
  "Anniversary": [
    {
      key: "years",
      question: "How many years have you been together?",
      placeholder: "e.g. 7 years",
      type: "text",
      hint: "If you've added your marriage date to her profile, we already know this — but you can override it here.",
      optional: true,
    },
    {
      key: "best_moment",
      question: "What's one thing she did this year that meant a lot to you?",
      placeholder: "She held everything together when... / She surprised me when...",
      type: "textarea",
    },
    {
      key: "milestone_anniversary",
      question: "Is this a milestone anniversary? (5th, 10th, 25th...)",
      type: "boolean",
    },
    {
      key: "vibe",
      question: "What's the vibe this year — romantic, funny, sentimental, or all three?",
      placeholder: "She'd love a mix of heartfelt and humor / Just make her cry (happy tears)",
      type: "text",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else?",
      type: "textarea",
      optional: true,
    },
  ],
  "Valentine's Day": [
    {
      key: "plans",
      question: "Any special plans this Valentine's Day?",
      placeholder: "Dinner reservation, trip, staying in, she has no idea...",
      type: "text",
      optional: true,
    },
    {
      key: "something_shes_into",
      question: "What's something she's been wanting or talking about lately?",
      placeholder: "A restaurant, a trip, something she keeps hinting at...",
      type: "textarea",
      optional: true,
    },
    {
      key: "recent_memory",
      question: "Any new memory from this past year worth mentioning?",
      placeholder: "A trip you took, something she did that stuck with you...",
      type: "textarea",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything specific for the card?",
      type: "textarea",
      optional: true,
    },
  ],
  "Christmas": [
    {
      key: "family_news",
      question: "Any big family news or changes this year?",
      placeholder: "New addition, move, big wins, hard things you got through together...",
      type: "textarea",
      optional: true,
    },
    {
      key: "traditions",
      question: "Any new traditions or plans this holiday?",
      type: "text",
      optional: true,
    },
    {
      key: "focus",
      question: "What do you want the card to focus on?",
      placeholder: "Gratitude, family, humor, love, the year we had...",
      type: "text",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else?",
      type: "textarea",
      optional: true,
    },
  ],
  "Thanksgiving": [
    {
      key: "grateful_for",
      question: "What are you most grateful for this year when it comes to her?",
      placeholder: "Something she did, who she is, something she made easier...",
      type: "textarea",
    },
    {
      key: "year_reflection",
      question: "Anything from this year worth reflecting on in the card?",
      type: "textarea",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else?",
      type: "textarea",
      optional: true,
    },
  ],
  "Just Because": [
    {
      key: "occasion",
      question: "What's the reason or context?",
      placeholder: "She had a rough week, we hit a milestone, I just want her to know...",
      type: "textarea",
    },
    {
      key: "feeling",
      question: "What do you want her to feel when she reads it?",
      placeholder: "Loved, seen, appreciated, like she married the right guy...",
      type: "text",
    },
    {
      key: "extra",
      question: "Anything specific to include?",
      type: "textarea",
      optional: true,
    },
  ],
};

/** Get questions for an event, falling back to generic questions */
export function getEventQuestions(event: string): BriefingQuestion[] {
  return (
    EVENT_QUESTIONS[event] ?? [
      {
        key: "context",
        question: `What should we know for the ${event} card?`,
        placeholder: "Any context, recent memories, or specific things to include...",
        type: "textarea",
      },
      {
        key: "extra",
        question: "Anything else?",
        type: "textarea",
        optional: true,
      },
    ]
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const HOLIDAYS = [
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Father's Day",
  "Valentine's Day",
  "Christmas",
  "Hanukkah",
  "Thanksgiving",
  "Easter",
  "New Year's",
  "Graduation",
  "Work Anniversary",
  "Just Because",
  "Get Well Soon",
  "Congratulations",
];

export const RELATIONSHIPS: Relationship[] = [
  "Wife", "Girlfriend", "Husband", "Boyfriend",
  "Mom", "Dad", "Mother in law", "Father in law",
  "Daughter", "Son", "Grandmother", "Grandfather",
  "Sister", "Brother", "Friend", "Employee", "Client", "Other",
];

export const TONES: Tone[] = [
  "Sweet", "Funny", "Romantic", "Simple",
  "Religious", "From the kids", "Apology style",
];

export const AUTOPILOT_LABELS: Record<AutopilotMode, { label: string; description: string }> = {
  full_autopilot: {
    label: "Full Autopilot",
    description: "We write it, we send it. You do nothing.",
  },
  preview_before_mailing: {
    label: "Preview Before Mailing",
    description: "We write it and show you first. You approve with one tap.",
  },
  require_approval: {
    label: "Require My Approval",
    description: "Nothing ships without your sign-off. Control freak mode.",
  },
};

// ─── Storage ─────────────────────────────────────────────────────────────────

const DATA_VERSION = "5";
const STORAGE_KEY_RECIPIENTS = "fi_forgot_recipients";
const STORAGE_KEY_CARDS = "fi_forgot_cards";
const STORAGE_KEY_BRIEFINGS = "fi_forgot_briefings";
const STORAGE_KEY_VERSION = "fi_forgot_data_version";

function ensureDataVersion() {
  const v = localStorage.getItem(STORAGE_KEY_VERSION);
  if (v !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY_RECIPIENTS);
    localStorage.removeItem(STORAGE_KEY_CARDS);
    localStorage.removeItem(STORAGE_KEY_BRIEFINGS);
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

function loadBriefings(): EventBriefing[] {
  ensureDataVersion();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRIEFINGS);
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

export function getBriefings(): EventBriefing[] {
  return loadBriefings();
}

export function getBriefingsForRecipient(recipientId: string): EventBriefing[] {
  return loadBriefings().filter((b) => b.recipientId === recipientId);
}

export function getBriefing(id: string): EventBriefing | undefined {
  return loadBriefings().find((b) => b.id === id);
}

export function saveBriefing(briefing: EventBriefing): void {
  const all = loadBriefings();
  const idx = all.findIndex((b) => b.id === briefing.id);
  if (idx >= 0) {
    all[idx] = briefing;
  } else {
    all.push(briefing);
  }
  localStorage.setItem(STORAGE_KEY_BRIEFINGS, JSON.stringify(all));
}

export function deleteBriefing(id: string): void {
  const all = loadBriefings().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY_BRIEFINGS, JSON.stringify(all));
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

export function defaultDelivery(relationship: Relationship): DeliveryPreference {
  if (["Wife", "Girlfriend", "Mom", "Mother in law", "Grandmother"].includes(relationship)) {
    return "Mail it to me";
  }
  return "Mail it directly to her";
}

export function suggestedEvents(relationship: Relationship): string[] {
  switch (relationship) {
    case "Wife":
    case "Girlfriend":
      return ["Birthday", "Anniversary", "Valentine's Day", "Christmas", "Mother's Day"];
    case "Husband":
    case "Boyfriend":
      return ["Birthday", "Anniversary", "Valentine's Day", "Christmas", "Father's Day"];
    case "Mom":
    case "Mother in law":
      return ["Birthday", "Mother's Day", "Christmas", "Thanksgiving"];
    case "Dad":
    case "Father in law":
      return ["Birthday", "Father's Day", "Christmas", "Thanksgiving"];
    case "Daughter":
    case "Son":
      return ["Birthday", "Graduation", "Christmas"];
    case "Grandmother":
    case "Grandfather":
      return ["Birthday", "Christmas", "Thanksgiving"];
    case "Friend":
      return ["Birthday", "Just Because"];
    case "Employee":
    case "Client":
      return ["Birthday", "Work Anniversary", "Congratulations"];
    default:
      return ["Birthday", "Christmas"];
  }
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
  "Needs profile", "Card being drafted", "Ready for approval",
  "Approved", "Mailed to me", "Mailed to her", "Delivered", "Given",
];
