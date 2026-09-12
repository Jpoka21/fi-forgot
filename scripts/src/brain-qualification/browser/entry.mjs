import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';import {createServer} from 'node:net';
import {qualifyBrowser} from './workflow.mjs';import {verifyExistingOwners,reassertSnapshot} from './integration-adapters.mjs';import {assertFrontendBuild} from './build-contract.mjs';
const root='C:/Users/James.Massaro/Projects/fi-forgot',input='C:/ProbeInput',output='C:/ProbeOutput/browser';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),fileHash=file=>hash(fs.readFileSync(file)),json=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
function need(value){if(!value)throw Error('FAIL_CLOSED: browser entry admission mismatch')}
try{
 need(process.platform==='win32'&&path.resolve(process.cwd()).toLowerCase()===path.resolve(root).toLowerCase()&&process.env.BRAIN_QUALIFICATION_OS_NETWORK_BOUNDARY==='reviewed-loopback-only');
 const request=json(input+'/live-request.json'),release=json(input+'/live-release.json');
 need(request.nonce===process.env.BRAIN_QUALIFICATION_ATTEMPT_NONCE&&release.nonce===request.nonce&&release.sessionId===process.env.BRAIN_QUALIFICATION_SESSION_ID&&release.requestHash.toLowerCase()===fileHash(input+'/live-request.json')&&release.action==='EXECUTE-ACCEPTED-DISPOSABLE-QUALIFICATION');
 const pins=new Map(request.pins.map(pin=>[pin.path,pin.sha256.toLowerCase()]));
 for(const name of ['browser-runtime.zip','browser-manifest.json','frontend-build-manifest.json'])need(pins.has(name)&&fileHash(input+'/'+name)===pins.get(name));
 const runtimePins={browserArchiveHash:pins.get('browser-runtime.zip'),browserManifestHash:pins.get('browser-manifest.json'),frontendManifestHash:pins.get('frontend-build-manifest.json')};
 const fixturePath=root+'/docs/brain-qualification-preparation/synthetic-fixtures.json';need(fileHash(fixturePath)==='1591c1c7e2adeab1d5f253a3d0de00ee1a1c2cea07ad1acff316eb9c9e843e62');
 need(fs.readFileSync(root+'/.orchestra/qualification/fi-forgot-brain-qualification-pgdata/.fi-forgot-brain-qualification-owned','utf8')==='fi-forgot-brain-qualification-owned-v1\n');
 const manifest=assertFrontendBuild(json(input+'/frontend-build-manifest.json'),root);
 const runtime=json(input+'/browser-manifest.json');
 for(const file of runtime.files){need(typeof file.path==='string'&&!file.path.includes('..')&&!file.path.includes(':')&&!file.path.includes('\\')&&!file.path.startsWith('/'));const staged='C:/BrowserSmokeRuntime/'+file.path;need(!fs.lstatSync(staged).isSymbolicLink()&&fileHash(staged)===file.sha256.toLowerCase())}
 fs.mkdirSync('C:/BrowserWorkflowTemp');process.env.TEMP='C:/BrowserWorkflowTemp';process.env.TMP='C:/BrowserWorkflowTemp';
 const {chromium}=createRequire(import.meta.url)('C:/BrowserSmokeRuntime/playwright/package');
 const proofScript=path.resolve(root,'scripts/src/brain-qualification/browser/process-proof.ps1');
 const proof=closed=>{const result=spawnSync('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',['-NoProfile','-File',proofScript,...closed?['-Closed']:[]],{encoding:'utf8',shell:false,windowsHide:true,timeout:20000,maxBuffer:65536});need(result.status===0);return JSON.parse(result.stdout.replace(/^\uFEFF/,''))};
 await qualifyBrowser({chromium,chrome:'C:/BrowserSmokeRuntime/chrome/chrome.exe',dist:path.resolve(root,'artifacts/fi-forgot/dist/public'),manifest,owners:json(fixturePath).owners,output,nonce:request.nonce,sessionId:release.sessionId,runtimePins,durablePath:root+'/.orchestra/qualification/brain-qualification-durable-evidence.json',verifyExistingOwners:()=>verifyExistingOwners({databaseUrl:process.env.DATABASE_URL,owners:json(fixturePath).owners}),reassertSnapshot:()=>reassertSnapshot(process.env),verifyProcess:()=>proof(false),verifyTeardown:async()=>{const closed=proof(true);const frontendPortReleased=await new Promise(resolve=>{const server=createServer();server.once('error',()=>resolve(false));server.listen(25460,'127.0.0.1',()=>server.close(error=>resolve(!error)))});return {...closed,frontendPortReleased}}});
 const files=fs.readdirSync(output).map(name=>{need(!name.includes('/')&&!name.includes('\\')&&name!=='browser-artifact-manifest.json');const p=path.join(output,name),stat=fs.lstatSync(p);need(stat.isFile()&&!stat.isSymbolicLink());return {path:name,bytes:stat.size,sha256:fileHash(p)}}).sort((a,b)=>a.path.localeCompare(b.path));
 fs.writeFileSync(output+'/browser-artifact-manifest.json',JSON.stringify({nonce:request.nonce,sessionId:release.sessionId,files},null,2)+'\n',{flag:'wx'});
}catch{console.error('FAIL_CLOSED: real browser workflow failed; inspect bounded synthetic browser evidence');process.exitCode=1}
