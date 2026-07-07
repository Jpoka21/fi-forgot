export const AUTOMATION_RUN_LOG_KEY = "fi_forgot_automation_run_log";
export const AI_PROMPT_NOTES_KEY = "fi_forgot_ai_prompt_notes";

export interface AiPromptSurface {
  id: string;
  label: string;
  endpoint: string;
  method: "POST" | "GET";
  description: string;
  contextFields: string[];
  preservationNote: string;
}

export const AI_PROMPT_SURFACES: AiPromptSurface[] = [
  {
    id: "admin-generate-message",
    label: "Admin message generation",
    endpoint: "/api/admin/generate-message",
    method: "POST",
    description: "Creates handwritten card message drafts from recipient relationship context.",
    contextFields: [
      "recipientName",
      "customerName",
      "senderName",
      "relationship",
      "eventType",
      "tone",
      "personalityNotes",
      "personality",
      "interests",
      "favoriteMemories",
      "insideJokes",
      "thingsToAvoid",
      "petName",
      "emotionalLevel",
      "yearsMarried",
      "previousMessages",
      "customNotes",
    ],
    preservationNote: "Server-side prompt templates are not editable from the frontend.",
  },
  {
    id: "admin-suggest-card",
    label: "Admin card suggestion",
    endpoint: "/api/admin/suggest-card",
    method: "POST",
    description: "Selects a Handwrytten card design based on event and recipient context.",
    contextFields: ["eventType", "interests", "relationship", "personalityNotes", "recipientName"],
    preservationNote: "Card ranking logic remains on the server.",
  },
  {
    id: "v2-generate-card",
    label: "Customer card generation",
    endpoint: "/api/v2/generate-card",
    method: "POST",
    description: "Generates customer-facing card drafts during onboarding and card flows.",
    contextFields: ["recipient profile", "occasion", "tone", "memories"],
    preservationNote: "Used by onboarding and card flows — contracts preserved.",
  },
  {
    id: "v2-refine-card",
    label: "Customer card refinement",
    endpoint: "/api/v2/refine-card",
    method: "POST",
    description: "Refines an existing draft with user guidance.",
    contextFields: ["draft text", "refinement instruction"],
    preservationNote: "Refinement behavior is server-owned.",
  },
  {
    id: "card-library-generate",
    label: "Card library generation",
    endpoint: "/api/admin/card-library/generate",
    method: "POST",
    description: "Generates reusable library card assets for the AI card catalog.",
    contextFields: ["category", "style", "tone", "metadata"],
    preservationNote: "Managed via Card Library admin tab.",
  },
];

export interface AutomationRunLogEntry {
  id: string;
  at: string;
  processed: number;
  skipped: number;
  errors: string[];
  trigger: "admin-load" | "manual-retry" | "admin-panel";
}

export const aiAutomationDefaults = {
  aiTitle: "AI administration",
  aiSubtitle: "Monitor concierge drafts, usage, and pipeline health without exposing raw prompts.",
  automationTitle: "Automation administration",
  automationSubtitle: "Review autopilot runs, queue status, and fulfillment automation history.",
  promptManagementTitle: "Prompt surfaces",
  promptManagementSubtitle: "Read-only map of AI endpoints and context fields. Notes are local admin documentation only.",
  activityTitle: "AI activity",
  usageTitle: "AI usage statistics",
  monitoringTitle: "Automation monitoring",
  healthTitle: "AI health",
  overviewTitle: "Automation overview",
  historyTitle: "Automation history",
  statusTitle: "Automation status",
  logsTitle: "Automation logs",
  retryLabel: "Run autopilot now",
  retryRunningLabel: "Running autopilot…",
  viewMessagesLabel: "Open messages",
  viewQueueLabel: "Open queue",
  noActivityLabel: "No AI drafts yet.",
  noLogsLabel: "No automation runs logged yet.",
  healthyLabel: "AI pipeline healthy",
  attentionLabel: "AI pipeline needs attention",
  notesLabel: "Admin notes (local only)",
  saveNotesLabel: "Save notes",
  preservationBanner: "Prompt templates, generation logic, and API contracts are preserved on the server.",
} as const;

export const PRESERVED_AI_API_INTEGRATIONS = [
  "POST /api/admin/generate-message",
  "POST /api/admin/suggest-card",
  "POST /api/admin/request-customer-approval",
  "POST /api/v2/generate-card",
  "POST /api/v2/refine-card",
  "lib/automation.ts — runAutopilot()",
] as const;
