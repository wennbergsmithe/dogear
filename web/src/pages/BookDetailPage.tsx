import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Book, ReadingLogEntry } from '../api/types';

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function fromDateInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function BookDetailPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const [book, setBook] = useState<Book | null>(null);
  const [entries, setEntries] = useState<ReadingLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState('');
  const [completedAt, setCompletedAt] = useState('');

  function load() {
    api.books.get(bookId).then(setBook).catch((err) => setError(err.message));
    api.readingLog.list(bookId).then(setEntries).catch((err) => setError(err.message));
  }

  useEffect(load, [bookId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.readingLog.create(bookId, {
        started_at: fromDateInput(startedAt),
        completed_at: fromDateInput(completedAt),
      });
      setStartedAt('');
      setCompletedAt('');
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleUpdate(entryId: number, changes: Partial<ReadingLogEntry>) {
    setError(null);
    try {
      await api.readingLog.update(bookId, entryId, changes);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(entryId: number) {
    setError(null);
    try {
      await api.readingLog.remove(bookId, entryId);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!book) return <p>Loading…</p>;

  return (
    <section>
      <p>
        <Link to="/library">&larr; Back to library</Link>
      </p>
      <h2>{book.title}</h2>
      <p>
        {book.author} &mdash; status: {book.status}
      </p>

      {error && <p className="error">{error}</p>}

      <h3>Reading log</h3>

      <form onSubmit={handleAdd}>
        <label>
          Started
          <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </label>
        <label>
          Completed
          <input
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
          />
        </label>
        <button type="submit">Add entry</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Started</th>
            <th>Completed</th>
            <th>Is completed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <ReadingLogRow
              key={entry.id}
              entry={entry}
              onSave={(changes) => handleUpdate(entry.id, changes)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ReadingLogRow({
  entry,
  onSave,
  onDelete,
}: {
  entry: ReadingLogEntry;
  onSave: (changes: Partial<ReadingLogEntry>) => void;
  onDelete: () => void;
}) {
  const [startedAt, setStartedAt] = useState(toDateInput(entry.started_at));
  const [completedAt, setCompletedAt] = useState(toDateInput(entry.completed_at));

  return (
    <tr>
      <td>
        <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
      </td>
      <td>
        <input
          type="date"
          value={completedAt}
          onChange={(e) => setCompletedAt(e.target.value)}
        />
      </td>
      <td>{completedAt ? 'Yes' : 'No'}</td>
      <td>
        <button
          onClick={() =>
            onSave({
              started_at: fromDateInput(startedAt),
              completed_at: fromDateInput(completedAt),
            })
          }
        >
          Save
        </button>
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  );
}
