import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Author, Book, BookStatus } from '../api/types';

const STATUSES: BookStatus[] = ['want_to_read', 'reading', 'finished'];
const NEW_AUTHOR = '__new__';

type SortKey = 'title' | 'author' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [authorChoice, setAuthorChoice] = useState('');
  const [newAuthorFirstName, setNewAuthorFirstName] = useState('');
  const [newAuthorLastName, setNewAuthorLastName] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('author');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const authorByName = useMemo(() => new Map(authors.map((a) => [a.name, a])), [authors]);
  const sortedAuthorNames = useMemo(
    () => authors.map((a) => a.name).sort((a, b) => a.localeCompare(b)),
    [authors],
  );

  function authorSortKey(bookAuthor: string): string {
    const match = authorByName.get(bookAuthor);
    return match ? `${match.last_name}|${match.first_name}` : bookAuthor;
  }

  function authorLastFirst(bookAuthor: string): string {
    const match = authorByName.get(bookAuthor);
    if (!match) return bookAuthor;
    return match.last_name ? `${match.last_name}, ${match.first_name}` : match.first_name;
  }

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
      if (sortKey === 'author') {
        return authorSortKey(a.author).localeCompare(authorSortKey(b.author));
      }
      return a[sortKey].localeCompare(b[sortKey]);
    });
    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [books, sortKey, sortDir, authorByName]);

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

    let authorFirstName: string;
    let authorLastName: string;
    if (authorChoice === NEW_AUTHOR) {
      authorFirstName = newAuthorFirstName.trim();
      authorLastName = newAuthorLastName.trim();
      if (!authorFirstName) {
        setError('Author first name is required');
        return;
      }
    } else {
      const existing = authorByName.get(authorChoice);
      if (!existing) {
        setError('Author is required');
        return;
      }
      authorFirstName = existing.first_name;
      authorLastName = existing.last_name;
    }
    const author = authorLastName ? `${authorFirstName} ${authorLastName}` : authorFirstName;

    try {
      await api.books.create({
        title,
        author,
        author_first_name: authorFirstName,
        author_last_name: authorLastName,
      });
      setTitle('');
      setAuthorChoice('');
      setNewAuthorFirstName('');
      setNewAuthorLastName('');
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
        <select
          value={authorChoice}
          onChange={(e) => setAuthorChoice(e.target.value)}
          required
        >
          <option value="" disabled>
            Select author…
          </option>
          <option value={NEW_AUTHOR}>+ New author…</option>
          {sortedAuthorNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {authorChoice === NEW_AUTHOR && (
          <>
            <input
              placeholder="First name"
              value={newAuthorFirstName}
              onChange={(e) => setNewAuthorFirstName(e.target.value)}
              required
            />
            <input
              placeholder="Last name"
              value={newAuthorLastName}
              onChange={(e) => setNewAuthorLastName(e.target.value)}
            />
          </>
        )}
        <button type="submit">Add book</button>
      </form>

      <div className="table-wrap">
        <table>
        <thead>
          <tr>
            <SortableHeader label="Title" sortKey="title" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHeader label="Author" sortKey="author" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHeader
              label="Date Added"
              sortKey="created_at"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="col-hide-mobile"
            />
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 && (
            <tr className="empty">
              <td colSpan={5}>No books yet.</td>
            </tr>
          )}
          {sortedBooks.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>
                {authorByName.has(book.author) ? (
                  <Link to={`/authors/${authorByName.get(book.author)!.id}`}>
                    {authorLastFirst(book.author)}
                  </Link>
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
              <td className="col-hide-mobile">{new Date(book.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(book)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </section>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className = '',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = sortKey === activeKey;
  return (
    <th
      className={`${isActive ? 'sortable active' : 'sortable'} ${className}`.trim()}
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {label}
      {isActive && <span className="sort-arrow">{dir === 'asc' ? ' ▲' : ' ▼'}</span>}
    </th>
  );
}
