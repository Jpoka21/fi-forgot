import { mapRelationshipOpportunityViewModel } from "../app/concierge-brain/mapConciergeViewModel.js";
import type { RelationshipOpportunity } from "../app/concierge-brain/conciergeWorkspaceTypes.js";

const source: RelationshipOpportunity = { version: 1, id: "o", relationshipId: null, relationshipIdentityProvenance: null, recipient: { id: "recipient", name: "Pat" }, title: "Observe", explanation: "Partial context.", confidence: { status: "unknown", value: null }, provenance: { sourceType: "brain_execution", sourceId: null, evidence: [{ evidenceId: null, source: "memory_freshness", label: "age", classification: "observation", observedAt: null }] }, timing: { observedAt: null }, presentation: { recommendationEligible: false, insightEligible: false }, restraint: { restrained: true, reason: "brain_recommends_no_action" }, recommendation: null };
const mapped = mapRelationshipOpportunityViewModel(source);
if (mapped.confidence.status !== "unknown" || mapped.relationshipId !== null || mapped.timing.observedAt !== null) throw new Error("missing fields invented");
if (mapped.provenance.evidence[0]?.classification !== "observation" || mapped.recommendation !== null) throw new Error("semantics/restraint lost");
const complete: RelationshipOpportunity = {
  ...source,
  id: "complete",
  relationshipId: "relationship-7",
  relationshipIdentityProvenance: { sourceType: "relationship_store", sourceId: "row-7" },
  confidence: { status: "known", value: 64 },
  provenance: {
    sourceType: "brain_execution",
    sourceId: "birthday",
    evidence: [{
      evidenceId: "evidence-2",
      source: "event_timing",
      label: "birthday",
      classification: "direct_fact",
      observedAt: "2026-08-01T00:00:00.000Z",
    }],
  },
  timing: { observedAt: "2026-08-01T00:00:00.000Z" },
  presentation: { recommendationEligible: true, insightEligible: true },
  restraint: { restrained: false, reason: null },
  recommendation: { label: "Prepare", href: "/briefings/r/Birthday", priority: "high" },
};
const completeMapped = mapRelationshipOpportunityViewModel(complete);
if (JSON.stringify(completeMapped) !== JSON.stringify(complete)) throw new Error("complete provenance changed");
console.log("relationship opportunity mapper passed");
