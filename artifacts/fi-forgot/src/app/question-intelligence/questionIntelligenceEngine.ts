import type { NextQuestion } from "@/app/relationship-profile/relationshipProfileDomain";
import {
  applyConciergeGates,
  orchestrateConcierge,
  type OrchestratorContext,
} from "@/app/concierge/conciergeOrchestrator";
import {
  applyPhrase,
  buildProgressLabel,
  CONVERSATIONAL_TEMPLATES,
  FRESH_UPDATE_FIELD_KEYS,
  getRelationshipPhrase,
  OCCASION_QUESTION_TEMPLATES,
  pickAffirmation,
  pickStableVariant,
  type ConciergeQuestion,
  type QuestionIntelligenceInput,
  wasRecentlyAnswered,
} from "@/app/question-intelligence/questionIntelligenceDomain";

function buildOrchestrationContext(input: QuestionIntelligenceInput): OrchestratorContext {
  return {
    recipient: input.recipient,
    freshUpdates: input.freshUpdates,
    healthScore: input.healthScore,
    upcomingEvents: input.upcomingEvents,
    profileComplete: input.profileComplete,
    profileScore: input.profileScore,
    cards: input.cards,
  };
}

function buildFromTemplate(
  template: (typeof CONVERSATIONAL_TEMPLATES)[number],
  phrase: string,
  firstName: string,
  seed: string,
): Pick<ConciergeQuestion, "question" | "reason" | "priority" | "expectedValue"> {
  return {
    question: applyPhrase(pickStableVariant(template.templates, seed), phrase, firstName),
    reason: applyPhrase(template.reason, phrase, firstName),
    priority: template.priority,
    expectedValue: template.expectedValue,
  };
}

function findTemplate(fieldKey: string) {
  return CONVERSATIONAL_TEMPLATES.find((entry) => entry.fieldKey === fieldKey);
}

function buildMatureQuestion(
  input: QuestionIntelligenceInput,
  orchestration: ReturnType<typeof orchestrateConcierge>,
  maturityMessage: string,
  priority: ConciergeQuestion["priority"] = "maintenance",
  expectedValue: ConciergeQuestion["expectedValue"] = "low",
): ConciergeQuestion {
  return {
    fieldKey: input.serverQuestion!.fieldKey,
    fieldLabel: input.serverQuestion!.fieldLabel,
    mode: input.serverQuestion!.mode,
    question: "",
    reason: "",
    maturityMessage,
    affirmationOnSave: pickAffirmation(`${input.recipient.id}:mature`),
    shouldAskNow: false,
    deferReason: maturityMessage,
    priority,
    expectedValue,
    confidenceScore: orchestration.confidence.score,
    learningHeadline: orchestration.interrupt.reason,
    followUp: input.serverQuestion!.followUp,
  };
}

function buildOccasionQuestion(
  input: QuestionIntelligenceInput,
  eventLabel: string,
  orchestration: ReturnType<typeof orchestrateConcierge>,
): ConciergeQuestion | null {
  const readiness = orchestration.occasionReadiness;
  if (readiness?.shouldAutoPrepare && !readiness.shouldAskOneQuestion) {
    return buildMatureQuestion(input, orchestration, readiness.reason, "occasion", "high");
  }

  const templates = OCCASION_QUESTION_TEMPLATES[eventLabel];
  if (!templates?.length || !input.serverQuestion) return null;

  const phrase = getRelationshipPhrase(input.recipient);
  const seed = `${input.recipient.id}:${eventLabel}:occasion`;
  const question = applyPhrase(pickStableVariant(templates, seed), phrase);
  const gate = applyConciergeGates(orchestration, "high", input.forceAsk);

  if (!gate.shouldAskNow) {
    return buildMatureQuestion(
      input,
      orchestration,
      gate.maturityMessage ?? readiness?.reason ?? "I have everything I need for this occasion.",
      "occasion",
      "high",
    );
  }

  return {
    fieldKey: input.serverQuestion.fieldKey,
    fieldLabel: input.serverQuestion.fieldLabel,
    mode: input.serverQuestion.mode,
    question,
    reason: gate.enhancedReason ?? `A fresh detail will make this year's ${eventLabel} card feel personal — not recycled.`,
    progressLabel: `Before ${eventLabel}`,
    affirmationOnSave: pickAffirmation(seed),
    shouldAskNow: true,
    priority: "occasion",
    expectedValue: "high",
    confidenceScore: orchestration.confidence.score,
    followUp: input.serverQuestion.followUp,
  };
}

function shouldDeferForMaturity(
  input: QuestionIntelligenceInput,
  orchestration: ReturnType<typeof orchestrateConcierge>,
): string | null {
  if (!input.profileComplete || input.forceAsk) return null;

  const gate = applyConciergeGates(orchestration, "low");
  if (!gate.shouldAskNow && gate.maturityMessage) {
    return gate.maturityMessage;
  }

  const recentEnough = input.freshUpdates.some((update) => update.daysAgo <= 30);
  const healthStrong = (input.healthScore?.score ?? 0) >= 70;
  const fewGaps = (input.profileScore ?? 100) >= 85;

  if (healthStrong && fewGaps && recentEnough && input.serverQuestion?.mode === "fresh_update") {
    const recentlyAnsweredKey = wasRecentlyAnswered(
      input.freshUpdates,
      input.serverQuestion.fieldKey,
      45,
    );
    if (recentlyAnsweredKey) {
      return "I already know enough to write a wonderful card. I'll check in again when something new would help.";
    }
  }

  return null;
}

function enrichFollowUp(
  input: QuestionIntelligenceInput,
  orchestration: ReturnType<typeof orchestrateConcierge>,
): ConciergeQuestion | null {
  if (!input.serverQuestion || input.serverQuestion.mode !== "follow_up") return null;

  const memoryFollowUp = orchestration.followUp;
  const followUp = input.serverQuestion.followUp;
  const phrase = getRelationshipPhrase(input.recipient);
  const contextNote = followUp
    ? `Last time you mentioned: "${followUp.originalAnswer.slice(0, 120)}${followUp.originalAnswer.length > 120 ? "…" : ""}"`
    : memoryFollowUp
      ? memoryFollowUp.reason
      : undefined;

  const question =
    memoryFollowUp && !followUp?.originalAnswer
      ? memoryFollowUp.followUpQuestion
      : input.serverQuestion.question;

  return {
    fieldKey: input.serverQuestion.fieldKey,
    fieldLabel: input.serverQuestion.fieldLabel,
    mode: "follow_up",
    question,
    reason:
      memoryFollowUp?.reason
      || input.serverQuestion.reason
      || `A quick follow-up helps me stay current on ${phrase}.`,
    contextNote,
    progressLabel: buildProgressLabel(input),
    affirmationOnSave: pickAffirmation(`${input.recipient.id}:follow_up`),
    shouldAskNow: true,
    priority: "follow_up",
    expectedValue: "high",
    confidenceScore: orchestration.confidence.score,
    followUp,
  };
}

export function pickAlternateFreshQuestion(
  input: QuestionIntelligenceInput,
): ConciergeQuestion | null {
  const phrase = getRelationshipPhrase(input.recipient);
  const firstName = input.recipient.name.split(" ")[0] ?? "them";
  const alternateIndex = input.alternateIndex ?? 0;
  const recentKeys = new Set(
    input.freshUpdates
      .filter((update) => update.daysAgo <= 60)
      .map((update) => update.questionKey),
  );

  const candidates = FRESH_UPDATE_FIELD_KEYS.filter((key) => !recentKeys.has(key));
  const pool = candidates.length > 0 ? candidates : FRESH_UPDATE_FIELD_KEYS;
  const fieldKey = pool[alternateIndex % pool.length];
  const template = findTemplate(fieldKey);
  if (!template) return null;

  const seed = `${input.recipient.id}:alt:${fieldKey}:${alternateIndex}`;
  const built = buildFromTemplate(template, phrase, firstName, seed);

  return {
    fieldKey,
    fieldLabel: template.fieldLabel,
    mode: "fresh_update",
    ...built,
    progressLabel: "Another angle",
    affirmationOnSave: pickAffirmation(seed),
    shouldAskNow: true,
  };
}

export function selectBestConciergeQuestion(
  input: QuestionIntelligenceInput,
): ConciergeQuestion | null {
  if (!input.serverQuestion) return null;

  const orchestration = orchestrateConcierge(buildOrchestrationContext(input));

  const deferReason = shouldDeferForMaturity(input, orchestration);
  if (deferReason) {
    return buildMatureQuestion(input, orchestration, deferReason);
  }

  const followUpQuestion = enrichFollowUp(input, orchestration);
  if (followUpQuestion) return followUpQuestion;

  const imminentEvent = input.upcomingEvents.find(
    (event) => event.daysAway !== null && event.daysAway <= 45,
  );
  if (
    imminentEvent
    && input.profileComplete
    && input.serverQuestion.mode === "fresh_update"
    && OCCASION_QUESTION_TEMPLATES[imminentEvent.event]
  ) {
    const occasionQuestion = buildOccasionQuestion(input, imminentEvent.event, orchestration);
    if (occasionQuestion) return occasionQuestion;
  }

  const phrase = getRelationshipPhrase(input.recipient);
  const firstName = input.recipient.name.split(" ")[0] ?? "them";
  const template = findTemplate(input.serverQuestion.fieldKey);
  const seed = `${input.recipient.id}:${input.serverQuestion.fieldKey}:${input.serverQuestion.mode}`;

  if (template) {
    const built = buildFromTemplate(template, phrase, firstName, seed);
    const gate = applyConciergeGates(orchestration, built.expectedValue, input.forceAsk);
    if (!gate.shouldAskNow) {
      return buildMatureQuestion(
        input,
        orchestration,
        gate.maturityMessage ?? orchestration.interrupt.reason,
        built.priority,
        built.expectedValue,
      );
    }
    return {
      fieldKey: input.serverQuestion.fieldKey,
      fieldLabel: input.serverQuestion.fieldLabel,
      mode: input.serverQuestion.mode,
      ...built,
      reason: gate.enhancedReason ?? built.reason,
      progressLabel: buildProgressLabel(input),
      affirmationOnSave: pickAffirmation(seed),
      shouldAskNow: true,
      confidenceScore: orchestration.confidence.score,
      followUp: input.serverQuestion.followUp,
    };
  }

  const fallbackExpected = input.profileComplete ? "maintenance" : "foundational";
  const fallbackValue = input.profileComplete ? ("medium" as const) : ("high" as const);
  const gate = applyConciergeGates(orchestration, fallbackValue, input.forceAsk);

  return {
    fieldKey: input.serverQuestion.fieldKey,
    fieldLabel: input.serverQuestion.fieldLabel,
    mode: input.serverQuestion.mode,
    question: applyPhrase(input.serverQuestion.question, phrase, firstName),
    reason: gate.enhancedReason ?? applyPhrase(input.serverQuestion.reason, phrase, firstName),
    progressLabel: buildProgressLabel(input),
    affirmationOnSave: pickAffirmation(seed),
    shouldAskNow: gate.shouldAskNow,
    maturityMessage: gate.shouldAskNow ? undefined : gate.maturityMessage,
    priority: fallbackExpected,
    expectedValue: fallbackValue,
    confidenceScore: orchestration.confidence.score,
    followUp: input.serverQuestion.followUp,
  };
}

export function toSavePayload(question: ConciergeQuestion): Pick<NextQuestion, "fieldKey" | "question" | "mode" | "followUp"> {
  return {
    fieldKey: question.fieldKey,
    question: question.question,
    mode: question.mode,
    followUp: question.followUp,
  };
}
