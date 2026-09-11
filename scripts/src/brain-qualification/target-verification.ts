// @ts-ignore Node built-in stripping requires an explicit runtime extension.
import { TARGET } from './plan.ts';

const fail = (): never => { throw new Error('FAIL_CLOSED: qualification target is not independently verified'); };
export function parseQualificationDatabaseUrl(raw: string | undefined) {
  if (!raw) return fail();
  let url: URL;
  try { url = new URL(raw); } catch { return fail(); }
  if (url.protocol !== 'postgresql:' || url.hostname !== TARGET.host || url.port !== String(TARGET.port) ||
      url.pathname !== `/${TARGET.database}` || url.search || url.hash || !url.password) return fail();
  let user: string, password: string;
  try { user=decodeURIComponent(url.username);password=decodeURIComponent(url.password); } catch { return fail(); }
  if(user!==TARGET.role||!password)return fail();
  // Explicit configuration prevents inherited PGHOST/PGPORT and URL option overrides.
  return {host:TARGET.host,port:TARGET.port,database:TARGET.database,user,password,ssl:false as const};
}
export function parseQualificationAdminDatabaseUrl(raw:string|undefined){
  if(!raw)return fail();let url:URL;try{url=new URL(raw);}catch{return fail();}
  if(url.protocol!=='postgresql:'||url.hostname!==TARGET.host||url.port!==String(TARGET.port)||url.pathname!=='/postgres'||url.search||url.hash||!url.password)return fail();
  let user:string,password:string;try{user=decodeURIComponent(url.username);password=decodeURIComponent(url.password);}catch{return fail();}
  if(user!==TARGET.adminRole||!password)return fail();return{host:TARGET.host,port:TARGET.port,database:'postgres',user,password,ssl:false as const};
}

export interface ObservedQualificationTarget {
  database: string;
  role: string;
  serverAddress: string;
  serverPort: number;
  serverVersion: number;
  dataDirectory: string;
}
export function assertObservedQualificationTarget(observed: unknown): asserts observed is ObservedQualificationTarget {
  if(!observed||typeof observed!=='object')return fail();
  const o=observed as Partial<ObservedQualificationTarget>;
  const directory=typeof o.dataDirectory==='string'?o.dataDirectory.replaceAll('\\','/').replace(/\/$/,'').toLowerCase():'';
  if(o.database!==TARGET.database||o.role!==TARGET.role||o.serverAddress!==TARGET.host||o.serverPort!==TARGET.port||
    !Number.isInteger(o.serverVersion)||o.serverVersion!<160000||o.serverVersion!>=170000||directory!==TARGET.pgdata.toLowerCase())return fail();
}

/** Every write/destructive entry must obtain observed server identity, never approve from flags. */
export async function withVerifiedQualificationTarget<T>(input:{databaseUrl?:string;artifactHashesVerified:boolean;ownedDirectoryVerified:boolean},
  inspect:(connection:ReturnType<typeof parseQualificationDatabaseUrl>)=>Promise<unknown>,
  action:()=>Promise<T>):Promise<T>{
  const connection=parseQualificationDatabaseUrl(input.databaseUrl);
  if(input.artifactHashesVerified!==true||input.ownedDirectoryVerified!==true)return fail();
  const observed=await inspect(connection);
  assertObservedQualificationTarget(observed);
  return action();
}
