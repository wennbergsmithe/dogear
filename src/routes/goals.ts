import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { NewGoal } from '../types/db';

const router = Router();

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const result = await db.selectFrom('goals').selectAll().orderBy('year', 'desc').execute();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:year', async (req, res: Response, next: NextFunction) => {
  try {
    const goal = await db
      .selectFrom('goals')
      .selectAll()
      .where('year', '=', Number(req.params.year))
      .executeTakeFirst();
    if (!goal) return res.status(404).json({ error: 'Not found' });
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

router.put('/:year', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { target } = req.body as Pick<NewGoal, 'target'>;
    const goal = await db
      .insertInto('goals')
      .values({ year: Number(req.params.year), target })
      .onConflict((oc) => oc.column('year').doUpdateSet({ target, updated_at: new Date() }))
      .returningAll()
      .executeTakeFirstOrThrow();
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

export default router;
