import { currentObservationVersions, observationHistory, exactDependenciesValid } from './versioned-understanding';
import type { Request as ExpressRequest, Response } from 'express';
type Request = ExpressRequest<Record<string,string>>;
import type { db as productionDb } from '@workspace/db';
import { recipientsTable, questionAnswersTable, personalCardsTable, followUpQuestionsTable, relationshipObservationVersionsTable, relationshipObservationHeadsTable, relationshipInterpretationsTable, relationshipInterpretationDependenciesTable, relationshipInterpretationActionsTable } from '@workspace/db/schema';
import { and, eq, desc, isNull, isNotNull, ne, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { projectRelationshipMemoryEvidence, executeRelationshipAnswerMutation, MUTABLE_ANSWER_TRIGGER_TYPES, type RelationshipAnswerRepository, type RelationshipAnswerScope, type RelationshipAnswerMutation } from './relationship-memory-evidence';
export type UnderstandingDatabase = typeof productionDb;
/** Capture only current source truth. Never reconstruct missing prior edits. */
export async function captureUnversionedAnswers(db: UnderstandingDatabase, scope: {userId:string;recipientId:string}) {
 const owned=await db.select({id:recipientsTable.id}).from(recipientsTable).where(and(eq(recipientsTable.id,scope.recipientId),eq(recipientsTable.userId,scope.userId))).limit(1);
 if(!owned.length)return false;
 const answers=await db.select().from(questionAnswersTable).where(and(eq(questionAnswersTable.userId,scope.userId),eq(questionAnswersTable.recipientId,scope.recipientId),eq(questionAnswersTable.wasSkipped,false)));
 const versions=await db.select().from(relationshipObservationVersionsTable).where(and(eq(relationshipObservationVersionsTable.userId,scope.userId),eq(relationshipObservationVersionsTable.recipientId,scope.recipientId)));
 const current=new Map(currentObservationVersions(versions).map(v=>[v.sourceRecordId,v]));
 for(const answer of answers){
  if(current.has(answer.id))continue;
  const id=randomUUID();const capturedAt=new Date();
  await db.insert(relationshipObservationVersionsTable).values({id,...scope,sourceRecordId:answer.id,sourceKind:'user_report',semanticClassification:'reported_information',sourceProvenance:{table:'question_answers',capture:'current_source_snapshot',sourceRecordedAt:answer.createdAt?.toISOString()??null},text:answer.answerText,version:1,lifecycleState:answer.archivedAt?'archived':'active',recordedAt:capturedAt,observedAt:null,occurredAt:null,confidence:null,relationshipId:null,actorUserId:answer.userId});
  await db.insert(relationshipObservationHeadsTable).values({...scope,sourceRecordId:answer.id,currentVersionId:id,revision:1,updatedAt:capturedAt});
 }
 return true;
}
type Authenticate = (req: Request, res: Response) => string | null;
function buildHandlers(db: UnderstandingDatabase, requireUserId: Authenticate) {
const relationshipAnswerRepository: RelationshipAnswerRepository = {
  async read(scope) {
    const [row] = await db
      .select()
      .from(questionAnswersTable)
      .where(
        and(
          eq(questionAnswersTable.id, scope.answerId),
          eq(questionAnswersTable.userId, scope.userId),
          eq(questionAnswersTable.recipientId, scope.recipientId),
        ),
      )
      .limit(1);
    return row ?? null;
  },
  async write(scope, mutation, expectedArchived) {
    return db.transaction(async (tx) => {
      const [head] = await tx
        .select()
        .from(relationshipObservationHeadsTable)
        .where(
          and(
            eq(relationshipObservationHeadsTable.userId, scope.userId),
            eq(
              relationshipObservationHeadsTable.recipientId,
              scope.recipientId,
            ),
            eq(
              relationshipObservationHeadsTable.sourceRecordId,
              scope.answerId,
            ),
          ),
        )
        .limit(1);
      const [current] = head
        ? await tx
            .select()
            .from(relationshipObservationVersionsTable)
            .where(
              eq(
                relationshipObservationVersionsTable.id,
                head.currentVersionId,
              ),
            )
            .limit(1)
        : await tx
            .select()
            .from(relationshipObservationVersionsTable)
            .where(
              and(
                eq(relationshipObservationVersionsTable.userId, scope.userId),
                eq(
                  relationshipObservationVersionsTable.recipientId,
                  scope.recipientId,
                ),
                eq(
                  relationshipObservationVersionsTable.sourceRecordId,
                  scope.answerId,
                ),
              ),
            )
            .orderBy(desc(relationshipObservationVersionsTable.version))
            .limit(1);
      if (
        mutation.expectedVersionId &&
        current?.id !== mutation.expectedVersionId
      )
        return null;
      const values =
        mutation.action === "edit"
          ? { answerText: mutation.answerText }
          : { archivedAt: mutation.action === "archive" ? new Date() : null };
      const [row] = await tx
        .update(questionAnswersTable)
        .set(values)
        .where(
          and(
            eq(questionAnswersTable.id, scope.answerId),
            eq(questionAnswersTable.userId, scope.userId),
            eq(questionAnswersTable.recipientId, scope.recipientId),
            inArray(questionAnswersTable.triggerType, [
              ...MUTABLE_ANSWER_TRIGGER_TYPES,
            ]),
            expectedArchived
              ? isNotNull(questionAnswersTable.archivedAt)
              : isNull(questionAnswersTable.archivedAt),
          ),
        )
        .returning();
      if (!row) return null;
      const requiredState =
        mutation.action === "restore" ? "archived" : "active";
      if (current && current.lifecycleState !== requiredState)
        throw new Error("STALE_OBSERVATION_VERSION");
      const version = (current?.version ?? 0) + 1;
      const versionId = `answer:${scope.answerId}:v${version}:${randomUUID()}`;

      await tx.insert(relationshipObservationVersionsTable).values({
        id: versionId,
        userId: scope.userId,
        recipientId: scope.recipientId,
        sourceRecordId: scope.answerId,
        sourceKind: "user_report",
        semanticClassification: "reported_information",
        sourceProvenance: {
          table: "question_answers",
          ...(current?.sourceProvenance as Record<string,unknown> ?? {}),
          capture: "transactional_current_state",
          operationId: mutation.operationId ?? null,
        },
        text: row.answerText,
        version,
        lifecycleState: row.archivedAt ? "archived" : "active",
        supersedesVersionId: current?.id ?? null,
        actorUserId: scope.userId,
        recordedAt: new Date(),
        observedAt:current?.observedAt??null,occurredAt:current?.occurredAt??null,relationshipId:current?.relationshipId??null,
      });
      if (head) {
        const changed = await tx
          .update(relationshipObservationHeadsTable)
          .set({
            currentVersionId: versionId,
            revision: head.revision + 1,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(relationshipObservationHeadsTable.userId, scope.userId),
              eq(
                relationshipObservationHeadsTable.recipientId,
                scope.recipientId,
              ),
              eq(
                relationshipObservationHeadsTable.sourceRecordId,
                scope.answerId,
              ),
              eq(
                relationshipObservationHeadsTable.currentVersionId,
                current!.id,
              ),
              eq(relationshipObservationHeadsTable.revision, head.revision),
            ),
          )
          .returning({
            id: relationshipObservationHeadsTable.currentVersionId,
          });
        if (!changed.length) throw new Error("STALE_OBSERVATION_VERSION");
      } else
        await tx.insert(relationshipObservationHeadsTable).values({
          userId: scope.userId,
          recipientId: scope.recipientId,
          sourceRecordId: scope.answerId,
          currentVersionId: versionId,
          revision: 1,
        });
      return row;
    });
  },
};

async function respondToAnswerMutation(
  res: any,
  scope: RelationshipAnswerScope,
  mutation: RelationshipAnswerMutation,
) {
  const result = await executeRelationshipAnswerMutation(
    relationshipAnswerRepository,
    scope,
    mutation,
  );
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({ ok: true });
}


const timeline = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({
      id: recipientsTable.id,
      birthday: recipientsTable.birthday,
      anniversary: recipientsTable.anniversary,
    })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }

  const [answers, cards, followUps] = await Promise.all([
    db
      .select()
      .from(questionAnswersTable)
      .where(
        and(
          eq(questionAnswersTable.recipientId, id),
          eq(questionAnswersTable.userId, userId),
          eq(questionAnswersTable.wasSkipped, false),
        ),
      )
      .orderBy(desc(questionAnswersTable.createdAt)),
    db
      .select()
      .from(personalCardsTable)
      .where(
        and(
          eq(personalCardsTable.recipientId, id),
          eq(personalCardsTable.userId, userId),
          ne(personalCardsTable.status, "draft"),
        ),
      )
      .orderBy(desc(personalCardsTable.createdAt)),
    db
      .select()
      .from(followUpQuestionsTable)
      .where(
        and(
          eq(followUpQuestionsTable.recipientId, id),
          eq(followUpQuestionsTable.userId, userId),
          inArray(followUpQuestionsTable.status, [
            "answered",
            "pending",
            "expired",
          ]),
        ),
      )
      .orderBy(desc(followUpQuestionsTable.createdAt)),
  ]);

  const [
    observationVersions,
    interpretations,
    ignoredDependencies,
    interpretationActions,
  ] = await Promise.all([
    db
      .select()
      .from(relationshipObservationVersionsTable)
      .where(
        and(
          eq(relationshipObservationVersionsTable.userId, userId),
          eq(relationshipObservationVersionsTable.recipientId, id),
        ),
      )
      .orderBy(desc(relationshipObservationVersionsTable.recordedAt)),
    db
      .select()
      .from(relationshipInterpretationsTable)
      .where(
        and(
          eq(relationshipInterpretationsTable.userId, userId),
          eq(relationshipInterpretationsTable.recipientId, id),
        ),
      )
      .orderBy(desc(relationshipInterpretationsTable.createdAt)),
    Promise.resolve([]),
    db
      .select()
      .from(relationshipInterpretationActionsTable)
      .where(
        and(
          eq(relationshipInterpretationActionsTable.userId, userId),
          eq(relationshipInterpretationActionsTable.recipientId, id),
        ),
      )
      .orderBy(desc(relationshipInterpretationActionsTable.newRevision)),
  ]);

  const dependencies=interpretations.length?await db.select().from(relationshipInterpretationDependenciesTable).where(inArray(relationshipInterpretationDependenciesTable.interpretationId,interpretations.map(i=>i.id))):[];
  const items: any[] = projectRelationshipMemoryEvidence({
    answers,
    cards,
    followUps,
    profileDates: [
      { kind: "birthday", value: row.birthday },
      { kind: "anniversary", value: row.anniversary },
    ],
  }).map((evidence) => ({
    ...evidence,
    id: evidence.displayId,
    date: evidence.activityAt ?? evidence.recordedAt ?? evidence.occurrenceAt,
    type: evidence.sourceKind,
    isArchived: evidence.archivedAt !== null,
  }));
  const latestObservations = currentObservationVersions(observationVersions);
  const observationIds = new Set(
    latestObservations
      .filter((v) => v.lifecycleState === "active")
      .map((v) => v.id),
  );
  for (const interpretation of interpretations) {
    const pinned = dependencies
      .filter((d) => d.interpretationId === interpretation.id)
      .map((d) => d.observationVersionId);
    const actions = interpretationActions.filter(
      (action) => action.interpretationId === interpretation.id,
    );
    const valid=exactDependenciesValid(observationVersions,pinned,{userId,recipientId:id});
    const effectiveLifecycle=interpretation.lifecycleState==='active'&&!valid?'superseded':interpretation.lifecycleState;
    items.push({
      id: interpretation.id,
      date: interpretation.createdAt.toISOString(),
      type: "interpretation",
      label: "Your interpretation",
      summary: interpretation.text,
      source: "User-authored interpretation",
      sourceKind: "interpretation",
      semanticClassification: "uncertain_interpretation",
      canArchive: interpretation.lifecycleState === "active",
      canEdit: false,
      canRestore:
        ["archived", "rejected", "withdrawn"].includes(
          interpretation.lifecycleState,
        ) && pinned.every((versionId) => observationIds.has(versionId)),
      isArchived: effectiveLifecycle !== "active",
      evidenceId: null,
      memberEvidenceIds: [],
      recordedAt: interpretation.createdAt.toISOString(),
      activityAt: null,
      occurrenceAt: null,
      observationAt: null,
      version: null,
      revision: interpretation.revision,
      lastOperationId: actions[0]?.operationId ?? null,
      actionHistory: actions.map((action) => ({
        operationId: action.operationId,
        action: action.action,
        actorUserId: action.actorUserId,
        actedAt: action.actedAt.toISOString(),
        expectedRevision: action.expectedRevision,
        newRevision: action.newRevision,
      })),
      lifecycleState: effectiveLifecycle,
      history: [],
      uncertain: true,
      confirmedAt: interpretation.confirmedAt?.toISOString() ?? null,
      endorsementWithdrawnAt:
        interpretation.endorsementWithdrawnAt?.toISOString() ?? null,
      dependencyVersionIds: pinned,
    });
  }
  for (const sourceRecordId of new Set(
    observationVersions
      .map((v) => v.sourceRecordId)
      .filter((value): value is string => Boolean(value)),
  )) {
    const history = observationHistory(observationVersions.filter((v) => v.sourceRecordId === sourceRecordId))
      .map((v) => ({
        id: v.id,
        version: v.version,
        text: v.text,
        lifecycleState: v.lifecycleState,
        stateAtRevision: v.stateAtRevision,
        operationId:(v.sourceProvenance as {operationId?:string}|null)?.operationId??null,
        recordedAt: v.recordedAt.toISOString(),
      }));
    const latest = history.at(-1);
    const existing = items.find((item) => item.evidenceId === sourceRecordId);
    if (existing && latest)
      Object.assign(existing, {
        version: latest.version,
        lifecycleState: latest.lifecycleState,
        lastOperationId:latest.operationId,
        history,
      });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ items });
};
const edit = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id, answerId } = req.params;
  const { answerText, expectedVersionId, operationId } = req.body as {
    operationId?:string;
    answerText?: string;
    expectedVersionId?: string;
  };

  if (typeof answerText !== "string" || answerText.trim().length === 0) {
    res.status(400).json({ error: "answerText is required" });
    return;
  }

  if (!expectedVersionId) {
    res.status(400).json({ error: "expectedVersionId is required" });
    return;
  }
  await respondToAnswerMutation(
    res,
    { userId, recipientId: id, answerId },
    { action: "edit", answerText, expectedVersionId, operationId },
  );
};
const archive = async (req: Request, res: Response) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id, answerId } = req.params;

    const { expectedVersionId, operationId } = req.body as { expectedVersionId?: string;operationId?:string };
    if (!expectedVersionId) {
      res.status(400).json({ error: "expectedVersionId is required" });
      return;
    }
    await respondToAnswerMutation(
      res,
      { userId, recipientId: id, answerId },
      { action: "archive", expectedVersionId, operationId },
    );
  };
const restore = async (req: Request, res: Response) => {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id, answerId } = req.params;

    const { expectedVersionId, operationId } = req.body as { expectedVersionId?: string;operationId?:string };
    if (!expectedVersionId) {
      res.status(400).json({ error: "expectedVersionId is required" });
      return;
    }
    await respondToAnswerMutation(
      res,
      { userId, recipientId: id, answerId },
      { action: "restore", expectedVersionId, operationId },
    );
  };
const createInterpretation = async (req: Request, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { id } = req.params;
  const { text, dependencyVersionIds, operationId } = req.body as {
    text?: string;
    dependencyVersionIds?: string[];
    operationId?: string;
  };
  if (typeof text!=='string'||!text.trim()||!Array.isArray(dependencyVersionIds)||!dependencyVersionIds.length||dependencyVersionIds.some(value=>typeof value!=='string'||!value)||typeof operationId!=='string'||!operationId.trim()||req.body.confidence!=null||req.body.relationshipId!=null) {
    res.status(400).json({
      error: "Text, exact observation versions, and operationId are required",
    });
    return;
  }
  try {
    const interpretationId = randomUUID();
    await db.transaction(async (tx) => {
      const all = await tx
        .select()
        .from(relationshipObservationVersionsTable)
        .where(
          and(
            eq(relationshipObservationVersionsTable.userId, userId),
            eq(relationshipObservationVersionsTable.recipientId, id),
          ),
        );
      const requested = new Set(dependencyVersionIds);
      if(!exactDependenciesValid(all,[...requested],{userId,recipientId:id}))throw new Error("INVALID_DEPENDENCY");
      await tx.insert(relationshipInterpretationsTable).values({
        id: interpretationId,
        userId,
        recipientId: id,
        relationshipId: null,
        text: text.trim(),
        confidence: null,
        actorUserId: userId,
        uncertaintyAcknowledged: true,
        revision: 1,
      });
      await tx.insert(relationshipInterpretationDependenciesTable).values(
        [...requested].map((observationVersionId) => ({
          interpretationId,
          observationVersionId,
        })),
      );
      await tx.insert(relationshipInterpretationActionsTable).values({
        id: randomUUID(),
        interpretationId,
        userId,
        recipientId: id,
        action: "create",
        actorUserId: userId,
        fromLifecycleState: null,
        toLifecycleState: "active",
        endorsementActive: false,
        operationId: operationId.trim(),
        expectedRevision: 0,
        newRevision: 1,
      });
    });
    res.status(201).json({
      ok: true,
      id: interpretationId,
      operationId: operationId.trim(),
      revision: 1,
    });
  } catch (error) {
    if ((error as Error).message === "INVALID_DEPENDENCY") {
      res.status(409).json({
        error:
          "An observation dependency is missing, inactive, or outside scope",
      });
      return;
    }
    throw error;
  }
};
const changeInterpretation = async (req: Request, res: Response) => {
    const userId = requireUserId(req, res);
    if (!userId) return;
    const { id, interpretationId, action } = req.params;
    const { expectedRevision, operationId } = req.body as {
      expectedRevision?: number;
      operationId?: string;
    };
    if (
      !["confirm", "withdraw", "reject", "archive", "restore"].includes(
        action,
      ) ||
      !Number.isInteger(expectedRevision) ||
      (typeof operationId!=='string'||!operationId.trim())
    ) {
      res.status(400).json({
        error:
          "Supported action, expectedRevision, and operationId are required",
      });
      return;
    }
    try {
      const result = await db.transaction(async (tx) => {
        const [item] = await tx
          .select()
          .from(relationshipInterpretationsTable)
          .where(
            and(
              eq(relationshipInterpretationsTable.id, interpretationId),
              eq(relationshipInterpretationsTable.userId, userId),
              eq(relationshipInterpretationsTable.recipientId, id),
            ),
          )
          .limit(1);
        if (!item) throw new Error("NOT_FOUND");
        if (item.revision !== expectedRevision) throw new Error("STALE");
        const dependencies = await tx
          .select()
          .from(relationshipInterpretationDependenciesTable)
          .where(
            eq(
              relationshipInterpretationDependenciesTable.interpretationId,
              interpretationId,
            ),
          );
        if (action === "confirm" || action === "restore") {
          const allVersions = await tx
            .select()
            .from(relationshipObservationVersionsTable)
            .where(
              and(
                eq(relationshipObservationVersionsTable.userId, userId),
                eq(relationshipObservationVersionsTable.recipientId, id),
              ),
            );
          if(!exactDependenciesValid(allVersions,dependencies.map(value=>value.observationVersionId),{userId,recipientId:id}))throw new Error("INVALID_DEPENDENCY");
        }
        let lifecycle = item.lifecycleState;
        let endorsed = Boolean(
          item.confirmedAt && !item.endorsementWithdrawnAt,
        );
        const values: Record<string, unknown> = { revision: item.revision + 1 };
        if (action === "confirm") {
          if (lifecycle !== "active" || endorsed)
            throw new Error("UNSUPPORTED");
          values.confirmedByUserId = userId;
          values.confirmedAt = new Date();
          values.endorsementWithdrawnAt = null;
          endorsed = true;
        } else if (action === "withdraw") {
          if (lifecycle!=="active"||!endorsed) throw new Error("UNSUPPORTED");
          lifecycle = "withdrawn";
          values.lifecycleState = lifecycle;
          values.endorsementWithdrawnAt = new Date();
          endorsed = false;
        } else if (action === "restore") {
          if (!["withdrawn", "rejected", "archived"].includes(lifecycle))
            throw new Error("UNSUPPORTED");
          lifecycle = "active";
          values.lifecycleState = lifecycle;
          values.confirmedByUserId = null;
          values.confirmedAt = null;
          values.endorsementWithdrawnAt = null;
          endorsed = false;
        } else {
          if (lifecycle !== "active") throw new Error("UNSUPPORTED");
          lifecycle = action === "reject" ? "rejected" : "archived";
          values.lifecycleState = lifecycle;
          endorsed=false;values.confirmedByUserId=null;values.confirmedAt=null;
        }
        const updated = await tx
          .update(relationshipInterpretationsTable)
          .set(values)
          .where(
            and(
              eq(relationshipInterpretationsTable.id, interpretationId),
              eq(relationshipInterpretationsTable.userId, userId),
              eq(relationshipInterpretationsTable.recipientId, id),
              eq(relationshipInterpretationsTable.revision, item.revision),
            ),
          )
          .returning({ revision: relationshipInterpretationsTable.revision });
        if (!updated[0]) throw new Error("STALE");
        await tx.insert(relationshipInterpretationActionsTable).values({
          id: randomUUID(),
          interpretationId,
          userId,
          recipientId: id,
          action,
          actorUserId: userId,
          fromLifecycleState: item.lifecycleState,
          toLifecycleState: lifecycle,
          endorsementActive: endorsed,
          operationId: operationId.trim(),
          expectedRevision: item.revision,
          newRevision: updated[0].revision,
        });
        return updated[0];
      });
      res.json({
        ok: true,
        operationId: operationId.trim(),
        revision: result.revision,
      });
    } catch (error) {
      const code = (error as Error).message;
      if (code === "NOT_FOUND") {
        res.status(404).json({ error: "Interpretation not found" });
        return;
      }
      if (["STALE", "INVALID_DEPENDENCY", "UNSUPPORTED"].includes(code)) {
        res.status(409).json({
          error:
            code === "STALE"
              ? "Interpretation revision is stale"
              : code === "INVALID_DEPENDENCY"
                ? "Exact observation dependencies are no longer valid"
                : "Unsupported interpretation transition",
        });
        return;
      }
      throw error;
    }
  };
return { timeline, edit, archive, restore, createInterpretation, changeInterpretation };
}

/** Real route handlers share one scoped, serializable transaction. A response is
 * published only after commit; failed commits can never report a successful write.
 * Dependency decisions and writes serialize with source mutations in this scope. */
export function createVersionedUnderstandingHandlers(database: UnderstandingDatabase, authenticate: Authenticate) {
 const names = ['timeline','edit','archive','restore','createInterpretation','changeInterpretation'] as const;
 const handlers = {} as ReturnType<typeof buildHandlers>;
 for (const name of names) handlers[name] = async (req: Request, res: Response) => {
  const userId=authenticate(req,res); if(!userId)return;
  let status=200; let body: unknown;
  const buffered={status(value:number){status=value;return buffered;},json(value:unknown){body=value;return buffered;}} as unknown as Response;
  try {
   await database.transaction(async tx=>{
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}),hashtext(${req.params.id}))`);
    if(!await captureUnversionedAnswers(tx as unknown as UnderstandingDatabase,{userId,recipientId:req.params.id})){buffered.status(404).json({error:'Recipient not found'});return;}
    await buildHandlers(tx as unknown as UnderstandingDatabase,authenticate)[name](req,buffered);
   },{isolationLevel:'serializable'});
   res.status(status).json(body);
  } catch(error) {
   const code=(error as {code?:string;cause?:{code?:string}}).code??(error as {cause?:{code?:string}}).cause?.code;
   if(code==='40001'||code==='23505'||(error as Error).message==='STALE_OBSERVATION_VERSION') {res.status(409).json({error:'Understanding changed. Reload before trying again.'});return;}
   throw error;
  }
 };
 return handlers;
}
