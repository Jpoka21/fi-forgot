export const fiEmptyStateVariants = [
  "dashboard",
  "timeline",
  "calendar",
  "search",
  "notification",
  "recipient",
  "billing",
  "aiConcierge",
  "admin",
] as const;

export type FiEmptyStateVariant = (typeof fiEmptyStateVariants)[number];

export interface FiEmptyStateCopy {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
}

export const emptyStateDefaults: Record<FiEmptyStateVariant, FiEmptyStateCopy> = {
  dashboard: {
    title: "Welcome. Let's build relationships you'll never forget.",
    description:
      "Every thoughtful card begins with knowing the people who matter. Add your first relationship and we'll help you take it from there.",
    primaryLabel: "Add Your First Person",
    secondaryLabel: "See How It Works",
  },
  timeline: {
    title: "No moments yet.",
    description:
      "The little things become the stories people remember. Start saving moments whenever they happen.",
    primaryLabel: "Log a Memory",
    secondaryLabel: "See Example Timeline",
  },
  calendar: {
    title: "Nothing scheduled yet.",
    description:
      "We'll keep track of birthdays, anniversaries, holidays, and meaningful moments so you never have to.",
    primaryLabel: "Add an Important Date",
    secondaryLabel: "Import Birthdays",
  },
  search: {
    title: "We couldn't find anything.",
    description: "Try another name, event, or keyword.",
    primaryLabel: "Clear Search",
    secondaryLabel: "Browse Everyone",
  },
  notification: {
    title: "You're all caught up.",
    description: "We'll let you know when someone deserves a thoughtful moment.",
    primaryLabel: "View Your People",
    secondaryLabel: "Notification Settings",
  },
  recipient: {
    title: "Your people will live here.",
    description:
      "Every birthday, anniversary, celebration, and everyday moment starts with adding someone important.",
    primaryLabel: "Add a Person",
    secondaryLabel: "Import Contacts",
  },
  billing: {
    title: "Your billing details will appear here.",
    description:
      "Invoices, subscription details, and payment history will show up once your account is active.",
    primaryLabel: "View Plans",
    secondaryLabel: "Billing Help",
  },
  aiConcierge: {
    title: "Your concierge is ready.",
    description:
      "As you add relationships and moments, personalized guidance and thoughtful suggestions will appear here.",
    primaryLabel: "Add a Person",
    secondaryLabel: "Learn About the Concierge",
  },
  admin: {
    title: "Nothing needs attention right now.",
    description:
      "When queue items, events, or customer activity require review, they will appear here.",
    primaryLabel: "Refresh",
    secondaryLabel: "Admin Dashboard",
  },
};
