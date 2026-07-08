import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Author, Book, BookStatus } from '../api/types';

const STATUSES: BookStatus[] = ['want_to_read', 'reading', 'finished'];

type SortKey = 'title' | 'author' | 'status';
type SortDir = 'asc' | 'desc';

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('author');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const authorIdByName = useMemo(() => new Map(authors.map((a) => [a.name, a.id])), [authors]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedBooks = useMemo(() => {
    const sorted = [...books].sort((a, b) => {
      if (sortKey === 'status') {
        return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      }
      return a[sortKey].localeCompare(b[sortKey]);
    });
    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [books, sortKey, sortDir]);

  function load() {
    api.books
      .list()
      .then(setBooks)
      .catch((err) => setError(err.message));
    api.authors
      .list()
      .then(setAuthors)
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
            <SortableHeader label="Title" sortKey="title" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHeader label="Author" sortKey="author" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 && (
            <tr className="empty">
              <td colSpan={4}>No books yet.</td>
            </tr>
          )}
          {sortedBooks.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>
                {authorIdByName.has(book.author) ? (
                  <Link to={`/authors/${authorIdByName.get(book.author)}`}>{book.author}</Link>
                ) : (
                  book.author
                )}
              </td>
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

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === activeKey;
  return (
    <th
      className={isActive ? 'sortable active' : 'sortable'}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {label}
      {isActive && <span className="sort-arrow">{dir === 'asc' ? ' ▲' : ' ▼'}</span>}
    </th>
  );
}
