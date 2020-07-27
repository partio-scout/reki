import { expect } from 'chai'
import {
  withFixtures,
  deleteUsers,
  createUserWithRoles as createUser,
  getWithUser,
  expectStatus,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import { models } from '../../src/server/models'

describe('Audit events', () => {
  withFixtures({
    Participant: [
      {
        participantId: 42,
        firstName: 'Testi',
        lastName: 'Henkilö',
        nonScout: false,
        internationalGuest: true,
        localGroup: 'Testilippukunta',
        campGroup: 'Leirilippukunta',
        village: 'Kylä',
        subCamp: 'Alaleiri',
        ageGroup: 'sudenpentu',
        dateOfBirth: new Date(),
      },
    ],
  })
  afterEach(deleteUsers)

  describe('Logging events when performing actions', () => {
    before(resetDatabase)

    it('should log an event when finding registry users', async () => {
      const user = await createUser(['registryAdmin'])
      const response = await getWithUser('/api/registryusers', user)
      expectStatus(response.status, 200)

      await expectAuditEventToEventuallyExist({
        eventType: 'find',
        model: 'User',
        modelId: null,
      })
    })

    it('should log an event when finding audit events', async () => {
      const user = await createUser(['registryAdmin'])
      const response = await getWithUser('/api/audit-events', user)
      expectStatus(response.status, 200)

      await expectAuditEventToEventuallyExist({
        eventType: 'find',
        model: 'AuditEvent',
        modelId: null,
      })
    })

    it('should log an event when finding participants', async () => {
      const user = await createUser(['registryUser'])
      const response = await getWithUser('/api/participants', user)
      expectStatus(response.status, 200)

      await expectAuditEventToEventuallyExist({
        eventType: 'find',
        model: 'Participant',
        modelId: null,
      })
    })

    it('should log an event when finding a participant', async () => {
      const user = await createUser(['registryUser'])
      const response = await getWithUser('/api/participants/42', user)
      expectStatus(response.status, 200)

      await expectAuditEventToEventuallyExist({
        eventType: 'find',
        model: 'Participant',
        modelId: 42,
      })
    })

    async function expectAuditEventToEventuallyExist(expectedEvent) {
      const res = await models.AuditEvent.findAll({ where: expectedEvent })
      expect(res).to.have.length(1)
      expect(res[0]).to.have.property('timestamp').that.is.not.null
    }
  })

  describe('Accessing audit events via the API', () => {
    let user

    before(resetDatabase)
    beforeEach(async () => {
      user = await createUser(['registryUser', 'registryAdmin'])

      // perform activity to create actual audit log events
      await getWithUser('/api/participants/42', user)
      await getWithUser('/api/participants', user)
      await getWithUser('/api/registryusers', user)
    })

    afterEach(async () => {
      // remove all audit log events, reset ids
      await models.AuditEvent.destroy({ truncate: true, restartIdentity: true })
    })

    it('Should list existing events', async () => {
      const response = await getAuditEventsWithFilter()

      expect(response).to.be.an('array').with.length(3)

      expect(response[0]).to.have.property('id', 3)
      expect(response[0]).to.have.property('eventType', 'find')
      expect(response[0]).to.have.property('model', 'User')

      expect(response[1]).to.have.property('id', 2)
      expect(response[1]).to.have.property('eventType', 'find')
      expect(response[1]).to.have.property('model', 'Participant')
      expect(response[1]).to.have.property('modelId', null)

      expect(response[2]).to.have.property('id', 1)
      expect(response[2]).to.have.property('eventType', 'find')
      expect(response[2]).to.have.property('model', 'Participant')
      expect(response[2]).to.have.property('modelId', 42)
    })

    it('Should allow limiting results', async () => {
      const response = await getAuditEventsWithFilter({ limit: 1 })
      expect(response).to.be.an('array').with.length(1)
      expect(response[0]).to.have.property('id', 3)
    })

    it('Should allow skipping results', async () => {
      const response = await getAuditEventsWithFilter({ skip: 1 })
      expect(response).to.be.an('array').with.length(2)
      expect(response[0]).to.have.property('id', 2)
      expect(response[1]).to.have.property('id', 1)
    })

    async function getAuditEventsWithFilter(filter = {}) {
      const res = await getWithUser(
        `/api/audit-events/?filter=${JSON.stringify(filter)}`,
        user,
      )
      expectStatus(res.status, 200)
      return res.body
    }
  })
})
