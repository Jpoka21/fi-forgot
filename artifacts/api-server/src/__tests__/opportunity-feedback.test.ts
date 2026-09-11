import { activeFeedback, feedbackLineageId, OPPORTUNITY_FEEDBACK_TYPES } from "../brain/feedback/index.js";

if (OPPORTUNITY_FEEDBACK_TYPES.length !== 9 || new Set(OPPORTUNITY_FEEDBACK_TYPES).size !== 9) throw new Error("nine distinct feedback types are required");
const target = { ownerId: "owner", recipientId: "recipient", opportunityId: "recipient:birthday", occurrenceCycleId: "annual:01-20:2026", relationshipId: null, family: "annual_recurring" };
const lineage = feedbackLineageId(target, "occurrence");
if (lineage === feedbackLineageId({ ...target, ownerId: "other" }, "occurrence")) throw new Error("owner scope leaked");
if (lineage === feedbackLineageId({ ...target, occurrenceCycleId: "annual:01-20:2027" }, "occurrence")) throw new Error("cycle scope leaked");

const base = { ...target, lineageId: lineage, scope: "occurrence" as const, provenance: "explicit_owner_feedback" as const, timingProvenance: "qualitative" as const, notBefore: null, receivedAt: "2026-01-01T00:00:00.000Z", supersedesId: null, withdrawnEventId: null, idempotencyKey: "request-1", type: "not_now" as const };
const set = { ...base, id: "one", version: 1, action: "set" as const, active: true };
const withdrawal = { ...base, id: "two", version: 2, action: "withdraw" as const, active: false, supersedesId: "one", withdrawnEventId: "one", idempotencyKey: "request-2" };
if (activeFeedback([set]).length !== 1 || activeFeedback([set, withdrawal]).length !== 0) throw new Error("withdrawal revived or lost lineage state");
console.log("opportunity feedback semantics unit tests passed");
