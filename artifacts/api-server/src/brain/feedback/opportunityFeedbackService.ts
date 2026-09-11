import { createHash } from "node:crypto";
import type { RelationshipOpportunity } from "../product/relationshipOpportunityTypes";
import { feedbackLineageId, OpportunityFeedbackConflictError, type OpportunityFeedbackRepository } from "./opportunityFeedbackRepository";
import { OPPORTUNITY_FEEDBACK_TYPES, type OpportunityFeedbackEvent, type OpportunityFeedbackMutation, type OpportunityFeedbackTarget } from "./opportunityFeedbackTypes";

export interface OpportunityFeedbackServiceDeps {
  repository: OpportunityFeedbackRepository;
  ownsRecipient(ownerId: string, recipientId: string): Promise<boolean>;
  resolveOpportunity(ownerId: string, recipientId: string, opportunityId: string): Promise<RelationshipOpportunity | null>;
  now?: () => string;
}

export interface FeedbackServiceResult { status: number; body: Record<string, unknown> }

export async function listOpportunityFeedbackService(ownerId: string, recipientId: string | null, deps: { repository: OpportunityFeedbackRepository; listOwnedRecipientIds(ownerId: string, recipientId: string | null): Promise<string[]> }): Promise<FeedbackServiceResult> {
  try {
    const recipientIds = await deps.listOwnedRecipientIds(ownerId, recipientId);
    if (recipientId && !recipientIds.includes(recipientId)) return { status: 404, body: { error: "Recipient not found" } };
    const history = await deps.repository.list({ ownerId, recipientIds });
    const latest = new Map<string, OpportunityFeedbackEvent>();
    for (const event of history) if (!latest.has(event.lineageId) || latest.get(event.lineageId)!.version < event.version) latest.set(event.lineageId, event);
    return { status: 200, body: { history, active: [...latest.values()].filter(event => event.action === "set" && event.active) } };
  } catch {
    return { status: 503, body: { error: "Opportunity feedback is unavailable" } };
  }
}

function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number), date = new Date(Date.UTC(y!, m! - 1, d!));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m! - 1 && date.getUTCDate() === d;
}

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function mutateOpportunityFeedbackService(ownerId: string, raw: unknown, deps: OpportunityFeedbackServiceDeps): Promise<FeedbackServiceResult> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { status: 400, body: { error: "Invalid Opportunity feedback request" } };
  const body = raw as Partial<OpportunityFeedbackMutation> & Record<string, unknown>;
  const withdraw = body.withdraw === true;
  const allowed = new Set(withdraw ? ["recipientId", "feedbackEventId", "expectedVersion", "idempotencyKey", "withdraw"] : ["recipientId", "opportunityId", "occurrenceCycleId", "type", "scope", "notBefore", "expectedVersion", "idempotencyKey"]);
  const valid = !Object.keys(body).some(key => !allowed.has(key)) && typeof body.recipientId === "string" && typeof body.idempotencyKey === "string" && body.idempotencyKey.length >= 8 && body.idempotencyKey.length <= 128 && Number.isInteger(body.expectedVersion) && (body.expectedVersion as number) >= 0 &&
    (withdraw ? typeof body.feedbackEventId === "string" && body.withdraw === true : typeof body.opportunityId === "string" && "occurrenceCycleId" in body && (body.occurrenceCycleId === null || typeof body.occurrenceCycleId === "string") && OPPORTUNITY_FEEDBACK_TYPES.includes(body.type as any) && (body.scope === undefined || body.scope === "occurrence" || body.scope === "recipient_family"));
  if (!valid || (body.notBefore != null && (typeof body.notBefore !== "string" || !calendarDate(body.notBefore))) || (body.notBefore && body.type !== "not_now" && body.type !== "too_early")) return { status: 400, body: { error: "Invalid Opportunity feedback request" } };
  const fingerprint = hash(withdraw ? { action:"withdraw", recipientId:body.recipientId, feedbackEventId:body.feedbackEventId, expectedVersion:body.expectedVersion } : {action:"set",recipientId:body.recipientId,opportunityId:body.opportunityId,occurrenceCycleId:body.occurrenceCycleId,type:body.type,scope:body.scope ?? "occurrence",notBefore:body.notBefore ?? null,expectedVersion:body.expectedVersion});
  try {
    if (!(await deps.ownsRecipient(ownerId, body.recipientId!))) return {status:404,body:{error:"Recipient not found"}};
    // Resolve a completed request before consulting mutable Opportunity/cycle state.
    const replay = await deps.repository.findReceipt?.({ownerId,idempotencyKey:body.idempotencyKey!,requestFingerprint:fingerprint});
    if (replay) return {status:201,body:{feedback:replay}};
    const history = await deps.repository.list({ ownerId, recipientIds: [body.recipientId!] });
    let target: OpportunityFeedbackTarget;
    let lineageId: string, prior: OpportunityFeedbackEvent | undefined, type, scope;
    if (withdraw) {
      const selected = history.find(event => event.id === body.feedbackEventId);
      if (!selected) return { status: 404, body: { error: "Feedback not found" } };
      target = { ownerId, recipientId: selected.recipientId, opportunityId: selected.opportunityId, occurrenceCycleId: selected.occurrenceCycleId, relationshipId: selected.relationshipId, family: selected.family };
      lineageId = selected.lineageId; type = selected.type; scope = selected.scope;
      prior = history.filter(event => event.lineageId === lineageId).sort((a, b) => b.version - a.version)[0];
      const replay = prior?.action === "withdraw" && prior.idempotencyKey === body.idempotencyKey;
      if (!replay && prior?.action !== "set") return { status: 409, body: { error: "No active feedback lineage to withdraw" } };
    } else {
      const opportunity = await deps.resolveOpportunity(ownerId, body.recipientId!, body.opportunityId!);
      if (!opportunity || body.occurrenceCycleId !== (opportunity.timing.temporal?.occurrenceCycleId ?? null)) return { status: 404, body: { error: "Opportunity not found" } };
      scope = body.scope ?? "occurrence"; type = body.type!;
      if (scope === "recipient_family" && !["do_not_remind", "more_often", "less_often"].includes(type)) return {status:400,body:{error:"This response applies only to the current occurrence"}};
      if (scope === "recipient_family" && !opportunity.provenance.sourceId) return { status: 400, body: { error: "Recipient-and-family scope is unavailable" } };
      target = { ownerId, recipientId: opportunity.recipient.id, opportunityId: opportunity.id, occurrenceCycleId: opportunity.timing.temporal?.occurrenceCycleId ?? null, relationshipId: opportunity.relationshipId, family: opportunity.provenance.sourceId ?? "unknown" };
      lineageId = feedbackLineageId(target, scope);
      prior = history.filter(event => event.lineageId === lineageId).sort((a, b) => b.version - a.version)[0];
    }
    const event: OpportunityFeedbackEvent = { ...target, id: hash([ownerId, body.idempotencyKey]), lineageId, version: body.expectedVersion! + 1, action: withdraw ? "withdraw" : "set", type, scope, notBefore: withdraw ? null : body.notBefore ?? null, timingProvenance: body.notBefore ? "user_not_before" : "qualitative", provenance: "explicit_owner_feedback", receivedAt: (deps.now ?? (() => new Date().toISOString()))(), supersedesId: prior?.id ?? null, withdrawnEventId: withdraw ? prior?.id ?? null : null, idempotencyKey: body.idempotencyKey!, active: !withdraw };
    return { status: 201, body: { feedback: await deps.repository.append({ event, expectedVersion: body.expectedVersion!, requestFingerprint: fingerprint }) } };
  } catch (error) {
    if (error instanceof OpportunityFeedbackConflictError) return { status: 409, body: { error: error.message } };
    return { status: 503, body: { error: "Opportunity feedback is unavailable" } };
  }
}


