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
