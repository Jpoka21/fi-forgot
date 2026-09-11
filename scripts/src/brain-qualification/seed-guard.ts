/** Qualification mode must reject the normal seed command before provider imports. */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
export function assertSeedAllowed(env:NodeJS.ProcessEnv=process.env){
  if(env.BRAIN_QUALIFICATION_MODE==="true" || env.BRAIN_QUALIFICATION_EXECUTION_ADMITTED==="true"){
    throw new Error("QUALIFICATION_CONTAINMENT: external product seeding is prohibited; use only the approved synthetic database fixture procedure");
  }
}
export async function runSeed(env:NodeJS.ProcessEnv=process.env,load:()=>Promise<unknown>=()=>import("../seed-products")){
  assertSeedAllowed(env);
  await load();
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  await runSeed();
}
