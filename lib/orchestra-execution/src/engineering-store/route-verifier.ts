import {
  CODEX_PROVIDER_ID,
  CURSOR_PROVIDER_ID,
  type ExecutionProvider,
} from "../provider-contract.js";
import {
  CursorExecutionProvider,
  type CursorProviderOptions,
} from "../providers/cursor/cursor-provider.js";
import {
  CodexExecutionProvider,
  type CodexProviderOptions,
} from "../providers/codex/codex-provider.js";
import {
  dispatchGovernedVerifierAssignment,
  type GovernedVerifierDispatchResult,
} from "./dispatch-verifier.js";
import type { FileEngineeringStore } from "./store.js";

/** Formally promoted default governed write/read provider (ORCH IMP 042.2). */
export const ACTIVE_EXECUTION_PROVIDER_ID = CODEX_PROVIDER_ID;

/** Explicit fallback provider retained after Codex promotion. */
export const FALLBACK_EXECUTION_PROVIDER_ID = CURSOR_PROVIDER_ID;

export type ResolveActiveExecutionProviderOptions = CodexProviderOptions;

/**
 * Resolve the active proven execution provider for governed Orchestra work.
 * Codex is the promoted default under the clean-baseline workspace-write bound;
 * mode is assignment-derived (write when allowedPaths non-empty, else read-only).
 */
export function resolveActiveExecutionProvider(
  options: ResolveActiveExecutionProviderOptions = {},
): ExecutionProvider {
  return new CodexExecutionProvider(options);
}

/** Resolve Cursor explicitly as fallback without changing the active default. */
export function resolveFallbackExecutionProvider(
  options: CursorProviderOptions = {},
): ExecutionProvider {
  return new CursorExecutionProvider(options);
}

/**
 * Resolve a provider for dispatch/routing.
 * Explicit provider instance wins. Otherwise providerId selects Codex (default)
 * or Cursor (fallback). Unknown ids fail closed — no silent fallback.
 */
export function resolveConfiguredExecutionProvider(input: {
  provider?: ExecutionProvider;
  providerId?: string;
}): ExecutionProvider {
  if (input.provider) return input.provider;
  const providerId = input.providerId ?? ACTIVE_EXECUTION_PROVIDER_ID;
  if (providerId === ACTIVE_EXECUTION_PROVIDER_ID || providerId === CODEX_PROVIDER_ID) {
    return resolveActiveExecutionProvider();
  }
  if (providerId === CURSOR_PROVIDER_ID || providerId === FALLBACK_EXECUTION_PROVIDER_ID) {
    return resolveFallbackExecutionProvider();
  }
  throw new Error(
    `unsupported execution provider id: ${providerId}. Pass an ExecutionProvider instance explicitly.`,
  );
}

export interface RouteGovernedVerifierAssignmentInput {
  store: FileEngineeringStore;
  verifierAssignmentId: string;
  provider?: ExecutionProvider;
  providerId?: string;
  projectHooks?: boolean;
}

export interface GovernedVerifierRoutingResult extends GovernedVerifierDispatchResult {
  routingProviderId: string;
  routedThroughActiveProvider: boolean;
}

/**
 * Programmatic governed verifier routing: authoritative store, explicit provider
 * resolution, closed dispatch eligibility, and provider execution without manual
 * assignment transport into a chat UI.
 */
export async function routeGovernedVerifierAssignment(
  input: RouteGovernedVerifierAssignmentInput,
): Promise<GovernedVerifierRoutingResult> {
  const provider = resolveConfiguredExecutionProvider(input);
  const result = await dispatchGovernedVerifierAssignment({
    store: input.store,
    provider,
    verifierAssignmentId: input.verifierAssignmentId,
    projectHooks: input.projectHooks,
  });
  return {
    ...result,
    routingProviderId: provider.providerId,
    routedThroughActiveProvider: provider.providerId === ACTIVE_EXECUTION_PROVIDER_ID,
  };
}
