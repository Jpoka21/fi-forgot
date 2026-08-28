import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { submitOwnerRequest } from "./owner-submit.js";

export const GITHUB_CONTROL_REPOSITORY = "Jpoka21/fi-forgot-control" as const;
export const GITHUB_CONTROL_DEFAULT_PROVIDER = "codex" as const;
export const GITHUB_CONTROL_PROTECTED_PATHS = ["playbook/writing-quality/PILOT_FINDINGS_9A2.md", "playbook/writing-quality/README.md", "playbook/writing-quality/pilot-9A.2/BLOCKER.md"] as const;

export interface GitHubControlRequest { schemaVersion: 1; recordKind: "orchestra_control_request"; requestId: string; projectId: "F.I. Forgot"; repositoryPath: string; branch: "frontend-rebuild"; startingHead: string; ownerText: string; allowedPaths: ["lib/orchestra-execution"]; protectedPaths: string[]; requireNoPush: true; commitAuthorization: false; pushAuthorization: false; providerId?: "codex"; createdAt: string; requestHash: string }
export type GitHubControlStatus = "accepted_awaiting_human_dispatch" | "duplicate" | "refused" | "ambiguous";
export interface GitHubControlResult { schemaVersion: 1; recordKind: "orchestra_control_result"; requestId: string; requestHash: string; status: GitHubControlStatus; assignmentId: string | null; assignmentHash: string | null; providerId: "codex"; executed: false; committed: false; pushed: false; humanAuthorityRequired: true; reasonCode: string; recordedAt: string }
export interface GitHubControlEnvelope { path: string; request: unknown }
export interface GitHubControlTransport { listRequests(): Promise<GitHubControlEnvelope[]>; publishResult(result: GitHubControlResult): Promise<void> }
interface JournalRow { requestId: string; requestHash: string; phase: "claimed" | "completed"; result?: GitHubControlResult }

function canonical(value: unknown): unknown { if (Array.isArray(value)) return value.map(canonical); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([k]) => k !== "requestHash").sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k, canonical(v)])); return value }
export function hashGitHubControlRequest(request: object): string { return createHash("sha256").update(JSON.stringify(canonical(request))).digest("hex") }
function git(repo: string, args: string[]): string { return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore","pipe","pipe"], env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } }).trim() }

export function validateGitHubControlRequest(value: unknown, repository: string): GitHubControlRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_structure"); const r = value as Partial<GitHubControlRequest>;
  if (r.schemaVersion !== 1 || r.recordKind !== "orchestra_control_request") throw new Error("invalid_schema");
  if (!/^[\w.-]{8,128}$/.test(r.requestId ?? "")) throw new Error("invalid_request_id");
  if (r.projectId !== "F.I. Forgot" || r.branch !== "frontend-rebuild") throw new Error("project_authority_mismatch");
  if (resolve(r.repositoryPath ?? "").toLowerCase() !== resolve(repository).toLowerCase()) throw new Error("repository_authority_mismatch");
  if (!/^[0-9a-f]{40,64}$/.test(r.startingHead ?? "") || !r.ownerText?.trim() || !Number.isFinite(Date.parse(r.createdAt ?? ""))) throw new Error("invalid_request_fields");
  if (JSON.stringify(r.allowedPaths) !== JSON.stringify(["lib/orchestra-execution"])) throw new Error("scope_authority_mismatch");
  if (JSON.stringify([...(r.protectedPaths ?? [])].sort()) !== JSON.stringify([...GITHUB_CONTROL_PROTECTED_PATHS].sort())) throw new Error("protected_paths_mismatch");
  if (r.requireNoPush !== true || r.commitAuthorization !== false || r.pushAuthorization !== false) throw new Error("git_authority_escalation");
  if (r.providerId !== undefined && r.providerId !== "codex") throw new Error("provider_refused_no_fallback");
  if (r.requestHash !== hashGitHubControlRequest(r)) throw new Error("request_hash_mismatch");
  if (git(repository, ["branch","--show-current"]) !== r.branch || git(repository, ["rev-parse","HEAD"]) !== r.startingHead) throw new Error("repository_baseline_mismatch");
  return r as GitHubControlRequest;
}

export class FileControlJournal {
  constructor(readonly path: string) {}
  rows(): JournalRow[] { return existsSync(this.path) ? readFileSync(this.path,"utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)) : [] }
  append(row: JournalRow): void { mkdirSync(dirname(this.path), { recursive: true }); const rows = [...this.rows(), row]; const temp = `${this.path}.${process.pid}.tmp`; writeFileSync(temp, rows.map(x => JSON.stringify(x)).join("\n")+"\n", { flag: "wx" }); renameSync(temp, this.path) }
}

export class GitHubControlWatcher {
  constructor(private readonly o: { repository: string; storeRoot: string; transport: GitHubControlTransport; journal: FileControlJournal; now?: () => string }) {}
  private result(id: string, hash: string, status: GitHubControlStatus, reasonCode: string): GitHubControlResult { return { schemaVersion: 1, recordKind: "orchestra_control_result", requestId: id, requestHash: hash, status, assignmentId: null, assignmentHash: null, providerId: "codex", executed: false, committed: false, pushed: false, humanAuthorityRequired: true, reasonCode, recordedAt: this.o.now?.() ?? new Date().toISOString() } }
  async pollOnce(): Promise<GitHubControlResult[]> { const out: GitHubControlResult[] = [];
    for (const e of await this.o.transport.listRequests()) { const raw = e.request as Partial<GitHubControlRequest>; const id = typeof raw?.requestId === "string" ? raw.requestId : `invalid-${createHash("sha256").update(e.path).digest("hex").slice(0,16)}`; const hash = typeof raw?.requestHash === "string" ? raw.requestHash : hashGitHubControlRequest(raw ?? {}); const prior = this.o.journal.rows().filter(x => x.requestId === id);
      let result: GitHubControlResult; if (prior.some(x => x.requestHash !== hash)) result = this.result(id,hash,"refused","request_id_collision"); else { const done = prior.find(x => x.phase === "completed")?.result; if (done) { await this.o.transport.publishResult(done); out.push(done); continue } if (prior.some(x => x.phase === "claimed")) result = this.result(id,hash,"ambiguous","crash_after_claim_manual_reconciliation_required"); else { this.o.journal.append({ requestId:id,requestHash:hash,phase:"claimed" }); try { const r=validateGitHubControlRequest(e.request,this.o.repository); const s=submitOwnerRequest({repository:this.o.repository,storeRoot:this.o.storeRoot,ownerText:r.ownerText,protectedPaths:GITHUB_CONTROL_PROTECTED_PATHS}); result={...this.result(id,hash,s.duplicate?"duplicate":"accepted_awaiting_human_dispatch",s.duplicate?"already_submitted":"explicit_human_dispatch_required"),assignmentId:s.assignmentId,assignmentHash:s.assignmentHash}; } catch(error) { result=this.result(id,hash,"refused",error instanceof Error?error.message:"unknown_refusal") } } }
      this.o.journal.append({requestId:id,requestHash:hash,phase:"completed",result}); await this.o.transport.publishResult(result); out.push(result);
    } return out;
  }
}

/** Pinned private GitHub Contents transport. Issue prose is deliberately unsupported. */
export class GitHubContentsControlTransport implements GitHubControlTransport {
  constructor(private token: string, private repository = GITHUB_CONTROL_REPOSITORY, private ref = "main") { if (repository !== GITHUB_CONTROL_REPOSITORY) throw new Error("control_repository_not_allowed") }
  private async call(path:string, init?:RequestInit) { const response=await fetch(`https://api.github.com/repos/${this.repository}/contents/${path}`,{...init,headers:{Accept:"application/vnd.github+json",Authorization:`Bearer ${this.token}`,"X-GitHub-Api-Version":"2022-11-28",...init?.headers}}); if(!response.ok) throw new Error(`github_transport_${response.status}`); return response }
  async listRequests() { const list=await (await this.call(`requests?ref=${encodeURIComponent(this.ref)}`)).json() as Array<{name:string;path:string;download_url:string|null}>; return Promise.all(list.filter(x=>x.name.endsWith(".json")&&x.download_url).map(async x=>({path:x.path,request:await (await fetch(x.download_url!,{headers:{Authorization:`Bearer ${this.token}`}})).json()}))) }
  async publishResult(result:GitHubControlResult) { const path=`results/${encodeURIComponent(result.requestId)}.json`; let sha:string|undefined; try{sha=((await (await this.call(`${path}?ref=${encodeURIComponent(this.ref)}`)).json()) as {sha:string}).sha}catch(e){if(!(e instanceof Error)||e.message!=="github_transport_404")throw e} await this.call(path,{method:"PUT",body:JSON.stringify({message:`orchestra result ${result.requestId}`,branch:this.ref,sha,content:Buffer.from(JSON.stringify(result,null,2)+"\n").toString("base64")})}) }
}
