/**
 * Briefing reference types.
 *
 * References only — question content is NOT owned by this domain.
 * Do not migrate EVENT_QUESTIONS, question catalogs, or selection logic here.
 *
 * BriefingQuestionSetId is intentionally distinct from EventId and from
 * Brain sourceRuleId (which this package never defines).
 */

import type { EventId } from "../core/types.js";

/**
 * Stable briefing question-set identifier.
 * Distinct type from EventId even when string values currently coincide.
 */
export type BriefingQuestionSetId = string & {
  readonly __brand: "BriefingQuestionSetId";
};

export function asBriefingQuestionSetId(value: string): BriefingQuestionSetId {
  return value as BriefingQuestionSetId;
}

export interface EventBriefingRef {
  readonly eventId: EventId;
  readonly questionSetId: BriefingQuestionSetId;
  /** Schema version for future question-set evolution. */
  readonly version: number;
}

/**
 * Metadata only — no question content.
 */
export interface BriefingQuestionSetMeta {
  readonly questionSetId: BriefingQuestionSetId;
  readonly title: string;
  readonly version: number;
}
