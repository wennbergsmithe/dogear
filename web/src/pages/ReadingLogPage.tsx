import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Book, CompletedReadingLogEntry } from '../api/types';

interface CurrentlyReadingBook extends Book {
  startedAt: string | null;
}

export function ReadingLogPage() {
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReadingBook[]>([]);
  const [entries, setEntries] = useState<CompletedReadingLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.books
      .list()
      .then(async (books) => {
        const reading = books.filter((book) => book.status === 'reading');
        const withStartDates = await Promise.all(
          reading.map(async (book) => {
            const log = await api.readingLog.list(book.id);
            const active = log.find((entry) => !entry.completed_at);
            return { ...book, startedAt: active?.started_at ?? null };
          }),
        );
        setCurrentlyReading(withStartDates);
      })
      .catch((err) => setError(err.message));
    api.readingLog
      .listCompleted()
      .then(setEntries)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h2>Reading Log</h2>

      {error && <p className="error">{error}</p>}

      <h3>Currently Reading</h3>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Date Started</th>
          </tr>
        </thead>
        <tbody>
          {currentlyReading.length === 0 && (
            <tr className="empty">
              <td colSpan={3}>Nothing in progress.</td>
            </tr>
          )}
          {currentlyReading.map((book) => (
            <tr key={book.id}>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>{book.author}</td>
              <td>{book.startedAt?.slice(0, 10) ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Completed</h3>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Started</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr className="empty">
              <td colSpan={4}>No completed books yet.</td>
            </tr>
          )}
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <Link to={`/books/${entry.book_id}`}>{entry.book_title}</Link>
              </td>
              <td>{entry.book_author}</td>
              <td>{entry.started_at?.slice(0, 10) ?? ''}</td>
              <td>{entry.completed_at?.slice(0, 10) ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
