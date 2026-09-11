import type { OpportunityFeedbackRequest } from './mutateOpportunityFeedback';

export type FeedbackRequestIntent = Omit<OpportunityFeedbackRequest, 'idempotencyKey'>;
function identity(request: FeedbackRequestIntent | OpportunityFeedbackRequest) {
  const { expectedVersion: _version, ...intent } = request;
  delete (intent as Partial<OpportunityFeedbackRequest>).idempotencyKey;
  return JSON.stringify(intent);
}
/** Keep the entire first request, including its expected version, after an uncertain response. */
export function reserveFeedbackRequest(pending: Map<string, OpportunityFeedbackRequest>, intent: FeedbackRequestIntent, makeKey = () => crypto.randomUUID()) {
  const key = identity(intent);
  const existing = pending.get(key);
  if (existing) return existing;
  const request = {...intent, idempotencyKey:makeKey()};
  pending.set(key, request);
  return request;
}
export function settleFeedbackRequest(pending: Map<string, OpportunityFeedbackRequest>, request: OpportunityFeedbackRequest) {
  const key = identity(request);
  if (pending.get(key)?.idempotencyKey === request.idempotencyKey) pending.delete(key);
}
