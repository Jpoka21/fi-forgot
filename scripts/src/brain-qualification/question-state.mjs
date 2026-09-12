import assert from 'node:assert/strict';

/** These GETs may materialize understanding and expire due questions. */
export async function captureQuestionState(call, owners, readFollowUps) {
  const selections = [];
  for (const owner of owners) {
    const other = owners.find(candidate => candidate.id !== owner.id);
    assert.ok(other);
    for (const recipientId of owner.recipientIds) {
      for (const endpoint of ['next-question', 'fresh-updates']) {
        await assert.rejects(() => call(`/v2/recipients/${recipientId}/${endpoint}`, other.id), /returned 403|returned 404/);
      }
      const selection = await call(`/v2/recipients/${recipientId}/next-question`, owner.id);
      assert.equal(typeof selection.profileComplete, 'boolean');
      assert.ok(Number.isFinite(selection.profileScore));
      assert.ok(selection.nextQuestion === null || (typeof selection.nextQuestion === 'object' && typeof selection.nextQuestion.question === 'string'));
      selections.push({ownerId: owner.id, recipientId, selection});
    }
  }
  const followUps = JSON.parse(JSON.stringify(await readFollowUps()));
  // No follow-ups are declared by the approved fixture. Never invent them to
  // claim expiry coverage; actual unexpected rows are a qualification failure.
  assert.deepEqual(followUps, [], 'undeclared follow-up state appeared');
  return {
    kind: 'BRAIN-QUESTION-STATE',
    selectionMayMaterializeUnderstanding: true,
    selectionMayExpireFollowUps: true,
    followUpExpiryBranchQualified: false,
    selections,
    followUps,
  };
}

export function verifyQuestionState(state, fixture) {
  assert.equal(state?.kind, 'BRAIN-QUESTION-STATE');
  assert.equal(state.selectionMayMaterializeUnderstanding, true);
  assert.equal(state.selectionMayExpireFollowUps, true);
  assert.equal(state.followUpExpiryBranchQualified, false);
  assert.deepEqual(state.followUps, []);
  const expected = fixture.owners.flatMap(owner => owner.recipientIds.map(recipientId => `${owner.id}/${recipientId}`)).sort();
  assert.deepEqual(state.selections.map(row => `${row.ownerId}/${row.recipientId}`).sort(), expected);
  for (const {selection} of state.selections) {
    assert.equal(typeof selection.profileComplete, 'boolean');
    assert.ok(Number.isFinite(selection.profileScore));
    assert.ok(selection.nextQuestion === null || (typeof selection.nextQuestion === 'object' && typeof selection.nextQuestion.question === 'string'));
  }
  return {questionSelectionStateQualified: true, followUpExpiryBranchQualified: false};
}
