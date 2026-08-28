import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { submitOwnerRequest } from "./owner-submit.js";
import type { FrozenAssignment } from "./assignment.js";
import type { ExecutionProvider } from "./provider-contract.js";
import { FileEngineeringStore } from "./engineering-store/store.js";
import { dispatchInitialGovernedExecutorAssignment } from "./governed-executor-capability.js";
import { resolveActiveExecutionProvider } from "./engineering-store/route-verifier.js";

export const GITHUB_CONTROL_REPOSITORY = "Jpoka21/fi-forgot-control" as const;
export const GITHUB_CONTROL_DEFAULT_PROVIDER = "codex" as const;
export const GITHUB_CONTROL_PROTECTED_PATHS = ["playbook/writing-quality/PILOT_FINDINGS_9A2.md", "playbook/writing-quality/README.md", "playbook/writing-quality/pilot-9A.2/BLOCKER.md"] as const;

export interface GitHubControlRequest { schemaVersion: 1; recordKind: "orchestra_control_request"; requestId: string; projectId: "F.I. Forgot"; repositoryPath: string; branch: "frontend-rebuild"; startingHead: string; ownerText: string; allowedPaths: ["lib/orchestra-execution"]; protectedPaths: string[]; requireNoPush: true; commitAuthorization: false; pushAuthorization: false; providerId?: "codex"; createdAt: string; requestHash: string }
export interface GitHubControlApproval { schemaVersion: 1; recordKind: "orchestra_control_approval"; requestId: string; requestHash: string; assignmentId: string; assignmentHash: string; projectId: "F.I. Forgot"; repositoryPath: string; branch: "frontend-rebuild"; startingHead: string; allowedPaths: ["lib/orchestra-execution"]; protectedPaths: string[]; requireNoPush: true; commitAuthorization: false; pushAuthorization: false; providerId: "codex"; explicitOwnerApproval: true; ownerConfirmation: string; approvedAt: string; expiresAt: string; approvalHash: string }
export type GitHubControlStatus = "accepted_awaiting_human_dispatch" | "executed" | "duplicate" | "refused" | "ambiguous";
export interface GitHubControlResult { schemaVersion: 1; recordKind: "orchestra_control_result"; requestId: string; requestHash: string; approvalHash?: string; status: GitHubControlStatus; assignmentId: string | null; assignmentHash: string | null; providerId: "codex"; executed: boolean; executionEvidenceId?: string; executionVerdict?: string; committed: false; pushed: false; humanAuthorityRequired: boolean; reasonCode: string; recordedAt: string }
export interface GitHubControlEnvelope { path: string; request: unknown }
export interface GitHubControlApprovalEnvelope { path: string; approval: unknown }
export interface GitHubControlTransport { listRequests(): Promise<GitHubControlEnvelope[]>; listApprovals?(): Promise<GitHubControlApprovalEnvelope[]>; publishResult(result: GitHubControlResult): Promise<void> }
interface JournalRow { requestId: string; requestHash: string; approvalHash?: string; phase: "claimed" | "completed"; result?: GitHubControlResult }

function canonical(value: unknown, omitted: string): unknown { if (Array.isArray(value)) return value.map(x => canonical(x, omitted)); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([k]) => k !== omitted).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k, canonical(v, omitted)])); return value }
export function hashGitHubControlRequest(request: object): string { return createHash("sha256").update(JSON.stringify(canonical(request, "requestHash"))).digest("hex") }
export function hashGitHubControlApproval(approval: object): string { return createHash("sha256").update(JSON.stringify(canonical(approval, "approvalHash"))).digest("hex") }
function git(repo: string, args: string[]): string { return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore","pipe","pipe"], env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } }).trim() }

function exactKeys(value: object, allowed: readonly string[], code: string): void { const unexpected = Object.keys(value).filter(key => !allowed.includes(key)); if (unexpected.length) throw new Error(`${code}:${unexpected.sort().join(",")}`) }

export function validateGitHubControlRequest(value: unknown, repository: string): GitHubControlRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_structure"); const r = value as Partial<GitHubControlRequest>;
  exactKeys(r, ["schemaVersion","recordKind","requestId","projectId","repositoryPath","branch","startingHead","ownerText","allowedPaths","protectedPaths","requireNoPush","commitAuthorization","pushAuthorization","providerId","createdAt","requestHash"], "unexpected_request_fields");
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

function sameStrings(left: readonly string[], right: readonly string[]): boolean { return JSON.stringify([...left]) === JSON.stringify([...right]) }

export function validateGitHubControlApproval(input: { value: unknown; request: GitHubControlRequest; frozen: FrozenAssignment; repository: string; now: string }): GitHubControlApproval {
  if (!input.value || typeof input.value !== "object" || Array.isArray(input.value)) throw new Error("invalid_approval_structure");
  const a = input.value as Partial<GitHubControlApproval>; const f = input.frozen.assignment;
  exactKeys(a, ["schemaVersion","recordKind","requestId","requestHash","assignmentId","assignmentHash","projectId","repositoryPath","branch","startingHead","allowedPaths","protectedPaths","requireNoPush","commitAuthorization","pushAuthorization","providerId","explicitOwnerApproval","ownerConfirmation","approvedAt","expiresAt","approvalHash"], "unexpected_approval_fields");
  if (a.schemaVersion !== 1 || a.recordKind !== "orchestra_control_approval") throw new Error("invalid_approval_schema");
  if (a.approvalHash !== hashGitHubControlApproval(a as object)) throw new Error("approval_hash_mismatch");
  if (a.explicitOwnerApproval !== true || a.ownerConfirmation !== a.assignmentId) throw new Error("explicit_owner_approval_required");
  if (a.requestId !== input.request.requestId || a.requestHash !== input.request.requestHash) throw new Error("approval_request_mismatch");
  if (a.assignmentId !== f.assignmentId || a.assignmentHash !== input.frozen.assignmentHash) throw new Error("approval_assignment_mismatch");
  if (a.projectId !== f.projectId || a.projectId !== "F.I. Forgot") throw new Error("approval_project_mismatch");
  if (resolve(a.repositoryPath ?? "").toLowerCase() !== resolve(input.repository).toLowerCase() || resolve(f.repositoryPath).toLowerCase() !== resolve(input.repository).toLowerCase()) throw new Error("approval_repository_mismatch");
  if (a.branch !== f.branch || a.startingHead?.toLowerCase() !== f.startingHead.toLowerCase()) throw new Error("approval_baseline_mismatch");
  if (!sameStrings(a.allowedPaths ?? [], f.allowedPaths) || !sameStrings(a.allowedPaths ?? [], ["lib/orchestra-execution"])) throw new Error("approval_scope_mismatch");
  if (!sameStrings([...(a.protectedPaths ?? [])].sort(), [...f.protectedPaths].sort()) || !sameStrings([...(a.protectedPaths ?? [])].sort(), [...GITHUB_CONTROL_PROTECTED_PATHS].sort())) throw new Error("approval_protected_paths_mismatch");
  if (a.requireNoPush !== true || a.commitAuthorization !== false || a.pushAuthorization !== false || f.requireNoPush !== true || f.commitAuthorization !== false || f.pushAuthorization !== false) throw new Error("approval_git_authority_escalation");
  if (a.providerId !== "codex") throw new Error("approval_provider_refused_no_fallback");
  const approved = Date.parse(a.approvedAt ?? ""); const expires = Date.parse(a.expiresAt ?? ""); const now = Date.parse(input.now);
  if (!Number.isFinite(approved) || !Number.isFinite(expires) || !Number.isFinite(now) || approved < Date.parse(input.request.createdAt) || approved < Date.parse(f.createdAt) || approved > now || expires <= approved || now > expires) throw new Error("approval_stale");
  if (git(input.repository, ["branch","--show-current"]) !== a.branch || git(input.repository, ["rev-parse","HEAD"]).toLowerCase() !== a.startingHead!.toLowerCase()) throw new Error("approval_repository_baseline_mismatch");
  return a as GitHubControlApproval;
}

export class FileControlJournal {
  constructor(readonly path: string) {}
  rows(): JournalRow[] { return existsSync(this.path) ? readFileSync(this.path,"utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)) : [] }
  append(row: JournalRow): void { mkdirSync(dirname(this.path), { recursive: true }); const rows = [...this.rows(), row]; const temp = `${this.path}.${process.pid}.tmp`; writeFileSync(temp, rows.map(x => JSON.stringify(x)).join("\n")+"\n", { flag: "wx" }); renameSync(temp, this.path) }
}

export class GitHubControlWatcher {
  constructor(private readonly o: { repository: string; storeRoot: string; transport: GitHubControlTransport; journal: FileControlJournal; now?: () => string; provider?: ExecutionProvider }) {}
  private result(id: string, hash: string, status: GitHubControlStatus, reasonCode: string): GitHubControlResult { return { schemaVersion: 1, recordKind: "orchestra_control_result", requestId: id, requestHash: hash, status, assignmentId: null, assignmentHash: null, providerId: "codex", executed: false, committed: false, pushed: false, humanAuthorityRequired: true, reasonCode, recordedAt: this.o.now?.() ?? new Date().toISOString() } }
  async pollOnce(): Promise<GitHubControlResult[]> { const out: GitHubControlResult[] = [];
    for (const e of await this.o.transport.listRequests()) { const raw = e.request as Partial<GitHubControlRequest>; const id = typeof raw?.requestId === "string" ? raw.requestId : `invalid-${createHash("sha256").update(e.path).digest("hex").slice(0,16)}`; const hash = typeof raw?.requestHash === "string" ? raw.requestHash : hashGitHubControlRequest(raw ?? {}); const prior = this.o.journal.rows().filter(x => x.requestId === id && x.approvalHash === undefined);
      let result: GitHubControlResult; if (prior.some(x => x.requestHash !== hash)) result = this.result(id,hash,"refused","request_id_collision"); else { const done = prior.find(x => x.phase === "completed")?.result; if (done) { await this.o.transport.publishResult(done); out.push(done); continue } if (prior.some(x => x.phase === "claimed")) result = this.result(id,hash,"ambiguous","crash_after_claim_manual_reconciliation_required"); else { this.o.journal.append({ requestId:id,requestHash:hash,phase:"claimed" }); try { const r=validateGitHubControlRequest(e.request,this.o.repository); const s=submitOwnerRequest({repository:this.o.repository,storeRoot:this.o.storeRoot,ownerText:r.ownerText,protectedPaths:GITHUB_CONTROL_PROTECTED_PATHS}); result={...this.result(id,hash,s.duplicate?"duplicate":"accepted_awaiting_human_dispatch",s.duplicate?"already_submitted":"explicit_human_dispatch_required"),assignmentId:s.assignmentId,assignmentHash:s.assignmentHash}; } catch(error) { result=this.result(id,hash,"refused",error instanceof Error?error.message:"unknown_refusal") } } }
      this.o.journal.append({requestId:id,requestHash:hash,phase:"completed",result}); await this.o.transport.publishResult(result); out.push(result);
    }
    for (const e of await this.o.transport.listApprovals?.() ?? []) {
      const raw = e.approval as Partial<GitHubControlApproval>; const id = typeof raw?.requestId === "string" ? raw.requestId : `invalid-${createHash("sha256").update(e.path).digest("hex").slice(0,16)}`; const approvalHash = typeof raw?.approvalHash === "string" ? raw.approvalHash : hashGitHubControlApproval(raw ?? {}); const requestRows = this.o.journal.rows().filter(x => x.requestId === id && !x.approvalHash); const submitted = requestRows.find(x => x.phase === "completed")?.result; const approvalRows = this.o.journal.rows().filter(x => x.requestId === id && x.approvalHash !== undefined);
      let result: GitHubControlResult;
      if (approvalRows.some(x => x.approvalHash !== approvalHash)) result = {...this.result(id, raw.requestHash ?? "", "refused", "approval_replay_or_collision"), approvalHash};
      else { const done = approvalRows.find(x => x.phase === "completed")?.result; if (done) { await this.o.transport.publishResult(done); out.push(done); continue; }
        if (approvalRows.some(x => x.phase === "claimed")) result = {...this.result(id, raw.requestHash ?? "", "ambiguous", "crash_after_approval_claim_manual_reconciliation_required"), approvalHash};
        else { this.o.journal.append({requestId:id,requestHash:raw.requestHash ?? "",approvalHash,phase:"claimed"}); try {
          if (e.path !== `approvals/${id}.json`) throw new Error("approval_path_mismatch");
          if (!submitted?.assignmentId || !submitted.assignmentHash || submitted.status === "refused" || submitted.status === "ambiguous") throw new Error("approved_request_not_submitted");
          const requestEnvelope = (await this.o.transport.listRequests()).find(x => (x.request as Partial<GitHubControlRequest>)?.requestId === id); if (!requestEnvelope) throw new Error("approved_request_missing");
          const request = validateGitHubControlRequest(requestEnvelope.request, this.o.repository); const store = new FileEngineeringStore(this.o.storeRoot); const frozen = store.loadFrozenAssignment(submitted.assignmentId); const approval = validateGitHubControlApproval({value:e.approval,request,frozen,repository:this.o.repository,now:this.o.now?.() ?? new Date().toISOString()});
          const provider = this.o.provider ?? resolveActiveExecutionProvider(); if (provider.providerId !== "codex") throw new Error("approval_provider_refused_no_fallback");
          const execution = await dispatchInitialGovernedExecutorAssignment({store,provider,assignmentId:approval.assignmentId,ownerConfirmation:approval.ownerConfirmation});
          result={...this.result(id,request.requestHash,"executed","approved_execution_completed"),approvalHash,assignmentId:approval.assignmentId,assignmentHash:approval.assignmentHash,executed:true,executionEvidenceId:execution.evidence.evidenceId,executionVerdict:execution.result.executionVerdict,humanAuthorityRequired:false};
        } catch(error) { result={...this.result(id,raw.requestHash ?? "","refused",error instanceof Error?error.message:"unknown_approval_refusal"),approvalHash,assignmentId:submitted?.assignmentId ?? null,assignmentHash:submitted?.assignmentHash ?? null}; } }
      }
      this.o.journal.append({requestId:id,requestHash:raw.requestHash ?? "",approvalHash,phase:"completed",result}); await this.o.transport.publishResult(result); out.push(result);
    }
    return out;
  }
}

/** Pinned private GitHub Contents transport. Issue prose is deliberately unsupported. */
export class GitHubContentsControlTransport implements GitHubControlTransport {
  constructor(private token: string, private repository = GITHUB_CONTROL_REPOSITORY, private ref = "main") { if (repository !== GITHUB_CONTROL_REPOSITORY) throw new Error("control_repository_not_allowed") }
  private async call(path:string, init?:RequestInit) { const response=await fetch(`https://api.github.com/repos/${this.repository}/contents/${path}`,{...init,headers:{Accept:"application/vnd.github+json",Authorization:`Bearer ${this.token}`,"X-GitHub-Api-Version":"2022-11-28",...init?.headers}}); if(!response.ok) throw new Error(`github_transport_${response.status}`); return response }
  async listRequests() { const list=await (await this.call(`requests?ref=${encodeURIComponent(this.ref)}`)).json() as Array<{name:string;path:string;download_url:string|null}>; return Promise.all(list.filter(x=>x.name.endsWith(".json")&&x.download_url).map(async x=>({path:x.path,request:await (await fetch(x.download_url!,{headers:{Authorization:`Bearer ${this.token}`}})).json()}))) }
  async listApprovals() { const list=await (await this.call(`approvals?ref=${encodeURIComponent(this.ref)}`)).json() as Array<{name:string;path:string;download_url:string|null}>; return Promise.all(list.filter(x=>x.name.endsWith(".json")&&x.download_url).map(async x=>({path:x.path,approval:await (await fetch(x.download_url!,{headers:{Authorization:`Bearer ${this.token}`}})).json()}))) }
  async publishResult(result:GitHubControlResult) { const identity=result.requestId; const path=`results/${encodeURIComponent(identity)}.json`; let sha:string|undefined; try{sha=((await (await this.call(`${path}?ref=${encodeURIComponent(this.ref)}`)).json()) as {sha:string}).sha}catch(e){if(!(e instanceof Error)||e.message!=="github_transport_404")throw e} await this.call(path,{method:"PUT",body:JSON.stringify({message:`orchestra result ${identity}`,branch:this.ref,sha,content:Buffer.from(JSON.stringify(result,null,2)+"\n").toString("base64")})}) }
}
