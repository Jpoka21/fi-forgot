import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const relationshipObservationVersionsTable = pgTable("relationship_observation_versions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  relationshipId: text("relationship_id"),
  sourceRecordId: text("source_record_id"),
  sourceKind: text("source_kind"),
  semanticClassification: text("semantic_classification"),
  sourceProvenance: jsonb("source_provenance"),
  text: text("text").notNull(),
  version: integer("version").notNull(),
  /** Immutable state recorded with this revision. Effective supersession is
   * derived from the current head/successor, never by rewriting this field. */
  lifecycleState: text("lifecycle_state").notNull().default("active"),
  supersedesVersionId: text("supersedes_version_id"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }),
  confidence: text("confidence"),
  actorUserId: text("actor_user_id").notNull(),
}, (table) => ({ sourceVersion: uniqueIndex("relationship_observation_source_version_uq").on(table.userId, table.recipientId, table.sourceRecordId, table.version) }));

export const relationshipObservationHeadsTable = pgTable("relationship_observation_heads", {
  userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(),
  sourceRecordId:text("source_record_id").notNull(), currentVersionId:text("current_version_id").notNull(),
  revision:integer("revision").notNull().default(1), updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow(),
}, table=>({scopeSource:uniqueIndex("relationship_observation_head_scope_source_uq").on(table.userId,table.recipientId,table.sourceRecordId)}));

export const relationshipInterpretationsTable = pgTable("relationship_interpretations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  relationshipId: text("relationship_id"),
  text: text("text").notNull(),
  uncertaintyAcknowledged: boolean("uncertainty_acknowledged").notNull().default(true),
  confidence: text("confidence"),
  lifecycleState: text("lifecycle_state").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  actorUserId: text("actor_user_id").notNull(),
  confirmedByUserId: text("confirmed_by_user_id"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  endorsementWithdrawnAt: timestamp("endorsement_withdrawn_at", { withTimezone: true }),
  revision: integer("revision").notNull().default(1),
});

export const relationshipInterpretationDependenciesTable = pgTable("relationship_interpretation_dependencies", {
  interpretationId: text("interpretation_id").notNull(),
  observationVersionId: text("observation_version_id").notNull(),
}, (table) => ({ dependency: uniqueIndex("relationship_interpretation_dependency_uq").on(table.interpretationId, table.observationVersionId) }));

export const relationshipInterpretationActionsTable = pgTable("relationship_interpretation_actions", {
  id: text("id").primaryKey(),
  interpretationId: text("interpretation_id").notNull(),
  userId: text("user_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actedAt: timestamp("acted_at", { withTimezone: true }).notNull().defaultNow(),
  fromLifecycleState: text("from_lifecycle_state"),
  toLifecycleState: text("to_lifecycle_state").notNull(),
  endorsementActive: boolean("endorsement_active").notNull().default(false),
  operationId: text("operation_id").notNull(),
  expectedRevision: integer("expected_revision").notNull(),
  newRevision: integer("new_revision").notNull(),
},table=>({operation:uniqueIndex('relationship_interpretation_operation_uq').on(table.userId,table.recipientId,table.operationId)}));

/** Immutable snapshots make an exact interpretation revision reconstructable. */
export const relationshipInterpretationRevisionsTable = pgTable("relationship_interpretation_revisions", {
  id:text("id").primaryKey(), interpretationId:text("interpretation_id").notNull(),
  userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(), revision:integer("revision").notNull(),
  text:text("text").notNull(), lifecycleState:text("lifecycle_state").notNull(), uncertaintyAcknowledged:boolean("uncertainty_acknowledged").notNull(),
  confidence:text("confidence"), confirmedByUserId:text("confirmed_by_user_id"), confirmedAt:timestamp("confirmed_at",{withTimezone:true}),
  endorsementWithdrawnAt:timestamp("endorsement_withdrawn_at",{withTimezone:true}), recordedAt:timestamp("recorded_at",{withTimezone:true}).notNull().defaultNow(),
},table=>({revision:uniqueIndex("relationship_interpretation_revision_uq").on(table.interpretationId,table.revision)}));

export const relationshipHypothesesTable = pgTable("relationship_hypotheses", {
  id:text("id").primaryKey(), userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(),
  family:text("family").notNull(), subjectKey:text("subject_key").notNull(), createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
},table=>({identity:uniqueIndex("relationship_hypothesis_identity_uq").on(table.userId,table.recipientId,table.family,table.subjectKey)}));
export const relationshipHypothesisVersionsTable = pgTable("relationship_hypothesis_versions", {
  id:text("id").primaryKey(), hypothesisId:text("hypothesis_id").notNull(), userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(),
  version:integer("version").notNull(), lifecycleState:text("lifecycle_state").notNull(), evidenceState:text("evidence_state").notNull(),
  policy:text("policy").notNull(), policyVersion:text("policy_version").notNull(), rationale:text("rationale").notNull(), explanation:text("explanation").notNull(),
  uncertainty:text("uncertainty").notNull(), confidence:text("confidence"), supportCount:integer("support_count").notNull(), conflictCount:integer("conflict_count").notNull(),
  evidenceFingerprint:text("evidence_fingerprint").notNull(), supersedesVersionId:text("supersedes_version_id"), generatedAt:timestamp("generated_at",{withTimezone:true}).notNull().defaultNow(),
},table=>({version:uniqueIndex("relationship_hypothesis_version_uq").on(table.hypothesisId,table.version)}));
export const relationshipHypothesisHeadsTable = pgTable("relationship_hypothesis_heads", {
  hypothesisId:text("hypothesis_id").primaryKey(), userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(), currentVersionId:text("current_version_id").notNull(), revision:integer("revision").notNull(), updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow(),
});
export const relationshipHypothesisEvidenceTable = pgTable("relationship_hypothesis_evidence", {
  hypothesisVersionId:text("hypothesis_version_id").notNull(), observationVersionId:text("observation_version_id"), interpretationId:text("interpretation_id"), interpretationRevision:integer("interpretation_revision"), polarity:text("polarity").notNull(),
},table=>({link:uniqueIndex("relationship_hypothesis_evidence_uq").on(table.hypothesisVersionId,table.observationVersionId,table.interpretationId,table.interpretationRevision,table.polarity)}));
export const relationshipHypothesisActionsTable = pgTable("relationship_hypothesis_actions", {
  id:text("id").primaryKey(), hypothesisId:text("hypothesis_id").notNull(), hypothesisVersionId:text("hypothesis_version_id").notNull(), userId:text("user_id").notNull(), recipientId:text("recipient_id").notNull(), action:text("action").notNull(), responseState:text("response_state").notNull(), operationId:text("operation_id").notNull(), expectedRevision:integer("expected_revision").notNull(), newRevision:integer("new_revision").notNull(), actedAt:timestamp("acted_at",{withTimezone:true}).notNull().defaultNow(), actorUserId:text("actor_user_id").notNull(),
},table=>({operation:uniqueIndex("relationship_hypothesis_operation_uq").on(table.userId,table.recipientId,table.operationId)}));

export type RelationshipObservationVersion = typeof relationshipObservationVersionsTable.$inferSelect;
export type RelationshipInterpretation = typeof relationshipInterpretationsTable.$inferSelect;
