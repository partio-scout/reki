import { expect } from 'chai'
import {
  withFixtures,
  createUserWithRoles,
  getWithUser,
  expectStatus,
} from '../utils/test-utils'
import _ from 'lodash'
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

describe('Date search in participant list API endpoint', () => {
  before(() => resetDatabase(sequelize, models))
  withFixtures(models, getFixtures())

  it("doesn't filter results when no filters are given", () =>
    expectParticipantsForQuery({}, ['Tero', 'Teemu', 'Jussi']))

  it("doesn't affect results when only a non-date filter is given", () =>
    expectParticipantsForQuery({ ageGroup: 'sudenpentu' }, ['Teemu']))

  it("doesn't filter results when an empty date filter is given", () =>
    expectParticipantsForQuery({ dates: [] }, ['Tero', 'Teemu', 'Jussi']))

  it('filters correctly when one date is given', () =>
    expectParticipantsForQuery({ dates: ['2016-07-22T00:00:00.000Z'] }, [
      'Tero',
      'Teemu',
    ]))

  it('filters correctly when one date and another filter are given', () =>
    expectParticipantsForQuery(
      { dates: ['2016-07-23T00:00:00.000Z'], ageGroup: 'seikkailija' },
      ['Tero'],
    ))

  it('filters correctly with two dates', () =>
    expectParticipantsForQuery(
      { dates: ['2016-07-23T00:00:00.000Z', '2016-07-21T00:00:00.000Z'] },
      ['Teemu', 'Tero'],
    ))

  it('filters correctly with and empty date filter and another filter', () =>
    expectParticipantsForQuery({ dates: [], subCamp: 'Alaleiri' }, [
      'Teemu',
      'Jussi',
    ]))

  it('search returns all dates the participant is present, not just the matched dates', async () => {
    const res = await queryParticipants({ dates: ['2016-07-22T00:00:00.000Z'] })
    expect(res.body.result[0].firstName).to.equal('Teemu')
    expect(res.body.result[0].dates).to.have.length(4)
  })

  async function queryParticipants(filter) {
    const user = await createUserWithRoles(models, ['registryUser'])
    const params = new URLSearchParams({
      ...filter,
      offset: 0,
      limit: 20,
    })
    const res = await getWithUser(app, `/api/participants/?${params}`, user)
    expectStatus(res.status, 200)
    return res
  }

  async function expectParticipantsForQuery(query, expectedParticipants) {
    const res = await queryParticipants(query)
    const firstNames = _.map(res.body.result, 'firstName')
    return expect(firstNames).to.have.members(expectedParticipants)
  }

  function getFixtures() {
    return {
      Participant: [
        {
          participantId: 1,
          firstName: 'Teemu',
          lastName: 'Testihenkilö',
          extraFields: {
            memberNumber: 123,
            dateOfBirth: new Date(),
            nonScout: false,
            internationalGuest: false,
            localGroup: 'Testilippukunta',
            campGroup: 'Leirilippukunta',
            village: 'Kylä',
            subCamp: 'Alaleiri',
            ageGroup: 'sudenpentu',
          },
        },
        {
          participantId: 2,
          firstName: 'Tero',
          lastName: 'Esimerkki',
          memberNumber: 345,
          extraFields: {
            nonScout: false,
            internationalGuest: false,
            localGroup: 'Testilippukunta',
            campGroup: 'Leirilippukunta',
            village: 'Kylä',
            subCamp: 'Alaleiri2',
            ageGroup: 'seikkailija',
            dateOfBirth: new Date(),
          },
        },
        {
          participantId: 3,
          firstName: 'Jussi',
          lastName: 'Jukola',
          memberNumber: 859,
          extraFields: {
            nonScout: false,
            internationalGuest: false,
            localGroup: 'Testilippukunta',
            campGroup: 'Leirilippukunta',
            village: 'Kylä',
            subCamp: 'Alaleiri',
            ageGroup: 'seikkailija',
            dateOfBirth: new Date(),
          },
        },
      ],
      ParticipantDate: [
        { participantId: 1, date: new Date(Date.UTC(2016, 6, 20)) },
        { participantId: 1, date: new Date(Date.UTC(2016, 6, 21)) },
        { participantId: 1, date: new Date(Date.UTC(2016, 6, 22)) },
        { participantId: 1, date: new Date(Date.UTC(2016, 6, 23)) },
        { participantId: 2, date: new Date(Date.UTC(2016, 6, 22)) },
        { participantId: 2, date: new Date(Date.UTC(2016, 6, 23)) },
        { participantId: 2, date: new Date(Date.UTC(2016, 6, 27)) },
      ],
    }
  }
})
