import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { NewBook, BookUpdate } from '../types/db';
import readingLogRouter from './readingLog';

const router = Router();

router.use('/:bookId/reading-log', readingLogRouter);

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const result = await db.selectFrom('books').selectAll().orderBy('created_at', 'desc').execute();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const book = await db
      .selectFrom('books')
      .selectAll()
      .where('id', '=', Number(req.params.id))
      .executeTakeFirst();
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await db
      .insertInto('books')
      .values(req.body as NewBook)
      .returningAll()
      .executeTakeFirstOrThrow();
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await db
      .updateTable('books')
      .set({ ...(req.body as BookUpdate), updated_at: new Date() })
      .where('id', '=', Number(req.params.id))
      .returningAll()
      .executeTakeFirst();
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const deleted = await db
      .deleteFrom('books')
      .where('id', '=', Number(req.params.id))
      .returningAll()
      .executeTakeFirst();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
