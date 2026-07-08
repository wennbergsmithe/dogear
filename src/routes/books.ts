import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { NewBook, BookUpdate } from '../types/db';
import readingLogRouter from './readingLog';

const router = Router();

router.use('/:bookId/reading-log', readingLogRouter);

// Keeps the authors table in sync with the free-text author field on books.
function splitAuthorName(name: string): { first_name: string; last_name: string } {
  const trimmed = name.trim();
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return { first_name: trimmed, last_name: '' };
  return { first_name: trimmed.slice(0, spaceIdx), last_name: trimmed.slice(spaceIdx + 1).trim() };
}

async function ensureAuthor(
  name: string,
  explicitSplit?: { first_name: string; last_name: string },
): Promise<void> {
  const { first_name, last_name } = explicitSplit ?? splitAuthorName(name);
  await db
    .insertInto('authors')
    .values({ first_name, last_name })
    .onConflict((oc) => oc.columns(['first_name', 'last_name']).doNothing())
    .execute();
}

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
    const { author_first_name, author_last_name, ...bookFields } = req.body as NewBook & {
      author_first_name?: string;
      author_last_name?: string;
    };
    const book = await db
      .insertInto('books')
      .values(bookFields as NewBook)
      .returningAll()
      .executeTakeFirstOrThrow();
    const explicitSplit = author_first_name
      ? { first_name: author_first_name, last_name: author_last_name ?? '' }
      : undefined;
    await ensureAuthor(book.author, explicitSplit);
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
    if ((req.body as BookUpdate).author !== undefined) {
      await ensureAuthor(book.author);
    }
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
