import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveRecipient, Recipient, Relationship, Tone, DeliveryPreference } from "./data";

export interface OnboardingData {
  recipientName: string;
  relationship: string;
  personality: string[];
  interests: string[];
  tone: string;
  petName: string;
  yearsTogther: string;
  thingsToAvoid: string;
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
  Mom: "Mom",
  "Mother-in-law": "Mother in law",
  Grandma: "Grandmother",
  Sister: "Sister",
  Other: "Other important woman",
};

function onboardingToRecipient(data: OnboardingData): Recipient {
  const rel: Relationship = RELATIONSHIP_MAP[data.relationship] ?? "Other important woman";
  const isMothersRelationship = ["Mom", "Mother-in-law", "Grandma"].includes(data.relationship);
  const isPartner = ["Wife", "Girlfriend"].includes(data.relationship);

  const personalityStr = data.personality.map((p) => PERSONALITY_LABELS[p] ?? p).join(", ");
  const interestsStr = data.interests.map((i) => INTEREST_LABELS[i] ?? i).join(", ");

  const noteParts = [
    personalityStr && `Personality: ${personalityStr}`,
    interestsStr && `Loves: ${interestsStr}`,
    data.yearsTogther && `Together: ${data.yearsTogther}`,
  ].filter(Boolean);

  const deliveryPreference: DeliveryPreference = isPartner
    ? "Mail it to me"
    : "Mail it directly to her";

  return {
    id: Date.now().toString(),
    name: data.recipientName,
    relationship: rel,
    needsMothersDay: isMothersRelationship,
    needsValentinesDay: isPartner,
    needsChristmasHanukkah: true,
    customDates: [],
    tonePreference: TONE_MAP[data.tone] ?? "Sweet",
    personalityNotes: noteParts.join(" | "),
    favoriteMemories: "",
    insideJokes: data.petName ? `Pet name: ${data.petName}` : "",
    thingsToAvoid: data.thingsToAvoid,
    emotionalLevel: 3,
    deliveryPreference,
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
