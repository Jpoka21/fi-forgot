import { questionRequestKind } from "./browser/policy.mjs";
import {
  questionResponse,
  questionProjection,
} from "./browser/question-evidence.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { assertSupplementalQuestionInputApiRow, assertSupplementalQuestionInputDatabaseRow, effectiveSupplementalQuestionInputSeed, supplementalQuestionInputSeedHash } from "./question-input-assertions.ts";

const need = (ok, message) => {
  if (!ok) throw Error("FAIL_CLOSED: browser " + message);
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const eq = (a, b) =>
  typeof a === "string" &&
  /^[a-f0-9]{64}$/i.test(a) &&
  typeof b === "string" &&
  a.toLowerCase() === b.toLowerCase();
const decode = (bytes) =>
  JSON.parse(bytes.toString("utf8").replace(/^\uFEFF/, ""));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const presented = (items) =>
  items
    .filter(
      (x) =>
        x.presentation.recommendationEligible &&
        x.recommendation !== null &&
        (x.timing.temporal?.recommendationEligible ?? true),
    )
    .slice(0, 3);
const current = (history) => {
  const latest = new Map();
  for (const e of history)
    if (!latest.has(e.lineageId) || latest.get(e.lineageId).version < e.version)
      latest.set(e.lineageId, e);
  return [...latest.values()].filter((e) => e.active && e.action === "set");
};
const mountedOutcome = (name, o) => {
  if (!o || typeof o !== "object") return false;
  switch (name) {
    case "reversed-delayed-load":
      return (
        o.visible === "recipient-b" &&
        o.stale === "recipient-a" &&
        o.stateUnchanged === true &&
        o.requestDelta === 0 &&
        o.staleSuccess === true &&
        o.staleRejection === true
      );
    case "failed-second-load":
      return (
        o.recipientId === "recipient-b" &&
        o.question === null &&
        o.savingAnswer === false
      );
    case "retained-a-b-a-callbacks":
      return o.requests === 0 && o.state === "unchanged";
    case "selection-null":
      return (
        o.state === "unavailable" &&
        o.requests === 0 &&
        o.snapshot?.recipientId === null &&
        o.snapshot?.question === null &&
        o.snapshot?.answerText === "" &&
        o.snapshot?.savingAnswer === false
      );
    case "started-save-new-view":
      return (
        o.target === "recipient-a" &&
        o.visible === "recipient-b" &&
        o.answerSaved === false &&
        o.stateUnchanged === true
      );
    case "delayed-timer-new-view":
      return (
        o.visible === "recipient-b" &&
        o.staleTimerIgnored === true &&
        o.stateUnchanged === true &&
        o.requestDelta === 0 &&
        o.eventDelta === 0 &&
        Number.isInteger(o.timerCallbacksRun) &&
        o.timerCallbacksRun > 0
      );
    case "unmount-retained-callbacks":
      return o.requests === 0 && o.state === "unmounted";
    case "production-transformed-save":
    case "production-alternate-save":
      return (
        o.requestRecipient === "recipient-a" &&
        typeof o.fieldKey === "string" &&
        o.fieldKey.length > 0 &&
        typeof o.question === "string" &&
        o.question.length > 0
      );
    default:
      return false;
  }
};
const archiveSemantics = (a, fixture, durableQuestionState, durableSnapshots, seedContext) => {
  const owner = fixture.owners.find((x) => x.id === a?.ownerId);
  if (
    !owner ||
    !owner.recipientIds.includes(a.recipientId) ||
    typeof a.answerId !== "string" ||
    !a.answerId ||
    typeof a.answerText !== "string" ||
    !a.answerText
  )
    return false;
  const seedDescriptor=effectiveSupplementalQuestionInputSeed(seedContext.syntheticRunDate);
  if(a.origin!=="synthetic_fixture_loader"||!same(a.seed?.descriptor,seedDescriptor)||a.seed?.hash!==supplementalQuestionInputSeedHash(seedContext.syntheticRunDate)||a.seed?.baseFixtureHash!==seedContext.baseFixtureHash||a.answerId!==seedDescriptor.id||a.ownerId!==seedDescriptor.userId||a.recipientId!==seedDescriptor.recipientId||a.answerText!==seedDescriptor.answerText||a.apiCreationQualified!==false||a.providerClassificationQualified!==false||a.pointsOutcomeQualified!==false)return false;
  try {
    const before=assertSupplementalQuestionInputDatabaseRow(a.seed.database?.beforeArchive,seedDescriptor,false),archived=assertSupplementalQuestionInputDatabaseRow(a.seed.database?.archived,seedDescriptor,true),restoredDb=assertSupplementalQuestionInputDatabaseRow(a.seed.database?.restored,seedDescriptor,false);
    if(before.createdAt!==archived.createdAt||before.createdAt!==restoredDb.createdAt)return false;
    const beforeApi=assertSupplementalQuestionInputApiRow(a.seed.api?.beforeArchive,seedDescriptor,before.createdAt),restoredApi=assertSupplementalQuestionInputApiRow(a.seed.api?.restored,seedDescriptor,restoredDb.createdAt);
    if(!same(beforeApi,a.active?.row)||!same(restoredApi,a.restored?.row))return false;
  } catch { return false; }
  const expectedRecipients = fixture.owners
    .flatMap((candidate) =>
      candidate.recipientIds.map((recipientId) => ({ ownerId: candidate.id, recipientId })),
    )
    .filter((candidate) => candidate.ownerId !== a.ownerId || candidate.recipientId !== a.recipientId)
    .sort((left, right) => `${left.ownerId}/${left.recipientId}`.localeCompare(`${right.ownerId}/${right.recipientId}`));
  if (!Array.isArray(a.unaffectedRecipients) || a.unaffectedRecipients.length !== expectedRecipients.length) return false;
  const actualRecipients = a.unaffectedRecipients.map(({ ownerId, recipientId }) => ({ ownerId, recipientId })).sort((left, right) => `${left.ownerId}/${left.recipientId}`.localeCompare(`${right.ownerId}/${right.recipientId}`));
  if (!same(actualRecipients, expectedRecipients) || new Set(actualRecipients.map((row) => `${row.ownerId}/${row.recipientId}`)).size !== actualRecipients.length || a.unaffectedRecipients.some((row) => !same(row.before, row.after))) return false;
  if (!Array.isArray(a.targetSources) || a.targetSources.length === 0 || new Set(a.targetSources.map((row) => row.evidenceId)).size !== a.targetSources.length || a.targetSources.some((row) => !row.evidenceId || row.evidenceId === a.answerId || row.before?.evidenceId !== row.evidenceId || !same(row.before, row.after))) return false;
  const ah = a.active?.observation?.history,
    zh = a.archived?.observation?.history,
    rh = a.restored?.observation?.history,
    ids = a.versionIds;
  if (
    !Array.isArray(ah) ||
    !Array.isArray(zh) ||
    !Array.isArray(rh) ||
    !Array.isArray(ids) ||
    ah.length !== 1 || zh.length !== 2 || rh.length !== 3 ||
    new Set(ids).size !== ids.length ||
    !same(
      ids,
      rh.map((x) => x.id),
    )
  )
    return false;
  const immutable = (history) => history.map(({ lifecycleState, ...record }) => record);
  if (
    !same(immutable(zh.slice(0, ah.length)), immutable(ah)) ||
    !same(immutable(rh.slice(0, zh.length)), immutable(zh)) ||
    !same(rh.map((row) => row.stateAtRevision), ["active", "archived", "active"]) ||
    !same(rh.map((row) => row.lifecycleState), ["superseded", "superseded", "active"]) ||
    !same(rh.map((row) => row.version), [1, 2, 3]) ||
    a.archived?.observation?.isArchived !== true ||
    a.restored?.observation?.isArchived !== false
  )
    return false;
  const active = a.active?.row,
    restored = a.restored?.row;
  if (
    !active ||
    active.id !== a.answerId ||
    active.answerText !== a.answerText ||
    !same(restored, active) ||
    !Array.isArray(a.archived?.activeRows) ||
    a.archived.activeRows.some((x) => x.id === a.answerId)
  )
    return false;
  const restoredObservation = a.restored.observation;
  if (restoredObservation.evidenceId !== a.answerId || restoredObservation.version !== 3 || restoredObservation.lifecycleState !== "active" || !same(restoredObservation.history, rh)) return false;
  const durableOwner = durableSnapshots?.find((row) => row.owner === a.ownerId);
  const durableTimeline = durableOwner?.timelines?.find((row) => row.id === a.recipientId)?.timeline;
  const durableObservation = durableTimeline?.items?.find((row) => row.evidenceId === a.answerId);
  const durableSelection = durableQuestionState?.selections?.find((row) => row.ownerId === a.ownerId && row.recipientId === a.recipientId);
  const expectedTargetSources = (durableTimeline?.items ?? []).filter((row) => row.evidenceId && row.evidenceId !== a.answerId);
  if (!same(durableObservation, restoredObservation) || !durableSelection || !same([...a.targetSources].sort((l,r)=>l.evidenceId.localeCompare(r.evidenceId)).map((row)=>row.after), [...expectedTargetSources].sort((l,r)=>l.evidenceId.localeCompare(r.evidenceId)))) return false;
  for (const row of a.unaffectedRecipients) {
    const durable = durableSnapshots?.find((entry) => entry.owner === row.ownerId)?.timelines?.find((entry) => entry.id === row.recipientId)?.timeline;
    if (!same(row.after, durable)) return false;
  }
  if (rh.some((row) => row.text !== a.answerText)) return false;
  return (
    a.archivedExcluded === true &&
    a.restoredActive === true &&
    a.historicalPreserved === true &&
    a.foreignHistoryUnchanged === true &&
    a.unaffectedSourceHistoriesUnchanged === true
  );
};

/** Read-only evidence validation. It cannot launch the browser, API, or database. */
export function verifyBrowserEvidence(
  {
    directory,
    bundle,
    fixture,
    pins,
    currentQuestionHookHash,
    trustedQuestionInputManifest,
    trustedQuestionInputBundleHash,
    durableQuestionInput,
    durableQuestionState,
    durableSnapshots,
    trustedBaseFixtureHash,
  },
  read = fs.readFileSync,
  list = fs.readdirSync,
) {
  const artifact = (name) => {
    need(
      typeof name === "string" &&
        /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) &&
        !name.includes(".."),
      "unsafe artifact name",
    );
    return path.join(directory, name);
  };
  const bytes = (name) => read(artifact(name));
  const receiptBytes = bytes("browser-receipt.json"),
    manifestBytes = bytes("browser-artifact-manifest.json");
  const receipt = decode(receiptBytes),
    manifest = decode(manifestBytes);
  need(
    eq(hash(receiptBytes), bundle.final.browserReceiptHash) &&
      eq(hash(manifestBytes), bundle.final.browserArtifactManifestHash),
    "final artifact binding",
  );
  for (const value of [receipt, manifest])
    need(
      value.nonce === bundle.request.nonce &&
        value.sessionId === bundle.owned.id,
      "stale session",
    );
  need(
    receipt.kind === "BRAIN-BROWSER-EXECUTION" &&
      receipt.success === true &&
      receipt.phase === "complete" &&
      receipt.authenticationQualified === false,
    "completion semantics",
  );
  const integrity = receipt.questionInputIntegrity;
  need(
    integrity?.kind === "BRAIN-QUESTION-INPUT-INTEGRITY" &&
      integrity.nonce === bundle.request.nonce &&
      integrity.sessionId === bundle.owned.id,
    "question input integrity absent or stale",
  );
  need(
    eq(integrity.snapshotHash, bundle.hashes.durable) &&
      eq(integrity.sourceHash, currentQuestionHookHash) &&
      same(integrity.fixtureManifest, trustedQuestionInputManifest) &&
      eq(
        integrity.fixtureManifest?.bundleHash,
        trustedQuestionInputBundleHash,
      ) &&
      eq(integrity.fixtureManifest?.hookHash, currentQuestionHookHash),
    "question input source/snapshot binding",
  );
  need(
    same(integrity.archiveRestore, durableQuestionInput) &&
      archiveSemantics(integrity.archiveRestore, fixture, durableQuestionState, durableSnapshots,{syntheticRunDate:bundle.request.syntheticDate,baseFixtureHash:trustedBaseFixtureHash}),
    "archive restore evidence",
  );
  const requiredCases = [
    "reversed-delayed-load",
    "failed-second-load",
    "retained-a-b-a-callbacks",
    "selection-null",
    "started-save-new-view",
    "delayed-timer-new-view",
    "unmount-retained-callbacks",
    "production-transformed-save",
    "production-alternate-save",
  ];
  const mountedCases = integrity.mountedHook?.cases;
  need(
    integrity.mountedHook?.kind === "QUESTION-INPUT-MOUNTED-SYNTHETIC" &&
      integrity.mountedHook.success === true &&
      integrity.mountedHook.mockedReact === false &&
      integrity.mountedHook.realReact?.createRoot === true &&
      eq(integrity.mountedHook.productionHookHash, currentQuestionHookHash) &&
      eq(integrity.mountedHook.bundleHash, trustedQuestionInputBundleHash) &&
      Array.isArray(mountedCases) &&
      same(mountedCases.map((x) => x.name).sort(), [...requiredCases].sort()) &&
      mountedCases.every(
        (x) => x?.passed === true && mountedOutcome(x.name, x.outcome),
      ),
    "mounted production hook evidence",
  );
  need(
    integrity.browserTransport?.exactRecipientIds === true &&
      Array.isArray(integrity.browserTransport.owners) &&
      integrity.browserTransport.owners.length === fixture.owners.length,
    "exact recipient browser transport evidence",
  );
  const start = Date.parse(receipt.startedAt),
    end = Date.parse(receipt.completedAt);
  need(
    Number.isFinite(start) &&
      Number.isFinite(end) &&
      start >= Date.parse(bundle.release.at) &&
      end >= start &&
      end <= Date.parse(bundle.execution.completedAt),
    "chronology",
  );
  need(
    eq(receipt.durableEvidenceHash, bundle.hashes.durable),
    "snapshot binding",
  );
  for (const [field, file] of [
    ["browserArchiveHash", "browser-runtime.zip"],
    ["browserManifestHash", "browser-manifest.json"],
    ["frontendManifestHash", "frontend-build-manifest.json"],
  ])
    need(
      eq(receipt.runtimePins?.[field], pins.get(file)),
      "runtime pin " + field,
    );
  const proof = receipt.processProof;
  need(
    proof?.mainProcesses === 1 &&
      [
        "pipeObserved",
        "noSandboxSwitchAbsent",
        "privateProfileObserved",
        "exactExecutableObserved",
      ].every((k) => proof[k] === true),
    "actual process boundary",
  );
  need(
    receipt.teardown?.chromeProcesses === 0 &&
      receipt.teardown?.frontendPortReleased === true,
    "process teardown",
  );
  need(
    Array.isArray(manifest.files) &&
      manifest.files.length > 0 &&
      manifest.files.length <= 300,
    "artifact manifest",
  );
  const entries = new Map();
  for (const item of manifest.files) {
    need(
      !entries.has(item.path) && item.path !== "browser-artifact-manifest.json",
      "duplicate manifest artifact",
    );
    const data = bytes(item.path);
    need(
      Number.isSafeInteger(item.bytes) &&
        item.bytes === data.length &&
        eq(hash(data), item.sha256),
      "artifact content drift",
    );
    entries.set(item.path, item);
  }
  need(
    same(
      [...list(directory)].sort(),
      [...entries.keys(), "browser-artifact-manifest.json"].sort(),
    ),
    "unlisted or missing artifact",
  );
  const referenced = new Set(["browser-receipt.json"]);
  const expectedTransport = [];
  const checked = (name, expected) => {
    need(
      entries.has(name) && eq(entries.get(name).sha256, expected),
      "reference hash mismatch",
    );
    referenced.add(name);
    return bytes(name);
  };
  need(
    Array.isArray(receipt.owners) &&
      receipt.owners.length === fixture.owners.length,
    "owner count",
  );
  for (const [index, owner] of fixture.owners.entries()) {
    const observed = receipt.owners[index],
      stem = "owner-" + (index + 1);
    need(
      observed.id === owner.id &&
        same(observed.denied, []) &&
        same(observed.pageErrors, []),
      "owner isolation or page failure",
    );
    const png = checked(stem + ".png", observed.screenshotHash);
    need(
      png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "screenshot format",
    );
    need(
      checked(stem + ".aria.txt", observed.accessibilityHash).length > 0,
      "accessibility absent",
    );
    need(
      Array.isArray(observed.responses) &&
        observed.responses.length > 0 &&
        observed.responses.length <= 128,
      "response inventory",
    );
    const records = new Map(),
      sequences = new Set();
    for (const response of observed.responses) {
      need(
        Number.isInteger(response.sequence) &&
          response.sequence > 0 &&
          !sequences.has(response.sequence) &&
          response.artifact ===
            stem + "-response-" + response.sequence + ".json",
        "response identity",
      );
      sequences.add(response.sequence);
      const envelope = decode(
        checked(response.artifact, response.artifactHash),
      );
      for (const key of [
        "sequence",
        "path",
        "method",
        "requestOwnerId",
        "bodyHash",
        "artifact",
      ])
        need(same(envelope[key], response[key]), "response envelope");
      need(
        typeof envelope.bodyUtf8 === "string" &&
          Buffer.byteLength(envelope.bodyUtf8) <= 4 * 1024 * 1024 &&
          eq(hash(envelope.bodyUtf8), response.bodyHash),
        "response body hash",
      );
      const body = JSON.parse(envelope.bodyUtf8);
      need(
        response.path === "/api/auth/session"
          ? response.method === "POST"
          : response.method === "GET",
        "response method",
      );
      need(
        response.requestOwnerId ===
          (response.method === "GET" ? owner.id : null),
        "request owner binding",
      );
      if (response.path === "/api/auth/session")
        need(body.userId === owner.id, "session owner");
      else if (response.path === "/api/recipients")
        need(
          same(
            body.recipients.map((x) => x.id).sort(),
            [...owner.recipientIds].sort(),
          ),
          "recipient owners",
        );
      else
        need(
          [
            "/api/personal/cards",
            "/api/personal/briefings",
            "/api/v2/concierge",
            "/api/v2/concierge/opportunity-feedback",
            "/api/v2/concierge/opportunity-follow-through",
          ].includes(response.path) ||
            questionRequestKind(response.path, owner) !== null,
          "unapproved response",
        );
      if (questionRequestKind(response.path, owner) !== null)
        questionResponse(response.path, body, owner);
      let scoped = [];
      if (response.path === "/api/v2/concierge") {
        need(
          body.version === 1 &&
            Array.isArray(body.opportunities) &&
            Array.isArray(body.recommendations) &&
            Array.isArray(body.insights),
          "workspace response shape",
        );
        scoped = [
          ...body.opportunities.map((x) => ({ recipientId: x.recipient.id })),
          ...body.recommendations,
          ...body.insights,
        ];
      }
      if (
        [
          "/api/v2/concierge/opportunity-feedback",
          "/api/v2/concierge/opportunity-follow-through",
        ].includes(response.path)
      ) {
        need(Array.isArray(body.history), "history response shape");
        scoped = body.history;
      }
      for (const row of scoped)
        need(
          owner.recipientIds.includes(row.recipientId) &&
            (!("ownerId" in row) || row.ownerId === owner.id),
          "captured response cross-owner payload",
        );
      if (response.path === "/api/personal/briefings") {
        need(Array.isArray(body.answers), "briefing response shape");
        for (const row of body.answers)
          need(
            row.userId === owner.id &&
              owner.recipientIds.includes(row.recipientId),
            "briefing owner",
          );
      }
      // Card data is a free-form payload; this qualifies only exposed owner/recipient
      // identifiers, not undisclosed ownership metadata removed by the API.
      if (response.path === "/api/personal/cards") {
        need(Array.isArray(body.cards), "card response shape");
        for (const row of body.cards)
          need(
            row &&
              typeof row === "object" &&
              (!("userId" in row) || row.userId === owner.id) &&
              (!("recipientId" in row) ||
                owner.recipientIds.includes(row.recipientId)),
            "card exposed owner",
          );
      }
      records.set(response.artifact, { response, body });
    }
    need(
      [...records.values()].some(
        (x) => x.response.path === "/api/auth/session",
      ) &&
        [...records.values()].some(
          (x) => x.response.path === "/api/recipients",
        ),
      "hydration evidence",
    );
    const workspaceBodies = [...records.values()]
      .filter((x) => x.response.path === "/api/v2/concierge")
      .map((x) => x.body);
    const questionRecipientIds = [
      ...new Set(
        [...records.values()]
          .filter((x) =>
            ["fresh", "question"].includes(
              questionRequestKind(x.response.path, owner),
            ),
          )
          .map((x) => x.response.path.split("/")[4]),
      ),
    ].sort();
    const healthRecipientIds = [
      ...new Set(
        [...records.values()]
          .filter(
            (x) => questionRequestKind(x.response.path, owner) === "health",
          )
          .flatMap((x) => x.body.scores.map((score) => score.recipientId)),
      ),
    ].sort();
    const insightRecipientIds = [
      ...new Set(
        workspaceBodies.flatMap((body) =>
          body.insights.map((insight) => insight.recipientId),
        ),
      ),
    ].sort();
    const transportExpectation = {
      ownerId: owner.id,
      recipientIds: [...owner.recipientIds],
      questionRecipientIds,
      healthRecipientIds,
      selectedInsightRecipientId: null,
      insightRecipientIds,
    };
    expectedTransport.push(transportExpectation);
    const cycle = (refs) => {
      need(Array.isArray(refs) && refs.length === 3, "cycle references");
      return refs.map((ref, i) => {
        const record = records.get(ref.artifact);
        need(
          record &&
            same(record.response, ref) &&
            ref.path ===
              [
                "/api/v2/concierge",
                "/api/v2/concierge/opportunity-feedback",
                "/api/v2/concierge/opportunity-follow-through",
              ][i],
          "cycle binding",
        );
        return record.body;
      });
    };
    need(
      Array.isArray(observed.assertions) && observed.assertions.length === 4,
      "assertion inventory",
    );
    for (const [i, assertion] of observed.assertions.entries()) {
      const data = checked(assertion.file, assertion.sha256);
      if (i === 0 || i === 2) {
        const transition = i === 0 ? "initial-workspace" : "returned-workspace";
        need(
          assertion.file === stem + "-" + transition + "-assertions.json",
          "assertion path",
        );
        const projection = decode(data),
          [workspace, feedback, follow] = cycle(projection.responseRecords);
        need(
          projection.transition === transition &&
            workspace.version === 1 &&
            workspace.opportunities.length > 0,
          "workspace evidence",
        );
        for (const row of [
          ...workspace.opportunities.map((x) => ({
            recipientId: x.recipient.id,
          })),
          ...workspace.recommendations,
          ...workspace.insights,
          ...feedback.history,
          ...follow.history,
        ])
          need(
            owner.recipientIds.includes(row.recipientId) &&
              (!("ownerId" in row) || row.ownerId === owner.id),
            "cross-owner payload",
          );
        const refs = projection.question?.responseRecords;
        need(
          Array.isArray(refs) && refs.length === 3,
          "question cycle references",
        );
        const captures = refs.map((ref) => {
          const row = records.get(ref.artifact);
          need(row && same(row.response, ref), "question envelope binding");
          return { record: row.response, body: row.body };
        });
        const hydrated = [...records.values()].find(
          (x) => x.response.path === "/api/recipients",
        ).body.recipients;
        const expectedQuestion = questionProjection(
          captures,
          owner,
          hydrated,
          workspace.insights,
        );
        if (transportExpectation.selectedInsightRecipientId === null)
          transportExpectation.selectedInsightRecipientId =
            expectedQuestion.selectedInsightRecipientId;
        else
          need(
            transportExpectation.selectedInsightRecipientId ===
              expectedQuestion.selectedInsightRecipientId,
            "selected insight cycle identity",
          );
        need(
          same(expectedQuestion.insightRecipientIds, insightRecipientIds),
          "observed insight inventory",
        );
        need(
          same(projection.question, expectedQuestion),
          "question projection",
        );
        const dom = projection.questionDom;
        need(
          dom?.claim === "panel-presence-only" &&
            dom?.recipientId === expectedQuestion.recipientId,
          "question DOM recipient",
        );
        if (expectedQuestion.nextQuestion === null)
          need(dom.state === "absent", "absent question DOM");
        else
          need(
            ["answer-control", "no-answer-control"].includes(dom.state) &&
              typeof dom.title === "string" &&
              dom.title.length > 0 &&
              dom.title.length <= 4096 &&
              (dom.state === "answer-control"
                ? dom.answerEmpty === true
                : dom.answerEmpty === null &&
                  dom.title === "I already know enough for now"),
            "question DOM observation",
          );
        const expected = presented(workspace.opportunities).map(
          ({ id, title, explanation, recommendation }) => ({
            id,
            title,
            explanation,
            recommendation,
          }),
        );
        need(
          same(projection.presented, expected) &&
            same(projection.feedback, current(feedback.history)) &&
            same(projection.followThrough, current(follow.history)),
          "UI response projection",
        );
        if (i === 2)
          need(
            observed.observedOpportunityCount ===
              workspace.opportunities.length &&
              same(
                observed.presentedIds,
                expected.map((x) => x.id),
              ) &&
              observed.feedbackCount === projection.feedback.length &&
              observed.followThroughCount === projection.followThrough.length,
            "final owner projection",
          );
      } else {
        need(
          assertion.file ===
            stem +
              "-" +
              (i === 1 ? "conversation" : "workspace") +
              ".aria.txt" && data.length > 0,
          "tab accessibility",
        );
        cycle(assertion.responseRecords);
      }
    }
  }
  need(
    same(integrity.browserTransport.owners, expectedTransport),
    "question input transport references",
  );
  need(
    same([...entries.keys()].sort(), [...referenced].sort()),
    "unreferenced artifact",
  );
  return { browserQualified: true, realAuthenticationQualified: false };
}
