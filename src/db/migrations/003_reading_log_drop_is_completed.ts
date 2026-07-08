import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('reading_log').dropColumn('is_completed').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('reading_log')
    .addColumn('is_completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();
}
