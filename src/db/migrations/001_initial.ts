import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('book_status')
    .asEnum(['want_to_read', 'reading', 'finished'])
    .execute();

  await db.schema
    .createTable('books')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('author', 'text', (col) => col.notNull())
    .addColumn('isbn', 'text')
    .addColumn('cover_url', 'text')
    .addColumn('total_pages', 'integer')
    .addColumn('status', sql`book_status`, (col) => col.notNull().defaultTo('want_to_read'))
    .addColumn('started_at', 'timestamptz')
    .addColumn('finished_at', 'timestamptz')
    .addColumn('rating', 'integer', (col) => col.check(sql`rating between 1 and 5`))
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('goals')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('year', 'integer', (col) => col.notNull())
    .addColumn('target', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema.createIndex('goals_year_unique').unique().on('goals').column('year').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('goals').execute();
  await db.schema.dropTable('books').execute();
  await db.schema.dropType('book_status').execute();
}
