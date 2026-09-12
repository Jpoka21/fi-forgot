import assert from "node:assert/strict";

export async function runQuestionInputHookProbe(page, bundleBytes, pins) {
  await page.route("**/*", (route) => route.abort("blockedbyclient"));
  await page.setContent(
    '<!doctype html><html><body><div id="root"></div></body></html>',
  );
  await page.addScriptTag({
    content: Buffer.from(bundleBytes).toString("utf8"),
  });
  const realReact = await page.evaluate(
    () => globalThis.__questionInputFixture.realReact,
  );
  assert.equal(realReact.createRoot, true);
  assert.match(realReact.reactVersion, /^\d+\./);
  const flush = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  const pending = () =>
    page.evaluate(() => globalThis.__questionInputFixture.pending());
  const snapshot = (label) =>
    page.evaluate(
      (label) => globalThis.__questionInputFixture.snapshot(label),
      label,
    );
  const mount = async (id, label) => {
    await page.evaluate(
      ([id, label]) => globalThis.__questionInputFixture.mount(id, label),
      [id, label],
    );
    if (id)
      await page.waitForFunction(
        (id) =>
          globalThis.__questionInputFixture
            .pending()
            .filter(
              (row) =>
                row.url.includes(`/recipients/${id}/`) ||
                row.url.endsWith("/recipient-health"),
            ).length >= 3,
        id,
      );
    else
      await page.waitForFunction(
        () =>
          globalThis.__questionInputFixture.snapshot()?.recipientId === null,
      );
    await page.waitForFunction(
      (label) => globalThis.__questionInputFixture.captured(label),
      label,
    );
  };
  const settle = async (
    recipientId,
    { last = false, rejectQuestion = false, expectVisible = true } = {},
  ) => {
    const rows = await pending(),
      pick = (values) => (last ? values.at(-1) : values[0]),
      fresh = pick(
        rows.filter((row) => row.url.includes(`/${recipientId}/fresh-updates`)),
      ),
      next = pick(
        rows.filter((row) => row.url.includes(`/${recipientId}/next-question`)),
      ),
      health = pick(
        rows.filter((row) => row.url.endsWith("/recipient-health")),
      );
    assert.ok(fresh && next && health);
    await page.evaluate(
      (x) => {
        const f = globalThis.__questionInputFixture;
        f.settle(x.fresh, {
          freshUpdates: [
            {
              id: `fresh-${x.recipientId}`,
              questionKey: "recent_memory",
              questionText: "Active",
              answerText: x.recipientId,
              createdAt: "2026-09-12T00:00:00.000Z",
              daysAgo: 0,
              ageCategory: "recent",
            },
          ],
        });
        x.rejectQuestion
          ? f.reject(x.next)
          : f.settle(x.next, {
              nextQuestion: {
                fieldKey: "recent_memory",
                fieldLabel: "Recent memory",
                category: "update",
                priority: "normal",
                question: `Raw server question ${x.recipientId}`,
                reason: "Synthetic",
                mode: "fresh_update",
              },
              profileComplete: x.recipientId === "recipient-a",
              profileScore: x.recipientId === "recipient-a" ? 100 : 40,
            });
        f.settle(x.health, {
          scores: [
            {
              recipientId: "recipient-a",
              name: "Same Name",
              score: 80,
              status: "Healthy",
              nextEventLabel: null,
              nextEventDaysAway: null,
              lastUpdateDaysAgo: 0,
              pendingFollowUps: 0,
            },
            {
              recipientId: "recipient-b",
              name: "Same Name",
              score: 40,
              status: "Priority",
              nextEventLabel: null,
              nextEventDaysAway: null,
              lastUpdateDaysAgo: 0,
              pendingFollowUps: 0,
            },
          ],
        });
      },
      {
        fresh: fresh.id,
        next: next.id,
        health: health.id,
        recipientId,
        rejectQuestion,
      },
    );
    if (expectVisible)
      await page.waitForFunction(
        ([id, rejected]) => {
          const s = globalThis.__questionInputFixture.snapshot();
          return (
            s?.recipientId === id &&
            s.healthRecipientId === id &&
            (rejected ? s.question === null : !!s.question)
          );
        },
        [recipientId, rejectQuestion],
      );
  };
  const cases = [],
    passed = (name, outcome) => cases.push({ name, passed: true, outcome });
  await mount("recipient-a", "delay-a");
  await mount("recipient-b", "delay-b");
  await settle("recipient-b", { last: true });
  const expectedB = await snapshot();
  const reversedBefore = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  await settle("recipient-a", { expectVisible: false });
  await flush();
  assert.deepEqual(await snapshot(), expectedB);
  const reversedSuccessAfter = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  assert.equal(reversedSuccessAfter.requestsCreated - reversedBefore.requestsCreated, 0);
  await mount("recipient-a", "delay-reject-a");
  await mount("recipient-b", "delay-reject-b");
  await settle("recipient-b", { last: true });
  const expectedRejectedB = await snapshot();
  const reversedRejectBefore = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  await settle("recipient-a", { expectVisible: false, rejectQuestion: true });
  await flush();
  assert.deepEqual(await snapshot(), expectedRejectedB);
  const reversedRejectAfter = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  assert.equal(reversedRejectAfter.requestsCreated - reversedRejectBefore.requestsCreated, 0);
  passed("reversed-delayed-load", {
    visible: "recipient-b",
    stale: "recipient-a",
    stateUnchanged: true,
    requestDelta: 0,
    staleSuccess: true,
    staleRejection: true,
  });
  await mount("recipient-a", "a-old");
  await settle("recipient-a");
  assert.equal((await snapshot()).healthRecipientId, "recipient-a");
  await page.evaluate(() =>
    globalThis.__questionInputFixture.setAnswer("old draft"),
  );
  await page.waitForFunction(
    () =>
      globalThis.__questionInputFixture.snapshot().answerText === "old draft",
  );
  const transformed = await page.evaluate(() =>
    globalThis.__questionInputFixture.productionPayload("transformed"),
  );
  await page.evaluate((payload) => {
    globalThis.__startedSave = globalThis.__questionInputFixture.save(payload);
  }, transformed);
  await page.waitForFunction(() =>
    globalThis.__questionInputFixture
      .pending()
      .some((row) => row.method === "POST"),
  );
  let rows = await pending(),
    post = rows.find((row) => row.method === "POST");
  assert.equal(post.url, "/api/v2/recipients/recipient-a/answer-question");
  await mount("recipient-b", "b-failed");
  await settle("recipient-b", { rejectQuestion: true });
  assert.equal((await snapshot()).question, null);
  const failedB = await snapshot();
  passed("failed-second-load", { recipientId: "recipient-b", question: null, savingAnswer: false });
  await page.evaluate(
    (id) => globalThis.__questionInputFixture.settle(id, { ok: true }),
    post.id,
  );
  await flush();
  assert.deepEqual(await snapshot(), failedB);
  passed("started-save-new-view", {
    target: "recipient-a",
    visible: "recipient-b",
    answerSaved: false,
    stateUnchanged: true,
  });
  await mount("recipient-a", "a-new");
  await settle("recipient-a");
  const before = await snapshot(),
    beforePending = (await pending()).length;
  await page.evaluate(() => {
    const f = globalThis.__questionInputFixture;
    f.setAnswer("stale", "a-old");
    f.setSkipped(true, "a-old");
    f.reload("a-old");
    f.save(
      { fieldKey: "recent_memory", question: "stale", mode: "fresh_update" },
      "a-old",
    );
  });
  await flush();
  assert.deepEqual(await snapshot(), before);
  assert.equal((await pending()).length, beforePending);
  passed("retained-a-b-a-callbacks", { requests: 0, state: "unchanged" });
  await page.evaluate(() => globalThis.__questionInputFixture.setAnswer("ready draft before null"));
  await page.waitForFunction(() => { const state=globalThis.__questionInputFixture.snapshot("a-new"); return state?.answerText === "ready draft before null" && !!state.question; });
  const nullPending = (await pending()).length;
  await mount(null, "none");
  await page.evaluate(() => {
    const f = globalThis.__questionInputFixture;
    f.setAnswer("stale", "a-new");
    f.setSkipped(true, "a-new");
    f.reload("a-new");
    f.save({ fieldKey: "recent_memory", question: "stale", mode: "fresh_update" }, "a-new");
  });
  await flush();
  const nullState = await snapshot();
  assert.equal(nullState.recipientId, null);
  assert.equal((await pending()).length, nullPending);
  passed("selection-null", { state: "unavailable", requests: 0, snapshot: nullState });
  await mount("recipient-a", "timer-a");
  await settle("recipient-a");
  await page.evaluate(() =>
    globalThis.__questionInputFixture.setAnswer("timer draft"),
  );
  await page.waitForFunction(
    () =>
      globalThis.__questionInputFixture.snapshot().answerText === "timer draft",
  );
  await page.evaluate((payload) => {
    globalThis.__timerSave = globalThis.__questionInputFixture.save(payload);
  }, transformed);
  await page.waitForFunction(() =>
    globalThis.__questionInputFixture
      .pending()
      .some((row) => row.method === "POST"),
  );
  rows = await pending();
  post = rows.find((row) => row.method === "POST");
  await page.evaluate(
    (id) => globalThis.__questionInputFixture.settle(id, { ok: true }),
    post.id,
  );
  await page.waitForFunction(
    () => globalThis.__questionInputFixture.snapshot().answerSaved === true,
  );
  await mount("recipient-b", "timer-b");
  await settle("recipient-b");
  await page.evaluate(() => { const f=globalThis.__questionInputFixture; f.setAnswer("distinct b draft"); f.setSkipped(true); });
  await page.waitForFunction(() => globalThis.__questionInputFixture.snapshot().answerText === "distinct b draft");
  await page.waitForFunction(() => { const state=globalThis.__questionInputFixture.snapshot("timer-b"); return state?.answerText === "distinct b draft" && !!state.question; });
  const timerBefore = await snapshot(), timerPending = (await pending()).length, countersBefore = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  await page.evaluate(() => globalThis.__questionInputFixture.runSaveTimers());
  await flush();
  assert.deepEqual(await snapshot(), timerBefore);
  assert.equal((await pending()).length, timerPending);
  const countersAfter = await page.evaluate(() => globalThis.__questionInputFixture.counters());
  assert.equal(countersAfter.savedEvents, countersBefore.savedEvents);
  assert.ok(countersAfter.timerCallbacksRun - countersBefore.timerCallbacksRun > 0);
  passed("delayed-timer-new-view", {
    visible: "recipient-b",
    staleTimerIgnored: true,
    stateUnchanged: true,
    requestDelta: 0,
    eventDelta: 0,
    timerCallbacksRun: countersAfter.timerCallbacksRun - countersBefore.timerCallbacksRun,
  });
  const retained = "timer-b";
  await page.evaluate(() => globalThis.__questionInputFixture.unmount());
  await flush();
  const count = (await pending()).length;
  await page.evaluate((label) => {
    const f = globalThis.__questionInputFixture;
    f.setAnswer("stale", label);
    f.setSkipped(true, label);
    f.reload(label);
    f.save({ fieldKey: "recent_memory", question: "stale", mode: "fresh_update" }, label);
  }, retained);
  await flush();
  assert.equal((await pending()).length, count);
  passed("unmount-retained-callbacks", { requests: 0, state: "unmounted" });
  for (const [kind, name] of [
    ["transformed", "production-transformed-save"],
    ["alternate", "production-alternate-save"],
  ]) {
    await mount("recipient-a", name);
    await settle("recipient-a");
    const payload = await page.evaluate(
      (kind) => globalThis.__questionInputFixture.productionPayload(kind),
      kind,
    );
    await page.evaluate(
      (name) => globalThis.__questionInputFixture.setAnswer(`${name} answer`),
      name,
    );
    await page.waitForFunction(
      () => globalThis.__questionInputFixture.snapshot().answerText.length > 0,
    );
    await page.evaluate((payload) => {
      globalThis.__productionSave =
        globalThis.__questionInputFixture.save(payload);
    }, payload);
    await page.waitForFunction(() =>
      globalThis.__questionInputFixture
        .pending()
        .some((row) => row.method === "POST"),
    );
    rows = await pending();
    post = rows.find((row) => row.method === "POST");
    assert.deepEqual(
      {
        fieldKey: post.body.fieldKey,
        question: post.body.questionText,
        mode: post.body.triggerType,
      },
      {
        fieldKey: payload.fieldKey,
        question: payload.question,
        mode: payload.mode,
      },
    );
    await page.evaluate(
      (id) => globalThis.__questionInputFixture.settle(id, { ok: true }),
      post.id,
    );
    await page.waitForFunction(
      () => globalThis.__questionInputFixture.snapshot().answerSaved === true,
    );
    passed(name, {
      fieldKey: payload.fieldKey,
      question: payload.question,
      requestRecipient: "recipient-a",
    });
    await mount(null, `${name}-done`);
  }
  return {
    kind: "QUESTION-INPUT-MOUNTED-SYNTHETIC",
    success: true,
    cases,
    controlledPromiseResults: cases.length,
    productionHookHash: pins.hookHash,
    bundleHash: pins.bundleHash,
    realReact,
    mockedReact: false,
    authenticationQualified: false,
    persistenceQualified: false,
  };
}
