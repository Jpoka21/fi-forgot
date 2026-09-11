// @ts-ignore Node built-in stripping requires explicit runtime extensions.
import{waitForReadiness}from'./process-lifecycle.ts';
if(process.env.BRAIN_QUALIFICATION_EXECUTION_ADMITTED!=="true"||process.env.BRAIN_QUALIFICATION_OWNER_AUTHORIZATION!=="OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION")throw new Error("FAIL_CLOSED: readiness probe requires exact admission");
await waitForReadiness(async()=>{try{const response=await fetch("http://127.0.0.1:8080/api/qualification/health",{redirect:"error",signal:AbortSignal.timeout(500)});return response.ok;}catch{return false;}},()=>new Promise(resolve=>setTimeout(resolve,100)),100);
console.log("qualified API ready");
