import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { GoalInterval, NewGoal } from '../types/db';

const router = Router();

const GOAL_INTERVALS: GoalInterval[] = ['year', 'month', 'week'];

function isGoalInterval(value: unknown): value is GoalInterval {
  return typeof value === 'string' && (GOAL_INTERVALS as string[]).includes(value);
}

type GoalProgress = { type: 'percentage'; percent: number } | { type: 'months'; met: boolean[] };

async function getCompletedDates(): Promise<Date[]> {
  const rows = await db
    .selectFrom('reading_log')
    .select('completed_at')
    .where('completed_at', 'is not', null)
    .execute();
  return rows.map((row) => row.completed_at as Date);
}

// 'week' goals fall back to a year-to-date percentage, same as 'year' goals,
// since there's no UI to show 52 per-week markers.
function computeProgress(
  goal: { year: number; interval: GoalInterval; target: number },
  completedDates: Date[],
): GoalProgress {
  const completedInYear = completedDates.filter((d) => d.getUTCFullYear() === goal.year);

  if (goal.interval === 'month') {
    const met = Array.from(
      { length: 12 },
      (_, month) => completedInYear.filter((d) => d.getUTCMonth() === month).length >= goal.target,
    );
    return { type: 'months', met };
  }

  const percent = goal.target > 0 ? Math.round((completedInYear.length / goal.target) * 100) : 0;
  return { type: 'percentage', percent };
}

async function upsertGoal(year: number, target: number, interval: GoalInterval | undefined) {
  return db
    .insertInto('goals')
    .values({ year, target, ...(interval !== undefined ? { interval } : {}) })
    .onConflict((oc) =>
      oc.columns(['year', 'interval']).doUpdateSet({
        target,
        ...(interval !== undefined ? { interval } : {}),
        updated_at: new Date(),
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow();
}

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const [goals, completedDates] = await Promise.all([
      db.selectFrom('goals').selectAll().orderBy('year', 'desc').execute(),
      getCompletedDates(),
    ]);
    const result = goals.map((goal) => ({ ...goal, progress: computeProgress(goal, completedDates) }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:year', async (req, res: Response, next: NextFunction) => {
  try {
    const [goals, completedDates] = await Promise.all([
      db
        .selectFrom('goals')
        .selectAll()
        .where('year', '=', Number(req.params.year))
        .orderBy('interval')
        .execute(),
      getCompletedDates(),
    ]);
    const result = goals.map((goal) => ({ ...goal, progress: computeProgress(goal, completedDates) }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, target, interval } = req.body as NewGoal;
    if (!Number.isInteger(year) || !Number.isInteger(target) || target < 1) {
      return res.status(400).json({ error: 'year and target are required and must be integers' });
    }
    if (interval !== undefined && !isGoalInterval(interval)) {
      return res.status(400).json({ error: `interval must be one of: ${GOAL_INTERVALS.join(', ')}` });
    }
    const goal = await upsertGoal(year, target, interval);
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

router.put('/:year', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { target, interval } = req.body as Pick<NewGoal, 'target' | 'interval'>;
    if (!Number.isInteger(target) || target < 1) {
      return res.status(400).json({ error: 'target is required and must be an integer' });
    }
    if (interval !== undefined && !isGoalInterval(interval)) {
      return res.status(400).json({ error: `interval must be one of: ${GOAL_INTERVALS.join(', ')}` });
    }
    const goal = await upsertGoal(Number(req.params.year), target, interval);
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

export default router;
