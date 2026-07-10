import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('books').addColumn('user_id', 'integer').execute();
  await db.schema.alterTable('goals').addColumn('user_id', 'integer').execute();

  // Retroactively hand pre-auth data to the admin user seeded in 008_users.
  await sql`
    update books set user_id = (select id from users where role = 'admin' order by id limit 1)
  `.execute(db);
  await sql`
    update goals set user_id = (select id from users where role = 'admin' order by id limit 1)
  `.execute(db);

  await db.schema
    .alterTable('books')
    .alterColumn('user_id', (col) => col.setNotNull())
    .execute();
  await db.schema
    .alterTable('books')
    .addForeignKeyConstraint('books_user_id_fkey', ['user_id'], 'users', ['id'])
    .onDelete('cascade')
    .execute();

  await db.schema
    .alterTable('goals')
    .alterColumn('user_id', (col) => col.setNotNull())
    .execute();
  await db.schema
    .alterTable('goals')
    .addForeignKeyConstraint('goals_user_id_fkey', ['user_id'], 'users', ['id'])
    .onDelete('cascade')
    .execute();

  await db.schema.dropIndex('goals_year_interval_unique').execute();
  await db.schema
    .createIndex('goals_user_year_interval_unique')
    .unique()
    .on('goals')
    .columns(['user_id', 'year', 'interval'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('goals_user_year_interval_unique').execute();
  await db.schema
    .createIndex('goals_year_interval_unique')
    .unique()
    .on('goals')
    .columns(['year', 'interval'])
    .execute();

  await db.schema.alterTable('goals').dropConstraint('goals_user_id_fkey').execute();
  await db.schema.alterTable('goals').dropColumn('user_id').execute();

  await db.schema.alterTable('books').dropConstraint('books_user_id_fkey').execute();
  await db.schema.alterTable('books').dropColumn('user_id').execute();
}
