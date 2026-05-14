import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveRecipient, Recipient, Relationship, Tone, DeliveryPreference, PreviewDays, suggestedEvents } from "./data";

export interface OnboardingData {
  recipientName: string;
  relationship: string;
  personality: string[];
  interests: string[];
  tone: string;
  petName: string;
  yearsTogther: string;
  thingsToAvoid: string;
  selectedEvents: string[];
  eventDates: Record<string, string>;
  previewDays: PreviewDays;
}

interface AuthContextType {
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  completeOnboarding: (data: OnboardingData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  onboardingComplete: true,
  user: null,
  login: () => {},
  signup: () => {},
  completeOnboarding: () => {},
  logout: () => {},
});

const PERSONALITY_LABELS: Record<string, string> = {
  sweet: "Sweet & sentimental",
  funny: "Funny & sarcastic",
  calm: "Calm & graceful",
  tough: "Tough love — no fluff",
  dramatic: "Dramatic — loves big gestures",
  earthy: "Down to earth",
};

const INTEREST_LABELS: Record<string, string> = {
  family: "Family & kids",
  travel: "Travel & adventure",
  food: "Food & cooking",
  reading: "Reading & learning",
  fitness: "Fitness & health",
  music: "Music & arts",
  animals: "Animals & pets",
  nature: "Nature & outdoors",
  movies: "Movies & TV",
  fashion: "Fashion & style",
};

const TONE_MAP: Record<string, Tone> = {
  heartfelt: "Sweet",
  funny: "Funny",
  short: "Simple",
  romantic: "Romantic",
  mix: "Sweet",
};

const RELATIONSHIP_MAP: Record<string, Relationship> = {
  Wife: "Wife",
  Girlfriend: "Girlfriend",
  Husband: "Husband",
  Boyfriend: "Boyfriend",
  Mom: "Mom",
  Dad: "Dad",
  "Mother-in-law": "Mother in law",
  "Father-in-law": "Father in law",
  Grandma: "Grandmother",
  Grandpa: "Grandfather",
  Sister: "Sister",
  Brother: "Brother",
  Friend: "Friend",
  Employee: "Employee",
  Client: "Client",
  Other: "Other",
};

function onboardingToRecipient(data: OnboardingData): Recipient {
  const rel: Relationship = RELATIONSHIP_MAP[data.relationship] ?? "Other";
  const isPartner = ["Wife", "Girlfriend", "Husband", "Boyfriend"].includes(data.relationship);
  const isMom = ["Mom", "Mother-in-law", "Grandma"].includes(data.relationship);
  const isDad = ["Dad", "Father-in-law", "Grandpa"].includes(data.relationship);

  const personalityStr = data.personality.map((p) => PERSONALITY_LABELS[p] ?? p).join(", ");
  const interestsStr = data.interests.map((i) => INTEREST_LABELS[i] ?? i).join(", ");

  const noteParts = [
    personalityStr && `Personality: ${personalityStr}`,
    interestsStr && `Loves: ${interestsStr}`,
  ].filter(Boolean);

  const deliveryPref: DeliveryPreference = isPartner || isMom
    ? "Mail it to me"
    : "Mail it directly to her";

  const events = data.selectedEvents.length > 0
    ? data.selectedEvents
    : suggestedEvents(rel);

  const eventDates = data.eventDates ?? {};
  const customDates: { id: string; label: string; date: string }[] = [];
  if (eventDates["Work Anniversary"])
    customDates.push({ id: "work-anniversary", label: "Work Anniversary", date: eventDates["Work Anniversary"] });
  if (eventDates["Graduation"])
    customDates.push({ id: "graduation", label: "Graduation", date: eventDates["Graduation"] });

  return {
    id: Date.now().toString(),
    name: data.recipientName,
    relationship: rel,
    children: [],
    marriageDate: undefined,
    birthday: eventDates["Birthday"] || undefined,
    anniversaryDate: eventDates["Anniversary"] || undefined,
    needsMothersDay: isMom || events.includes("Mother's Day"),
    needsFathersDay: isDad || events.includes("Father's Day"),
    needsValentinesDay: isPartner || events.includes("Valentine's Day"),
    needsChristmasHanukkah: events.includes("Christmas") || events.includes("Hanukkah"),
    needsThanksgiving: events.includes("Thanksgiving"),
    needsNewYears: events.includes("New Year's"),
    needsEaster: events.includes("Easter"),
    selectedEvents: events,
    customDates,
    tonePreference: TONE_MAP[data.tone] ?? "Sweet",
    personalityNotes: noteParts.join(" | "),
    favoriteMemories: "",
    insideJokes: data.petName ? `Pet name: ${data.petName}` : "",
    thingsToAvoid: data.thingsToAvoid,
    emotionalLevel: 3,
    deliveryPreference: deliveryPref,
    previewDays: data.previewDays ?? 7,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fi_forgot_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsLoggedIn(true);
        const ob = localStorage.getItem("fi_forgot_onboarding");
        setOnboardingComplete(!!ob);
      } catch {}
    }
  }, []);

  function login(email: string, name?: string) {
    const displayName = name ?? email.split("@")[0].replace(/[._]/g, " ");
    const u = { name: displayName, email };
    setUser(u);
    setIsLoggedIn(true);
    setOnboardingComplete(true);
    localStorage.setItem("fi_forgot_user", JSON.stringify(u));
  }

  function signup(name: string, email: string) {
    const u = { name, email };
    setUser(u);
    setIsLoggedIn(true);
    setOnboardingComplete(false);
    localStorage.setItem("fi_forgot_user", JSON.stringify(u));
    localStorage.removeItem("fi_forgot_onboarding");
  }

  function completeOnboarding(data: OnboardingData) {
    localStorage.setItem("fi_forgot_onboarding", JSON.stringify(data));
    if (data.recipientName.trim()) {
      const recipient = onboardingToRecipient(data);
      saveRecipient(recipient);
    }
    setOnboardingComplete(true);
  }

  function logout() {
    setUser(null);
    setIsLoggedIn(false);
    setOnboardingComplete(true);
    localStorage.removeItem("fi_forgot_user");
    localStorage.removeItem("fi_forgot_onboarding");
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, onboardingComplete, user, login, signup, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
