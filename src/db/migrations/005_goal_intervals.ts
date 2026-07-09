import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('goal_interval')
    .asEnum(['year', 'month', 'week'])
    .execute();

  await db.schema.alterTable('goals')
    .addColumn('interval', sql`goal_interval`, (col) => col.notNull().defaultTo('year'))
    .addColumn('is_completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('goals')
    .dropColumn('interval')
    .dropColumn('is_completed')
    .execute();
    
  await db.schema.dropType('goal_interval').execute();
  
}