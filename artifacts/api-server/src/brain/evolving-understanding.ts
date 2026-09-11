import {createHash} from 'node:crypto';
export const EVOLVING_UNDERSTANDING_POLICY='explicit-recipient-communication-preference';export const EVOLVING_UNDERSTANDING_POLICY_VERSION='3';
export type HypothesisEvidence={observationVersionId:string;interpretationId?:string;interpretationRevision?:number;text:string;sourceKind?:string|null;semanticClassification?:string|null};
export interface HypothesisJudgment{subjectKey:string;evidenceState:'support'|'conflict'|'unknown';support:HypothesisEvidence[];conflict:HypothesisEvidence[];evidenceLinks:Array<HypothesisEvidence&{polarity:'support'|'conflict'}>;rationale:string;explanation:string;uncertainty:string;confidence:null;fingerprint:string}
const channel='(?:texts?|phones?|phone calls?|calls?|emails?)';
const choice=String.raw`(?:a |an )?${channel}(?:(?: and | or )${channel})?`;
const positive=[
 new RegExp(String.raw`^they (?:also |clearly )?(?:prefer|like|favor|want|welcome) ${choice}(?: too)?$`,'i'),
 new RegExp(String.raw`^${channel} (?:works? (?:best|better|well)|is (?:preferred|welcome|best))(?: for them)?$`,'i'),
 new RegExp(String.raw`^their (?:preferred|favorite) (?:channel|way to communicate) is ${choice}$`,'i'),
 new RegExp(String.raw`^they (?:asked|told) (?:me|us) to (?:call|text|email)(?: them)?$`,'i'),
];
const negative=[
 new RegExp(String.raw`^they (?:(?:do not|don't|never) (?:prefer|like|want|welcome|use)|dislike|hate|avoid) ${choice}$`,'i'),
 new RegExp(String.raw`^${channel} (?:does not|doesn't|never) work(?: for them)?$`,'i'),
];
/** A finite, whole-clause grammar. Never search inside arbitrary prose for a
 * convenient preference phrase: quotation, attribution and conditionals change
 * the meaning. Unsupported clauses make this policy abstain on the entire item. */
function classifyText(text:string):Array<{polarity:'support'|'conflict';channels:string[]}> {
 const normalized=text.trim().replace(/\s+/g,' ').replace(/’/g,"'");
 if(/["“”‘;:?!]/.test(normalized))return[];
 const clauses=normalized.replace(/\.$/,'').split(/\.\s+/);
 const result:Array<{polarity:'support'|'conflict';channels:string[]}>=[];
 for(const clause of clauses){
  const polarity=negative.some(rule=>rule.test(clause))?'conflict':positive.some(rule=>rule.test(clause))?'support':null;
  if(!polarity)return[];
  const channels=[...new Set((clause.match(/\b(?:phone calls?|phones?|calls?|texts?|emails?)\b/gi)??[]).map(value=>/phone|call/i.test(value)?'phone':/text/i.test(value)?'text':'email'))];
  result.push({polarity,channels});
 }
 return result;
}
function classificationAllowed(item:HypothesisEvidence){return item.interpretationId?Number.isInteger(item.interpretationRevision):item.sourceKind==='user_report'&&item.semanticClassification==='reported_information';}
/** Policy v3 accepts only explicit recipient-scoped preference grammar from a
 * current user report or exact active interpretation revision. It abstains on
 * incidental channel words, quotations, hypotheticals, and other people. */
export function deriveCommunicationPreferenceHypothesis(evidence:readonly HypothesisEvidence[]):HypothesisJudgment|null{
 const classified=evidence.filter(classificationAllowed).flatMap(item=>classifyText(item.text).map(value=>({item,...value})));if(!classified.length)return null;
 const independent=(polarity:'support'|'conflict')=>[...new Map(classified.filter(value=>value.polarity===polarity).map(value=>[value.item.observationVersionId,value.item])).values()];const support=independent('support'),conflict=independent('conflict');
 const evidenceLinks=[...new Map(classified.map(value=>[`${value.item.observationVersionId}:${value.item.interpretationId??'observation'}:${value.item.interpretationRevision??0}:${value.polarity}`,{...value.item,polarity:value.polarity}])).values()];const evidenceState=support.length&&conflict.length?'conflict':support.length?'support':'unknown';
 const fingerprint=createHash('sha256').update(EVOLVING_UNDERSTANDING_POLICY_VERSION+'|'+evidenceLinks.map(link=>[link.observationVersionId,link.interpretationId??null,link.interpretationRevision??null,link.polarity,link.text.trim().toLocaleLowerCase()]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))).map(value=>JSON.stringify(value)).join('|')).digest('hex');
 return{subjectKey:'communication-channel',evidenceState,support,conflict,evidenceLinks,rationale:`They may have a communication preference involving ${[...new Set(classified.flatMap(value=>value.channels))].sort().join(', ')}. ${evidenceState==='support'?'Current reports support this possibility.':evidenceState==='conflict'?'Supporting and conflicting statements are both retained.':'Only negative preference evidence is present; positive preference is unknown.'}`,explanation:`${support.length} independent observation${support.length===1?'':'s'} support this possibility; ${conflict.length} conflict. Interpretation provenance is retained without adding corroboration. This is evidence support, not calibrated probability.`,uncertainty:evidenceState==='support'?'An explicit statement may still be contextual rather than durable.':'Current evidence conflicts or explicitly rejects a channel; no positive preference is asserted.',confidence:null,fingerprint};
}
