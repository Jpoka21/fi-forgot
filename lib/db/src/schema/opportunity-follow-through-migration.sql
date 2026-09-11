-- Intentionally unapplied. Deployment requires an authorized migrated environment.
CREATE TABLE IF NOT EXISTS opportunity_follow_through_events (
  id text PRIMARY KEY, lineage_id text NOT NULL, version integer NOT NULL,
  owner_id text NOT NULL, recipient_id text NOT NULL, opportunity_id text NOT NULL,
  occurrence_cycle_id text, relationship_id text, family text NOT NULL,
  source_type text NOT NULL CHECK (source_type = 'brain_execution'), source_id text NOT NULL,
  dimension text NOT NULL CHECK (dimension IN ('action','outcome')),
  value text NOT NULL, action text NOT NULL CHECK (action IN ('set','withdraw')),
  provenance text NOT NULL CHECK (provenance = 'explicit_owner_report'),
  verification text NOT NULL CHECK (verification = 'user_reported'),
  received_at timestamptz NOT NULL, supersedes_id text, withdrawn_event_id text,
  idempotency_key text NOT NULL, active boolean NOT NULL,
  CONSTRAINT opportunity_follow_through_lineage_version_uq UNIQUE(lineage_id, version),
  CONSTRAINT opportunity_follow_through_owner_idempotency_uq UNIQUE(owner_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS opportunity_follow_through_owner_recipient_idx ON opportunity_follow_through_events(owner_id,recipient_id,received_at);
CREATE TABLE IF NOT EXISTS opportunity_follow_through_receipts (
  id text PRIMARY KEY, owner_id text NOT NULL, idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL, response jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opportunity_follow_through_receipt_owner_key_uq UNIQUE(owner_id,idempotency_key)
);
