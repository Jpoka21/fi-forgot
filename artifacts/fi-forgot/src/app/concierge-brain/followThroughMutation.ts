import { mutateOpportunityFollowThrough, type OpportunityFollowThroughRequest } from './mutateOpportunityFollowThrough';

/** A retry retains the original CAS version and payload after an uncertain response. */
export function reserveFollowThroughRequest(cache: Map<string, OpportunityFollowThroughRequest>, intent: Omit<OpportunityFollowThroughRequest,'idempotencyKey'>, makeKey=()=>crypto.randomUUID()) {
  const {expectedVersion: _version, ...identity}=intent;
  const reservation=JSON.stringify(identity);
  let request=cache.get(reservation);
  if(!request){request={...intent,idempotencyKey:makeKey()};cache.set(reservation,request);}
  return {reservation,request};
}

/** Production operation shared with the hook; tests exercise real transport and callbacks. */
export async function performFollowThroughMutation(input:{reservation:string;request:OpportunityFollowThroughRequest;cache:Map<string,OpportunityFollowThroughRequest>;setPending:(key:string|null)=>void;setStatus:(message:string)=>void;reload:()=>Promise<unknown>}) {
  input.setPending(input.reservation);
  input.setStatus(input.request.withdraw?'Withdrawing report.':'Saving your report.');
  try {
    await mutateOpportunityFollowThrough(input.request);
  } catch {
    input.setStatus('Save status is uncertain. Retry will use the same request.');
    try{await input.reload();}catch{/* Unavailable history cannot establish whether a write occurred. */}
    input.setPending(null);
    return;
  }
  input.cache.delete(input.reservation);
  input.setStatus(input.request.withdraw?'Report withdrawn.':'Report saved as your report, not external verification.');
  try{await input.reload();}catch{input.setStatus('Report saved, but refreshed history is unavailable.');}
  input.setPending(null);
}
