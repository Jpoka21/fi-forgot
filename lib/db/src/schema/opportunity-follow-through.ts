import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const opportunityFollowThroughTable = pgTable("opportunity_follow_through_events", {
  id:text("id").primaryKey(), lineageId:text("lineage_id").notNull(), version:integer("version").notNull(),
  ownerId:text("owner_id").notNull(), recipientId:text("recipient_id").notNull(), opportunityId:text("opportunity_id").notNull(),
  occurrenceCycleId:text("occurrence_cycle_id"), relationshipId:text("relationship_id"), family:text("family").notNull(),
  sourceType:text("source_type").notNull(), sourceId:text("source_id").notNull(), dimension:text("dimension").notNull(),
  value:text("value").notNull(), action:text("action").notNull(), provenance:text("provenance").notNull(), verification:text("verification").notNull(),
  receivedAt:timestamp("received_at",{withTimezone:true}).notNull(), supersedesId:text("supersedes_id"), withdrawnEventId:text("withdrawn_event_id"),
  idempotencyKey:text("idempotency_key").notNull(), active:boolean("active").notNull(),
},table=>({
  lineageVersion:unique("opportunity_follow_through_lineage_version_uq").on(table.lineageId,table.version),
  ownerIdempotency:unique("opportunity_follow_through_owner_idempotency_uq").on(table.ownerId,table.idempotencyKey),
  ownerRecipient:index("opportunity_follow_through_owner_recipient_idx").on(table.ownerId,table.recipientId,table.receivedAt),
  sourceTypeCheck:check("opportunity_follow_through_source_type_check",sql`${table.sourceType} = 'brain_execution'`),
  dimensionCheck:check("opportunity_follow_through_dimension_check",sql`${table.dimension} in ('action','outcome')`),
  actionCheck:check("opportunity_follow_through_action_check",sql`${table.action} in ('set','withdraw')`),
  provenanceCheck:check("opportunity_follow_through_provenance_check",sql`${table.provenance} = 'explicit_owner_report'`),
  verificationCheck:check("opportunity_follow_through_verification_check",sql`${table.verification} = 'user_reported'`),
}));

export const opportunityFollowThroughReceiptTable=pgTable("opportunity_follow_through_receipts",{
  id:text("id").primaryKey(),ownerId:text("owner_id").notNull(),idempotencyKey:text("idempotency_key").notNull(),requestFingerprint:text("request_fingerprint").notNull(),response:jsonb("response").notNull(),receivedAt:timestamp("received_at",{withTimezone:true}).defaultNow().notNull(),
},table=>({ownerKey:unique("opportunity_follow_through_receipt_owner_key_uq").on(table.ownerId,table.idempotencyKey)}));
