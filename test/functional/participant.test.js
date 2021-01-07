import { expect } from 'chai'
import {
  getWithUser,
  expectStatus,
  createUserWithRoles as createUser,
  deleteUsers,
  withFixtures,
} from '../utils/test-utils'
import { configureApp } from '../../src/server/server'
import {
  initializeSequelize,
  initializeModels,
  resetDatabase,
  Models,
} from '../../src/server/models'

const sequelize = initializeSequelize()
const models = initializeModels(sequelize)
const app = configureApp(false, true, sequelize, models)

describe('Single participant API endpoint', () => {
  let user

  before(() => resetDatabase(sequelize, models))
  withFixtures(models, async () => {
    user = await createUser(models, ['registryUser'])
    return getFixtures(user.id)
  })
  afterEach(() => deleteUsers(models))

  //TODO split this into several test cases for clarity
  it('returns correct info', async () => {
    const res = await getWithUser(app, '/api/participants/1', user)
    expectStatus(res.status, 200)

    expect(res.body).to.have.property('firstName', 'Teemu')
    expect(res.body).to.have.property('dates')
    expect(res.body.dates).to.be.an('array').with.length(3)
    expect(res.body).to.have.property('allergies')
    expect(res.body.allergies).to.be.an('array').with.length(1)
    expect(res.body).to.have.property('selections')
    expect(res.body.selections).to.be.an('array').with.length(1)
    expect(res.body.selections[0]).to.have.property(
      'groupName',
      'herneenpalvojat',
    )
    expect(res.body.selections[0]).to.have.property('selectionName', 'ok')
  })

  it('returns correct information about presence history', async () => {
    const res = await getWithUser(app, '/api/participants/1', user)
    expectStatus(res.status, 200)

    expect(res.body).to.have.property('presenceHistory')
    expect(res.body.presenceHistory).to.be.an('array').with.length(1)
    expect(res.body.presenceHistory[0]).to.have.property('presence', 1)
    expect(res.body.presenceHistory[0]).to.have.property('author')
    expect(res.body.presenceHistory[0].author).to.have.property(
      'firstName',
      'Testi',
    )
    expect(res.body.presenceHistory[0].author).to.not.have.property(
      'passwordHash',
    )
  })

  it('returns 404 when incorrect id is given', async () => {
    const res = await getWithUser(app, '/api/participants/404', user)
    expectStatus(res.status, 404)
  })

  it('returns 404 when a string id is given', async () => {
    const res = await getWithUser(app, '/api/participants/hello', user)
    expectStatus(res.status, 404)
  })

  function getFixtures(userId) {
    return {
      Participant: [
        {
          participantId: 1,
          firstName: 'Teemu',
          lastName: 'Testihenkilö',
          nonScout: false,
          internationalGuest: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Kylä',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 123,
          dateOfBirth: new Date(2018, 5, 10),
        },
      ],
      ParticipantDate: [
        { id: 1, participantId: 1, date: new Date(2016, 6, 20) },
        { id: 2, participantId: 1, date: new Date(2016, 6, 21) },
        { id: 3, participantId: 1, date: new Date(2016, 6, 23) },
      ],
      PresenceHistory: [
        {
          participantParticipantId: 1,
          presence: 1,
          timestamp: new Date(2016, 6, 20),
          authorId: userId,
        },
      ],
      Allergy: [
        {
          allergyId: 1,
          name: 'hernekeitto',
        },
      ],
      Selection: [
        {
          selectionId: 0,
          participantParticipantId: 1,
          kuksaGroupId: 0,
          kuksaSelectionId: 0,
          groupName: 'herneenpalvojat',
          selectionName: 'ok',
        },
      ],
      ParticipantAllergy: [
        {
          allergyAllergyId: 1,
          participantParticipantId: 1,
        },
      ],
    }
  }
})
