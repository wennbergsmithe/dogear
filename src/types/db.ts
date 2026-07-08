import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type BookStatus = 'want_to_read' | 'reading' | 'finished';

export interface BookTable {
  id: Generated<number>;
  title: string;
  author: string;
  isbn: string | null;
  cover_url: string | null;
  total_pages: number | null;
  status: BookStatus;
  started_at: Date | null;
  finished_at: Date | null;
  rating: number | null;
  notes: string | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, Date>;
}

export interface GoalTable {
  id: Generated<number>;
  year: number;
  target: number;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, Date>;
}

export interface ReadingLogTable {
  id: Generated<number>;
  book_id: number;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, Date>;
}

export interface AuthorTable {
  id: Generated<number>;
  first_name: string;
  last_name: string;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, Date>;
}

export interface Database {
  books: BookTable;
  goals: GoalTable;
  reading_log: ReadingLogTable;
  authors: AuthorTable;
}

export type Book = Selectable<BookTable>;
export type NewBook = Insertable<BookTable>;
export type BookUpdate = Updateable<BookTable>;

export type Goal = Selectable<GoalTable>;
export type NewGoal = Insertable<GoalTable>;
export type GoalUpdate = Updateable<GoalTable>;

export type ReadingLogEntry = Selectable<ReadingLogTable>;
export type NewReadingLogEntry = Insertable<ReadingLogTable>;
export type ReadingLogEntryUpdate = Updateable<ReadingLogTable>;

export type Author = Selectable<AuthorTable>;
export type NewAuthor = Insertable<AuthorTable>;
export type AuthorUpdate = Updateable<AuthorTable>;
