// @ts-ignore Native runtime extension.
import {assertPostgresIdentity} from './postgres-identity.ts';
// @ts-ignore Native runtime extension.
import {TARGET} from './plan.ts';
export type RestartIdentity={database:string;role:string;address:string;port:number;version:string;encoding:string;dataDirectory:string;systemIdentifier:string;postmasterStart:string};
export type RestartOwnership={path:string;marker:string;major:string};
export interface RestartAdapter{identity():RestartIdentity;ownership():RestartOwnership;snapshotHash():string;stop():void;status():number;assertPortReleased():Promise<void>;start():void;}
const normalized=(path:string)=>path.replaceAll('\\','/').toLowerCase();
export function assertRestartIdentity(value:RestartIdentity){assertPostgresIdentity(value,true);if(!/^[1-9]\d+$/.test(value.systemIdentifier)||!Number.isFinite(Date.parse(value.postmasterStart)))throw Error('FAIL_CLOSED: PostgreSQL restart continuity identity mismatch');}
function assertOwnership(value:RestartOwnership){if(normalized(value.path)!==normalized(TARGET.pgdata)||value.marker!=='fi-forgot-brain-qualification-owned-v1\n'||value.major.trim()!=='16')throw Error('FAIL_CLOSED: PostgreSQL restart ownership mismatch');}
export async function provePostgresRestart(adapter:RestartAdapter,nonce:string|undefined,sessionId:string|undefined){
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!nonce||!sessionId||!uuid.test(nonce)||!uuid.test(sessionId))throw Error('FAIL_CLOSED: restart requires exact Sandbox session binding');
 assertOwnership(adapter.ownership());const before=adapter.identity();assertRestartIdentity(before);
 const durableEvidenceHash=adapter.snapshotHash();if(!/^[a-f0-9]{64}$/i.test(durableEvidenceHash))throw Error('FAIL_CLOSED: restart snapshot hash missing');
 adapter.stop();const stoppedStatusExit=adapter.status();if(stoppedStatusExit!==3)throw Error('FAIL_CLOSED: PostgreSQL stop not independently observed');
 await adapter.assertPortReleased();
 assertOwnership(adapter.ownership());adapter.start();
 const after=adapter.identity();assertRestartIdentity(after);assertOwnership(adapter.ownership());
 if(after.systemIdentifier!==before.systemIdentifier||after.version!==before.version||Date.parse(after.postmasterStart)<=Date.parse(before.postmasterStart)||adapter.snapshotHash()!==durableEvidenceHash)throw Error('FAIL_CLOSED: PostgreSQL restart continuity mismatch');
 return {kind:'BRAIN-POSTGRES-RESTART' as const,nonce,sessionId,pgdata:TARGET.pgdata,host:TARGET.host,port:TARGET.port,postgresMajor:16,beforeSystemIdentifier:before.systemIdentifier,afterSystemIdentifier:after.systemIdentifier,beforePostmasterStart:before.postmasterStart,afterPostmasterStart:after.postmasterStart,serverVersion:after.version,stoppedStatusExit:3,portReleased:true,durableEvidenceHash};
}
export function finalizePostgresRestart(proof:Awaited<ReturnType<typeof provePostgresRestart>>|undefined,assertionsPassed:boolean,snapshotHash:string){if(!proof||!assertionsPassed||snapshotHash!==proof.durableEvidenceHash)throw Error('FAIL_CLOSED: post-restart persistence assertions not proven');return {...proof,persistenceAssertionsPassed:true,at:new Date().toISOString()};}
