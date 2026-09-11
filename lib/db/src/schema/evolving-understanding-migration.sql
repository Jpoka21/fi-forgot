BEGIN;
CREATE TABLE relationship_interpretation_revisions (id text PRIMARY KEY,interpretation_id text NOT NULL,user_id text NOT NULL,recipient_id text NOT NULL,revision integer NOT NULL,text text NOT NULL,lifecycle_state text NOT NULL,uncertainty_acknowledged boolean NOT NULL,confidence text,confirmed_by_user_id text,confirmed_at timestamptz,endorsement_withdrawn_at timestamptz,recorded_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX relationship_interpretation_revision_uq ON relationship_interpretation_revisions(interpretation_id,revision);
CREATE TABLE relationship_hypotheses (id text PRIMARY KEY,user_id text NOT NULL,recipient_id text NOT NULL,family text NOT NULL,subject_key text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX relationship_hypothesis_identity_uq ON relationship_hypotheses(user_id,recipient_id,family,subject_key);
CREATE TABLE relationship_hypothesis_versions (id text PRIMARY KEY,hypothesis_id text NOT NULL,user_id text NOT NULL,recipient_id text NOT NULL,version integer NOT NULL,lifecycle_state text NOT NULL,evidence_state text NOT NULL,policy text NOT NULL,policy_version text NOT NULL,rationale text NOT NULL,explanation text NOT NULL,uncertainty text NOT NULL,confidence text,support_count integer NOT NULL,conflict_count integer NOT NULL,evidence_fingerprint text NOT NULL,supersedes_version_id text,generated_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX relationship_hypothesis_version_uq ON relationship_hypothesis_versions(hypothesis_id,version);
CREATE TABLE relationship_hypothesis_heads (hypothesis_id text PRIMARY KEY,user_id text NOT NULL,recipient_id text NOT NULL,current_version_id text NOT NULL,revision integer NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE relationship_hypothesis_evidence (hypothesis_version_id text NOT NULL,observation_version_id text,interpretation_id text,interpretation_revision integer,polarity text NOT NULL);
ALTER TABLE relationship_hypothesis_evidence ADD CONSTRAINT relationship_hypothesis_evidence_uq UNIQUE NULLS NOT DISTINCT (hypothesis_version_id,observation_version_id,interpretation_id,interpretation_revision,polarity);
CREATE TABLE relationship_hypothesis_actions (id text PRIMARY KEY,hypothesis_id text NOT NULL,hypothesis_version_id text NOT NULL,user_id text NOT NULL,recipient_id text NOT NULL,action text NOT NULL,response_state text NOT NULL,operation_id text NOT NULL,expected_revision integer NOT NULL,new_revision integer NOT NULL,acted_at timestamptz NOT NULL DEFAULT now(),actor_user_id text NOT NULL);
CREATE UNIQUE INDEX relationship_hypothesis_operation_uq ON relationship_hypothesis_actions(user_id,recipient_id,operation_id);
COMMIT;
-- Verification (psql):
-- \d relationship_interpretation_revisions
-- \d relationship_hypotheses
-- \d relationship_hypothesis_versions
-- \d relationship_hypothesis_heads
-- \d relationship_hypothesis_evidence
-- \d relationship_hypothesis_actions
