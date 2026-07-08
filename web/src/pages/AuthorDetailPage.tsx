import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { AuthorDetail } from '../api/types';

export function AuthorDetailPage() {
  const { id } = useParams();
  const authorId = Number(id);
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.authors
      .get(authorId)
      .then(setAuthor)
      .catch((err) => setError(err.message));
  }, [authorId]);

  if (error) return <p className="error">{error}</p>;
  if (!author) return <p>Loading…</p>;

  return (
    <section>
      <p>
        <Link to="/library">&larr; Back to library</Link>
      </p>
      <h2>{author.name}</h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {author.books.length === 0 && (
            <tr className="empty">
              <td colSpan={2}>No books by this author yet.</td>
            </tr>
          )}
          {author.books.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>
                <span className="status" data-status={book.status}>
                  {book.status.replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
