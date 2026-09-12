import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {verifyBrowserEvidence} from './verify-browser-evidence.mjs';
import {verifySemanticEvidence} from './verify-semantic-evidence.mjs';
import {verifyQuestionState} from './question-state.mjs';

const ROOT = 'C:/Users/James.Massaro/Projects/fi-forgot';
const PGDATA = `${ROOT}/.orchestra/qualification/fi-forgot-brain-qualification-pgdata`;
const FIXTURE = '1591c1c7e2adeab1d5f253a3d0de00ee1a1c2cea07ad1acff316eb9c9e843e62';
const BASELINE = '193867eb1a69acb86757ffd2f2340ec02785610be717163170edc855eb9fc7b2';
const MARKER = 'fi-forgot-brain-qualification-owned-v1\n';
const fail = message => { throw new Error(`FAIL_CLOSED: ${message}`); };
const need = (value, message) => { if (!value) fail(message); };
const equalHash = (a, b) => typeof a === 'string' && /^[a-f0-9]{64}$/i.test(a) && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const canonical = value => String(value).replaceAll('\\', '/').toLowerCase();
function safe(base, relative) {
  need(typeof relative === 'string' && relative.length > 0 && !relative.includes('\\') && !relative.split('/').some(p => !p || p === '.' || p === '..' || p.includes(':')), 'unsafe evidence path');
  const target = path.resolve(base, relative);
  need(canonical(target).startsWith(`${canonical(path.resolve(base))}/`), 'path escaped evidence root');
  return target;
}
function noLinks(file) {
  let current = path.resolve(file);
  while (true) {
    need(!fs.lstatSync(current).isSymbolicLink(), 'linked evidence path');
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
}

/** Admission requires observed restart evidence, not merely a requested restart command. */
export function assertPostgresRestartReceipt(restart, bundle) {
  const { request, owned, release, execution, final, hashes } = bundle;
  need(restart?.kind === 'BRAIN-POSTGRES-RESTART', 'PostgreSQL restart receipt absent');
  need(restart.nonce === request.nonce && restart.sessionId === owned.id, 'stale PostgreSQL restart receipt');
  need(canonical(restart.pgdata) === canonical(PGDATA) && restart.host === '127.0.0.1' && restart.port === 55432 && restart.postgresMajor === 16, 'PostgreSQL restart target mismatch');
  need(typeof restart.serverVersion === 'string' && /^16\d{4}$/.test(restart.serverVersion), 'PostgreSQL restart server version mismatch');
  need(typeof restart.beforeSystemIdentifier === 'string' && /^[1-9]\d+$/.test(restart.beforeSystemIdentifier) && restart.afterSystemIdentifier === restart.beforeSystemIdentifier, 'PostgreSQL cluster changed across restart');
  const before = Date.parse(restart.beforePostmasterStart), after = Date.parse(restart.afterPostmasterStart), observed = Date.parse(restart.at);
  need(Number.isFinite(before) && Number.isFinite(after) && after > before && before >= Date.parse(release.at) && after <= observed && observed <= Date.parse(execution.completedAt), 'PostgreSQL restart chronology invalid or start unchanged');
  need(restart.stoppedStatusExit === 3 && restart.portReleased === true && restart.persistenceAssertionsPassed === true, 'PostgreSQL restart or persistence assertions unverified');
  need(equalHash(restart.durableEvidenceHash, hashes.durable) && equalHash(final.postgresRestartHash, hashes.restart), 'PostgreSQL restart evidence binding mismatch');
}

/** Pure receipt-chain checks; file content and current-source checks are separate below. */
export function assertReceiptChain(b) {
  const { request: r, owned: o, preflight: p, release: release, execution: e, final: f, stop: s, launch, acceptance, hashes: h } = b;
  need(r && o && p && release && e && f && s && launch && acceptance && h, 'missing receipt chain');
  need(/^[a-f0-9-]{36}$/i.test(r.nonce) && /^[a-f0-9-]{36}$/i.test(o.id), 'invalid attempt identity');
  for (const receipt of [o, p, release, e, f, s, launch, acceptance]) need(receipt.nonce === r.nonce, 'stale attempt receipt');
  for (const receipt of [release, e, f, acceptance]) need(receipt.sessionId === o.id, 'wrong guest session');
  need(s.id === o.id && s.stopped === true, 'exact session not stopped');
  for (const receipt of [o, p, release, launch, acceptance]) need(equalHash(receipt.requestHash, h.request), 'request binding mismatch');
  for (const receipt of [r, o, release, launch, acceptance]) need(equalHash(receipt.configHash, h.config), 'config binding mismatch');
  need(equalHash(r.guestScriptHash, h.guest) && equalHash(p.scriptHash, h.guest), 'guest script drift');
  for (const [receipt, stage] of [[launch, 'launch-preflight'], [acceptance, 'execute-after-preflight']]) {
    need(receipt.approved === true && receipt.stage === stage && typeof receipt.reviewer === 'string' && receipt.reviewer.trim(), 'independent acceptance absent');
    need(equalHash(receipt.guestScriptHash, h.guest) && equalHash(receipt.hostScriptHash, h.host), 'accepted wrapper drift');
  }
  need(equalHash(o.hostScriptHash, h.host), 'session wrapper drift');
  for (const receipt of [release, acceptance]) need(equalHash(receipt.preflightHash, h.preflight), 'preflight binding mismatch');
  need(release.action === 'EXECUTE-ACCEPTED-DISPOSABLE-QUALIFICATION', 'invalid release');
  need(p.kind === 'BRAIN-LIVE-PREFLIGHT' && p.success === true && p.databaseActions === 0 && Array.isArray(p.checks) && p.checks.length > 0 && p.checks.every(c => c.passed === true), 'preflight failed');
  const required = ['script-pinned', 'no-active-nic', 'outbound-denied-192.0.2.1', 'outbound-denied-2001:db8::1', 'input-read-only', 'host-config-unmapped', 'host-git-unmapped', 'exact-parent-canonical', 'pgdata-absent', 'host-canary-matches', 'loopback-free-55432', 'loopback-free-8080', 'loopback-free-25460', 'postgres-16.15-identity', 'node-identity'];
  for (const name of required) need(p.checks.some(c => c.name === name && c.passed === true), `missing preflight check ${name}`);
  need(p.postgresVersion === 'postgres (PostgreSQL) 16.15', 'wrong PostgreSQL version');
  need(e.kind === 'BRAIN-LIVE-EXECUTION' && e.success === true && e.exitCode === 0 && e.rawLogsExported === false, 'execution missing or failed');
  need(f.kind === 'BRAIN-LIVE-FINAL-STATE' && canonical(f.pgdata) === canonical(PGDATA) && f.postgresStopped === true && f.postgresStatusExit === 3 && f.marker === MARKER && f.postgresMajor === 16, 'final PostgreSQL state unverified');
  need(Array.isArray(f.portsReleased) && [55432, 8080, 25460].every(port => f.portsReleased.includes(port)), 'final ports unverified');
  need(equalHash(f.durableEvidenceHash, h.durable) && equalHash(f.sanitizedLogHash, h.log), 'final output binding mismatch');
  const times = [r.preparedAt, o.createdAt, p.at, release.at, e.completedAt, f.at, s.at].map(Date.parse);
  need(times.every(Number.isFinite) && times.every((t, i) => !i || t >= times[i - 1]), 'invalid receipt chronology');
  assertPostgresRestartReceipt(b.restart, b);
}

export function verifySandboxEvidence() {
  need(canonical(process.cwd()) === canonical(ROOT), 'wrong repository');
  need(!process.env.BRAIN_QUALIFICATION_OS_NETWORK_BOUNDARY, 'host must not carry guest OS admission');
  const base = path.join(ROOT, '.orchestra/sandbox-evaluation');
  const input = path.join(base, 'input'), output = path.join(base, 'output');
  const paths = {
    request: path.join(input, 'live-request.json'), config: path.join(base, 'live-qualification.wsb'),
    host: path.join(base, 'live-qualification-host.ps1'), guest: path.join(input, 'live-qualification-guest.ps1'),
    owned: path.join(base, 'live-owned-session.json'), preflight: path.join(output, 'live-preflight.json'),
    release: path.join(input, 'live-release.json'), execution: path.join(output, 'live-execution.json'),
    final: path.join(output, 'live-final-state.json'), stop: path.join(base, 'live-stop-receipt.json'),
    launch: path.join(base, 'live-launch-acceptance.json'), acceptance: path.join(base, 'live-execution-acceptance.json'),
    log: path.join(output, 'live-executor-sanitized.log'), durable: path.join(ROOT, '.orchestra/qualification/brain-qualification-durable-evidence.json'),
    restart: path.join(ROOT, '.orchestra/qualification/brain-qualification-postgres-restart.json'),
  };
  for (const file of Object.values(paths)) noLinks(file);
  need(!fs.existsSync(path.join(output, 'live-failure.json')), 'guest failure receipt exists');
  const bundle = Object.fromEntries(['request', 'owned', 'preflight', 'release', 'execution', 'final', 'stop', 'launch', 'acceptance', 'restart'].map(k => [k, json(paths[k])]));
  bundle.hashes = Object.fromEntries(['request', 'config', 'host', 'guest', 'preflight', 'durable', 'log', 'restart'].map(k => [k, hash(paths[k])]));
  assertReceiptChain(bundle);
  const pins = new Map();
  for (const pin of bundle.request.pins ?? []) {
    need(!pins.has(pin.path), 'duplicate input pin'); const file = safe(input, pin.path); noLinks(file);
    need(equalHash(hash(file), pin.sha256), 'input pin drift'); pins.set(pin.path, pin.sha256);
  }
  for (const name of ['application.zip', 'application-manifest.json', 'postgresql-runtime.zip', 'postgresql-manifest.json', 'vc-runtime/manifest.json', 'browser-runtime.zip', 'browser-manifest.json', 'frontend-build-manifest.json']) need(pins.has(name), 'required input pin absent');
  const manifest = json(path.join(input, 'application-manifest.json'));
  const stage = path.join(input, 'application');
  need(Array.isArray(manifest.files) && manifest.files.length > 0 && manifest.packages, 'invalid application manifest');
  need(Array.isArray(manifest.sourceProvenance) && manifest.sourceProvenance.length > 0, 'product source provenance absent');
  // Git is used only to enumerate current product files; no database or application is launched.
  const currentPaths = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8', timeout: 30000, windowsHide: true }).split('\0').filter(p => p && !p.startsWith('lib/orchestra-execution/') && !/(^|\/)\.env/.test(p) && (['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.json', 'tsconfig.base.json'].includes(p) || /^(artifacts|lib|scripts)\//.test(p))))].sort();
  need(JSON.stringify(manifest.sourceProvenance.map(p => p.path).sort()) === JSON.stringify(currentPaths), 'product source inventory changed');
  for (const entry of manifest.sourceProvenance) {
    const file = safe(ROOT, entry.path); noLinks(file); need(equalHash(hash(file), entry.sha256), 'product source provenance drift');
  }
  const seen = new Set(), packagesChecked = new Set();
  const lock = fs.readFileSync(path.join(ROOT, 'pnpm-lock.yaml'), 'utf8').replaceAll('\r\n', '\n');
  for (const file of manifest.files) {
    need(!seen.has(file.path) && !/(^|\/)(\.git|\.orchestra|\.env[^/]*)(\/|$)/i.test(file.path), 'duplicate or sensitive staged path'); seen.add(file.path);
    const staged = safe(stage, file.path); noLinks(staged); need(equalHash(hash(staged), file.sha256), 'staged file drift');
    let source;
    if (file.path === 'tools/node.exe') source = process.execPath;
    else if (file.path.startsWith('node_modules/') || file.path.startsWith('scripts/node_modules/tsx/')) {
      const suffix = file.path.startsWith('node_modules/') ? file.path.slice(13) : file.path.slice('scripts/node_modules/'.length);
      const name = suffix.startsWith('@') ? suffix.split('/').slice(0, 2).join('/') : suffix.split('/')[0];
      const pkg = manifest.packages[name]; need(pkg && canonical(pkg.source).startsWith(`${canonical(ROOT)}/node_modules/.pnpm/`), 'package provenance outside locked store');
      source = safe(pkg.source, suffix.slice(name.length + 1)); noLinks(source);
      if (!packagesChecked.has(name)) {
        const installed = json(path.join(pkg.source, 'package.json')); need(installed.name === name && installed.version === pkg.version, 'package provenance drift');
        const key = `${name}@${pkg.version}`;
        need(lock.includes(`\n  ${key}:`) || lock.includes(`\n  '${key}':`), 'package missing from lockfile');
        packagesChecked.add(name);
      }
    } else {
      need(['scripts/src/brain-qualification/', 'lib/db/src/', 'artifacts/api-server/dist/', 'artifacts/fi-forgot/dist/'].some(prefix => file.path.startsWith(prefix)) || ['package.json', 'pnpm-lock.yaml', 'scripts/package.json', 'lib/db/package.json', 'docs/brain-qualification-preparation/migration-manifest.json', 'docs/brain-qualification-preparation/synthetic-fixtures.json', 'docs/brain-qualification-preparation/bootstrap/0000-current.sql'].includes(file.path), 'unapproved staged source path');
      source = safe(ROOT, file.path); noLinks(source);
    }
    need(equalHash(hash(source), file.sha256), 'current source differs from executed stage');
  }
  for (const required of ['scripts/src/brain-qualification/verify-sandbox-evidence.mjs', 'scripts/src/brain-qualification/execution.ts', 'scripts/src/brain-qualification/future-workflow.ts', 'artifacts/api-server/dist/index.mjs', 'pnpm-lock.yaml']) need(seen.has(required), 'required source not staged');
  // Detect additions as well as modifications/deletions in copied source roots.
  function inventory(directory, prefix) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      need(!entry.isSymbolicLink(), 'linked source inventory');
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.orchestra' || entry.name.startsWith('.env')) continue;
      const relative = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) inventory(path.join(directory, entry.name), relative);
      else if (entry.isFile()) need(seen.has(relative), 'new current source absent from executed stage');
    }
  }
  for (const prefix of ['scripts/src/brain-qualification', 'lib/db/src', 'artifacts/api-server/dist', 'artifacts/fi-forgot/dist']) inventory(path.join(ROOT, prefix), prefix);
  need(equalHash(hash(path.join(ROOT, 'docs/brain-qualification-preparation/bootstrap/0000-current.sql')), BASELINE), 'baseline drift');
  need(equalHash(hash(path.join(ROOT, 'docs/brain-qualification-preparation/synthetic-fixtures.json')), FIXTURE), 'fixture drift');
  const durable = json(paths.durable), fixture = json(path.join(ROOT, 'docs/brain-qualification-preparation/synthetic-fixtures.json'));
  need(durable.fixtureHash === FIXTURE && durable.syntheticRunDate === bundle.request.syntheticDate && Array.isArray(durable.snapshots), 'invalid durable snapshot');
  need(durable.snapshots.length === fixture.owners.length && fixture.owners.every(owner => durable.snapshots.some(s => s.owner === owner.id && JSON.stringify([...s.ids].sort()) === JSON.stringify([...owner.recipientIds].sort()) && Array.isArray(s.timelines) && s.timelines.length === owner.recipientIds.length)), 'durable ownership inventory mismatch');
  const log = fs.readFileSync(paths.log, 'utf8');
  const semantics = verifySemanticEvidence(durable, fixture);
  const questions = verifyQuestionState(durable.questionState, fixture);
  need(log.includes('Lifecycle mutations and pre-restart evidence captured') && log.includes('Persisted lifecycle/history and ownership reads match pre-restart evidence'), 'lifecycle/restart completion absent');
  need(!/postgres(?:ql)?:\/\/[^\s"']+/i.test(log), 'unsanitized connection URI');
  noLinks(PGDATA);
  need(fs.readFileSync(path.join(PGDATA, '.fi-forgot-brain-qualification-owned'), 'utf8') === MARKER && fs.readFileSync(path.join(PGDATA, 'PG_VERSION'), 'utf8').trim() === '16' && !fs.existsSync(path.join(PGDATA, 'postmaster.pid')), 'host mapped target state mismatch');
  const browserDirectory=path.join(output,'browser');noLinks(browserDirectory);
  for(const entry of fs.readdirSync(browserDirectory,{withFileTypes:true})){need(entry.isFile()&&!entry.isSymbolicLink(),'browser artifact must be a regular file');noLinks(path.join(browserDirectory,entry.name));}
  const browser=verifyBrowserEvidence({directory:browserDirectory,bundle,fixture,pins});
  return { passed: true, nonce: bundle.request.nonce, sessionId: bundle.owned.id, evidence: 'actual PostgreSQL, API, Concierge, browser and API/PostgreSQL restart persistence', ...browser, ...semantics, ...questions, postgresRestartQualified: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { need(process.argv.length === 2, 'unexpected validator arguments'); console.log(JSON.stringify(verifySandboxEvidence())); }
  catch { console.error('FAIL_CLOSED: actual Sandbox qualification evidence is absent, stale, failed, or inconsistent'); process.exitCode = 1; }
}
