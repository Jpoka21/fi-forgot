import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiConciergeLearnSomeonePanel } from "@/app/components/concierge-questions";
import { FiAiSuggestionList } from "@/app/components/ai/FiAiSuggestionList";
import { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
import { relationshipOpportunitiesForRecommendationPresentation } from "@/app/ai-concierge/aiConciergeDomain";
import type { AiConciergeWorkspaceController } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";
import { useState } from "react";
import type { OpportunityFeedbackType } from "@/app/concierge-brain/conciergeWorkspaceTypes";
import { currentOpportunityFeedback } from "@/app/concierge-brain/currentOpportunityFeedback";
import { currentOpportunityFollowThrough } from "@/app/concierge-brain/currentOpportunityFollowThrough";
import type { OpportunityActionState, RelationshipOutcomeState } from "@/app/concierge-brain/conciergeWorkspaceTypes";

const feedbackChoices: Array<[OpportunityFeedbackType, string]> = [
  ["helpful", "Helpful"], ["not_helpful", "Not helpful"], ["not_now", "Not now"],
  ["too_early", "Too early"], ["too_late", "Too late"], ["already_handled", "Already handled"],
  ["do_not_remind", "Do not remind"], ["more_often", "More often"], ["less_often", "Less often"],
];

export function FiConciergeWorkspacePanel({
  workspace,
  onPromptSelect,
}: {
  workspace: AiConciergeWorkspaceController;
  onPromptSelect: (prompt: string) => void;
}) {
  const [notBefore, setNotBefore] = useState<Record<string, string>>({});
  const [feedbackChoice, setFeedbackChoice] = useState<Record<string, OpportunityFeedbackType>>({});
  const [preferenceScope, setPreferenceScope] = useState<Record<string, "occurrence" | "recipient_family">>({});
  const [actionState,setActionState]=useState<Record<string,OpportunityActionState>>({});
  const [outcomeState,setOutcomeState]=useState<Record<string,RelationshipOutcomeState>>({});
  const [retainedAction,setRetainedAction]=useState<Record<string,OpportunityActionState>>({});
  const [retainedOutcome,setRetainedOutcome]=useState<Record<string,RelationshipOutcomeState>>({});
  const presentedOpportunities = relationshipOpportunitiesForRecommendationPresentation(workspace.opportunities);
  return (
    <div className="fi-ai-concierge-page__layout fi-ai-concierge-page__layout--workspace">
      <FiConciergeLearnSomeonePanel insights={workspace.insights} />

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-prompts-title">
        <h2 id="concierge-prompts-title" className="fi-ai-concierge-page__section-title">
          Suggested conversations
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.workspaceDescription}</p>

        <div className="fi-ai-concierge-page__prompt-grid">
          {workspace.suggestedConversations.map((item) => (
            <button
              key={item.id}
              type="button"
              className="fi-ai-concierge-page__prompt"
              onClick={() => {
                trackConciergeEvent("concierge_prompt_selected", { promptId: item.id });
                onPromptSelect(item.prompt);
              }}
            >
              <p className="fi-ai-concierge-page__prompt-label">{item.label}</p>
              <p className="fi-ai-concierge-page__prompt-copy">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-recommendations-title">
        <h2 id="concierge-recommendations-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.recommendationsTitle}
        </h2>
        {workspace.opportunities.length > 0 ? (
          <ul className="fi-ai-concierge-page__insight-list">
            {presentedOpportunities.map((opportunity) => (
              <li key={opportunity.id} className="fi-ai-concierge-page__insight-item">
                <strong>{opportunity.title}</strong>
                <span>{opportunity.explanation}</span>
                {opportunity.recommendation ? (
                  <Link href={opportunity.recommendation.href}>
                    <FiButton variant="secondary" size="sm">
                      {opportunity.recommendation.label}
                    </FiButton>
                  </Link>
                ) : null}
                <div className="fi-ai-concierge-page__feedback" aria-label={`Feedback for ${opportunity.title}`}>
                  <label htmlFor={`action-state-${opportunity.id}`}>What happened with the action
                    <select id={`action-state-${opportunity.id}`} value={actionState[opportunity.id]??"unknown"} onChange={event=>setActionState(current=>({...current,[opportunity.id]:event.target.value as OpportunityActionState}))}>
                      <option value="unknown">No action status reported</option><option value="planned">Planned</option><option value="user_reported_completed">I completed it</option><option value="not_completed">Not completed</option><option value="dismissed">Dismissed</option><option value="no_longer_relevant">No longer relevant</option>
                    </select>
                  </label>
                  <button type="button" disabled={workspace.followThroughPending!==null} onClick={()=>void workspace.submitFollowThrough({opportunity,dimension:"action",value:actionState[opportunity.id]??"unknown"})}>Save action report</button>
                  <label htmlFor={`outcome-state-${opportunity.id}`}>Relationship outcome
                    <select id={`outcome-state-${opportunity.id}`} value={outcomeState[opportunity.id]??"unknown"} onChange={event=>setOutcomeState(current=>({...current,[opportunity.id]:event.target.value as RelationshipOutcomeState}))}>
                      <option value="unknown">No known outcome</option><option value="went_well">Went well</option><option value="went_poorly">Went poorly</option><option value="appreciated">Appreciated</option><option value="unnecessary">Unnecessary</option>
                    </select>
                  </label>
                  <button type="button" disabled={workspace.followThroughPending!==null} onClick={()=>void workspace.submitFollowThrough({opportunity,dimension:"outcome",value:outcomeState[opportunity.id]??"unknown"})}>Save outcome report</button>
                  <small>These are your reports. Links and clicks do not verify completion or outcomes.</small>
                  <label htmlFor={`feedback-choice-${opportunity.id}`}>Preference
                    <select id={`feedback-choice-${opportunity.id}`} value={feedbackChoice[opportunity.id] ?? "helpful"} onChange={event => setFeedbackChoice(current => ({ ...current, [opportunity.id]: event.target.value as OpportunityFeedbackType }))}>
                      {feedbackChoices.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                    </select>
                  </label>
                  <button type="button" disabled={workspace.feedbackPending !== null} onClick={() => { const type = feedbackChoice[opportunity.id] ?? "helpful"; void workspace.submitFeedback({ opportunity, type, scope: ["do_not_remind", "more_often", "less_often"].includes(type) ? preferenceScope[opportunity.id] ?? "occurrence" : "occurrence", notBefore: ["not_now", "too_early"].includes(type) ? notBefore[opportunity.id] || null : null }); }}>Save preference</button>
                  <label htmlFor={`feedback-date-${opportunity.id}`}>Optional not-before date
                    <input id={`feedback-date-${opportunity.id}`} type="date" value={notBefore[opportunity.id] ?? ""} onChange={event => setNotBefore(current => ({ ...current, [opportunity.id]: event.target.value }))} />
                  </label>
                  {opportunity.provenance.sourceId && ["do_not_remind", "more_often", "less_often"].includes(feedbackChoice[opportunity.id] ?? "helpful") ? (
                    <label htmlFor={`feedback-scope-${opportunity.id}`}>Apply to
                      <select id={`feedback-scope-${opportunity.id}`} value={preferenceScope[opportunity.id] ?? "occurrence"} onChange={event => setPreferenceScope(current => ({...current,[opportunity.id]:event.target.value as "occurrence" | "recipient_family"}))}>
                        <option value="occurrence">This occurrence only</option>
                        <option value="recipient_family">This kind of suggestion for {opportunity.recipient.name}, including future occurrences</option>
                      </select>
                    </label>
                  ) : <span>This occurrence only</span>}
                </div>
              </li>
            ))}
          </ul>
        ) : workspace.recommendations.length > 0 ? (
          <FiAiSuggestionList suggestions={workspace.recommendations} />
        ) : (
          <p className="fi-ai-concierge-page__section-copy">{workspace.aiDefaults.emptyDescription}</p>
        )}
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-feedback-title">
        <h2 id="concierge-feedback-title" className="fi-ai-concierge-page__section-title">Saved Opportunity preferences</h2>
        <p className="fi-ai-concierge-page__section-copy">Explicit preferences only. Withdrawing stops their influence while retaining history.</p>
        {workspace.feedbackStatus ? <output className="fi-ai-concierge-page__status">{workspace.feedbackStatus}</output> : null}
        <ul className="fi-ai-concierge-page__insight-list">
          {currentOpportunityFeedback(workspace.feedbackHistory).map(event => {
            const opportunity = workspace.opportunities.find(item => item.id === event.opportunityId);
            return <li key={event.id} className="fi-ai-concierge-page__insight-item"><strong>{event.type.replaceAll("_", " ")}</strong>
              <span>{opportunity?.title ?? "Retained Opportunity"} · {event.scope === "recipient_family" ? `this person and ${event.family}` : "this occurrence"}{event.notBefore ? ` · not before ${event.notBefore} (your preference)` : ""}</span>
              <FiButton variant="ghost" size="sm" disabled={workspace.feedbackPending !== null} onClick={() => void workspace.submitFeedback({ opportunity, type: event.type, withdrawEvent: event })}>Withdraw</FiButton>
            </li>;
          })}
        </ul>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-follow-through-title">
        <h2 id="concierge-follow-through-title" className="fi-ai-concierge-page__section-title">Saved follow-through</h2>
        <p className="fi-ai-concierge-page__section-copy">Action and relationship outcome histories are separate. Corrections add history; withdrawal removes only the current report's influence.</p>
        {workspace.followThroughStatus?<output className="fi-ai-concierge-page__status">{workspace.followThroughStatus}</output>:null}
        <ul className="fi-ai-concierge-page__insight-list">{currentOpportunityFollowThrough(workspace.followThroughHistory).map(event=>{const opportunity=workspace.opportunities.find(item=>item.id===event.opportunityId);return <li key={event.id} className="fi-ai-concierge-page__insight-item"><strong>{event.dimension==="action"?"Action report":"Relationship outcome"}</strong><span>{opportunity?.title??"Retained Opportunity"} - {event.value.replaceAll("_"," ")} (reported by you)</span><details><summary>Correct or add a report</summary><><label htmlFor={`retained-action-${event.id}`}>Correct action report<select id={`retained-action-${event.id}`} value={retainedAction[event.id]??(event.dimension==="action"?event.value:"unknown")} onChange={e=>setRetainedAction(v=>({...v,[event.id]:e.target.value as OpportunityActionState}))}><option value="unknown">Unknown</option><option value="planned">Planned</option><option value="user_reported_completed">I completed it</option><option value="not_completed">Not completed</option><option value="dismissed">Dismissed</option><option value="no_longer_relevant">No longer relevant</option></select></label><button type="button" disabled={workspace.followThroughPending!==null} onClick={()=>void workspace.submitFollowThrough?.({anchorEvent:event,dimension:"action",value:retainedAction[event.id]??(event.dimension==="action"?event.value as OpportunityActionState:"unknown")})}>Save correction</button><label htmlFor={`retained-outcome-${event.id}`}>Add or correct outcome<select id={`retained-outcome-${event.id}`} value={retainedOutcome[event.id]??(event.dimension==="outcome"?event.value as RelationshipOutcomeState:"unknown")} onChange={e=>setRetainedOutcome(v=>({...v,[event.id]:e.target.value as RelationshipOutcomeState}))}><option value="unknown">No known outcome</option><option value="went_well">Went well</option><option value="went_poorly">Went poorly</option><option value="appreciated">Appreciated</option><option value="unnecessary">Unnecessary</option></select></label><button type="button" disabled={workspace.followThroughPending!==null} onClick={()=>void workspace.submitFollowThrough?.({anchorEvent:event,dimension:"outcome",value:retainedOutcome[event.id]??(event.dimension==="outcome"?event.value as RelationshipOutcomeState:"unknown")})}>Save outcome</button></></details><FiButton variant="ghost" size="sm" disabled={workspace.followThroughPending!==null} onClick={()=>void workspace.submitFollowThrough?.({opportunity,withdrawEvent:event})}>Withdraw</FiButton></li>})}</ul>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-insights-title">
        <h2 id="concierge-insights-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.insightsTitle}
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.insightsDescription}</p>
        <ul className="fi-ai-concierge-page__insight-list">
          {workspace.insights.map((insight) => (
            <li key={insight.id} className="fi-ai-concierge-page__insight-item">
              <strong>{insight.title}</strong>
              <span>{insight.description}</span>
              {insight.href ? (
                <Link href={insight.href}>
                  <FiButton variant="ghost" size="sm">
                    View profile
                  </FiButton>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-memory-title">
        <h2 id="concierge-memory-title" className="fi-ai-concierge-page__section-title">
          {workspace.defaults.memoryTitle}
        </h2>
        <p className="fi-ai-concierge-page__section-copy">{workspace.defaults.memoryDescription}</p>
        {workspace.memories.length > 0 ? (
          <ul className="fi-ai-concierge-page__memory-list">
            {workspace.memories.map((memory) => (
              <li key={memory.id} className="fi-ai-concierge-page__memory-item">
                <strong>
                  {memory.recipientName} · {memory.label}
                </strong>
                <span>{memory.excerpt}</span>
                <Link href={memory.href}>
                  <FiButton
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      trackConciergeEvent("concierge_memory_opened", { memoryId: memory.id })
                    }
                  >
                    Open memory
                  </FiButton>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fi-ai-concierge-page__section-copy">
            Add a few memories in relationship profiles to help future cards feel personal.
          </p>
        )}
      </section>
    </div>
  );
}
