import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import authorsRouter from './authors';
import booksRouter from './books';
import goalsRouter from './goals';

const router = Router();

router.use('/books', booksRouter);
router.use('/goals', goalsRouter);
router.use('/authors', authorsRouter);

router.get('/reading-log', async (_req, res: Response, next: NextFunction) => {
  try {
    const entries = await db
      .selectFrom('reading_log')
      .innerJoin('books', 'books.id', 'reading_log.book_id')
      .select([
        'reading_log.id',
        'reading_log.book_id',
        'reading_log.started_at',
        'reading_log.completed_at',
        'books.title as book_title',
        'books.author as book_author',
      ])
      .where('reading_log.completed_at', 'is not', null)
      .orderBy('reading_log.completed_at', 'desc')
      .execute();
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

export default router;
