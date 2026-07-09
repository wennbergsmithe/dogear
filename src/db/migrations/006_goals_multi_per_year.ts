import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('goals_year_unique').execute();

  await db.schema
    .createIndex('goals_year_interval_unique')
    .unique()
    .on('goals')
    .columns(['year', 'interval'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('goals_year_interval_unique').execute();

  await db.schema.createIndex('goals_year_unique').unique().on('goals').column('year').execute();
}
