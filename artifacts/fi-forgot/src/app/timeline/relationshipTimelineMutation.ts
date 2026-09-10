export type TimelineMutationOutcome<T> =
  | { kind:"confirmed"; value:T }
  | { kind:"write_failed_reloaded"; value:T }
  | { kind:"confirmed_after_ambiguous_write"; value:T }
  | { kind:"write_resolved_state_mismatch"; value:T }
  | { kind:"write_failed_stale" }
  | { kind:"write_confirmed_reload_failed" };

export async function runTimelineMutation<T>(write:()=>Promise<unknown>, reload:()=>Promise<T>, confirmsMutation:(value:T)=>boolean=()=>false):Promise<TimelineMutationOutcome<T>> {
  try { await write(); }
  catch {
    try { const value=await reload(); return confirmsMutation(value)?{kind:"confirmed_after_ambiguous_write",value}:{kind:"write_failed_reloaded",value}; }
    catch { return {kind:"write_failed_stale"}; }
  }
  try { const value=await reload(); return confirmsMutation(value)?{kind:"confirmed",value}:{kind:"write_resolved_state_mismatch",value}; }
  catch { return {kind:"write_confirmed_reload_failed"}; }
}

export type TimelineMutationAction = "edit" | "archive" | "restore" | "interpretation";

const mutationMessages: Record<TimelineMutationAction, { reloadFailed:string; requestFailed:string; unconfirmed:string }> = {
  edit: {
    reloadFailed:"The correction was saved, but its current text could not be reloaded. Refresh before making another change.",
    requestFailed:"The correction request failed; the current timeline was reloaded.",
    unconfirmed:"The correction outcome could not be confirmed. Refresh before making another change.",
  },
  archive: {
    reloadFailed:"The report was archived, but its current state could not be reloaded. Refresh before making another change.",
    requestFailed:"The archive request failed; the current timeline was reloaded.",
    unconfirmed:"The archive outcome could not be confirmed. Refresh before making another change.",
  },
  restore: {
    reloadFailed:"The report was restored, but its current state could not be reloaded. Refresh before making another change.",
    requestFailed:"The restore request failed; the current timeline was reloaded.",
    unconfirmed:"The restore outcome could not be confirmed. Refresh before making another change.",
  },
  interpretation: {
    reloadFailed:"The understanding change was saved, but current history could not be reloaded. Refresh before another change.",
    requestFailed:"The understanding request failed; the current timeline was reloaded.",
    unconfirmed:"The understanding outcome could not be confirmed. Refresh before another change.",
  },
};

export function applyTimelineMutationOutcome<T extends {items:unknown[]}>(
  action:TimelineMutationAction,
  outcome:TimelineMutationOutcome<T>,
  sinks:{setItems:(items:T["items"])=>void;setMutationError:(error:string|null)=>void;onConfirmed:()=>void},
):boolean {
  if ("value" in outcome) sinks.setItems(outcome.value.items);
  if (outcome.kind === "confirmed" || outcome.kind === "confirmed_after_ambiguous_write") {
    sinks.setMutationError(null);
    sinks.onConfirmed();
    return true;
  }
  const messages=mutationMessages[action];
  sinks.setMutationError(outcome.kind === "write_confirmed_reload_failed" ? messages.reloadFailed : outcome.kind === "write_failed_reloaded" ? messages.requestFailed : messages.unconfirmed);
  return false;
}
