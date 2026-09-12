// @ts-ignore Native runtime extension.
import {TARGET} from './plan.ts';
export type PostgresIdentity={database?:unknown;role?:unknown;address?:unknown;port?:unknown;version?:unknown;dataDirectory?:unknown;encoding?:unknown};
/** Report only fixed field names and pass/fail, never arbitrary server output. */
export function assertPostgresIdentity(value:PostgresIdentity|undefined,admin:boolean){
 const checks={database:value?.database===(admin?'postgres':TARGET.database),role:value?.role===(admin?TARGET.adminRole:TARGET.role),address:value?.address===TARGET.host,port:String(value?.port)===String(TARGET.port),version:typeof value?.version==='string'&&/^16\d{4}$/.test(value.version),encoding:value?.encoding==='UTF8',...(admin?{dataDirectory:typeof value?.dataDirectory==='string'&&value.dataDirectory.replaceAll('\\','/').toLowerCase()===TARGET.pgdata.toLowerCase()}: {})};
 if(Object.values(checks).some(match=>!match))throw Error(`FAIL_CLOSED: ${admin?'admin':'app'}-observed PostgreSQL identity mismatch ${JSON.stringify(checks)}`);
}
