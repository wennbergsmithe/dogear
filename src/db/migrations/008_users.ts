import { Kysely, sql } from 'kysely';
import bcrypt from 'bcryptjs';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('user_role').asEnum(['user', 'admin']).execute();

  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('role', sql`user_role`, (col) => col.notNull().defaultTo('user'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // Seeds the sole admin account from env vars so the app has an owner to
  // migrate existing (pre-auth) books/goals data onto in the next migration.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to run this migration');
  }
  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insertInto('users')
    .values({ email, password_hash: passwordHash, role: 'admin' })
    .onConflict((oc) => oc.column('email').doNothing())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
  await db.schema.dropType('user_role').execute();
}
