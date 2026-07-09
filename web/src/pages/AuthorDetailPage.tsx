import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { AuthorDetail } from '../api/types';

export function AuthorDetailPage() {
  const { id } = useParams();
  const authorId = Number(id);
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function load() {
    api.authors
      .get(authorId)
      .then((data) => {
        setAuthor(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [authorId]);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.authors.update(authorId, { first_name: firstName, last_name: lastName });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!author) return error ? <p className="error">{error}</p> : <p>Loading…</p>;

  return (
    <section>
      <p>
        <Link to="/library">&larr; Back to library</Link>
      </p>
      <h2>{author.name}</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleUpdate}>
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>
        <button type="submit">Save</button>
      </form>

      <div className="table-wrap">
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
      </div>
    </section>
  );
}
