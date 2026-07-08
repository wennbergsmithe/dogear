import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { NewReadingLogEntry, ReadingLogEntryUpdate } from '../types/db';

const router = Router({ mergeParams: true });

async function markBookFinishedIfCompleted(bookId: number, completedAt: unknown) {
  if (!completedAt) return;
  await db
    .updateTable('books')
    .set({ status: 'finished', updated_at: new Date() })
    .where('id', '=', bookId)
    .execute();
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await db
      .selectFrom('reading_log')
      .selectAll()
      .where('book_id', '=', Number(req.params.bookId))
      .orderBy('started_at', 'desc')
      .execute();
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await db
      .insertInto('reading_log')
      .values({
        ...(req.body as Omit<NewReadingLogEntry, 'book_id'>),
        book_id: Number(req.params.bookId),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    await markBookFinishedIfCompleted(entry.book_id, entry.completed_at);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await db
      .updateTable('reading_log')
      .set({ ...(req.body as ReadingLogEntryUpdate), updated_at: new Date() })
      .where('id', '=', Number(req.params.id))
      .where('book_id', '=', Number(req.params.bookId))
      .returningAll()
      .executeTakeFirst();
    if (!entry) return res.status(404).json({ error: 'Not found' });
    await markBookFinishedIfCompleted(entry.book_id, entry.completed_at);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await db
      .deleteFrom('reading_log')
      .where('id', '=', Number(req.params.id))
      .where('book_id', '=', Number(req.params.bookId))
      .returningAll()
      .executeTakeFirst();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
