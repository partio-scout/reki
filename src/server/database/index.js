import * as fs from 'fs';
import { Pool, types } from 'pg';
import { fromCallback } from '../promises';

export async function usingTransaction(pool, handler) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');

    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function createConnection() {
  // this stops postgres dates being parsed into JS Dates
  types.setTypeParser(1082, 'text', x => x);

  const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('Cannot connect to db because no database url is defined. Defined the environment variable DATABASE_URL (and TEST_DATABASE_URL for tests).');
  }

  const pool = new Pool({
    connectionString: dbUrl,
  });

  await migrateDb(pool);

  return pool;
}

export async function migrateDb(pool) {
  await waitForDbConnection(pool);

  if (await isMigrated(pool)) {
    return;
  }

  const schema = await fromCallback(cb => fs.readFile('src/server/database/schema.sql', { encoding: 'utf-8' }, cb));
  await pool.query(schema);
}

async function isMigrated(pool) {
  try {
    const res = await pool.query('SELECT migrated FROM migration_status');
    if (res.rows.length !== 1 || !res.rows[0].migrated) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

async function waitForDbConnection(pool) {
  let triesLeft = 5;
  const delay = exponentialBackoffDelay(1000, 1.1);

  while (true) { // eslint-disable-line no-constant-condition
    try {
      await pool.query('SELECT 1');
      return;
    } catch (e) {
      triesLeft--;
      if (triesLeft <= 0) {
        throw new Error('Could not connect to the database');
      }

      await delay();
    }
  }
}

function exponentialBackoffDelay(baseDelayMs, backoffMultiplier) {
  let currentDelay = baseDelayMs;
  return function delay() {
    return new Promise(resolve => {
      setTimeout(resolve, currentDelay);
      currentDelay *= backoffMultiplier;
    });
  };
}
