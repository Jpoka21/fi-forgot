/** Immutable state at a revision is distinct from its effective current state.
 * Successors supersede old evidence without rewriting any historical field. */
export interface UnderstandingScope { userId:string; recipientId:string }
export interface ObservationIdentity extends UnderstandingScope { id:string; sourceRecordId:string|null; version:number; lifecycleState:string }
export function currentObservationVersions<T extends ObservationIdentity>(versions:readonly T[],scope?:UnderstandingScope):T[] {
  const latest=new Map<string,T>();
  for(const version of versions){
    if(scope&&(version.userId!==scope.userId||version.recipientId!==scope.recipientId))continue;
    const key=JSON.stringify([version.userId,version.recipientId,version.sourceRecordId??version.id]);
    const prior=latest.get(key);if(!prior||version.version>prior.version)latest.set(key,version);
  }
  return [...latest.values()];
}
export function observationHistory<T extends ObservationIdentity>(versions:readonly T[]) {
  const currentIds=new Set(currentObservationVersions(versions).map(v=>v.id));
  return [...versions].sort((a,b)=>a.version-b.version).map(v=>({...v,stateAtRevision:v.lifecycleState,lifecycleState:currentIds.has(v.id)?v.lifecycleState:'superseded'}));
}
export function exactDependenciesValid(versions:readonly ObservationIdentity[],ids:readonly string[],scope?:UnderstandingScope) {
  const active=new Set(currentObservationVersions(versions,scope).filter(v=>v.lifecycleState==='active').map(v=>v.id));
  return ids.length>0&&new Set(ids).size===ids.length&&ids.every(id=>active.has(id));
}
export function truthfulIso(value:Date|string|null|undefined):string|null {
  if(value==null||value==='')return null;
  const time=new Date(value).getTime();return Number.isFinite(time)?new Date(time).toISOString():null;
}
type Observation=ObservationIdentity&{text:string;relationshipId:string|null;sourceKind:string|null;semanticClassification:string|null;sourceProvenance:unknown;recordedAt:Date|string;observedAt:Date|string|null;occurredAt:Date|string|null;confidence:string|null;actorUserId:string};
type Interpretation=UnderstandingScope&{id:string;text:string;relationshipId:string|null;confidence:string|null;lifecycleState:string;createdAt:Date|string;actorUserId:string;confirmedByUserId:string|null;confirmedAt:Date|string|null;endorsementWithdrawnAt:Date|string|null;revision:number};
export function projectActiveUnderstanding(versions:readonly Observation[],interpretations:readonly Interpretation[],dependencies:readonly {interpretationId:string;observationVersionId:string}[],scope:UnderstandingScope) {
  const observations=currentObservationVersions(versions,scope).filter(v=>v.lifecycleState==='active').map(v=>({...v,recordedAt:truthfulIso(v.recordedAt),observedAt:truthfulIso(v.observedAt),occurredAt:truthfulIso(v.occurredAt)}));
  const validIds=new Set(observations.map(v=>v.id));
  const active=interpretations.filter(i=>i.userId===scope.userId&&i.recipientId===scope.recipientId&&i.lifecycleState==='active'&&!i.endorsementWithdrawnAt).map(i=>({...i,uncertain:true as const,semanticClassification:'uncertain_interpretation' as const,createdAt:truthfulIso(i.createdAt),confirmedAt:truthfulIso(i.confirmedAt),dependencyVersionIds:dependencies.filter(d=>d.interpretationId===i.id).map(d=>d.observationVersionId)})).filter(i=>i.dependencyVersionIds.length>0&&i.dependencyVersionIds.every(id=>validIds.has(id)));
  return {observations,interpretations:active};
}
