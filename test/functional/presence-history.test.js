import _ from 'lodash'
import { expect } from 'chai'
import {
  postWithUser,
  expectStatus,
  createUserWithRoles as createUser,
  deleteUsers,
  withFixtures,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import { models } from '../../src/server/models'
import { configureApp } from '../../src/server/server'

const app = configureApp(false, true)

describe('Participant presence history', () => {
  const inCamp = 3
  const tmpLeftCamp = 2
  const leftCamp = 1

  let user

  before(resetDatabase)
  beforeEach(async () => (user = await createUser(['registryUser'])))
  afterEach(deleteUsers)
  withFixtures(getFixtures())

  it("is saved when updating the participant's presence field", async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    await expectPresenceHistoryValues([inCamp], 1)
  })

  it('includes the author of the change correctly', async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    const res2 = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: tmpLeftCamp,
      fieldName: 'presence',
    })
    expectStatus(res2.status, 200)
    await expectPresenceAuthorValue([user.id, user.id], 1)
  })

  it('is saved correctly when updating presences twice', async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    const res2 = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: leftCamp,
      fieldName: 'presence',
    })
    expectStatus(res2.status, 200)
    await expectPresenceHistoryValues([inCamp, leftCamp], 1)
  })

  it("is saved when updating two participants' presences at once", async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [2, 3],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    const res2 = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [2, 3],
      newValue: tmpLeftCamp,
      fieldName: 'presence',
    })
    expectStatus(res2.status, 200)
    await expectPresenceHistoryValues([inCamp, tmpLeftCamp], 2)
    await expectPresenceHistoryValues([inCamp, tmpLeftCamp], 3)
  })

  it("is not saved when presence field of the participant doesn't change", async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [2],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    const res2 = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [2],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res2.status, 200)
    await expectPresenceHistoryValues([inCamp], 2)
  })

  it('is not saved to wrong participants', async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: inCamp,
      fieldName: 'presence',
    })
    expectStatus(res.status, 200)
    await expectPresenceHistoryValues([], 2)
  })

  it('is not saved when invalid presence data is given', async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1],
      newValue: 'some string value',
      fieldName: 'presence',
    })
    expectStatus(res.status, 400)
    await expectPresenceHistoryValues([], 1)
  })

  function expectPresenceHistoryValues(
    expectedPresences,
    participantId,
    response,
  ) {
    return models.PresenceHistory.findAll({
      where: { participantParticipantId: participantId },
      order: [['id', 'ASC']],
    }).then((rows) => {
      const presenceHistory = _.map(rows, (row) => row.presence)
      expect(presenceHistory).to.eql(expectedPresences)
    })
  }

  function expectPresenceAuthorValue(expectedAuthors, participantId, response) {
    return models.PresenceHistory.findAll({
      where: { participantParticipantId: participantId },
    }).then((rows) => {
      const AuthorHistory = _.map(rows, (row) => row.authorId)
      expect(AuthorHistory).to.eql(expectedAuthors)
    })
  }

  function getFixtures() {
    return {
      Participant: [
        {
          participantId: 1,
          firstName: 'Teemu',
          lastName: 'Testihenkilö',
          nonScout: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 123,
          presence: 0,
          dateOfBirth: new Date(),
          internationalGuest: false,
        },
        {
          participantId: 2,
          firstName: 'Tero',
          lastName: 'Esimerkki',
          nonScout: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 345,
          presence: 0,
          dateOfBirth: new Date(),
          internationalGuest: false,
        },
        {
          participantId: 3,
          firstName: 'Jussi',
          lastName: 'Jukola',
          nonScout: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'seikkailija',
          memberNumber: 859,
          presence: 0,
          dateOfBirth: new Date(),
          internationalGuest: false,
        },
      ],
    }
  }
})
