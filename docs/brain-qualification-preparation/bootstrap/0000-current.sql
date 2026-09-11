-- Offline full-current PostgreSQL 16 bootstrap; NEVER applied during preparation.
-- Fresh empty qualification database only; do not follow with duplicate incrementals.
BEGIN;
CREATE TABLE "ai_card_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"subcategory" text NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"handwrytten_card_id" text,
	"prompt_used" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"style" text,
	"tone" text,
	"primary_color" text,
	"seasonal" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"times_shown" integer DEFAULT 0 NOT NULL,
	"times_selected" integer DEFAULT 0 NOT NULL,
	"times_rejected" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"occasion" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"relationship" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"season" text,
	"audience" text,
	"gender_lean" text,
	CONSTRAINT "ai_card_library_handwrytten_card_id_unique" UNIQUE("handwrytten_card_id")
);

CREATE TABLE "brain_opportunity_exposure_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"opportunity_key" text NOT NULL,
	"recipient_id" text NOT NULL,
	"source_rule_id" text NOT NULL,
	"event_type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"source_outcome_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "brain_outcome_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"opportunity_key" text NOT NULL,
	"outcome_type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"metadata" jsonb,
	"source_action_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "brownie_point_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text,
	"action_type" text NOT NULL,
	"points" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "business_card_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"client_id" text NOT NULL,
	"approval_token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"event_type" text NOT NULL,
	"occasion_date" text NOT NULL,
	"mail_date" text NOT NULL,
	"card_message" text NOT NULL,
	"client_name" text NOT NULL,
	"client_address" text,
	"client_company" text,
	"card_font" text,
	"card_signature" text,
	"notify_email" text,
	"hw_order_id" text,
	"context_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	CONSTRAINT "business_card_queue_approval_token_unique" UNIQUE("approval_token")
);

CREATE TABLE "business_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"full_name" text NOT NULL,
	"company" text,
	"address" text,
	"email" text,
	"phone" text,
	"birthday" text,
	"home_purchase_anniversary" text,
	"client_since" text,
	"custom_events" text,
	"relationship_other" text,
	"anniversary_date" text,
	"anniversary_note" text,
	"tone" text,
	"kids_names" text,
	"pets" text,
	"interests" text,
	"notes" text,
	"tags" text,
	"relationship" text,
	"auto_birthday" boolean DEFAULT true,
	"auto_holiday" boolean DEFAULT true,
	"auto_anniversary" boolean DEFAULT false,
	"require_approval" boolean DEFAULT true,
	"automations_on" boolean DEFAULT true,
	"last_card_sent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "business_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"email" text,
	"biz_type" text,
	"biz_type_other" text,
	"tone" text,
	"card_signature" text,
	"card_font" text,
	"notify_timing" text,
	"notify_channel" text,
	"notify_email" text,
	"notify_phone" text,
	"automation_mode" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_settings_business_id_unique" UNIQUE("business_id")
);

CREATE TABLE "card_classifications" (
	"image_url" text PRIMARY KEY NOT NULL,
	"occasions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confirmed_occasions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"claude_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gpt_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skip" boolean DEFAULT false NOT NULL,
	"classified_at" bigint NOT NULL,
	"models" jsonb DEFAULT '[]'::jsonb NOT NULL
);

CREATE TABLE "card_previews" (
	"token" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"card_name" text DEFAULT '' NOT NULL,
	"message_text" text NOT NULL,
	"recipient_name" text NOT NULL,
	"event_type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "custom_holiday_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"handwrytten_card_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"occasion" text DEFAULT 'Happy Holidays' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"generated_at" bigint NOT NULL,
	CONSTRAINT "custom_holiday_cards_handwrytten_card_id_unique" UNIQUE("handwrytten_card_id")
);

CREATE TABLE "demo_leads" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"recipient_name" text NOT NULL,
	"relationship" text NOT NULL,
	"occasion" text,
	"personality" text,
	"source" text DEFAULT 'demo_for_free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_demo_email_sent_at" timestamp,
	"demo_email_send_count" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "follow_up_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"source_answer_id" text NOT NULL,
	"category" text NOT NULL,
	"trigger_date" timestamp with time zone NOT NULL,
	"question" text NOT NULL,
	"original_answer" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answered_at" timestamp with time zone
);

CREATE TABLE "opportunity_feedback_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"response" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_feedback_receipt_owner_key_uq" UNIQUE("owner_id","idempotency_key")
);

CREATE TABLE "opportunity_feedback_events" (
	"id" text PRIMARY KEY NOT NULL,
	"lineage_id" text NOT NULL,
	"version" integer NOT NULL,
	"owner_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"occurrence_cycle_id" text,
	"relationship_id" text,
	"family" text NOT NULL,
	"action" text NOT NULL,
	"feedback_type" text NOT NULL,
	"scope" text NOT NULL,
	"not_before" text,
	"timing_provenance" text NOT NULL,
	"provenance" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"supersedes_id" text,
	"withdrawn_event_id" text,
	"idempotency_key" text NOT NULL,
	"active" boolean NOT NULL,
	CONSTRAINT "opportunity_feedback_lineage_version_uq" UNIQUE("lineage_id","version"),
	CONSTRAINT "opportunity_feedback_owner_idempotency_uq" UNIQUE("owner_id","idempotency_key")
);

CREATE TABLE "opportunity_follow_through_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"response" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_follow_through_receipt_owner_key_uq" UNIQUE("owner_id","idempotency_key")
);

CREATE TABLE "opportunity_follow_through_events" (
	"id" text PRIMARY KEY NOT NULL,
	"lineage_id" text NOT NULL,
	"version" integer NOT NULL,
	"owner_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"occurrence_cycle_id" text,
	"relationship_id" text,
	"family" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"dimension" text NOT NULL,
	"value" text NOT NULL,
	"action" text NOT NULL,
	"provenance" text NOT NULL,
	"verification" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"supersedes_id" text,
	"withdrawn_event_id" text,
	"idempotency_key" text NOT NULL,
	"active" boolean NOT NULL,
	CONSTRAINT "opportunity_follow_through_lineage_version_uq" UNIQUE("lineage_id","version"),
	CONSTRAINT "opportunity_follow_through_owner_idempotency_uq" UNIQUE("owner_id","idempotency_key"),
	CONSTRAINT "opportunity_follow_through_source_type_check" CHECK ("opportunity_follow_through_events"."source_type" = 'brain_execution'),
	CONSTRAINT "opportunity_follow_through_dimension_check" CHECK ("opportunity_follow_through_events"."dimension" in ('action','outcome')),
	CONSTRAINT "opportunity_follow_through_action_check" CHECK ("opportunity_follow_through_events"."action" in ('set','withdraw')),
	CONSTRAINT "opportunity_follow_through_provenance_check" CHECK ("opportunity_follow_through_events"."provenance" = 'explicit_owner_report'),
	CONSTRAINT "opportunity_follow_through_verification_check" CHECK ("opportunity_follow_through_events"."verification" = 'user_reported')
);

CREATE TABLE "opportunity_temporal_history" (
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
	"evaluated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "pending_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_item_id" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"recipient_name" text NOT NULL,
	"event_type" text NOT NULL,
	"scheduled_mail_date" text NOT NULL,
	"message_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_reminder_sent_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);

CREATE TABLE "personal_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"message_original" text,
	"message_final" text,
	"was_edited" boolean DEFAULT false NOT NULL,
	"generation_version" text DEFAULT 'v1' NOT NULL,
	"archetype" text,
	"handwrytten_card_id" text,
	"brain_source_rule_id" text,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"mailed_at" timestamp with time zone,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "personal_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);

CREATE TABLE "question_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_year" integer NOT NULL,
	"question_key" text NOT NULL,
	"question_text" text NOT NULL,
	"answer_text" text NOT NULL,
	"was_skipped" boolean DEFAULT false NOT NULL,
	"trigger_type" text DEFAULT 'event_briefing' NOT NULL,
	"importance_score" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "recipient_memory" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_id" text NOT NULL,
	"permanent_facts" jsonb DEFAULT '{}'::jsonb,
	"relationship_dna" jsonb DEFAULT '{}'::jsonb,
	"card_fuel" jsonb DEFAULT '{}'::jsonb,
	"card_preferences" jsonb DEFAULT '{}'::jsonb,
	"profile_completeness" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipient_memory_recipient_id_unique" UNIQUE("recipient_id")
);

CREATE TABLE "recipient_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_id" text NOT NULL,
	"personality_notes" text,
	"personality_traits" jsonb,
	"interests" jsonb,
	"hobbies" text,
	"dislikes" text,
	"favorite_memories" text,
	"inside_jokes" text,
	"preferred_tone" text,
	"emotional_openness" integer,
	"things_to_avoid" text,
	"things_to_always_include" text,
	"sender_nickname" text,
	"sign_off" text,
	"delivery_preference" text,
	"preview_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipient_profile_recipient_id_unique" UNIQUE("recipient_id")
);

CREATE TABLE "recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"nickname" text,
	"relationship_type" text NOT NULL,
	"relationship_label" text,
	"birthday" text,
	"anniversary" text,
	"email" text,
	"phone" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'US',
	"active" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "recipients_v2" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"relationship_type" text NOT NULL,
	"birthday" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_hypotheses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"family" text NOT NULL,
	"subject_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_hypothesis_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"hypothesis_id" text NOT NULL,
	"hypothesis_version_id" text NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"action" text NOT NULL,
	"response_state" text NOT NULL,
	"operation_id" text NOT NULL,
	"expected_revision" integer NOT NULL,
	"new_revision" integer NOT NULL,
	"acted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" text NOT NULL
);

CREATE TABLE "relationship_hypothesis_evidence" (
	"hypothesis_version_id" text NOT NULL,
	"observation_version_id" text,
	"interpretation_id" text,
	"interpretation_revision" integer,
	"polarity" text NOT NULL,
	CONSTRAINT "relationship_hypothesis_evidence_uq" UNIQUE NULLS NOT DISTINCT("hypothesis_version_id","observation_version_id","interpretation_id","interpretation_revision","polarity")
);

CREATE TABLE "relationship_hypothesis_heads" (
	"hypothesis_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"current_version_id" text NOT NULL,
	"revision" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_hypothesis_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"hypothesis_id" text NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"version" integer NOT NULL,
	"lifecycle_state" text NOT NULL,
	"evidence_state" text NOT NULL,
	"policy" text NOT NULL,
	"policy_version" text NOT NULL,
	"rationale" text NOT NULL,
	"explanation" text NOT NULL,
	"uncertainty" text NOT NULL,
	"confidence" text,
	"support_count" integer NOT NULL,
	"conflict_count" integer NOT NULL,
	"evidence_fingerprint" text NOT NULL,
	"supersedes_version_id" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_interpretation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"interpretation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"action" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"acted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"from_lifecycle_state" text,
	"to_lifecycle_state" text NOT NULL,
	"endorsement_active" boolean DEFAULT false NOT NULL,
	"operation_id" text NOT NULL,
	"expected_revision" integer NOT NULL,
	"new_revision" integer NOT NULL
);

CREATE TABLE "relationship_interpretation_dependencies" (
	"interpretation_id" text NOT NULL,
	"observation_version_id" text NOT NULL
);

CREATE TABLE "relationship_interpretation_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"interpretation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"revision" integer NOT NULL,
	"text" text NOT NULL,
	"lifecycle_state" text NOT NULL,
	"uncertainty_acknowledged" boolean NOT NULL,
	"confidence" text,
	"confirmed_by_user_id" text,
	"confirmed_at" timestamp with time zone,
	"endorsement_withdrawn_at" timestamp with time zone,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_interpretations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"relationship_id" text,
	"text" text NOT NULL,
	"uncertainty_acknowledged" boolean DEFAULT true NOT NULL,
	"confidence" text,
	"lifecycle_state" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" text NOT NULL,
	"confirmed_by_user_id" text,
	"confirmed_at" timestamp with time zone,
	"endorsement_withdrawn_at" timestamp with time zone,
	"revision" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "relationship_observation_heads" (
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"source_record_id" text NOT NULL,
	"current_version_id" text NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "relationship_observation_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"relationship_id" text,
	"source_record_id" text,
	"source_kind" text,
	"semantic_classification" text,
	"source_provenance" jsonb,
	"text" text NOT NULL,
	"version" integer NOT NULL,
	"lifecycle_state" text DEFAULT 'active' NOT NULL,
	"supersedes_version_id" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"observed_at" timestamp with time zone,
	"occurred_at" timestamp with time zone,
	"confidence" text,
	"actor_user_id" text NOT NULL
);

CREATE TABLE "sample_card_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_image_url" text NOT NULL,
	"category" text NOT NULL,
	"tone" text DEFAULT 'Professional' NOT NULL,
	"business_type" text DEFAULT '' NOT NULL,
	"recipient_type" text DEFAULT '' NOT NULL,
	"relationship_context" text DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE TABLE "studio_artwork_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"artwork_slot_id" uuid NOT NULL,
	"name" text NOT NULL,
	"brief" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "studio_artwork_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"name" text NOT NULL,
	"brief" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "studio_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"occasion" text NOT NULL,
	"relationship" text NOT NULL,
	"style" text,
	"description" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "fi_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" text DEFAULT 'basic',
	"brownie_points_balance" integer DEFAULT 0 NOT NULL,
	"lifetime_brownie_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fi_users_email_unique" UNIQUE("email")
);

ALTER TABLE "studio_artwork_candidates" ADD CONSTRAINT "studio_artwork_candidates_collection_id_studio_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."studio_collections"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "studio_artwork_candidates" ADD CONSTRAINT "studio_artwork_candidates_artwork_slot_id_studio_artwork_slots_id_fk" FOREIGN KEY ("artwork_slot_id") REFERENCES "public"."studio_artwork_slots"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "studio_artwork_slots" ADD CONSTRAINT "studio_artwork_slots_collection_id_studio_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."studio_collections"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "brain_opp_exposure_user_key_idx" ON "brain_opportunity_exposure_events" USING btree ("user_id","opportunity_key");
CREATE INDEX "brain_opp_exposure_user_occurred_idx" ON "brain_opportunity_exposure_events" USING btree ("user_id","occurred_at");
CREATE UNIQUE INDEX "brain_opp_exposure_source_outcome_uidx" ON "brain_opportunity_exposure_events" USING btree ("source_outcome_event_id");
CREATE INDEX "brain_outcome_user_key_idx" ON "brain_outcome_events" USING btree ("user_id","opportunity_key");
CREATE INDEX "brain_outcome_user_occurred_idx" ON "brain_outcome_events" USING btree ("user_id","occurred_at");
CREATE UNIQUE INDEX "brain_outcome_source_action_uidx" ON "brain_outcome_events" USING btree ("source_action_id");
CREATE INDEX "opportunity_feedback_owner_recipient_idx" ON "opportunity_feedback_events" USING btree ("owner_id","recipient_id","received_at");
CREATE INDEX "opportunity_follow_through_owner_recipient_idx" ON "opportunity_follow_through_events" USING btree ("owner_id","recipient_id","received_at");
CREATE UNIQUE INDEX "opportunity_temporal_history_change_uq" ON "opportunity_temporal_history" USING btree ("id");
CREATE INDEX "opportunity_temporal_history_timeline_idx" ON "opportunity_temporal_history" USING btree ("user_id","opportunity_id","evaluated_at");
CREATE INDEX "opportunity_temporal_history_recipient_idx" ON "opportunity_temporal_history" USING btree ("user_id","recipient_id","evaluated_at");
CREATE UNIQUE INDEX "relationship_hypothesis_identity_uq" ON "relationship_hypotheses" USING btree ("user_id","recipient_id","family","subject_key");
CREATE UNIQUE INDEX "relationship_hypothesis_operation_uq" ON "relationship_hypothesis_actions" USING btree ("user_id","recipient_id","operation_id");
CREATE UNIQUE INDEX "relationship_hypothesis_version_uq" ON "relationship_hypothesis_versions" USING btree ("hypothesis_id","version");
CREATE UNIQUE INDEX "relationship_interpretation_operation_uq" ON "relationship_interpretation_actions" USING btree ("user_id","recipient_id","operation_id");
CREATE UNIQUE INDEX "relationship_interpretation_dependency_uq" ON "relationship_interpretation_dependencies" USING btree ("interpretation_id","observation_version_id");
CREATE UNIQUE INDEX "relationship_interpretation_revision_uq" ON "relationship_interpretation_revisions" USING btree ("interpretation_id","revision");
CREATE UNIQUE INDEX "relationship_observation_head_scope_source_uq" ON "relationship_observation_heads" USING btree ("user_id","recipient_id","source_record_id");
CREATE UNIQUE INDEX "relationship_observation_source_version_uq" ON "relationship_observation_versions" USING btree ("user_id","recipient_id","source_record_id","version");
CREATE INDEX "scm_lookup_idx" ON "sample_card_messages" USING btree ("card_image_url","category","tone","business_type","recipient_type","relationship_context");
COMMIT;
