import _ from 'lodash'
import { expect } from 'chai'
import {
  createUserWithRoles,
  withFixtures,
  deleteUsers,
  postWithUser,
  expectStatus,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import { configureApp } from '../../src/server/server'
import {
  initializeSequelize,
  initializeModels,
  Models,
} from '../../src/server/models'

const sequelize = initializeSequelize()
const models = initializeModels(sequelize)
const app = configureApp(false, true, sequelize, models)

describe('Participant mass edit API endpoint', () => {
  const inCamp = 3
  const tmpLeftCamp = 2
  const leftCamp = 1

  let user

  before(() => resetDatabase(sequelize, models))
  withFixtures(models, getFixtures())

  beforeEach(
    async () => (user = await createUserWithRoles(models, ['registryUser'])),
  ),
    afterEach(() => deleteUsers(models))

  it('updates whitelisted fields', async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1, 2],
      newValue: inCamp,
      fieldName: 'presence',
    })

    expectStatus(res.status, 200)
    expect(res.body).to.be.an('array').with.length(2)
    expect(res.body[0]).to.have.property('firstName', 'Teemu')

    const participants = await models.Participant.findAll({
      order: ['participantId'],
    })
    expect(_.map(participants, 'presence')).to.eql([
      inCamp,
      inCamp,
      tmpLeftCamp,
    ])
  })

  it("doesn't update fields that are not whitelisted", async () => {
    const res = await postWithUser(app, '/api/participants/massAssign', user, {
      ids: [1, 2],
      newValue: 'alaleiri2',
      fieldName: 'subCamp',
    })

    expectStatus(res.status, 400)

    const participants = await models.Participant.findAll({
      order: ['participantId'],
    })
    expect(_.map(participants, 'subCamp')).to.eql([
      'Alaleiri',
      'Alaleiri',
      'Alaleiri',
    ])
  })

  function getFixtures() {
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
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 123,
          presence: leftCamp,
          dateOfBirth: new Date(),
        },
        {
          participantId: 2,
          firstName: 'Tero',
          lastName: 'Esimerkki',
          nonScout: false,
          internationalGuest: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 345,
          presence: leftCamp,
          dateOfBirth: new Date(),
        },
        {
          participantId: 3,
          firstName: 'Jussi',
          lastName: 'Jukola',
          nonScout: false,
          internationalGuest: false,
          localGroup: 'Testilippukunta',
          campGroup: 'Leirilippukunta',
          village: 'Testikylä',
          subCamp: 'Alaleiri',
          ageGroup: 'seikkailija',
          memberNumber: 859,
          presence: tmpLeftCamp,
          dateOfBirth: new Date(),
        },
      ],
    }
  }
})
