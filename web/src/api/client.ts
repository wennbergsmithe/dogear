import type {
  Author,
  AuthorDetail,
  Book,
  BookUpdate,
  CompletedReadingLogEntry,
  Goal,
  NewBook,
  NewReadingLogEntry,
  ReadingLogEntry,
  ReadingLogEntryUpdate,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  books: {
    list: () => request<Book[]>('/books'),
    get: (id: number) => request<Book>(`/books/${id}`),
    create: (book: NewBook) =>
      request<Book>('/books', { method: 'POST', body: JSON.stringify(book) }),
    update: (id: number, book: BookUpdate) =>
      request<Book>(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(book) }),
    remove: (id: number) => request<void>(`/books/${id}`, { method: 'DELETE' }),
  },
  authors: {
    list: () => request<Author[]>('/authors'),
    get: (id: number) => request<AuthorDetail>(`/authors/${id}`),
  },
  goals: {
    list: () => request<Goal[]>('/goals'),
    get: (year: number) => request<Goal>(`/goals/${year}`),
    set: (year: number, target: number) =>
      request<Goal>(`/goals/${year}`, { method: 'PUT', body: JSON.stringify({ target }) }),
  },
  readingLog: {
    list: (bookId: number) => request<ReadingLogEntry[]>(`/books/${bookId}/reading-log`),
    create: (bookId: number, entry: NewReadingLogEntry) =>
      request<ReadingLogEntry>(`/books/${bookId}/reading-log`, {
        method: 'POST',
        body: JSON.stringify(entry),
      }),
    update: (bookId: number, id: number, entry: ReadingLogEntryUpdate) =>
      request<ReadingLogEntry>(`/books/${bookId}/reading-log/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(entry),
      }),
    remove: (bookId: number, id: number) =>
      request<void>(`/books/${bookId}/reading-log/${id}`, { method: 'DELETE' }),
    listCompleted: () => request<CompletedReadingLogEntry[]>('/reading-log'),
  },
};
