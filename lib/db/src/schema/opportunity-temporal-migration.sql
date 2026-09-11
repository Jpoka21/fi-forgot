-- UNAPPLIED: review and deploy through the normal database migration process.
CREATE TABLE IF NOT EXISTS "opportunity_temporal_history" (
  "id" text PRIMARY KEY NOT NULL,
  "change_key" text NOT NULL,
  "user_id" text NOT NULL,
  "opportunity_id" text NOT NULL,
  "recipient_id" text NOT NULL,
  "source" text NOT NULL,
  "source_id" text,
  "source_version" text,
  "occurrence_cycle_id" text,
  "state" text NOT NULL,
  "effective_date" text,
  "reason" text NOT NULL,
  "evidence" jsonb NOT NULL,
  "evaluated_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "opportunity_temporal_history_change_uq" ON "opportunity_temporal_history" ("id");
CREATE INDEX IF NOT EXISTS "opportunity_temporal_history_timeline_idx" ON "opportunity_temporal_history" ("user_id", "opportunity_id", "evaluated_at");
CREATE INDEX IF NOT EXISTS "opportunity_temporal_history_recipient_idx" ON "opportunity_temporal_history" ("user_id", "recipient_id", "evaluated_at");
