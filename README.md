# dogear

A self-hosted book log for tracking reading history and yearly goals.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL
- **Query builder**: Kysely
- **Infrastructure**: Docker

## Getting started

```bash
cp .env.example .env
docker compose up
```

In a separate terminal, run migrations:

```bash
docker compose exec server npm run db:migrate
```

The API will be available at `http://localhost:3000`.

### Web UI

A minimal React UI for exercising the API lives in `web/`. `docker compose up`
starts it alongside the API as its own Vite dev server, proxying `/api`
requests to the `server` container.

The UI will be available at `http://localhost:5173`.

To run the UI without Docker (e.g. for faster iteration), point it at the API
running on the host instead:

```bash
cd web
npm install
npm run dev
```

## Production

`docker-compose.yml` is for local development — it runs the API and UI as
separate dev servers with hot reload. For a real deployment, use
`docker-compose.prod.yml` instead, which builds the UI into static assets and
serves them directly from the Express server (one container, no separate `web`
service):

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec server npm run db:migrate:prod
```

The app (API + UI) will be available at `http://localhost:3000`.

## Project structure

```
src/
├── db/
│   ├── index.ts          # Kysely instance
│   ├── migrate.ts        # Migration runner
│   └── migrations/       # Versioned migration files
├── middleware/
│   └── errorHandler.ts
├── routes/
│   ├── authors.ts
│   ├── books.ts
│   ├── goals.ts
│   └── readingLog.ts
└── types/
    └── db.ts             # Database types (Selectable, Insertable, Updateable)

web/                       # React + Vite UI for testing the API
├── src/
│   ├── api/               # fetch client + types mirroring the API
│   ├── pages/              # ReadingLogPage, BooksPage, BookDetailPage, AuthorDetailPage, GoalsPage
│   └── App.tsx             # routes + nav
└── vite.config.ts          # dev server proxies /api -> localhost:3000
```

## API

### Books

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List all books |
| GET | `/api/books/:id` | Get a book |
| POST | `/api/books` | Add a book |
| PATCH | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |

**Book status values**: `want_to_read`, `reading`, `finished`

### Authors

The `authors` table (`first_name`, `last_name`) is kept in sync automatically
whenever a book is created or its `author` field is updated — there's no
separate endpoint for creating authors. Books are matched to authors by
comparing `books.author` against the author's full name.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/authors` | List all authors, with a `book_count` for each |
| GET | `/api/authors/:id` | Get an author, including their `books` |

### Reading log

One book can have multiple reading log entries (e.g. re-reads), each tracking
a single read-through. An entry is considered complete when `completed_at` is
set (there's no separate `is_completed` flag). Setting `completed_at` on an
entry also marks the book's status as `finished`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books/:bookId/reading-log` | List reading log entries for a book |
| POST | `/api/books/:bookId/reading-log` | Add a reading log entry |
| PATCH | `/api/books/:bookId/reading-log/:id` | Update a reading log entry |
| DELETE | `/api/books/:bookId/reading-log/:id` | Delete a reading log entry |
| GET | `/api/reading-log` | List reading log entries with `completed_at` set, across all books, with book title/author |

**Reading log fields**: `started_at`, `completed_at`

### Goals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/goals` | List all goals |
| GET | `/api/goals/:year` | Get goal for a year |
| PUT | `/api/goals/:year` | Create or update goal for a year |

## Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run db:migrate   # Run pending migrations
```

## Adding a migration

Create a new file in `src/db/migrations/` following the naming convention:

```
002_your_migration_name.ts
```

Export `up` and `down` functions:

```typescript
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('books')
    .addColumn('page_progress', 'integer')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('books').dropColumn('page_progress').execute();
}
```

Then run `npm run db:migrate`. Kysely tracks applied migrations in a `kysely_migration` table and only runs new ones.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `POSTGRES_HOST` | `db` | Postgres host |
| `POSTGRES_PORT` | `5432` | Postgres port |
| `POSTGRES_USER` | `dogear` | Postgres user |
| `POSTGRES_PASSWORD` | `dogear` | Postgres password |
| `POSTGRES_DB` | `dogear` | Database name |
