import { MockExecutionProvider } from "../providers/mock-provider.js";
import { createAssignment } from "../assignment-hash.js";
import { expect, expectTrue, section } from "./harness.js";

export async function runProviderContractTests(): Promise<void> {
  section("provider contract");
  const provider = new MockExecutionProvider({ resultText: "ok" });
  const frozen = createAssignment({
    assignmentId: "contract",
    projectId: "p",
    role: "executor",
    repositoryPath: "C:/tmp/repo",
    branch: "main",
    startingHead: "abc",
    assignmentText: "noop",
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  const session = await provider.createSession({
    repositoryPath: frozen.assignment.repositoryPath,
    branch: frozen.assignment.branch,
    startingHead: frozen.assignment.startingHead,
  });
  expect("createSession providerId", session.providerId, "mock");
  const identity = provider.getSessionIdentity(session);
  expect("session identity is correlator only", identity.sessionId, "mock-session");
  const run = await provider.submitAssignment(session, frozen);
  expect("submitAssignment records hash", run.assignmentHash, frozen.assignmentHash);
  const events = [];
  for await (const event of provider.streamEvents(run)) events.push(event);
  expect("mock stream default empty", events.length, 0);
  const result = await provider.awaitResult(run);
  expect("awaitResult is not orchestra pass", result.status, "finished");
  await provider.requestCancellation(run);
  await provider.closeSession(session);
  expectTrue("closeSession invoked", provider.wasClosed());
  const resumed = await provider.resumeSession("mock-session");
  expect("resumeSession returns provider id", resumed.sessionId, "mock-session");
}
