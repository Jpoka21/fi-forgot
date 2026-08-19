import {
  CURSOR_PROVIDER_ID,
  type ExecutionProvider,
} from "../provider-contract.js";
import {
  CursorExecutionProvider,
  type CursorProviderOptions,
} from "../providers/cursor/cursor-provider.js";
import {
  dispatchGovernedVerifierAssignment,
  type GovernedVerifierDispatchResult,
} from "./dispatch-verifier.js";
import type { FileEngineeringStore } from "./store.js";

export const ACTIVE_EXECUTION_PROVIDER_ID = CURSOR_PROVIDER_ID;

export interface ResolveActiveExecutionProviderOptions extends CursorProviderOptions {}

/**
 * Resolve the active proven execution provider for governed Orchestra work.
 * Cursor is the active provider in this slice; the contract remains vendor neutral.
 */
export function resolveActiveExecutionProvider(
  options: ResolveActiveExecutionProviderOptions = {},
): ExecutionProvider {
  return new CursorExecutionProvider(options);
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

function resolveRoutingProvider(input: RouteGovernedVerifierAssignmentInput): ExecutionProvider {
  if (input.provider) {
    return input.provider;
  }
  const providerId = input.providerId ?? ACTIVE_EXECUTION_PROVIDER_ID;
  if (providerId === ACTIVE_EXECUTION_PROVIDER_ID) {
    return resolveActiveExecutionProvider();
  }
  throw new Error(
    `unsupported execution provider id for routing: ${providerId}. Pass an ExecutionProvider instance explicitly.`,
  );
}

/**
 * Programmatic governed verifier routing: authoritative store, explicit provider
 * resolution, closed dispatch eligibility, and provider execution without manual
 * assignment transport into Cursor chat.
 */
export async function routeGovernedVerifierAssignment(
  input: RouteGovernedVerifierAssignmentInput,
): Promise<GovernedVerifierRoutingResult> {
  const provider = resolveRoutingProvider(input);
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
