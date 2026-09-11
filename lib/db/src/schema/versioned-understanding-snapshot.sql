-- Current-state capture only; recorded_at is not observation time.
INSERT INTO relationship_observation_versions
  (id,user_id,recipient_id,source_record_id,source_kind,semantic_classification,source_provenance,text,version,lifecycle_state,recorded_at,observed_at,occurred_at,confidence,actor_user_id)
SELECT 'answer:' || id || ':captured-v1',user_id,recipient_id,id,'user_report','reported_information',jsonb_build_object('table','question_answers','capture','rollout_current_state'),answer_text,1,CASE WHEN archived_at IS NULL THEN 'active' ELSE 'archived' END,now(),NULL,NULL,NULL,user_id
FROM question_answers WHERE was_skipped=false
ON CONFLICT (user_id,recipient_id,source_record_id,version) DO NOTHING;
INSERT INTO relationship_observation_heads (user_id,recipient_id,source_record_id,current_version_id,revision)
SELECT DISTINCT ON (user_id,recipient_id,source_record_id)
user_id,recipient_id,source_record_id,id,version FROM relationship_observation_versions
WHERE source_record_id IS NOT NULL
ORDER BY user_id,recipient_id,source_record_id,version DESC
ON CONFLICT (user_id,recipient_id,source_record_id) DO NOTHING;

-- No interpretation revisions or hypotheses are backfilled. Deploy the new
-- tables empty; production capture begins only after the migration is active.
