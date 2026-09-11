import { Router } from 'express';
import { createVersionedUnderstandingHandlers, type UnderstandingDatabase } from '../services/versioned-understanding-repository';

/** Same production handlers and paths; omit the unrelated AI question/delivery graph. */
export function createQualificationUnderstandingRouter(db: UnderstandingDatabase) {
  const router = Router();
  const handlers = createVersionedUnderstandingHandlers(db, (req, res) => {
    const owner = req.headers['x-user-id'];
    if (typeof owner !== 'string' || !owner) { res.status(401).json({ error: 'x-user-id header required' }); return null; }
    return owner;
  });
  router.get('/v2/recipients/:id/timeline', handlers.timeline);
  router.patch('/v2/recipients/:id/answers/:answerId/edit', handlers.edit);
  router.patch('/v2/recipients/:id/answers/:answerId/archive', handlers.archive);
  router.patch('/v2/recipients/:id/answers/:answerId/restore', handlers.restore);
  router.post('/v2/recipients/:id/interpretations', handlers.createInterpretation);
  router.patch('/v2/recipients/:id/interpretations/:interpretationId/:action', handlers.changeInterpretation);
  router.patch('/v2/recipients/:id/hypotheses/:hypothesisId/:action', handlers.changeHypothesisLifecycle);
  return router;
}
