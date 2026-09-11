import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { get as esmHttpGet } from 'node:http';
const require = createRequire(import.meta.url);
const runtime = await import(new URL('../../../artifacts/api-server/src/qualification/runtime-containment.ts', import.meta.url).href);
const seed = await import(new URL('./seed-guard.ts', import.meta.url).href);
let providerImports=0;
for(const env of [{BRAIN_QUALIFICATION_MODE:'true'},{BRAIN_QUALIFICATION_EXECUTION_ADMITTED:'true'}]) await assert.rejects(seed.runSeed(env,async()=>{providerImports++;}),/CONTAINMENT/);
assert.equal(providerImports,0);
await seed.runSeed({},async()=>{providerImports++;});assert.equal(providerImports,1);
const {QUALIFICATION_BROWSER_HEADERS}=await import(new URL('../../../artifacts/fi-forgot/src/qualification/browser-policy.ts',import.meta.url).href);
const csp=QUALIFICATION_BROWSER_HEADERS['Content-Security-Policy'];
assert.ok(csp.includes("worker-src 'none'"));assert.ok(csp.includes("frame-src 'none'"));
assert.ok(csp.includes("connect-src 'self' http://127.0.0.1:8080 ws://127.0.0.1:25460"));
assert.ok(!csp.includes('*'));
const net = require('node:net'), http = require('node:http'), https = require('node:https');
const tls = require('node:tls'), udp = require('node:dgram'), dns = require('node:dns');
const child = require('node:child_process'), workers = require('node:worker_threads');
const original = { connect: net.Socket.prototype.connect, request: http.request, spawn: child.spawn, fetch: globalThis.fetch };
runtime.installRuntimeContainment({});
assert.equal(net.Socket.prototype.connect, original.connect);
assert.equal(http.request, original.request);
assert.equal(child.spawn, original.spawn);
assert.equal(globalThis.fetch, original.fetch);
runtime.assertPostgresSocket([55432, '127.0.0.1']);
runtime.assertPostgresSocket([{ port: '55432', host: '127.0.0.1' }]);
for (const args of [[55432], [55432,'localhost'], [443,'127.0.0.1'], [{host:'127.0.0.1',port:55432,path:'socket'}], [{host:'127.0.0.1',port:55432,lookup(){}}]]) assert.throws(()=>runtime.assertPostgresSocket(args), /CONTAINMENT/);
runtime.installRuntimeContainment({ BRAIN_QUALIFICATION_MODE: 'true' });
const attempts: Array<[string,()=>unknown]> = [
  ['HTTP request',()=>http.request('http://example.invalid')], ['HTTP get',()=>http.get('http://example.invalid')],
  ['ESM HTTP get',()=>esmHttpGet('http://example.invalid')],
  ['HTTPS get',()=>https.get('https://example.invalid')], ['ClientRequest',()=>new http.ClientRequest('http://example.invalid')],
  ['TLS',()=>tls.connect(443,'example.invalid')], ['HTTP2',()=>require('node:http2').connect('https://example.invalid')],
  ['net.connect',()=>net.connect(443,'example.invalid')], ['createConnection',()=>net.createConnection({host:'example.invalid',port:443})],
  ['Socket.connect',()=>net.Socket.prototype.connect.call({},55432,'example.invalid')],
  ['UDP create',()=>udp.createSocket('udp4')], ['UDP send',()=>udp.Socket.prototype.send.call({},Buffer.from('x'),53,'example.invalid')],
  ['DNS lookup',()=>dns.lookup('example.invalid',()=>{})], ['DNS resolve',()=>dns.resolve('example.invalid',()=>{})],
  ['DNS resolver',()=>new dns.Resolver().resolve4('example.invalid',()=>{})],
  ['spawn',()=>child.spawn('never-executed')], ['spawnSync',()=>child.spawnSync('never-executed')],
  ['exec',()=>child.exec('never-executed')], ['execSync',()=>child.execSync('never-executed')],
  ['execFile',()=>child.execFile('never-executed')], ['execFileSync',()=>child.execFileSync('never-executed')],
  ['fork',()=>child.fork('never-executed')], ['Worker',()=>new workers.Worker('never-executed')],
  ['native addon',()=>process.dlopen({} as NodeModule,'never-loaded')],
];
if (globalThis.WebSocket) attempts.push(['WebSocket',()=>new WebSocket('wss://example.invalid')]);
for (const [name, attempt] of attempts) assert.throws(attempt,/QUALIFICATION_CONTAINMENT/,name);
await assert.rejects(globalThis.fetch('https://example.invalid'),/QUALIFICATION_CONTAINMENT/);
await assert.rejects(dns.promises.resolve4('example.invalid'),/QUALIFICATION_CONTAINMENT/);
// A second installation cannot replace the policy or recursively wrap Socket.connect.
const once=net.Socket.prototype.connect; runtime.installRuntimeContainment({BRAIN_QUALIFICATION_MODE:'true'}); assert.equal(net.Socket.prototype.connect,once);
console.log(`Installed runtime containment PASS: ${attempts.length+2} denied entry points; production no-op; no external connection`);
