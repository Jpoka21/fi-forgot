/**
 * Runtime validation for append-only Brain outcome writes.
 */

import type { RecordBrainOutcomeInput } from "./brainOutcomeRecorder";
import {
  assertValidBrainOutcomeOpportunityIdentity,
  isBrainOutcomeType,
  type BrainOutcomeMetadata,
  type CardOutcomeMetadata,
  type OpportunityDismissedOutcomeMetadata,
  type QuestionAnsweredOutcomeMetadata,
} from "./outcomeTypes";

function isQuestionAnsweredMetadata(
  metadata: BrainOutcomeMetadata,
): metadata is QuestionAnsweredOutcomeMetadata {
  return "fieldKey" in metadata && "triggerType" in metadata;
}

function isCardOutcomeMetadata(metadata: BrainOutcomeMetadata): metadata is CardOutcomeMetadata {
  return "cardId" in metadata && "cardStatus" in metadata;
}

function isOpportunityDismissedMetadata(
  metadata: BrainOutcomeMetadata,
): metadata is OpportunityDismissedOutcomeMetadata {
  return "dismissSource" in metadata;
}

export function assertValidOutcomeMetadataCorrelation(input: RecordBrainOutcomeInput): void {
  if (input.metadata === undefined) {
    return;
  }

  if (input.outcomeType === "question_answered") {
    if (!isQuestionAnsweredMetadata(input.metadata)) {
      throw new Error(
        `Invalid brain outcome metadata: "${input.outcomeType}" requires question-answered metadata`,
      );
    }
    return;
  }

  if (input.outcomeType === "opportunity_dismissed") {
    if (!isOpportunityDismissedMetadata(input.metadata)) {
      throw new Error(
        `Invalid brain outcome metadata: "${input.outcomeType}" requires dismissal metadata`,
      );
    }
    return;
  }

  if (!isCardOutcomeMetadata(input.metadata)) {
    throw new Error(
      `Invalid brain outcome metadata: "${input.outcomeType}" requires card lifecycle metadata`,
    );
  }
}

export function assertValidRecordBrainOutcomeInput(input: RecordBrainOutcomeInput): void {
  if (!isBrainOutcomeType(input.outcomeType)) {
    throw new Error(`Invalid brain outcome type: "${input.outcomeType}"`);
  }

  assertValidBrainOutcomeOpportunityIdentity({
    opportunityKey: input.opportunityKey,
    recipientId: input.recipientId,
  });
  assertValidOutcomeMetadataCorrelation(input);
}
