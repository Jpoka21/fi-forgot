import { createAssignment, hashAssignment } from "../assignment-hash.js";
import { canonicalizeAssignment } from "../assignment.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

export function runAssignmentTests(): void {
  section("assignment normalization and hash");
  const frozen = createAssignment({
    assignmentId: "a1",
    projectId: "p1",
    role: "executor",
    repositoryPath: "C:/tmp/repo",
    branch: "fixture-main",
    startingHead: "ABCDEF",
    assignmentText: "do the work",
    allowedPaths: ["allowed.txt"],
    protectedPaths: ["protected.txt"],
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  expect("startingHead lowercased", frozen.assignment.startingHead, "abcdef");
  expect("requireNoPush default", frozen.assignment.requireNoPush, true);
  expect("commitAuthorization default false", frozen.assignment.commitAuthorization, false);
  expect("pushAuthorization default false", frozen.assignment.pushAuthorization, false);
  expect("hash length", frozen.assignmentHash.length, 64);
  expect(
    "hash matches canonical body",
    hashAssignment(frozen.assignment),
    frozen.assignmentHash,
  );
  const again = createAssignment({
    assignmentId: "a1",
    projectId: "p1",
    role: "executor",
    repositoryPath: "C:/tmp/repo",
    branch: "fixture-main",
    startingHead: "abcdef",
    assignmentText: "do the work",
    allowedPaths: ["allowed.txt"],
    protectedPaths: ["protected.txt"],
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  expect("hash is deterministic", again.assignmentHash, frozen.assignmentHash);
  expectTrue(
    "canonical json is stable",
    canonicalizeAssignment(frozen.assignment) === canonicalizeAssignment(again.assignment),
  );

  let mutated = false;
  try {
    (frozen.assignment as { assignmentId: string }).assignmentId = "mutated";
  } catch {
    mutated = true;
  }
  expectTrue("assignment object is frozen", mutated || frozen.assignment.assignmentId === "a1");
  expectFalse("verifier is a supported role", createAssignment({
    ...frozen.assignment,
    role: "verifier",
    assignmentId: "a2",
  }).assignment.role !== "verifier");
}
