import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('authors')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('authors_name_unique')
    .unique()
    .on('authors')
    .columns(['first_name', 'last_name'])
    .execute();

  // Backfill from existing books.author strings ("First Last" -> first_name
  // "First", last_name "Last"). Names with no space become just a first name.
  await sql`
    insert into authors (first_name, last_name)
    select distinct
      split_part(author, ' ', 1) as first_name,
      case
        when position(' ' in author) > 0
        then trim(substring(author from position(' ' in author) + 1))
        else ''
      end as last_name
    from books
    on conflict (first_name, last_name) do nothing
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('authors').execute();
}
