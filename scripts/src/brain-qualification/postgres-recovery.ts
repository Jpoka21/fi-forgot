// @ts-ignore Native runtime extension.
import {TARGET} from './plan.ts';
export type RecoveryOwnership={path:string;marker:string;major:string};
export function assertRecoveryOwnership(value:RecoveryOwnership){if(value.path.replaceAll('\\','/').toLowerCase()!==TARGET.pgdata.toLowerCase()||value.marker!=='fi-forgot-brain-qualification-owned-v1\n'||value.major.trim()!=='16')throw Error('FAIL_CLOSED: PostgreSQL recovery ownership mismatch');}
export interface RecoveryAdapter{ownership():RecoveryOwnership;status():number;stop():void;portReleased():Promise<boolean>;remove():void;}
/** Attempt history never substitutes for actual postmaster state. */
export async function recoverOwnedPostgres(adapter:RecoveryAdapter,apiStopped:boolean){
 assertRecoveryOwnership(adapter.ownership());
 const initial=adapter.status();if(initial!==0&&initial!==3)throw Error('FAIL_CLOSED: PostgreSQL recovery status unknown');
 if(initial===0)adapter.stop();
 if(adapter.status()!==3)throw Error('FAIL_CLOSED: PostgreSQL recovery stop unproven');
 if(!await adapter.portReleased())throw Error('FAIL_CLOSED: PostgreSQL recovery port occupied');
 assertRecoveryOwnership(adapter.ownership());
 if(!apiStopped)throw Error('FAIL_CLOSED: API stop failed; owned PostgreSQL stopped, target preserved');
 adapter.remove();
}
