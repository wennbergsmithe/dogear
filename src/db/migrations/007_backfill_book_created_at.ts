import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // A book's created_at shouldn't postdate when it was actually started, so
  // backfill it to the earliest reading_log start for books where that's the case.
  await sql`
    update books
    set created_at = earliest.started_at,
        updated_at = now()
    from (
      select book_id, min(started_at) as started_at
      from reading_log
      where started_at is not null
      group by book_id
    ) as earliest
    where books.id = earliest.book_id
      and earliest.started_at < books.created_at
  `.execute(db);
}

export async function down(): Promise<void> {
  // Data backfill; original created_at values aren't recoverable.
}
