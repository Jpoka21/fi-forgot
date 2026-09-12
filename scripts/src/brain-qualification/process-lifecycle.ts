export interface ManagedProcess {
  requestGracefulStop():void;
  waitForExit(timeoutMs:number):Promise<boolean>;
  forceStop():void;
  assertPortReleased():Promise<void>;
}
export async function stopManagedProcess(child:ManagedProcess) {
  child.requestGracefulStop();
  if(!await child.waitForExit(5000)) {
    child.forceStop();
    if(!await child.waitForExit(5000))throw new Error('FAIL_CLOSED: owned process did not terminate; restart and teardown refused');
  }
  await child.assertPortReleased();
}
export async function waitForReadiness(probe:()=>Promise<boolean>,pause:()=>Promise<void>,attempts=100) {
  for(let attempt=0;attempt<attempts;attempt++){
    if(await probe())return;
    await pause();
  }
  throw new Error('FAIL_CLOSED: qualified API readiness timed out');
}
import type {ChildProcess} from 'node:child_process';
/** Install immediately after spawn so a late IPC error cannot escape recovery. */
export function observeManagedChild(child:ChildProcess){child.on('error',()=>{});}
export function requestManagedChildStop(child:ChildProcess){
  const alive=()=>child.exitCode==null&&child.signalCode==null;
  const terminate=()=>{if(alive())try{child.kill('SIGTERM');}catch{/* wait/port proof still required */}};
  if(!alive())return;
  if(child.connected)try{child.send('brain-qualification-stop',error=>{if(error)terminate();});}catch{terminate();}
  else terminate();
}
