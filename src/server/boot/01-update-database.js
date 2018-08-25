import { createConnection } from '../database';

export default async function(app) {
  if (!app.get('standalone')) {
    return;
  }

  const pool = await createConnection();

  app.locals.pool = pool;
}
