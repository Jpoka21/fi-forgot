import {resolve} from 'node:path';
export function assertFrontendBuild(manifest,repositoryRoot){
 const expected={PORT:'25460',API_PROXY_TARGET:'http://127.0.0.1:8080',BRAIN_QUALIFICATION_MODE:'true',BASE_PATH:'/',VITE_BRAIN_CONCIERGE:'true',NODE_ENV:'production'};
 if(manifest.buildExitCode!==0||Object.entries(expected).some(([key,value])=>manifest.buildEnvironment?.[key]!==value)||resolve(manifest.root).toLowerCase()!==resolve(repositoryRoot,'artifacts/fi-forgot/dist/public').toLowerCase()||!Array.isArray(manifest.files)||!manifest.files.some(x=>x.path==='index.html'))throw Error('FAIL_CLOSED: reviewed Brain frontend build mismatch');
 return manifest;
}
