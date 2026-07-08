import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Book, BookStatus } from '../api/types';

const STATUSES: BookStatus[] = ['want_to_read', 'reading', 'finished'];

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  function load() {
    api.books
      .list()
      .then(setBooks)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.books.create({ title, author });
      setTitle('');
      setAuthor('');
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleStatusChange(book: Book, status: BookStatus) {
    try {
      await api.books.update(book.id, { status });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(book: Book) {
    try {
      await api.books.remove(book.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section>
      <h2>Library</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleAdd}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <button type="submit">Add book</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 && (
            <tr className="empty">
              <td colSpan={4}>No books yet.</td>
            </tr>
          )}
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>{book.author}</td>
              <td>
                <select
                  value={book.status}
                  onChange={(e) => handleStatusChange(book, e.target.value as BookStatus)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(book)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
