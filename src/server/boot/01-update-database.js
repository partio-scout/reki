import { createConnection, migrateDb } from '../database';

export default async function(app) {
  const pool = await createConnection();

  const migrationPromise = migrateDb(pool);

  app.locals.migration = migrationPromise;

  await migrationPromise;

  app.locals.pool = pool;
}
