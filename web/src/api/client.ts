import type {
  Author,
  AuthorDetail,
  AuthorUpdate,
  Book,
  BookUpdate,
  CompletedReadingLogEntry,
  Goal,
  GoalInterval,
  NewBookInput,
  NewReadingLogEntry,
  ReadingLogEntry,
  ReadingLogEntryUpdate,
  User,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  // A 401 outside of the auth endpoints means the session cookie expired or
  // was never there — bounce to the login page rather than surfacing this as
  // a page-level error. /auth/me and /auth/login report 401 as normal
  // application state (not logged in / bad credentials), so they're exempt.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<User>('/auth/me'),
  },
  books: {
    list: () => request<Book[]>('/books'),
    get: (id: number) => request<Book>(`/books/${id}`),
    create: (book: NewBookInput) =>
      request<Book>('/books', { method: 'POST', body: JSON.stringify(book) }),
    update: (id: number, book: BookUpdate) =>
      request<Book>(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(book) }),
    remove: (id: number) => request<void>(`/books/${id}`, { method: 'DELETE' }),
  },
  authors: {
    list: () => request<Author[]>('/authors'),
    get: (id: number) => request<AuthorDetail>(`/authors/${id}`),
    update: (id: number, author: AuthorUpdate) =>
      request<Author>(`/authors/${id}`, { method: 'PATCH', body: JSON.stringify(author) }),
  },
  goals: {
    list: () => request<Goal[]>('/goals'),
    get: (year: number) => request<Goal[]>(`/goals/${year}`),
    set: (year: number, target: number, interval: GoalInterval) =>
      request<Goal>(`/goals/${year}`, { method: 'PUT', body: JSON.stringify({ target, interval }) }),
    remove: (id: number) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
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
