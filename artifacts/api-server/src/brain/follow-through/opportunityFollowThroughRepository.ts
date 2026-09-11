import { createHash } from "node:crypto";
import type { FollowThroughDimension, OpportunityFollowThroughEvent, OpportunityFollowThroughTarget } from "./opportunityFollowThroughTypes";

export class OpportunityFollowThroughConflictError extends Error {}

export interface OpportunityFollowThroughRepository {
  list(input: { ownerId: string; recipientIds: string[] }): Promise<OpportunityFollowThroughEvent[]>;
  findReceipt?(input: { ownerId: string; idempotencyKey: string; requestFingerprint: string }): Promise<OpportunityFollowThroughEvent | null>;
  append(input: { event: OpportunityFollowThroughEvent; expectedVersion: number; requestFingerprint: string }): Promise<OpportunityFollowThroughEvent>;
}

async function loadDb() {
  const [{ db }, loadedSchema] = await Promise.all([import("@workspace/db"), import("@workspace/db/schema")]);
  const schema = loadedSchema as any; // Runtime schema is source-exported; project references may retain a stale declaration until the root build.
  return { db, opportunityFollowThroughTable: schema.opportunityFollowThroughTable, opportunityFollowThroughReceiptTable: schema.opportunityFollowThroughReceiptTable };
}

const fromRow = (row: any): OpportunityFollowThroughEvent => ({
  id: row.id, lineageId: row.lineageId, version: row.version, dimension: row.dimension, value: row.value,
  action: row.action, ownerId: row.ownerId, recipientId: row.recipientId, opportunityId: row.opportunityId,
  occurrenceCycleId: row.occurrenceCycleId, relationshipId: row.relationshipId, family: row.family,
  sourceType: row.sourceType, sourceId: row.sourceId, provenance: "explicit_owner_report", verification: "user_reported",
  receivedAt: row.receivedAt.toISOString(), supersedesId: row.supersedesId, withdrawnEventId: row.withdrawnEventId,
  idempotencyKey: row.idempotencyKey, active: row.active,
});

export function followThroughLineageId(target: OpportunityFollowThroughTarget, dimension: FollowThroughDimension) {
  return createHash("sha256").update(JSON.stringify([target.ownerId, target.recipientId, target.relationshipId, target.opportunityId, target.occurrenceCycleId, target.family, target.sourceType, target.sourceId, dimension])).digest("hex");
}

function pgUnique(error: unknown) {
  let cause = error; const seen = new Set<unknown>();
  while (cause && typeof cause === "object" && !seen.has(cause)) {
    seen.add(cause); if ((cause as {code?:string}).code === "23505") return true; cause = (cause as {cause?:unknown}).cause;
  }
  return false;
}

export function createPgOpportunityFollowThroughRepository(database: typeof loadDb = loadDb): OpportunityFollowThroughRepository {
  return {
    async findReceipt({ownerId,idempotencyKey,requestFingerprint}) {
      const {and,eq}=await import("drizzle-orm"); const {db,opportunityFollowThroughReceiptTable:t}=await database();
      const [r]=await db.select().from(t).where(and(eq(t.ownerId,ownerId),eq(t.idempotencyKey,idempotencyKey))).limit(1);
      if (!r) return null; if (r.requestFingerprint !== requestFingerprint) throw new OpportunityFollowThroughConflictError("Idempotency key was already used for a different request");
      return r.response as OpportunityFollowThroughEvent;
    },
    async list({ownerId,recipientIds}) {
      if (!recipientIds.length) return []; const {and,asc,eq,inArray}=await import("drizzle-orm"); const {db,opportunityFollowThroughTable:t}=await database();
      return (await db.select().from(t).where(and(eq(t.ownerId,ownerId),inArray(t.recipientId,recipientIds))).orderBy(asc(t.receivedAt),asc(t.version))).map(fromRow);
    },
    async append({event,expectedVersion,requestFingerprint}) {
      const {and,desc,eq}=await import("drizzle-orm"); const {db,opportunityFollowThroughTable:t,opportunityFollowThroughReceiptTable:r}=await database();
      return db.transaction(async(tx:any)=>{
        const retry=await tx.select().from(r).where(and(eq(r.ownerId,event.ownerId),eq(r.idempotencyKey,event.idempotencyKey))).limit(1);
        if(retry[0]) { if(retry[0].requestFingerprint!==requestFingerprint) throw new OpportunityFollowThroughConflictError("Idempotency key was already used for a different request"); return retry[0].response; }
        const rows=await tx.select().from(t).where(and(eq(t.ownerId,event.ownerId),eq(t.lineageId,event.lineageId))).orderBy(desc(t.version)).limit(1);
        const prior=rows[0]?fromRow(rows[0]):null, version=prior?.version??0;
        const equal=prior&&prior.action===event.action&&prior.value===event.value&&prior.active===event.active;
        if(!equal&&version!==expectedVersion) throw new OpportunityFollowThroughConflictError(`Expected version ${expectedVersion}; current version is ${version}`);
        const result=equal?prior:event;
        try { if(!equal) await tx.insert(t).values({...event,receivedAt:new Date(event.receivedAt)}); await tx.insert(r).values({id:createHash("sha256").update(JSON.stringify([event.ownerId,event.idempotencyKey])).digest("hex"),ownerId:event.ownerId,idempotencyKey:event.idempotencyKey,requestFingerprint,response:result}); }
        catch(error){if(pgUnique(error)) throw new OpportunityFollowThroughConflictError("Concurrent follow-through mutation conflicted"); throw error;}
        return result;
      });
    },
  };
}

export function currentFollowThrough(events: OpportunityFollowThroughEvent[]) {
  const latest=new Map<string,OpportunityFollowThroughEvent>();
  for(const event of events) if(!latest.has(event.lineageId)||latest.get(event.lineageId)!.version<event.version) latest.set(event.lineageId,event);
  return [...latest.values()].filter(event=>event.active&&event.action==="set");
}
