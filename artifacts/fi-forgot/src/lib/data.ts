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

export type DeliveryPreference = "Mail it to me" | "Mail it directly to them";

export type PreviewDays = 14 | 21 | 30;

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

export interface RecipientAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export type RecipientGender = "male" | "female" | "neutral";

export interface Recipient {
  id: string;
  name: string;
  relationship: Relationship;
  gender?: RecipientGender;
  active?: boolean; // undefined/true = autopilot on; false = archived/paused
  profileUpdatedAt?: string; // ISO datetime — set on save; drives freshness decay
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
  senderName?: string; // How this recipient knows the sender — "James", "Dad", "Uncle Jim"
  petName?: string; // Nickname / pet name
  yearsTogther?: string; // How long they've been together (partner relationships)
  personality?: string[]; // Structured personality picks
  interests?: string[]; // Structured interest picks
  tonePreference: Tone;
  personalityNotes: string;
  favoriteMemories: string;
  insideJokes: string;
  thingsToAvoid: string;
  emotionalLevel: number;
  deliveryPreference: DeliveryPreference;
  previewDays: PreviewDays;
  // Contact & delivery
  mailingAddress?: RecipientAddress; // where to send physical cards
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
  overrideAddress?: RecipientAddress;
  keptInMind?: string[];
  keptInMindSources?: string[];
}

// ─── Personalization record ───────────────────────────────────────────────────

export interface PersonalizationRecord {
  items: string[];
  sources: string[];
  occasion: string;
  sentAt: string;
}

const PERSONALIZATION_KEY_PREFIX = "fi_last_personalization_";

export function saveLastPersonalization(recipientId: string, record: Omit<PersonalizationRecord, "sentAt">): void {
  try {
    localStorage.setItem(PERSONALIZATION_KEY_PREFIX + recipientId, JSON.stringify({ ...record, sentAt: new Date().toISOString() }));
  } catch { /* ignore */ }
}

export function getLastPersonalization(recipientId: string): PersonalizationRecord | null {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_KEY_PREFIX + recipientId);
    if (raw) return JSON.parse(raw) as PersonalizationRecord;
  } catch { /* ignore */ }
  return null;
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
  "Birthday": [
    {
      key: "milestone",
      question: "Is this a milestone birthday?",
      hint: "Turning 30, 40, 50, 60... milestones change the whole tone of the card.",
      type: "boolean",
    },
    {
      key: "milestone_age",
      question: "Which milestone? Be specific.",
      placeholder: "She's turning 40",
      type: "text",
      optional: true,
    },
    {
      key: "this_year",
      question: "What's something she went through or accomplished this past year?",
      placeholder: "New job, a big move, something she crushed, something she survived, a hobby she got weirdly obsessed with...",
      type: "textarea",
      optional: true,
    },
    {
      key: "how_she_celebrates",
      question: "How does she like to celebrate — low key, big dinner, surprised, or just you two?",
      placeholder: "She hates surprises but loves a long dinner / She wants a big night out / She'd rather skip it honestly...",
      type: "text",
      optional: true,
    },
    {
      key: "birthday_tradition",
      question: "Any birthday tradition or inside joke between you two that could work in the card?",
      placeholder: "Every year she says she doesn't want anything and then... / She always makes the same wish... / The thing she does every birthday...",
      type: "textarea",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything specific you want to make sure is in the card?",
      placeholder: "A feeling, a phrase, something only you'd say...",
      type: "textarea",
      optional: true,
    },
  ],

  "Anniversary": [
    {
      key: "years",
      question: "How many years have you been together?",
      placeholder: "7 years",
      type: "text",
      hint: "If you added your marriage date to her profile, we already filled this in — but you can override it.",
      optional: true,
    },
    {
      key: "milestone_anniversary",
      question: "Is this a milestone anniversary?",
      hint: "5th, 10th, 25th, 50th — big ones deserve a bigger card.",
      type: "boolean",
    },
    {
      key: "milestone_which",
      question: "Which one?",
      placeholder: "10th anniversary",
      type: "text",
      optional: true,
    },
    {
      key: "best_moment",
      question: "What's one moment from this past year together you never want to forget?",
      placeholder: "She surprised me when... / The night we... / When she said... / The trip where...",
      type: "textarea",
    },
    {
      key: "why_her",
      question: "What did she do this year that reminded you why you picked her?",
      placeholder: "She held everything together when... / She just always... / She stepped up and...",
      type: "textarea",
      optional: true,
    },
    {
      key: "yours_as_couple",
      question: "Is there a place, song, phrase, or tradition that's uniquely 'yours' as a couple?",
      placeholder: "Our spot, our song, the thing we always say, the trip that changed everything...",
      type: "textarea",
      optional: true,
    },
    {
      key: "vibe",
      question: "What vibe do you want — sentimental, funny, a mix of both?",
      placeholder: "Make her cry (happy tears) / Make her laugh first, then feel it / She'd roll her eyes at anything too serious",
      type: "text",
      optional: true,
    },
  ],

  "Mother's Day": [
    {
      key: "children",
      question: "Who are her kids?",
      type: "children",
      hint: "We use names, genders, and ages to make the card feel personal and current. Ages update automatically each year — you only add them once.",
    },
    {
      key: "first_mothers_day",
      question: "Is this her first Mother's Day as a mom?",
      type: "boolean",
      optional: true,
    },
    {
      key: "mom_moment",
      question: "What's one specific mom thing she did this year that stuck with you?",
      placeholder: "She stayed up all night when... / The way she handled... / That moment with the kids where... / She just always...",
      type: "textarea",
      optional: true,
    },
    {
      key: "what_she_sacrifices",
      question: "What does she do for the kids that they probably don't notice — but you do?",
      placeholder: "She always makes sure... / She gives up... / She never complains about... / Every single morning she...",
      type: "textarea",
      optional: true,
    },
    {
      key: "kids_would_say",
      question: "If the kids could put it into words today — what would they want her to know?",
      placeholder: "Even if they're too little to say it yet / Something they've said that you remember / What you know they feel...",
      type: "textarea",
      optional: true,
    },
    {
      key: "big_change",
      question: "Any big family changes this year worth acknowledging?",
      placeholder: "New baby, kid starting school, a move, a tough stretch she pushed through...",
      type: "textarea",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else she should hear?",
      placeholder: "A feeling, something you don't say enough, something only you'd know to say...",
      type: "textarea",
      optional: true,
    },
  ],

  "Father's Day": [
    {
      key: "children",
      question: "Who are the kids?",
      type: "children",
      hint: "We'll use names and ages to personalize the card. Ages update automatically each year.",
    },
    {
      key: "dad_moment",
      question: "What's one standout dad moment from this past year?",
      placeholder: "He coached the whole season, was there the day it mattered, just always shows up without making it a thing...",
      type: "textarea",
      optional: true,
    },
    {
      key: "what_he_brings",
      question: "What does he bring to the family that doesn't get said enough?",
      placeholder: "He's the one who always... / The kids feel safe because... / Without him...",
      type: "textarea",
      optional: true,
    },
    {
      key: "this_year",
      question: "Any big changes or proud moments for him this year?",
      placeholder: "New job, a big win, something he worked hard for, something he got through...",
      type: "textarea",
      optional: true,
    },
    {
      key: "tone",
      question: "How should the card land — funny, sincere, or a mix?",
      placeholder: "He'd hate a mushy card / He cries at commercials, go for it / He needs to laugh before he feels anything",
      type: "text",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else he should hear?",
      type: "textarea",
      optional: true,
    },
  ],

  "Valentine's Day": [
    {
      key: "years_together",
      question: "How long have you two been together?",
      placeholder: "3 years, since college, feels like forever and also yesterday...",
      type: "text",
    },
    {
      key: "recent_win",
      question: "What's something she did recently that you want to make her feel good about?",
      placeholder: "She stepped up when... / She's been killing it at... / She surprised me by... / The way she handled...",
      type: "textarea",
    },
    {
      key: "memory",
      question: "Any specific memory from this past year that's stuck with you?",
      placeholder: "That trip, that night, that conversation, that moment where you just looked at her and thought...",
      type: "textarea",
      optional: true,
    },
    {
      key: "what_you_love",
      question: "What's something you love about her that you probably don't say out loud enough?",
      placeholder: "The way she... / How she always... / The thing she does that you hope your kids get from her...",
      type: "textarea",
      optional: true,
    },
    {
      key: "plans",
      question: "Any plans for the day?",
      placeholder: "Dinner reservation, trip, total surprise, we're keeping it low key this year...",
      type: "text",
      optional: true,
    },
    {
      key: "feel",
      question: "What do you want her to feel when she reads this?",
      placeholder: "Seen, loved, lucky, like she married the right guy, like she matters more than she knows...",
      type: "text",
      optional: true,
    },
  ],

  "Christmas": [
    {
      key: "her_this_year",
      question: "What did she do this year that you're genuinely proud of or grateful for?",
      placeholder: "She held things together, took a real risk, was there for everyone, just kept being exactly who she is...",
      type: "textarea",
      optional: true,
    },
    {
      key: "year_in_review",
      question: "Any big life events from this year worth acknowledging in the card?",
      placeholder: "New addition, a move, a promotion, a tough thing you got through together...",
      type: "textarea",
      optional: true,
    },
    {
      key: "tradition",
      question: "Any holiday tradition that's hers or yours as a family?",
      placeholder: "She always bakes the same thing / We always do... / The thing the kids look forward to every year...",
      type: "text",
      optional: true,
    },
    {
      key: "how_shes_feeling",
      question: "How's she feeling heading into the holidays this year?",
      placeholder: "Excited, exhausted but happy, going through something, better than last year...",
      type: "text",
      optional: true,
    },
    {
      key: "who_celebrating",
      question: "Who's celebrating with you?",
      placeholder: "Big family gathering, just us and the kids, long distance this year, first Christmas in the new place...",
      type: "text",
      optional: true,
    },
    {
      key: "feel",
      question: "What do you want the card to make her feel?",
      placeholder: "Grateful, loved, like the year was worth it, like you see her...",
      type: "text",
      optional: true,
    },
  ],

  "Thanksgiving": [
    {
      key: "grateful_for",
      question: "What are you most grateful for — specifically because of her — this year?",
      placeholder: "Something she did, something she is, something she made easier, the fact that she's just... her...",
      type: "textarea",
    },
    {
      key: "she_brings",
      question: "What does she bring to the family that doesn't get said enough?",
      placeholder: "She's the one who always... / The house would fall apart without... / She makes every holiday feel like...",
      type: "textarea",
      optional: true,
    },
    {
      key: "her_year",
      question: "Did she have a big milestone or tough stretch this year worth acknowledging?",
      placeholder: "New job, health stuff, a big win, something she pushed through and didn't make a big deal of...",
      type: "textarea",
      optional: true,
    },
    {
      key: "celebrating",
      question: "How are you celebrating this year?",
      placeholder: "Big family dinner, just the two of you, traveling, first Thanksgiving in the new house...",
      type: "text",
      optional: true,
    },
    {
      key: "extra",
      question: "Anything else she should hear?",
      placeholder: "Something you've been meaning to say, a feeling, something that's been on your mind...",
      type: "textarea",
      optional: true,
    },
  ],

  "Just Because": [
    {
      key: "why_now",
      question: "What's prompting this card right now?",
      placeholder: "They had a rough week and don't know you noticed / They did something that floored me / I just felt like it / They deserve to hear this and I'm bad at saying it out loud...",
      type: "textarea",
    },
    {
      key: "her_lately",
      question: "How have they been doing lately?",
      placeholder: "Stressed but powering through / In their element / Going through something / Better than they think they are...",
      type: "text",
      optional: true,
    },
    {
      key: "want_to_say",
      question: "If you could say one thing to them that you haven't said enough — what would it be?",
      placeholder: "You're doing a better job than you think / I see how hard you work / I don't say this enough but... / The thing I notice that they don't know I notice...",
      type: "textarea",
    },
    {
      key: "reference",
      question: "Any specific moment, thing they did, or something they said that you want referenced?",
      placeholder: "Something recent, something they're proud of, something only you two would understand...",
      type: "textarea",
      optional: true,
    },
    {
      key: "feel",
      question: "What do you want them to feel when they read it?",
      placeholder: "Seen, appreciated, like they matter more than they know, like things are going to be okay...",
      type: "text",
      optional: true,
    },
  ],
};

function applyPronouns(text: string | undefined, gender: RecipientGender): string {
  if (!text || gender === "female") return text ?? "";
  if (gender === "male") {
    return text
      .replace(/\bShe's\b/g, "He's")
      .replace(/\bshe's\b/g, "he's")
      .replace(/\bShe'd\b/g, "He'd")
      .replace(/\bshe'd\b/g, "he'd")
      .replace(/\bShe'll\b/g, "He'll")
      .replace(/\bshe'll\b/g, "he'll")
      .replace(/\bShe\b/g, "He")
      .replace(/\bshe\b/g, "he")
      .replace(/\bher (profile|year|day|kids|family|heart|story|card|name|role|work|way|win|moment|strength)\b/g, "his $1")
      .replace(/\bHer (profile|year|day|kids|family|heart|story|card|name|role|work|way|win|moment|strength)\b/g, "His $1")
      .replace(/\bher\b/g, "him")
      .replace(/\bHer\b/g, "Him");
  }
  // neutral
  return text
    .replace(/\bShe's\b/g, "They're")
    .replace(/\bshe's\b/g, "they're")
    .replace(/\bShe'd\b/g, "They'd")
    .replace(/\bshe'd\b/g, "they'd")
    .replace(/\bShe'll\b/g, "They'll")
    .replace(/\bshe'll\b/g, "they'll")
    .replace(/\bShe\b/g, "They")
    .replace(/\bshe\b/g, "they")
    .replace(/\bher (profile|year|day|kids|family|heart|story|card|name|role|work|way|win|moment|strength)\b/g, "their $1")
    .replace(/\bHer (profile|year|day|kids|family|heart|story|card|name|role|work|way|win|moment|strength)\b/g, "Their $1")
    .replace(/\bher\b/g, "them")
    .replace(/\bHer\b/g, "Them");
}

/** Get questions for an event, falling back to generic questions */
export function getEventQuestions(event: string, gender: RecipientGender = "female"): BriefingQuestion[] {
  const questions: BriefingQuestion[] = EVENT_QUESTIONS[event] ?? [
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
  ];
  if (gender === "female") return questions;
  return questions.map((q) => ({
    ...q,
    question: applyPronouns(q.question, gender),
    placeholder: applyPronouns(q.placeholder, gender),
    hint: applyPronouns(q.hint, gender),
  }));
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

// Relationships where the recipient IS a father figure — Father's Day appropriate
export const FATHERS_DAY_RELATIONSHIPS: Relationship[] = [
  "Dad", "Father in law", "Husband", "Boyfriend", "Grandfather",
];

// Relationships where the recipient IS a mother figure — Mother's Day appropriate
export const MOTHERS_DAY_RELATIONSHIPS: Relationship[] = [
  "Mom", "Mother in law", "Wife", "Girlfriend", "Grandmother",
];

/**
 * Returns the subset of HOLIDAYS that make sense for this relationship.
 * Father's Day is only offered when the recipient is a dad/grandfather/partner.
 * Mother's Day is only offered when the recipient is a mom/grandmother/partner.
 */
export function availableHolidays(relationship: Relationship | string): string[] {
  return HOLIDAYS.filter(h => {
    if (h === "Father's Day" && !FATHERS_DAY_RELATIONSHIPS.includes(relationship as Relationship)) return false;
    if (h === "Mother's Day" && !MOTHERS_DAY_RELATIONSHIPS.includes(relationship as Relationship)) return false;
    return true;
  });
}

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

export const PREVIEW_DAYS_OPTIONS: { days: PreviewDays; label: string; description: string; badge?: string }[] = [
  { days: 14, label: "14 days before", description: "Draft hits your inbox 14 days out. We ping you every day after that. Act on it or don't — we ship the card either way.", badge: "RECOMMENDED" },
  { days: 21, label: "21 days before", description: "Three weeks of daily reminders before we pull the trigger. More runway, same result." },
  { days: 30, label: "30 days before", description: "A whole month of daily pings. If you still haven't touched it, we handle it. No excuses accepted." },
];

// ─── Personal settings ───────────────────────────────────────────────────────

export interface PersonalSettings {
  automationMode: "autopilot" | "approve";
  defaultTone: Tone;
  cardSignature: string;
  cardFont: string;
  notifyTiming: string[];
  notifyChannel: "email" | "text" | "both";
  notifyEmail: string;
  notifyPhone: string;
}

const DEFAULT_PERSONAL_SETTINGS: PersonalSettings = {
  automationMode: "approve",
  defaultTone: "Sweet",
  cardSignature: "",
  cardFont: "",
  notifyTiming: ["14 days before it mails"],
  notifyChannel: "email",
  notifyEmail: "",
  notifyPhone: "",
};

const STORAGE_KEY_SETTINGS = "fi_forgot_personal_settings";

export function getPersonalSettings(): PersonalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return { ...DEFAULT_PERSONAL_SETTINGS, ...JSON.parse(raw) as Partial<PersonalSettings> };
  } catch { /* ignore */ }
  return { ...DEFAULT_PERSONAL_SETTINGS };
}

export function savePersonalSettings(s: PersonalSettings): void {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
}

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
    if (raw) {
      const parsed = JSON.parse(raw) as Recipient[];
      return parsed.map((r) => ({
        ...r,
        deliveryPreference: (r.deliveryPreference as string) === "Mail it directly to her"
          ? "Mail it directly to them"
          : r.deliveryPreference,
      }));
    }
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

// ─── Server sync ─────────────────────────────────────────────────────────────

let _serverUserId: string | null = null;

export function setServerSyncUserId(id: string | null): void {
  _serverUserId = id;
}

function syncHeaders(): HeadersInit {
  return _serverUserId ? { "Content-Type": "application/json", "x-user-id": _serverUserId } : { "Content-Type": "application/json" };
}

export function getApiHeaders(): HeadersInit {
  return syncHeaders();
}

/** On login: fetch server recipients. If server has data, replace local. If not, push local to server. */
export async function hydrateRecipientsFromServer(userId: string): Promise<void> {
  try {
    const res = await fetch("/api/recipients", { headers: { "x-user-id": userId } });
    if (!res.ok) return;
    const { recipients: serverRecipients } = await res.json() as { recipients: Recipient[] };
    if (serverRecipients.length > 0) {
      localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(serverRecipients));
    } else {
      const local = loadRecipients();
      if (local.length > 0) {
        await Promise.all(local.map(r =>
          fetch(`/api/recipients/${r.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-user-id": userId },
            body: JSON.stringify(r),
          })
        ));
      }
    }
  } catch { /* non-blocking */ }
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

  if (_serverUserId) {
    fetch(`/api/recipients/${recipient.id}`, {
      method: "PUT",
      headers: syncHeaders(),
      body: JSON.stringify(recipient),
    }).catch(() => {});
  }
}

export function deleteRecipient(id: string): void {
  const all = loadRecipients().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_RECIPIENTS, JSON.stringify(all));

  if (_serverUserId) {
    fetch(`/api/recipients/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": _serverUserId },
    }).catch(() => {});
  }
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
  if (_serverUserId) {
    fetch("/api/personal/cards", {
      method: "POST",
      headers: syncHeaders(),
      body: JSON.stringify(card),
    }).catch(() => {});
  }
}

export function saveCard(card: CardOrder): void {
  let all = loadCards();
  const existingIdx = all.findIndex((c) => c.id === card.id);
  if (existingIdx >= 0) {
    all[existingIdx] = card;
  } else {
    // Remove any stale "Ready for approval" cards for the same recipient+holiday
    // before adding the new one, so the review queue never shows outdated cards.
    all = all.filter(
      (c) =>
        !(c.recipientId === card.recipientId &&
          c.holiday === card.holiday &&
          c.status === "Ready for approval")
    );
    all.push(card);
  }
  localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(all));
  if (_serverUserId) {
    fetch("/api/personal/cards", {
      method: "POST",
      headers: syncHeaders(),
      body: JSON.stringify(card),
    }).catch(() => {});
  }
}

export function deleteCard(id: string): void {
  const all = loadCards().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(all));
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
  if (_serverUserId) {
    fetch("/api/personal/briefings", {
      method: "POST",
      headers: syncHeaders(),
      body: JSON.stringify(briefing),
    }).catch(() => {});
  }
}

export function deleteBriefing(id: string): void {
  const all = loadBriefings().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY_BRIEFINGS, JSON.stringify(all));
}

export async function hydrateCardsFromServer(userId: string): Promise<void> {
  try {
    const res = await fetch("/api/personal/cards", { headers: { "x-user-id": userId } });
    if (!res.ok) return;
    const { cards: serverCards } = await res.json() as { cards: CardOrder[] };
    if (serverCards.length > 0) {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(serverCards));
    } else {
      const local = loadCards();
      if (local.length > 0) {
        await Promise.all(local.map(c =>
          fetch("/api/personal/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": userId },
            body: JSON.stringify(c),
          })
        ));
      }
    }
  } catch { /* non-blocking */ }
}

export async function hydrateBriefingsFromServer(userId: string): Promise<void> {
  try {
    const res = await fetch("/api/personal/briefings", { headers: { "x-user-id": userId } });
    if (!res.ok) return;
    const { answers } = await res.json() as { answers: { recipientId: string; eventType: string; eventYear: number; questionKey: string; questionText: string; answerText: string; createdAt: string }[] };

    if (answers.length === 0) {
      const local = loadBriefings();
      if (local.length > 0) {
        await Promise.all(local.map(b =>
          fetch("/api/personal/briefings", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": userId },
            body: JSON.stringify(b),
          })
        ));
      }
      return;
    }

    // Group flat Q&A rows back into EventBriefing objects keyed by (recipientId, event, year)
    const groups = new Map<string, typeof answers>();
    for (const row of answers) {
      const key = `${row.recipientId}_${row.eventType}_${row.eventYear}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    // Use existing local briefings to recover original IDs and recipientName
    const local = loadBriefings();
    const localByKey = new Map(local.map(b => [`${b.recipientId}_${b.event}_${b.year}`, b]));
    const recipientMap = new Map(loadRecipients().map(r => [r.id, r.name]));

    const rebuilt: EventBriefing[] = [];
    for (const [key, rows] of groups) {
      const existing = localByKey.get(key);
      const first = rows[0];
      rebuilt.push({
        id: existing?.id ?? `server_${key}`,
        recipientId: first.recipientId,
        recipientName: existing?.recipientName ?? recipientMap.get(first.recipientId) ?? "",
        event: first.eventType,
        year: first.eventYear,
        completedAt: existing?.completedAt ?? first.createdAt,
        answers: rows.map(r => ({
          questionKey: r.questionKey,
          question: r.questionText,
          answer: r.answerText,
        })),
      });
    }

    // Merge: rebuilt server briefings win; keep any local-only briefings not on the server
    const serverKeys = new Set(groups.keys());
    const localOnly = local.filter(b => !serverKeys.has(`${b.recipientId}_${b.event}_${b.year}`));
    localStorage.setItem(STORAGE_KEY_BRIEFINGS, JSON.stringify([...rebuilt, ...localOnly]));
  } catch { /* non-blocking */ }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

export function defaultDelivery(relationship: Relationship): DeliveryPreference {
  if (["Wife", "Girlfriend", "Mom", "Mother in law", "Grandmother"].includes(relationship)) {
    return "Mail it to me";
  }
  return "Mail it directly to them";
}

export function suggestedEvents(relationship: Relationship): string[] {
  switch (relationship) {
    case "Wife":
    case "Girlfriend":
      return ["Birthday", "Anniversary", "Valentine's Day", "Christmas", "Mother's Day", "Just Because"];
    case "Husband":
    case "Boyfriend":
      return ["Birthday", "Anniversary", "Valentine's Day", "Christmas", "Father's Day", "Just Because"];
    case "Mom":
    case "Mother in law":
      return ["Birthday", "Mother's Day", "Christmas", "Thanksgiving", "Just Because"];
    case "Dad":
    case "Father in law":
      return ["Birthday", "Father's Day", "Christmas", "Thanksgiving", "Just Because"];
    case "Daughter":
    case "Son":
      return ["Birthday", "Graduation", "Christmas", "Just Because"];
    case "Grandmother":
    case "Grandfather":
      return ["Birthday", "Christmas", "Thanksgiving", "Just Because"];
    case "Friend":
      return ["Birthday", "Just Because"];
    case "Employee":
    case "Client":
      return ["Birthday", "Work Anniversary", "Congratulations"];
    default:
      return ["Birthday", "Christmas", "Just Because"];
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
