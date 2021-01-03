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

describe('Particpant list API endpoint', () => {
  before(() => resetDatabase(sequelize, models))
  afterEach(() => deleteUsers(models))
  withFixtures(models, getFixtures())

  it('returns all participants when no where filter is given', async () => {
    const response = await getParticipantsWithFilter({ offset: 0, limit: 200 })
    expect(response.result).to.be.an('array').with.length(3)
    expect(response.result[0]).to.have.property('firstName', 'Teemu')
  })

  it('returns correct participants with one where filter', async () => {
    const response = await getParticipantsWithFilter({
      village: 'Kattivaara',
      offset: 0,
      limit: 200,
    })
    expect(response.result).to.be.an('array').with.length(1)
    expect(response.result[0]).to.have.property('firstName', 'Teemu')
  })

  it('returns correct participants with a combination of where filters', async () => {
    const response = await getParticipantsWithFilter({
      ageGroup: 'sudenpentu',
      village: 'Testikylä',
      offset: 0,
      limit: 200,
    })
    expect(response.result).to.be.an('array').with.length(1)
    expect(response.result[0]).to.have.property('firstName', 'Tero')
  })

  it('returns the dates the participant is present', async () => {
    const response = await getParticipantsWithFilter({ offset: 0, limit: 200 })
    expect(response.result[0]).to.have.property('dates')
    expect(response.result[0].dates).to.be.an('array').with.length(3)
  })

  it('skips correct amount of participants from the start when skip parameter is set', async () => {
    const response = await getParticipantsWithFilter({ offset: 2, limit: 1 })
    expect(response.result).to.be.an('array').with.length(1)
    expect(response.result[0]).to.have.property('participantId', 3)
    expect(response.result[0]).to.have.property('firstName', 'Jussi')
  })

  it('returns correct amount of participants when limit parameter is set', async () => {
    const response = await getParticipantsWithFilter({ offset: 0, limit: 2 })
    expect(response.result).to.be.an('array').with.length(2)
    expect(response.result[0]).to.have.property('participantId', 1)
    expect(response.result[0]).to.have.property('firstName', 'Teemu')
  })

  it('sorts participants correctly when order parameter is set', async () => {
    const response = await getParticipantsWithFilter({
      offset: 0,
      limit: 200,
      orderBy: 'lastName',
      orderDirection: 'DESC',
    })
    expect(response.result).to.be.an('array').with.length(3)
    expect(response.result[0]).to.have.property('lastName', 'Testihenkilö')
    expect(response.result[1]).to.have.property('lastName', 'Jukola')
    expect(response.result[2]).to.have.property('lastName', 'Esimerkki')
  })

  it('returns the count of matching participants along with the result', async () => {
    const response = await getParticipantsWithFilter({ offset: 0, limit: 200 })
    expect(response.count).to.equal(3)
  })

  //count should return the number of all maches regardless of the paging
  it('counts matching participants correctly also when skip and limit are set', async () => {
    const response = await getParticipantsWithFilter({ offset: 1, limit: 2 })
    expect(response.count).to.equal(3)
  })

  // TODO add test for no filters at all
  // TODO add test for invalid filters
  // TODO add test for count when where filter is set

  async function getParticipantsWithFilter(filter) {
    const params = new URLSearchParams(filter)
    const res = await getWithUser(
      app,
      `/api/participants/?${params}`,
      await createUser(models, ['registryUser']),
    )
    expectStatus(res.status, 200)
    return res.body
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
          village: 'Kattivaara',
          subCamp: 'Alaleiri',
          ageGroup: 'sudenpentu',
          memberNumber: 123,
          presence: 0,
          internationalGuest: false,
          dateOfBirth: new Date(),
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
          internationalGuest: false,
          dateOfBirth: new Date(),
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
          internationalGuest: false,
          dateOfBirth: new Date(),
        },
      ],
      ParticipantDate: [
        { participantId: 1, date: new Date(2016, 6, 20) },
        { participantId: 1, date: new Date(2016, 6, 21) },
        { participantId: 1, date: new Date(2016, 6, 23) },
      ],
    }
  }
})
