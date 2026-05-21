import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveRecipient, Recipient, Relationship, Tone, DeliveryPreference, PreviewDays, suggestedEvents } from "./data";
import type { Plan } from "./plan";

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
  emotionalLevel?: number;
  favoriteMemories?: string;
  insideJokes?: string;
  deliveryPreference?: "Mail it to me" | "Mail it directly to her";
  mailingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface Workspace {
  id: string;
  type: "personal" | "business";
  name: string;
  businessType?: string;
  businessId?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  user: { name: string; email: string; plan?: Plan } | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  businessSignup: (name: string, email: string, businessName: string, businessType: string) => void;
  completeOnboarding: (data: OnboardingData) => void;
  logout: () => void;
  upgradePlan: (plan: Plan) => void;
  switchWorkspace: (id: string) => void;
  createBusinessWorkspace: (businessName: string, businessType: string) => Workspace;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  onboardingComplete: true,
  user: null,
  workspaces: [],
  activeWorkspace: null,
  login: () => {},
  signup: () => {},
  businessSignup: () => {},
  completeOnboarding: () => {},
  logout: () => {},
  upgradePlan: () => {},
  switchWorkspace: () => {},
  createBusinessWorkspace: () => ({ id: "", type: "business", name: "" }),
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
  if (eventDates["Just Because"])
    customDates.push({ id: "just-because", label: "Just Because", date: eventDates["Just Because"] });

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
    favoriteMemories: data.favoriteMemories ?? "",
    insideJokes: [
      data.insideJokes ?? "",
      data.petName ? `Pet name: ${data.petName}` : "",
    ].filter(Boolean).join(" | "),
    thingsToAvoid: data.thingsToAvoid,
    emotionalLevel: data.emotionalLevel ?? 3,
    deliveryPreference: data.deliveryPreference ?? deliveryPref,
    mailingAddress: data.mailingAddress?.line1?.trim()
      ? (data.mailingAddress as import("./data").RecipientAddress)
      : undefined,
    previewDays: data.previewDays ?? 14,
  };
}

const STORAGE_VERSION = "2";
const ALL_STORAGE_KEYS = [
  "fi_forgot_user",
  "fi_forgot_onboarding",
  "fi_forgot_recipients",
  "fi_forgot_cards",
  "fi_forgot_briefings",
];

function clearAllUserData() {
  ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function loadWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem("fi_forgot_workspaces");
    if (!raw) return [];
    return JSON.parse(raw) as Workspace[];
  } catch { return []; }
}

function saveWorkspaces(ws: Workspace[]) {
  localStorage.setItem("fi_forgot_workspaces", JSON.stringify(ws));
}

function loadActiveWorkspaceId(): string | null {
  return localStorage.getItem("fi_forgot_active_workspace");
}

function saveActiveWorkspaceId(id: string) {
  localStorage.setItem("fi_forgot_active_workspace", id);
}

function makePersonalWorkspace(): Workspace {
  return { id: crypto.randomUUID(), type: "personal", name: "Personal" };
}

function makeBusinessWorkspace(businessName: string, businessType: string): Workspace {
  return {
    id: crypto.randomUUID(),
    type: "business",
    name: businessName,
    businessType,
    businessId: crypto.randomUUID(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; plan?: Plan } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const version = localStorage.getItem("fi_forgot_storage_version");
    if (version !== STORAGE_VERSION) {
      clearAllUserData();
      localStorage.setItem("fi_forgot_storage_version", STORAGE_VERSION);
      return;
    }

    const stored = localStorage.getItem("fi_forgot_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsLoggedIn(true);
        const ob = localStorage.getItem("fi_forgot_onboarding");
        setOnboardingComplete(!!ob);

        let ws = loadWorkspaces();
        // Repair: any business workspace missing a businessId gets one assigned
        const repaired = ws.map(w =>
          (w.type === "business" && !w.businessId)
            ? { ...w, businessId: crypto.randomUUID() }
            : w
        );
        if (repaired.some((w, i) => w.businessId !== ws[i].businessId)) {
          saveWorkspaces(repaired);
          ws = repaired;
        }
        setWorkspaces(ws);
        const activeId = loadActiveWorkspaceId();
        const active = ws.find(w => w.id === activeId) ?? ws[0] ?? null;
        setActiveWorkspace(active);
      } catch {}
    }

    // Migrate old fi_forgot_business data into workspaces
    const oldBiz = localStorage.getItem("fi_forgot_business");
    if (oldBiz) {
      try {
        const biz = JSON.parse(oldBiz);
        const ws = loadWorkspaces();
        const alreadyMigrated = ws.some(w => w.type === "business");
        if (!alreadyMigrated && biz.businessId) {
          const bizWorkspace: Workspace = {
            id: crypto.randomUUID(),
            type: "business",
            name: biz.businessName || "My Business",
            businessType: biz.businessType || "",
            businessId: biz.businessId,
          };
          const updated = [...ws, bizWorkspace];
          saveWorkspaces(updated);
          setWorkspaces(updated);
        }
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

    // Ensure a personal workspace exists
    let ws = loadWorkspaces();
    if (ws.length === 0) {
      const personal = makePersonalWorkspace();
      ws = [personal];
      saveWorkspaces(ws);
    }
    setWorkspaces(ws);
    const activeId = loadActiveWorkspaceId();
    const active = ws.find(w => w.id === activeId) ?? ws[0] ?? null;
    setActiveWorkspace(active);
    if (active) saveActiveWorkspaceId(active.id);
  }

  function signup(name: string, email: string) {
    const u = { name, email };
    setUser(u);
    setIsLoggedIn(true);
    setOnboardingComplete(false);
    localStorage.setItem("fi_forgot_user", JSON.stringify(u));
    localStorage.removeItem("fi_forgot_onboarding");

    // Create personal workspace
    const personal = makePersonalWorkspace();
    const ws = [personal];
    saveWorkspaces(ws);
    saveActiveWorkspaceId(personal.id);
    setWorkspaces(ws);
    setActiveWorkspace(personal);
  }

  function businessSignup(name: string, email: string, businessName: string, businessType: string) {
    const u = { name, email };
    setUser(u);
    setIsLoggedIn(true);
    setOnboardingComplete(true);
    localStorage.setItem("fi_forgot_user", JSON.stringify(u));

    // Create personal + business workspaces
    const personal = makePersonalWorkspace();
    const business = makeBusinessWorkspace(businessName, businessType);
    const ws = [personal, business];
    saveWorkspaces(ws);
    saveActiveWorkspaceId(business.id);
    setWorkspaces(ws);
    setActiveWorkspace(business);
  }

  function createBusinessWorkspace(businessName: string, businessType: string): Workspace {
    const business = makeBusinessWorkspace(businessName, businessType);
    const ws = [...loadWorkspaces(), business];
    saveWorkspaces(ws);
    saveActiveWorkspaceId(business.id);
    setWorkspaces(ws);
    setActiveWorkspace(business);
    return business;
  }

  function switchWorkspace(id: string) {
    const ws = workspaces.find(w => w.id === id) ?? null;
    setActiveWorkspace(ws);
    if (ws) saveActiveWorkspaceId(ws.id);
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
    setWorkspaces([]);
    setActiveWorkspace(null);
    localStorage.removeItem("fi_forgot_user");
    localStorage.removeItem("fi_forgot_onboarding");
    localStorage.removeItem("fi_forgot_workspaces");
    localStorage.removeItem("fi_forgot_active_workspace");
    localStorage.removeItem("fi_forgot_business");
  }

  function upgradePlan(plan: Plan) {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, plan };
      localStorage.setItem("fi_forgot_user", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn, onboardingComplete, user,
      workspaces, activeWorkspace,
      login, signup, businessSignup, completeOnboarding, logout, upgradePlan,
      switchWorkspace, createBusinessWorkspace,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
