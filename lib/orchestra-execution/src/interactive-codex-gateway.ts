import type { ExecutionProvider } from "./provider-contract.js";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { sortKeys } from "./assignment.js";
import { sha256Utf8 } from "./engineering-store/atomic-write.js";
import { ENGINEERING_STORE_SCHEMA_VERSION, type GovernedCandidateAcceptanceRecord,
  type VerificationDecisionRecord } from "./engineering-store/types.js";
import { dispatchInitialGovernedExecutorAssignment } from "./governed-executor-capability.js";
import { ACTIVE_EXECUTION_PROVIDER_ID, resolveActiveExecutionProvider,
  routeGovernedVerifierAssignment } from "./engineering-store/route-verifier.js";
import { prepareVerifierAssignment,
  authorizeAndFreezeVerifierAssignment } from "./engineering-store/prepare-verifier.js";
import { adjudicateVerifierExecution } from "./engineering-store/adjudicate-verifier.js";
import { preparePostDecisionAction } from "./engineering-store/prepare-post-decision-action.js";
import { authorizePostDecisionExecution } from "./engineering-store/authorize-post-decision-execution.js";
import { executeAuthorizedPostDecisionAction } from "./engineering-store/execute-authorized-post-decision-action.js";
import { FileEngineeringStore } from "./engineering-store/store.js";
import { defaultEngineeringStoreRoot, submitOwnerRequest } from "./owner-submit.js";
import { PROTECTED_WRITING_QUALITY_PATHS } from "./owner-cli.js";

export type GatewayResponse = {
  ok: boolean;
  phase: "conversation" | "authority_required" | "executed" | "verified" | "refused";
  message: string;
  data?: unknown;
};
export interface InteractiveCodexGatewayOptions {
  repository: string;
  storeRoot?: string;
  protectedPaths?: readonly string[];
  /** Injection seam for deterministic tests. Production resolves promoted Codex. */
  providerFactory?: () => ExecutionProvider;
  /** Test-only interlock used to prove acceptance-to-mutation drift refusals. */
  publicationInterlock?: () => void;
}

/** Conversational façade over Orchestra authority; deliberately Codex-only. */
export class InteractiveCodexGateway {
  readonly repository: string;
  readonly storeRoot: string;
  readonly protectedPaths: readonly string[];
  private readonly providerFactory: () => ExecutionProvider;
  private readonly publicationInterlock?: () => void;
  constructor(options: InteractiveCodexGatewayOptions) {
    this.repository = options.repository;
    this.storeRoot = options.storeRoot ?? defaultEngineeringStoreRoot(options.repository);
    this.protectedPaths = options.protectedPaths ?? PROTECTED_WRITING_QUALITY_PATHS;
    this.providerFactory = options.providerFactory ?? (() => resolveActiveExecutionProvider());
    this.publicationInterlock = options.publicationInterlock;
  }
  async converse(input: string): Promise<GatewayResponse> {
    const text = input.trim();
    if (!text) return this.refuse("A development request or gateway command is required.");
    if (text === "Accept and publish") {
      try { return this.publishVerifiedCandidate(); }
      catch (error) { return this.refuse(error instanceof Error ? error.message : String(error)); }
    }
    const [command, ...args] = text.split(/\s+/);
    try {
      switch (command!.toLowerCase()) {
        case "/help": return { ok: true, phase: "conversation", message: HELP };
        case "/dispatch": return await this.dispatch(args);
        case "/verify": return await this.verify(args);
        case "/authorize": return this.authorize(args);
        case "/continue": return await this.continue(args);
        default: return this.submit(text);
      }
    } catch (error) {
      return this.refuse(error instanceof Error ? error.message : String(error));
    }
  }
  private store(): FileEngineeringStore { return new FileEngineeringStore(this.storeRoot); }
  private provider(): ExecutionProvider {
    const provider = this.providerFactory();
    if (provider.providerId !== ACTIVE_EXECUTION_PROVIDER_ID) {
      throw new Error(`codex_required: gateway refused provider ${provider.providerId}; no Cursor fallback`);
    }
    return provider;
  }
  private submit(ownerText: string): GatewayResponse {
    const result = submitOwnerRequest({ repository: this.repository, storeRoot: this.storeRoot,
      ownerText, protectedPaths: this.protectedPaths });
    return { ok: true, phase: "authority_required",
      message: `Frozen ${result.assignmentId}. To grant exact owner authority: /dispatch ${result.assignmentId} ${result.assignmentId}`,
      data: result };
  }
  private async dispatch(args: string[]): Promise<GatewayResponse> {
    if (args.length !== 2 || args[0] !== args[1])
      return this.refuse("exact_owner_authority_required: /dispatch ASSIGNMENT_ID ASSIGNMENT_ID");
    const result = await dispatchInitialGovernedExecutorAssignment({ store: this.store(), provider: this.provider(),
      assignmentId: args[0]!, ownerConfirmation: args[1]!, projectHooks: true });
    return { ok: true, phase: "executed",
      message: `Codex execution evidence ${result.evidence.evidenceId} persisted; semantic verification is pending.`, data: result };
  }
  private async verify(args: string[]): Promise<GatewayResponse> {
    if (args.length < 2 || args.length > 3)
      return this.refuse("usage: /verify EXECUTOR_ASSIGNMENT_ID EXECUTION_EVIDENCE_ID [VERIFIER_ASSIGNMENT_ID]");
    const input = { store: this.store(), executorAssignmentId: args[0]!, executionEvidenceId: args[1]! };
    const candidate = prepareVerifierAssignment(input);
    if (!candidate.ready || !candidate.candidate) return this.refuse(`verification_refused: ${candidate.reason}`);
    const verifierId = candidate.candidate.assignment.assignmentId;
    if (args[2] !== verifierId) return { ok: false, phase: "authority_required",
      message: `Verifier prepared but not authorized. Confirm: /verify ${args[0]} ${args[1]} ${verifierId}`, data: candidate };
    const authorized = authorizeAndFreezeVerifierAssignment({ ...input, humanAuthorized: true });
    if (!authorized.ready || !authorized.persisted) return this.refuse(`verification_authorization_refused: ${authorized.reason}`);
    const routed = await routeGovernedVerifierAssignment({ store: this.store(), provider: this.provider(),
      verifierAssignmentId: verifierId, projectHooks: true });
    const decision = adjudicateVerifierExecution({ store: this.store(), verifierAssignmentId: verifierId });
    const next = decision.decisionRecord ? preparePostDecisionAction({ store: this.store(),
      verificationDecisionId: decision.decisionRecord.verificationDecisionId }) : null;
    return { ok: decision.adjudicated, phase: decision.adjudicated ? "verified" : "refused",
      message: decision.adjudicated ? `Verification decision: ${decision.decision}. ${next?.actionRecord ? `Next action ${next.actionRecord.postDecisionActionId} requires /authorize.` : ""}`
        : `verification_adjudication_refused: ${decision.reason}`, data: { authorized, routed, decision, next } };
  }
  private authorize(args: string[]): GatewayResponse {
    if (args.length !== 2 || args[0] !== args[1])
      return this.refuse("exact_owner_authority_required: /authorize ACTION_ID ACTION_ID");
    const result = authorizePostDecisionExecution({ store: this.store(), postDecisionActionId: args[0]!, humanAuthorized: true });
    return { ok: result.authorized, phase: result.authorized ? "authority_required" : "refused",
      message: result.authorized && result.authorization ? `Authorized once. Execute with /continue ${args[0]} ${result.authorization.authorizationId}`
        : `authorization_refused: ${result.reason}`, data: result };
  }
  private async continue(args: string[]): Promise<GatewayResponse> {
    if (args.length !== 2) return this.refuse("usage: /continue ACTION_ID AUTHORIZATION_ID");
    const result = await executeAuthorizedPostDecisionAction({ store: this.store(), provider: this.provider(),
      postDecisionActionId: args[0]!, authorizationId: args[1]!, projectHooks: true });
    return { ok: result.executed, phase: result.executed ? "executed" : "refused",
      message: result.executed ? `Governed ${result.preparedAction} evidence ${result.executionEvidenceId} persisted.`
        : `continuation_refused: ${result.reason}`, data: result };
  }
  private git(args: string[]): string {
    return execFileSync("git", ["-C", this.repository, ...args], { encoding: "utf8", windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } }).trimEnd();
  }
  private canonicalRepository(): string { return realpathSync.native(resolve(this.git(["rev-parse", "--show-toplevel"]))); }
  private hashPath(repository: string, path: string): string | null {
    const absolute = resolve(repository, path);
    const inside = relative(repository, absolute);
    if (!inside || inside.startsWith("..") || isAbsolute(inside)) throw new Error(`invalid_candidate_path: ${path}`);
    return existsSync(absolute) ? sha256Utf8(readFileSync(absolute).toString("base64")) : null;
  }
  private selectEligibleVerifiedCandidate(store: FileEngineeringStore, repository: string) {
    const eligible: Array<{ decision: VerificationDecisionRecord; candidatePaths: string[]; protectedPaths: string[] }> = [];
    for (const assignmentId of store.listAssignmentIds()) for (const decision of store.loadVerificationDecisions(assignmentId)) {
      if (decision.decision !== "VERIFIED") continue;
      const authoritative = store.findVerificationDecisionById(decision.verificationDecisionId);
      if (!authoritative || authoritative.decisionHash !== decision.decisionHash) continue;
      const executor = store.loadFrozenAssignment(decision.verifiedExecutorAssignmentId);
      const verifier = store.loadFrozenAssignment(decision.verifierAssignmentId);
      if (executor.assignment.role !== "executor" || verifier.assignment.role !== "verifier") continue;
      if (realpathSync.native(resolve(executor.assignment.repositoryPath)) !== repository) continue;
      const executorEvidence = store.loadExecutionEvidenceById(decision.verifiedExecutorAssignmentId, decision.verifiedExecutorExecutionEvidenceId);
      const verifierEvidence = store.loadExecutionEvidenceById(decision.verifierAssignmentId, decision.verifierExecutionEvidenceId);
      store.assertTrustedExecutionEvidence(executorEvidence); store.assertTrustedExecutionEvidence(verifierEvidence);
      const relationship = store.loadAssignmentRecord(decision.verifierAssignmentId).relationship;
      if (relationship.verifiesAssignmentId !== executor.assignment.assignmentId ||
          relationship.verifiesExecutionEvidenceId !== executorEvidence.evidenceId) continue;
      const allowed = new Set(executor.assignment.allowedPaths);
      const candidatePaths = [...new Set(executorEvidence.result.changedPaths)].sort();
      if (!candidatePaths.length || candidatePaths.some((path) => !allowed.has(path))) continue;
      eligible.push({ decision, candidatePaths, protectedPaths: [...executor.assignment.protectedPaths].sort() });
    }
    if (!eligible.length) throw new Error("no_eligible_verified_candidate");
    if (eligible.length !== 1) throw new Error("multiple_eligible_verified_candidates");
    return eligible[0]!;
  }
  private publishVerifiedCandidate(): GatewayResponse {
    const store = this.store();
    const repository = this.canonicalRepository();
    const disposableRoot = realpathSync.native(resolve(tmpdir()));
    const disposableRelative = relative(disposableRoot, repository);
    if (disposableRelative.startsWith("..") || isAbsolute(disposableRelative)) throw new Error("publication_refused_not_disposable_repository");
    const selected = this.selectEligibleVerifiedCandidate(store, repository);
    const executor = store.loadFrozenAssignment(selected.decision.verifiedExecutorAssignmentId);
    const acceptanceId = `accept-${selected.decision.verificationDecisionId}`;
    const priorPublication = store.loadGovernedCandidatePublications().find((row) => row.acceptanceId === acceptanceId);
    if (priorPublication) return { ok: true, phase: "executed", message: `Already published ${priorPublication.commit}.`, data: priorPublication };
    const verifier = store.loadFrozenAssignment(selected.decision.verifierAssignmentId);
    const executorEvidence = store.loadExecutionEvidenceById(selected.decision.verifiedExecutorAssignmentId, selected.decision.verifiedExecutorExecutionEvidenceId);
    const verifierEvidence = store.loadExecutionEvidenceById(selected.decision.verifierAssignmentId, selected.decision.verifierExecutionEvidenceId);
    const branch = this.git(["branch", "--show-current"]), head = this.git(["rev-parse", "HEAD"]);
    const existingAcceptance = store.loadGovernedCandidateAcceptances().find((row) => row.acceptanceId === acceptanceId);
    if (branch !== executor.assignment.branch) throw new Error("branch_drift");
    if (head !== executor.assignment.startingHead) throw new Error("head_drift");
    const upstream = this.git(["rev-parse", "--abbrev-ref", "@{upstream}"]);
    const slash = upstream.indexOf("/");
    if (slash <= 0 || upstream.slice(slash + 1) !== branch) throw new Error("upstream_mismatch");
    const remoteName = upstream.slice(0, slash), remoteUrl = this.git(["remote", "get-url", remoteName]);
    this.git(["fetch", "--quiet", remoteName, branch]);
    const remoteBaseline = this.git(["rev-parse", "@{upstream}"]);
    if (remoteBaseline !== head) throw new Error("pre_commit_remote_divergence");
    const staged = this.git(["diff", "--cached", "--name-only", "--"]);
    if (staged) throw new Error("staged_contamination");
    const candidateContentSha256 = Object.fromEntries(selected.candidatePaths.map((path) => [path, this.hashPath(repository, path)]));
    const protectedStateSha256 = Object.fromEntries(selected.protectedPaths.map((path) => [path, this.hashPath(repository, path)]));
    const body = { schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION, recordKind: "governed_candidate_acceptance" as const,
      acceptanceId, repository, branch, startingHead: head, upstream, remoteName, remoteUrl, remoteBaseline,
      verifierAssignmentId: selected.decision.verifierAssignmentId, verifierAssignmentHash: verifier.assignmentHash,
      verifierExecutionEvidenceId: selected.decision.verifierExecutionEvidenceId, verifierExecutionEvidenceHash: verifierEvidence.evidenceHash,
      verificationDecisionId: selected.decision.verificationDecisionId, decisionHash: selected.decision.decisionHash,
      executorAssignmentId: selected.decision.verifiedExecutorAssignmentId, executorAssignmentHash: executor.assignmentHash,
      executorExecutionEvidenceId: selected.decision.verifiedExecutorExecutionEvidenceId, executorExecutionEvidenceHash: executorEvidence.evidenceHash,
      candidatePaths: selected.candidatePaths, candidateContentSha256, protectedStateSha256, expectedStagedPaths: [] as [],
      commitSubject: `orchestra: publish ${executor.assignment.assignmentId}`,
      publicationIntent: "commit_and_normal_push_exact_refspec" as const, acceptedPhrase: "Accept and publish" as const,
      acceptedAt: existingAcceptance?.acceptedAt ?? new Date().toISOString() };
    const computed: GovernedCandidateAcceptanceRecord = { ...body, acceptanceHash: sha256Utf8(JSON.stringify(sortKeys(body))) };
    const acceptance = existingAcceptance ?? store.persistGovernedCandidateAcceptance(computed);
    this.publicationInterlock?.();
    if (this.canonicalRepository() !== acceptance.repository) throw new Error("repository_drift");
    if (this.git(["branch", "--show-current"]) !== acceptance.branch) throw new Error("branch_drift");
    if (this.git(["rev-parse", "HEAD"]) !== acceptance.startingHead) throw new Error("head_drift");
    if (this.git(["rev-parse", "--abbrev-ref", "@{upstream}"]) !== acceptance.upstream) throw new Error("upstream_mismatch");
    if (this.git(["remote", "get-url", acceptance.remoteName]) !== acceptance.remoteUrl) throw new Error("remote_url_drift");
    const rebound = store.findVerificationDecisionById(acceptance.verificationDecisionId);
    if (!rebound || rebound.decision !== "VERIFIED" || rebound.decisionHash !== acceptance.decisionHash) throw new Error("verified_evidence_binding_drift");
    this.git(["fetch", "--quiet", acceptance.remoteName, acceptance.branch]);
    if (this.git(["rev-parse", "@{upstream}"]) !== acceptance.remoteBaseline) throw new Error("pre_commit_remote_divergence");
    if (this.git(["diff", "--cached", "--name-only", "--"])) throw new Error("staged_contamination");
    for (const [path, hash] of Object.entries(acceptance.candidateContentSha256)) if (this.hashPath(repository, path) !== hash) throw new Error("candidate_content_drift");
    for (const [path, hash] of Object.entries(acceptance.protectedStateSha256)) if (this.hashPath(repository, path) !== hash) throw new Error("protected_path_drift");
    this.git(["add", "--", ...acceptance.candidatePaths]);
    const exactIndex = this.git(["diff", "--cached", "--name-only", "--"]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(exactIndex) !== JSON.stringify(acceptance.candidatePaths)) throw new Error("exact_index_mismatch");
    this.git(["commit", "--only", "-m", acceptance.commitSubject, "--", ...acceptance.candidatePaths]);
    const commit = this.git(["rev-parse", "HEAD"]);
    const committedPaths = this.git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(committedPaths) !== JSON.stringify(acceptance.candidatePaths)) throw new Error("published_paths_mismatch");
    const refspec = `${acceptance.branch}:${acceptance.branch}`;
    this.git(["push", acceptance.remoteName, refspec]);
    const publicationBody = { schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION, recordKind: "governed_candidate_publication" as const,
      acceptanceId, acceptanceHash: acceptance.acceptanceHash, commit, refspec, publishedAt: new Date().toISOString() };
    const publication = store.persistGovernedCandidatePublication({ ...publicationBody, publicationHash: sha256Utf8(JSON.stringify(sortKeys(publicationBody))) });
    return { ok: true, phase: "executed", message: `Published verified candidate ${commit}.`, data: { acceptance, publication } };
  }
  private refuse(message: string): GatewayResponse { return { ok: false, phase: "refused", message }; }
}
export const HELP = `Interactive Codex Gateway:
  <development request>                         freeze a bounded request
  /dispatch ASSIGNMENT_ID ASSIGNMENT_ID         authorize initial Codex execution
  /verify EXECUTOR_ID EVIDENCE_ID [VERIFIER_ID] prepare/authorize/run verification
  /authorize ACTION_ID ACTION_ID                authorize one correction/continuation
  /continue ACTION_ID AUTHORIZATION_ID          execute that action through Codex
  Accept and publish                            accept the sole VERIFIED candidate and publish it
Provider prose is never authority. Development and verifier execution cannot commit or push.`;
