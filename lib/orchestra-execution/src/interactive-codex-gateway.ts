import type { ExecutionProvider } from "./provider-contract.js";
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
}

/** Conversational façade over Orchestra authority; deliberately Codex-only. */
export class InteractiveCodexGateway {
  readonly repository: string;
  readonly storeRoot: string;
  readonly protectedPaths: readonly string[];
  private readonly providerFactory: () => ExecutionProvider;
  constructor(options: InteractiveCodexGatewayOptions) {
    this.repository = options.repository;
    this.storeRoot = options.storeRoot ?? defaultEngineeringStoreRoot(options.repository);
    this.protectedPaths = options.protectedPaths ?? PROTECTED_WRITING_QUALITY_PATHS;
    this.providerFactory = options.providerFactory ?? (() => resolveActiveExecutionProvider());
  }
  async converse(input: string): Promise<GatewayResponse> {
    const text = input.trim();
    if (!text) return this.refuse("A development request or gateway command is required.");
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
  private refuse(message: string): GatewayResponse { return { ok: false, phase: "refused", message }; }
}
export const HELP = `Interactive Codex Gateway:
  <development request>                         freeze a bounded request
  /dispatch ASSIGNMENT_ID ASSIGNMENT_ID         authorize initial Codex execution
  /verify EXECUTOR_ID EVIDENCE_ID [VERIFIER_ID] prepare/authorize/run verification
  /authorize ACTION_ID ACTION_ID                authorize one correction/continuation
  /continue ACTION_ID AUTHORIZATION_ID          execute that action through Codex
Provider prose is never authority. No commit, push, or Cursor fallback.`;
