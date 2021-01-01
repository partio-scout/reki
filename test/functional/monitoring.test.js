import { configureApp } from '../../src/server/server'
import request from 'supertest'
import { resetDatabase } from '../../scripts/seed-database'

const app = configureApp(false, true)

describe('Monitoring endpoint', () => {
  beforeEach(resetDatabase)

  it('should return ok, even for unauthenticated users', () =>
    request(app).get('/monitoring').expect(200, 'OK'))
})
