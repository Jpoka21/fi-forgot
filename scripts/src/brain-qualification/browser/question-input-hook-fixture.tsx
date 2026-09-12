// @ts-ignore Resolved from the pinned installed frontend package by the fixture builder.
import React, { useEffect } from "react";
// @ts-ignore Resolved from the pinned installed frontend package by the fixture builder.
import { createRoot, type Root } from "react-dom/client";
// @ts-ignore Resolved against the production frontend source root by the fixture builder.
import { useRecipientConciergeQuestion } from "@/app/question-intelligence/hooks/useRecipientConciergeQuestion";
// @ts-ignore Resolved against the production frontend source root by the fixture builder.
import { pickAlternateFreshQuestion, selectBestConciergeQuestion } from "@/app/question-intelligence/questionIntelligenceEngine";

declare const document: any;

type Pending = {
  id: number;
  url: string;
  method: string;
  body: unknown;
  resolve: (value: Response) => void;
  reject: (reason: Error) => void;
};
const pending: Pending[] = [];
const delayedTimers: Array<() => void> = [];
let timerCallbacksRun = 0;
let savedEvents = 0;
(globalThis as any).addEventListener("recipient-answer-saved", () => savedEvents++);
const nativeSetTimeout = globalThis.setTimeout.bind(globalThis);
(globalThis as any).setTimeout = (callback: (...args: any[]) => void, delay?: number, ...args: any[]) => delay === 1400 ? (delayedTimers.push(() => callback(...args)), delayedTimers.length) : nativeSetTimeout(callback, delay, ...args);
const recipients = new Map([
  [
    "recipient-a",
    {
      id: "recipient-a",
      name: "Same Name",
      firstName: "Same",
      lastName: "Name",
      birthday: null,
      anniversary: null,
      customDates: [],
      selectedEvents: [],
    },
  ],
  [
    "recipient-b",
    {
      id: "recipient-b",
      name: "Same Name",
      firstName: "Same",
      lastName: "Name",
      birthday: null,
      anniversary: null,
      customDates: [],
      selectedEvents: [],
    },
  ],
]);
let sequence = 0;
let root: Root | undefined;
let latest: any = null;
const retained = new Map<string, any>();
(globalThis as any).__questionInputData = {
  getRecipient: (id: string) => recipients.get(id),
  getCards: () => [],
  getApiHeaders: () => ({ "x-user-id": "synthetic-owner" }),
  getServerUserId: () => "synthetic-owner",
};
(globalThis as any).fetch = (
  input: unknown,
  init: RequestInit = {},
) =>
  new Promise<Response>((resolve, reject) => {
    const url = String(input);
    pending.push({
      id: ++sequence,
      url,
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(String(init.body)) : null,
      resolve,
      reject,
    });
  });

function Harness({
  recipientId,
  retainAs,
}: {
  recipientId: string | null;
  retainAs: string;
}) {
  const value = useRecipientConciergeQuestion(recipientId);
  latest = value;
  useEffect(() => {
    retained.set(retainAs, value);
  });
  return React.createElement("div", {
    id: "mounted-question-hook",
    "data-recipient-id": value.recipient?.id ?? "",
    "data-question": value.nextQuestion?.question ?? "",
    "data-answer": value.answerText,
    "data-saving": String(value.savingAnswer),
    "data-skipped": String(value.questionSkipped),
    "data-health-recipient-id": value.healthScore?.recipientId ?? "",
  });
}
const snapshot = (value = latest) =>
  value
    ? {
        recipientId: value.recipient?.id ?? null,
        question: value.nextQuestion?.question ?? null,
        answerText: value.answerText,
        savingAnswer: value.savingAnswer,
        answerSaved: value.answerSaved,
        questionSkipped: value.questionSkipped,
        healthRecipientId: value.healthScore?.recipientId ?? null,
        freshUpdates: value.freshUpdates,
        profileComplete: value.profileComplete,
        profileScore: value.profileScore,
        cards: value.cards,
        upcomingEvents: value.upcomingEvents,
      }
    : null;
(globalThis as any).__questionInputFixture = {
  mount(recipientId: string | null, retainAs = "current") {
    root ??= createRoot(document.getElementById("root")!);
    root.render(React.createElement(Harness, { recipientId, retainAs }));
  },
  pending: () =>
    pending.map(({ id, url, method, body }) => ({ id, url, method, body })),
  settle(id: number, data: unknown, ok = true) {
    const index = pending.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("unknown pending request");
    pending
      .splice(index, 1)[0]!
      .resolve(
        new Response(JSON.stringify(data), {
          status: ok ? 200 : 500,
          headers: { "content-type": "application/json" },
        }),
      );
  },
  reject(id: number) {
    const index = pending.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("unknown pending request");
    pending.splice(index, 1)[0]!.reject(new Error("controlled rejection"));
  },
  snapshot: (label?: string) => snapshot(label ? retained.get(label) : latest),
  captured: (label: string) => retained.has(label),
  setAnswer: (value: string, label?: string) =>
    (label ? retained.get(label) : latest).setAnswerText(value),
  setSkipped: (value: boolean, label?: string) =>
    (label ? retained.get(label) : latest).setQuestionSkipped(value),
  reload: (label?: string) => (label ? retained.get(label) : latest).reload(),
  save: (payload: any, label?: string) =>
    (label ? retained.get(label) : latest).handleSaveAnswer(payload),
  unmount() {
    root?.unmount();
    root = undefined;
    latest = null;
  },
  counters: () => ({ timerCallbacksRun, savedEvents, requestsCreated: sequence }),
  runSaveTimers() { while (delayedTimers.length) { timerCallbacksRun++; delayedTimers.shift()!(); } },
  realReact: {
    reactVersion: React.version,
    createRoot: typeof createRoot === "function",
  },
  productionPayload(kind: "transformed" | "alternate") {
    const input = {
      serverQuestion: { fieldKey: "recent_memory", fieldLabel: "Recent memory", category: "update", priority: "normal", question: "Raw server question", reason: "Synthetic", mode: "fresh_update" },
      recipient: recipients.get("recipient-a")!, freshUpdates: [], healthScore: null, upcomingEvents: [], profileComplete: false, profileScore: 20, cards: [], alternateIndex: 1, forceAsk: true,
    };
    const selected = kind === "alternate" ? pickAlternateFreshQuestion(input as any) : selectBestConciergeQuestion(input as any);
    if (!selected) throw new Error("production question engine abstained in fixture");
    return { fieldKey: selected.fieldKey, question: selected.question, mode: selected.mode, followUp: selected.followUp };
  },
};
