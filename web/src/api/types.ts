export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export type BookStatus = 'want_to_read' | 'reading' | 'finished';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  cover_url: string | null;
  total_pages: number | null;
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewBook = Pick<Book, 'title' | 'author'> &
  Partial<Omit<Book, 'id' | 'title' | 'author' | 'created_at' | 'updated_at'>>;

export type BookUpdate = Partial<NewBook>;

// Optional explicit first/last name split, used when the author doesn't
// already exist, so the authors table doesn't have to guess how to split it.
export type NewBookInput = NewBook & {
  author_first_name?: string;
  author_last_name?: string;
};

export type GoalInterval = 'year' | 'month' | 'week';

export type GoalProgress = { type: 'percentage'; percent: number } | { type: 'months'; met: boolean[] };

export interface Goal {
  id: number;
  year: number;
  interval: GoalInterval;
  target: number;
  is_completed: boolean;
  progress: GoalProgress;
  created_at: string;
  updated_at: string;
}

export interface ReadingLogEntry {
  id: number;
  book_id: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewReadingLogEntry = Partial<Pick<ReadingLogEntry, 'started_at' | 'completed_at'>>;

export type ReadingLogEntryUpdate = NewReadingLogEntry;

export interface CompletedReadingLogEntry {
  id: number;
  book_id: number;
  started_at: string | null;
  completed_at: string | null;
  book_title: string;
  book_author: string;
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  book_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthorDetail extends Author {
  books: Book[];
}

export type AuthorUpdate = Partial<Pick<Author, 'first_name' | 'last_name'>>;
