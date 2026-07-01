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
│   ├── books.ts
│   └── goals.ts
└── types/
    └── db.ts             # Database types (Selectable, Insertable, Updateable)
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
