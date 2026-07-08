import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { Author } from '../types/db';

const router = Router();

function fullName(author: Pick<Author, 'first_name' | 'last_name'>): string {
  return author.last_name ? `${author.first_name} ${author.last_name}` : author.first_name;
}

router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const authors = await db.selectFrom('authors').selectAll().execute();
    const books = await db.selectFrom('books').select('author').execute();

    const counts = new Map<string, number>();
    for (const book of books) {
      counts.set(book.author, (counts.get(book.author) ?? 0) + 1);
    }

    const result = authors
      .map((author) => ({
        ...author,
        name: fullName(author),
        book_count: counts.get(fullName(author)) ?? 0,
      }))
      .sort(
        (a, b) =>
          a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name),
      );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const author = await db
      .selectFrom('authors')
      .selectAll()
      .where('id', '=', Number(req.params.id))
      .executeTakeFirst();
    if (!author) return res.status(404).json({ error: 'Not found' });

    const name = fullName(author);
    const books = await db
      .selectFrom('books')
      .selectAll()
      .where('author', '=', name)
      .orderBy('title')
      .execute();

    res.json({ ...author, name, books });
  } catch (err) {
    next(err);
  }
});

export default router;
