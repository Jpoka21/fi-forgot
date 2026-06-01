import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveRecipient, Recipient, Relationship, Tone, DeliveryPreference, PreviewDays, suggestedEvents, RecipientAddress, setServerSyncUserId, hydrateRecipientsFromServer } from "./data";
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
  deliveryPreference?: "Mail it to me" | "Mail it directly to them";
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
  user: { name: string; email: string; plan?: Plan; mailingAddress?: RecipientAddress } | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string, skipOnboarding?: boolean) => void;
  businessSignup: (name: string, email: string, businessName: string, businessType: string) => void;
  completeOnboarding: (data: OnboardingData) => void;
  logout: () => void;
  upgradePlan: (plan: Plan) => void;
  updateMailingAddress: (addr: RecipientAddress) => void;
  switchWorkspace: (id: string) => void;
  createBusinessWorkspace: (businessName: string, businessType: string) => Workspace;
  restoreBusinessWorkspace: (businessId: string, businessName: string, businessType: string) => void;
  repairBusinessId: (correctId: string) => void;
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
  updateMailingAddress: () => {},
  switchWorkspace: () => {},
  createBusinessWorkspace: () => ({ id: "", type: "business", name: "" }),
  restoreBusinessWorkspace: () => {},
  repairBusinessId: () => {},
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
    : "Mail it directly to them";

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

function makeBusinessWorkspace(businessName: string, businessType: string, existingBusinessId?: string): Workspace {
  const businessId = existingBusinessId ?? crypto.randomUUID();
  try { localStorage.setItem("fi_forgot_biz_id_anchor", businessId); } catch { /* ignore */ }
  return {
    id: crypto.randomUUID(),
    type: "business",
    name: businessName,
    businessType,
    businessId,
  };
}

function registerEmailOnServer(email: string, businessId: string, bizType?: string) {
  fetch("/api/business-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, email: email.toLowerCase().trim(), bizType: bizType || undefined }),
  }).catch(() => {});
}

function connectSession(email: string, name?: string) {
  fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.toLowerCase().trim(), name }),
  })
    .then(r => r.json())
    .then((d: { userId?: string }) => {
      if (d.userId) {
        setServerSyncUserId(d.userId);
        hydrateRecipientsFromServer(d.userId).catch(() => {});
      }
    })
    .catch(() => {});
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
        connectSession(parsed.email as string, parsed.name as string | undefined);
        const ob = localStorage.getItem("fi_forgot_onboarding");
        let ws = loadWorkspaces();
        const hasBusiness = ws.some(w => w.type === "business");
        setOnboardingComplete(!!ob || hasBusiness);
        // Fallback: if any business workspace is missing a businessId, check the durable anchor
        // key (set when the workspace is first created, never cleared) before minting a new UUID.
        const repaired = ws.map(w => {
          if (w.type === "business" && !w.businessId) {
            let recovered: string | undefined;
            try {
              recovered = localStorage.getItem("fi_forgot_biz_id_anchor") ??
                          (JSON.parse(localStorage.getItem("fi_forgot_business") ?? "null") as { businessId?: string } | null)?.businessId ??
                          undefined;
            } catch { /* ignore */ }
            return { ...w, businessId: recovered ?? crypto.randomUUID() };
          }
          return w;
        });
        if (repaired.some((w, i) => w.businessId !== ws[i]?.businessId)) {
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
    // Persist onboarding-complete so ProtectedRoute survives a page reload.
    // Don't overwrite real onboarding data if it already exists.
    if (!localStorage.getItem("fi_forgot_onboarding")) {
      localStorage.setItem("fi_forgot_onboarding", JSON.stringify({ loginRestore: true }));
    }

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

    connectSession(email, displayName);
  }

  function signup(name: string, email: string, skipOnboarding = false) {
    const u = { name, email };
    setUser(u);
    setIsLoggedIn(true);
    setOnboardingComplete(skipOnboarding);
    localStorage.setItem("fi_forgot_user", JSON.stringify(u));
    if (skipOnboarding) {
      localStorage.setItem("fi_forgot_onboarding", "true");
    } else {
      localStorage.removeItem("fi_forgot_onboarding");
    }

    // Create personal workspace
    const personal = makePersonalWorkspace();
    const ws = [personal];
    saveWorkspaces(ws);
    saveActiveWorkspaceId(personal.id);
    setWorkspaces(ws);
    setActiveWorkspace(personal);

    connectSession(email, name);
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

    // Register email → businessId on server so it can be recovered on future sign-ins
    registerEmailOnServer(email, business.businessId!, businessType);
  }

  function createBusinessWorkspace(businessName: string, businessType: string): Workspace {
    const business = makeBusinessWorkspace(businessName, businessType);
    const ws = [...loadWorkspaces(), business];
    saveWorkspaces(ws);
    saveActiveWorkspaceId(business.id);
    setWorkspaces(ws);
    setActiveWorkspace(business);
    // Register email → businessId on server
    if (user?.email) registerEmailOnServer(user.email, business.businessId!, businessType);
    return business;
  }

  function restoreBusinessWorkspace(businessId: string, businessName: string, businessType: string) {
    const existing = loadWorkspaces();
    const hasBiz = existing.some(w => w.type === "business");
    if (hasBiz) {
      const updated = existing.map(w =>
        w.type === "business"
          ? { ...w, businessId, name: businessName || w.name, businessType: businessType || w.businessType }
          : w
      );
      saveWorkspaces(updated);
      setWorkspaces(updated);
      const biz = updated.find(w => w.type === "business")!;
      setActiveWorkspace(biz);
      saveActiveWorkspaceId(biz.id);
    } else {
      const business = makeBusinessWorkspace(businessName || "My Business", businessType || "", businessId);
      const ws = [...existing, business];
      saveWorkspaces(ws);
      saveActiveWorkspaceId(business.id);
      setWorkspaces(ws);
      setActiveWorkspace(business);
    }
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
    // Save subscriber's mailing address to user profile if provided
    if (data.mailingAddress?.line1?.trim()) {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, mailingAddress: data.mailingAddress as RecipientAddress };
        localStorage.setItem("fi_forgot_user", JSON.stringify(updated));
        return updated;
      });
    }
    setOnboardingComplete(true);
  }

  function updateMailingAddress(addr: RecipientAddress) {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, mailingAddress: addr };
      localStorage.setItem("fi_forgot_user", JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    setUser(null);
    setIsLoggedIn(false);
    setOnboardingComplete(true);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setServerSyncUserId(null);
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

  function repairBusinessId(correctId: string) {
    setWorkspaces(prev => {
      const updated = prev.map(w => w.type === "business" ? { ...w, businessId: correctId } : w);
      saveWorkspaces(updated);
      return updated;
    });
    setActiveWorkspace(prev => prev?.type === "business" ? { ...prev, businessId: correctId } : prev);
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn, onboardingComplete, user,
      workspaces, activeWorkspace,
      login, signup, businessSignup, completeOnboarding, logout, upgradePlan, updateMailingAddress,
      switchWorkspace, createBusinessWorkspace, restoreBusinessWorkspace, repairBusinessId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
