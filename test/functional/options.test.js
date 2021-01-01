import { expect } from 'chai'
import {
  withFixtures,
  deleteUsers,
  getWithUser,
  expectStatus,
  createUserWithRoles as createUser,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import { configureApp } from '../../src/server/server'

const app = configureApp(false, true)

describe('Options API endpoint', () => {
  it('returns filter options', async () => {
    const res = await getWithUser(
      app,
      '/api/options',
      await createUser(['registryUser']),
    )
    expectStatus(res.status, 200)

    expect(res.body.village).to.deep.equal(['Mallikylä', 'muu'])
    expect(res.body.campGroup).to.deep.equal(['muu'])
  })

  before(resetDatabase)
  withFixtures({
    Option: [
      {
        property: 'village',
        value: 'Mallikylä',
      },
      {
        property: 'village',
        value: 'muu',
      },
      {
        property: 'campGroup',
        value: 'muu',
      },
    ],
  })
  afterEach(deleteUsers)
})
