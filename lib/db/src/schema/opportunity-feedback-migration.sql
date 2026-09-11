-- UNAPPLIED: deployment and live qualification are intentionally deferred.
CREATE TABLE opportunity_feedback_events (
  id text PRIMARY KEY, lineage_id text NOT NULL, version integer NOT NULL,
  owner_id text NOT NULL, recipient_id text NOT NULL, opportunity_id text NOT NULL,
  occurrence_cycle_id text, relationship_id text, family text NOT NULL,
  action text NOT NULL, feedback_type text NOT NULL, scope text NOT NULL,
  not_before text, timing_provenance text NOT NULL, provenance text NOT NULL,
  received_at timestamptz NOT NULL, supersedes_id text, withdrawn_event_id text,
  idempotency_key text NOT NULL, active boolean NOT NULL,
  CONSTRAINT opportunity_feedback_lineage_version_uq UNIQUE (lineage_id, version),
  CONSTRAINT opportunity_feedback_owner_idempotency_uq UNIQUE (owner_id, idempotency_key)
);
CREATE INDEX opportunity_feedback_owner_recipient_idx ON opportunity_feedback_events(owner_id, recipient_id, received_at);
CREATE TABLE opportunity_feedback_receipts (
  id text PRIMARY KEY, owner_id text NOT NULL, idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL, response jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opportunity_feedback_receipt_owner_key_uq UNIQUE (owner_id, idempotency_key)
);
