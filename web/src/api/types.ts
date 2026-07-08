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

export interface Goal {
  id: number;
  year: number;
  target: number;
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
