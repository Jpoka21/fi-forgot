import type { Recipient } from "@/lib/data";

/** Shared palette for personal (Home + relationship hub) surfaces */
export const PB = {
  cream:  "#FAF7F4",
  beige:  "#F2E6D3",
  red:    "#E23B2E",
  ink:    "#1F1F1F",
  mid:    "#4B5563",
  white:  "#FFFFFF",
  sage:   "#5B8C6B",
  amber:  "#C97A0A",
  border: "#E5E0D8",
} as const;

const SENSITIVE_EVENTS = new Set([
  "sympathy", "apology", "thinking of you", "get well", "condolence",
  "loss", "grief", "funeral", "illness", "cancer", "hospital",
]);

export function isSensitiveOccasion(event: string): boolean {
  const lower = event.toLowerCase();
  return [...SENSITIVE_EVENTS].some(k => lower.includes(k));
}

const AVATAR_PALETTES = [
  { bg: "#F2E6D3", fg: "#8B5E3C" },
  { bg: "#E4EDE7", fg: "#3D6B50" },
  { bg: "#EDE8F5", fg: "#5E4B8B" },
  { bg: "#FDEAEA", fg: "#8B3030" },
  { bg: "#E5EDF8", fg: "#2D5087" },
  { bg: "#FDF3E1", fg: "#7A5C00" },
];

export function personInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

export function avatarPalette(name: string) {
  return AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];
}

export function urgencyAccent(daysAway: number): string {
  if (daysAway <= 3) return PB.red;
  if (daysAway <= 7) return PB.amber;
  return PB.sage;
}

export function formatBigDate(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

export function daysLabel(n: number): string {
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  return `in ${n} days`;
}

export function occasionPhrase(event: string, daysAway: number, dateStr: string, sincere = false): string {
  if (sincere || isSensitiveOccasion(event)) {
    const longDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    if (daysAway === 0) return `${event} is today. We're here if you need us.`;
    if (daysAway === 1) return `${event} is tomorrow.`;
    if (daysAway <= 14) return `${event} is in ${daysAway} days.`;
    return `${event} is ${longDate}.`;
  }
  if (daysAway === 0) return `${event} is today — don't blow it.`;
  if (daysAway === 1) return `${event} is tomorrow. Clock's ticking.`;
  if (daysAway <= 7) return `${event} is in ${daysAway} days. Danger zone.`;
  if (daysAway <= 14) return `${event} is in ${daysAway} days.`;
  const longDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric",
  });
  return `${event} · ${longDate}`;
}

export function buildHomeHeroSubline(upcomingCount: number, first?: { name: string; event: string; daysAway: number }): string {
  if (upcomingCount === 0) {
    return "We remember the people who matter. You get the credit when the card lands.";
  }
  if (upcomingCount === 1 && first) {
    return `${first.name}'s ${first.event} is ${daysLabel(first.daysAway)}. We've got your back.`;
  }
  if (upcomingCount <= 3) {
    return `${upcomingCount} cards coming up. We'll help you not look forgetful.`;
  }
  return "A few people need you soon. We'll nudge you before it's awkward.";
}

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 },
  "Mother's Day":    { month: 5,  day: 12 },
  "Father's Day":    { month: 6,  day: 16 },
  "Thanksgiving":    { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 },
  "Hanukkah":        { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  },
  "Easter":          { month: 4,  day: 20 },
};

function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const d = new Date(year, month - 1, 1);
  const offset = (weekday - d.getDay() + 7) % 7;
  return new Date(year, month - 1, 1 + offset + (nth - 1) * 7);
}

function floatingHolidayDate(event: string, year: number): Date | null {
  if (event === "Mother's Day")  return nthWeekday(year, 5,  0, 2);
  if (event === "Father's Day")  return nthWeekday(year, 6,  0, 3);
  if (event === "Thanksgiving")  return nthWeekday(year, 11, 4, 4);
  return null;
}

export function getEventDateForRecipient(event: string, r: Recipient): string | null {
  const now = new Date();
  const year = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d = new Date(year, (p[1] ?? 1) - 1, p[2] ?? 1);
    if (d < now) d = new Date(year + 1, (p[1] ?? 1) - 1, p[2] ?? 1);
    return fmt(d);
  };
  if (event === "Birthday" && r.birthday) return next(r.birthday);
  if (event === "Anniversary") {
    const src = r.anniversaryDate ?? r.marriageDate;
    if (src) return next(src);
  }
  const custom = r.customDates?.find(c => c.label === event);
  if (custom?.date) return next(custom.date);
  const floating = floatingHolidayDate(event, year);
  if (floating) {
    if (floating < now) return fmt(floatingHolidayDate(event, year + 1)!);
    return fmt(floating);
  }
  const fixed = HOLIDAY_DATES[event];
  if (fixed) return next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  return null;
}

export function getNextOccasion(r: Recipient): { event: string; daysAway: number; dateStr: string } | null {
  const today = new Date();
  let best: { event: string; daysAway: number; dateStr: string } | null = null;
  for (const event of r.selectedEvents ?? []) {
    const dateStr = getEventDateForRecipient(event, r);
    if (!dateStr) continue;
    const d = new Date(dateStr + "T12:00:00");
    if (d < today) continue;
    const daysAway = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (!best || daysAway < best.daysAway) best = { event, daysAway, dateStr };
  }
  return best;
}

export function personStatusLine(
  r: Recipient,
  opts: { daysAway?: number | null; hasCard?: boolean; memoryThin?: boolean },
): string {
  if (opts.memoryThin) return "Needs a memory before we can sound charming.";
  const next = getNextOccasion(r);
  if (opts.daysAway != null && opts.daysAway <= 7) {
    const ev = next?.event ?? "Their occasion";
    if (isSensitiveOccasion(ev)) return "A meaningful moment is coming up soon.";
    if (ev.toLowerCase().includes("birthday")) return "Birthday danger zone.";
    return `${ev} is close — don't sleep on it.`;
  }
  if (opts.hasCard) return "Card's ready. You're off the hook.";
  if ((r.selectedEvents?.length ?? 0) === 0) return "Add an occasion so we can watch your back.";
  return "You're safe for now.";
}

export function recipientHasThinMemory(r: Recipient): boolean {
  const notes = [r.personalityNotes, r.favoriteMemories, r.insideJokes].filter(Boolean).join("");
  return notes.trim().length < 20 && (r.interests?.length ?? 0) === 0;
}
