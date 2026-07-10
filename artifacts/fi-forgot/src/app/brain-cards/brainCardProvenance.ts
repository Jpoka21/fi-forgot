/**
 * Brain card provenance transport — carries sourceRuleId into the first card create POST.
 *
 * Routing and POST attribution must be driven by authoritative Brain action semantics
 * (e.g. outcome `prepare_card` and server-supplied briefing href), never by frontend
 * rule-id allowlists.
 *
 * Never transports full opportunity keys, tokens, or link-table identifiers.
 */

export const BRAIN_SOURCE_RULE_ID_QUERY_PARAM = "brainSourceRuleId";

export function parseSourceRuleIdFromOpportunityId(opportunityId: string): string | null {
  const separatorIndex = opportunityId.indexOf(":");
  if (separatorIndex === -1) {
    return null;
  }
  const sourceRuleId = opportunityId.slice(separatorIndex + 1);
  return sourceRuleId.length > 0 ? sourceRuleId : null;
}

/**
 * Builds a briefing deep link with provenance query param.
 * Caller must supply the briefing event from Brain — not inferred from sourceRuleId.
 */
export function buildBrainCardBriefingHref(input: {
  recipientId: string;
  sourceRuleId: string;
  event: string;
}): string {
  const params = new URLSearchParams({
    [BRAIN_SOURCE_RULE_ID_QUERY_PARAM]: input.sourceRuleId,
  });
  return `/briefings/${input.recipientId}/${encodeURIComponent(input.event)}?${params.toString()}`;
}

/**
 * Resolves a card action href only when Brain explicitly authorizes card preparation.
 * Prefer server-supplied product href from Brain builders in production surfaces.
 */
export function resolveBrainCardActionHrefFromAuthority(input: {
  brainAuthorizesCardPreparation: boolean;
  recipientId: string;
  sourceRuleId: string;
  briefingEvent: string | null | undefined;
  fallbackHref: string;
}): string {
  if (!input.brainAuthorizesCardPreparation) {
    return input.fallbackHref;
  }

  const event = input.briefingEvent?.trim();
  if (!event) {
    return input.fallbackHref;
  }

  return buildBrainCardBriefingHref({
    recipientId: input.recipientId,
    sourceRuleId: input.sourceRuleId,
    event,
  });
}

export function readBrainSourceRuleIdFromSearch(search: string): string | null {
  const raw = new URLSearchParams(search).get(BRAIN_SOURCE_RULE_ID_QUERY_PARAM)?.trim();
  return raw && raw.length > 0 ? raw : null;
}

export function stripBrainSourceRuleIdFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(BRAIN_SOURCE_RULE_ID_QUERY_PARAM);
  const next = params.toString();
  return next ? `?${next}` : "";
}

export function buildPersonalCardCreateRequestBody<C extends object>(
  card: C,
  options?: { brainSourceRuleId?: string },
): C | (C & { brainSourceRuleId: string }) {
  if (options?.brainSourceRuleId) {
    return {
      ...card,
      brainSourceRuleId: options.brainSourceRuleId,
    };
  }
  return card;
}
