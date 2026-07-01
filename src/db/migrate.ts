import 'dotenv/config';
import path from 'path';
import { promises as fs } from 'fs';
import { FileMigrationProvider, Migrator } from 'kysely';
import { db } from './index';

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((r) => {
    if (r.status === 'Success') console.log(`applied: ${r.migrationName}`);
    if (r.status === 'Error') console.error(`failed:  ${r.migrationName}`);
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
