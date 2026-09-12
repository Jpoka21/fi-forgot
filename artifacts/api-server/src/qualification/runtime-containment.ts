import { createRequire, syncBuiltinESMExports } from 'node:module';
const localRequire = createRequire(import.meta.url);
let installed = false;

/** Install before the trusted application graph. This is not an OS firewall for other processes. */
export function installRuntimeContainment(env: NodeJS.ProcessEnv = process.env) {
  if (env.BRAIN_QUALIFICATION_MODE !== 'true' || installed) return;
  // Pino's development formatter starts a worker. Qualification uses its synchronous production sink.
  env.NODE_ENV = 'production';
  function deny(): never { throw new Error('QUALIFICATION_CONTAINMENT: outbound capability denied'); }
  const net = localRequire('node:net');
  const connect = net.Socket.prototype.connect;
  const listen = net.Server.prototype.listen;
  net.Server.prototype.listen = function (...raw: unknown[]) {
    const first=raw[0];
    const options=typeof first==='object'&&first!==null?first as Record<string,unknown>:{port:first,host:raw[1]};
    if(options.host!=='127.0.0.1'||Number(options.port)!==8080||options.path!==undefined||options.fd!==undefined||options.lookup!==undefined||options.handle!==undefined||options._handle!==undefined)deny();
    return listen.apply(this,raw);
  };
  net.Socket.prototype.connect = function (...raw: unknown[]) {
    assertPostgresSocket(raw);
    return connect.apply(this, raw);
  };
  for (const name of ['node:http', 'node:https']) {
    const module = localRequire(name);
    module.request = deny; module.get = deny; module.ClientRequest = deny;
  }
  localRequire('node:http2').connect = deny;
  localRequire('node:tls').connect = deny;
  const udp = localRequire('node:dgram');
  udp.createSocket = deny;
  udp.Socket.prototype.send = deny; udp.Socket.prototype.connect = deny;
  const dns = localRequire('node:dns');
  for (const key of Object.keys(dns)) if (/^(lookup|resolve|reverse)/.test(key)) dns[key] = deny;
  // Node 24 Server.listen calls dns.lookup even for a numeric address. Resolve
  // only this literal in-process; never delegate to DNS or a host resolver.
  dns.lookup = (host:unknown, options:unknown, callback?:unknown) => {
    const config=typeof options==='function'?{}:typeof options==='number'?{family:options}:options??{};
    const cb=typeof options==='function'?options:callback;
    if(host!=='127.0.0.1'||typeof cb!=='function'||typeof config!=='object'||config===null)deny();
    const value=config as {family?:unknown;all?:unknown};
    if(value.family!==undefined&&value.family!==0&&value.family!==4)deny();
    process.nextTick(()=>value.all?cb(null,[{address:'127.0.0.1',family:4}]):cb(null,'127.0.0.1',4));
  };
  for (const key of Object.keys(dns.promises)) if (/^(lookup|resolve|reverse)/.test(key)) dns.promises[key] = async () => deny();
  for (const prototype of [dns.Resolver.prototype, dns.promises.Resolver.prototype]) {
    for (const key of Object.getOwnPropertyNames(prototype)) if (/^(resolve|reverse)/.test(key)) prototype[key] = deny;
  }
  const child = localRequire('node:child_process');
  for (const name of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork']) child[name] = deny;
  localRequire('node:worker_threads').Worker = class { constructor() { deny(); } };
  process.dlopen = deny;
  globalThis.fetch = async () => deny();
  if ('WebSocket' in globalThis) globalThis.WebSocket = class { constructor() { deny(); } } as unknown as typeof WebSocket;
  syncBuiltinESMExports();
  installed = true;
}

/** Pure policy used by the installed Socket method. No DNS or default host is allowed. */
export function assertPostgresSocket(raw: unknown[]) {
  const args = Array.isArray(raw[0]) ? raw[0] : raw;
  const first = args[0];
  const options: Record<string, unknown> = typeof first === 'object' && first !== null ? first as Record<string, unknown> : { port: first, host: args[1] };
  const port = typeof options.port === 'string' && /^\d+$/.test(options.port) ? Number(options.port) : options.port;
  if (options.host !== '127.0.0.1' || port !== 55432 || options.path !== undefined || options.fd !== undefined || options.lookup !== undefined) {
    throw new Error('QUALIFICATION_CONTAINMENT: socket target denied');
  }
}
