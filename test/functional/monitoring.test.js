import app from '../../src/server/server';
import request from 'supertest';
import * as testUtils from '../utils/test-utils';

describe('Monitoring endpoint', () => {
  before(async () => {
    const { pool } = app.locals;
    await testUtils.resetDatabase(pool);
  });

  it('should return ok, even for unauthenticated users',
    () => request(app).get('/monitoring').expect(200, 'OK'));
});
