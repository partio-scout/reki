import { expect } from 'chai'
import * as testUtils from '../utils/test-utils'
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

describe('Free-text search in participant list API endpoint', () => {
  before(() => resetDatabase(sequelize, models))
  afterEach(() => testUtils.deleteUsers(models))
  testUtils.withFixtures(models, getFixtures())

  it("doesn't filter results when no filter is given", () =>
    queryParticipants({}).then((res) => {
      expectParticipants(['Tero', 'Teemu', 'Jussi'], res.body)
    }))

  it("doesn't affect results when only some other filter is given", () =>
    queryParticipants({ ageGroup: 'sudenpentu' }).then((res) => {
      expectParticipants(['Tero', 'Teemu'], res.body)
    }))

  it('filters results by last name', () =>
    queryParticipants({ textSearch: 'Esimerkki' }).then((res) => {
      expectParticipants(['Tero'], res.body)
    }))

  it('filters results by first name in lowercase', () =>
    queryParticipants({ textSearch: 'tero' }).then((res) => {
      expectParticipants(['Tero'], res.body)
    }))

  it('filters results correctly when combined with multiple filters', () =>
    queryParticipants({
      ageGroup: 'sudenpentu',
      subCamp: 'Alaleiri',
      textSearch: 'Teemu',
    }).then((res) => {
      expectParticipants(['Teemu'], res.body)
    }))

  it('works correctly when multiple filters yield no results', () =>
    queryParticipants({ ageGroup: 'seikkailija', textSearch: 'Teemu' }).then(
      (res) => {
        expectParticipants([], res.body)
      },
    ))

  it("doesn't affect results when only several other filters are present", () =>
    queryParticipants({ ageGroup: 'seikkailija', subCamp: 'Alaleiri' }).then(
      (res) => {
        expectParticipants(['Jussi'], res.body)
      },
    ))

  it('filters results by a part of name', () =>
    queryParticipants({ localGroup: 'Testilippukunta', textSearch: 'Te' }).then(
      (res) => {
        expectParticipants(['Tero', 'Teemu'], res.body)
      },
    ))

  it('filters results by member number', () =>
    queryParticipants({ textSearch: '859' }).then((res) => {
      expectParticipants(['Jussi'], res.body)
    }))

  it('filters results correctly when one word matches one field and one word matches anoher field', () =>
    queryParticipants({ textSearch: 'Jukola Jussi' }).then((res) => {
      expectParticipants(['Jussi'], res.body)
    }))

  it('filters results by staff position', () =>
    queryParticipants({ textSearch: 'Jumppaohjaaja' }).then((res) => {
      expectParticipants(['Tero'], res.body)
    }))

  it('filters results by position in generator', () =>
    queryParticipants({ textSearch: 'Tiskari' }).then((res) => {
      expectParticipants(['Teemu', 'Jussi'], res.body)
    }))

  it('filters results by partial staff position', () =>
    queryParticipants({ textSearch: 'tisk' }).then((res) => {
      expectParticipants(['Teemu', 'Jussi'], res.body)
    }))

  it('filters results by hashtag', () =>
    queryParticipants({ textSearch: '#Tiskari' }).then((res) => {
      expectParticipants(['Jussi'], res.body)
    }))

  it('filters results by camp office notes', () =>
    queryParticipants({ textSearch: 'Leiritoimisto' }).then((res) => {
      expectParticipants(['Tero'], res.body)
    }))

  it('filters results by editable info', () =>
    queryParticipants({ textSearch: 'Muokattava' }).then((res) => {
      expectParticipants(['Teemu'], res.body)
    }))

  function expectParticipants(expectedResult, response) {
    const firstNames = _.map(response.result, 'firstName')
    return expect(firstNames).to.have.members(expectedResult)
  }

  async function queryParticipants({ textSearch, ...filter }) {
    const params = new URLSearchParams({
      ...filter,
      offset: 0,
      limit: 20,
    })
    if (textSearch) {
      params.set('q', textSearch)
    }
    const res = await testUtils.getWithUser(
      app,
      `/api/participants/?${params}`,
      await testUtils.createUserWithRoles(models, ['registryUser']),
    )
    testUtils.expectStatus(res.status, 200)
    return res
  }

  function getFixtures() {
    return {
      Participant: [
        {
          participantId: 1,
          firstName: 'Teemu',
          lastName: 'Testihenkilö',
          nonScout: false,
          memberNumber: 123,
          editableInfo: 'Muokattava teksti',
          extraFields: {
            internationalGuest: false,
            localGroup: 'Testilippukunta',
            campGroup: 'Leirilippukunta',
            village: 'Kylä',
            subCamp: 'Alaleiri',
            ageGroup: 'sudenpentu',
            staffPosition: null,
            staffPositionInGenerator: 'Tiskari',
            dateOfBirth: new Date(),
          },
        },
        {
          participantId: 2,
          firstName: 'Tero',
          lastName: 'Esimerkki',
          memberNumber: 345,
          campOfficeNotes: 'Leiritoimiston jutut',
          extraFields: {
            nonScout: false,
            internationalGuest: false,
            localGroup: 'Testilippukunta',
            campGroup: 'Leirilippukunta',
            village: 'Kylä',
            subCamp: 'Alaleiri',
            ageGroup: 'sudenpentu',
            staffPosition: 'Jumppaohjaaja',
            staffPositionInGenerator: null,
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
            staffPosition: 'Kaivaja',
            staffPositionInGenerator: '#Tiskari',
            dateOfBirth: new Date(),
          },
        },
      ],
    }
  }
})
