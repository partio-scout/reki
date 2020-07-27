import app from '../../src/server/server'
import request from 'supertest'
import { expect } from 'chai'
import {
  withFixtures,
  createUserWithRoles as createUser,
  getWithUser,
  postWithUser,
  expectStatus,
} from '../utils/test-utils'
import { resetDatabase } from '../../scripts/seed-database'
import _ from 'lodash'

const OK = 200
const NO_CONTENT = 204
const UNAUTHORIZED = 401

describe('HTTP API access control', () => {
  const otherUserId = 123

  before(resetDatabase)
  withFixtures(getFixtures())

  describe('Access control tests', () => {
    it('exist for all endpoints under /api', () => {
      /*
        If this test just failed, it means that you probably added, moved or removed an API endpoint.
        To make this test pass, write the relevant tests for your endpoint in this file and update the
        list of known endpoints below - even if your endpoint is accessible to everyone (which
        it probably shouldn't be). It's very important to have access control tests for all
        endpoints.
      */

      const apiRoutesWithAccessControlTests = [
        'GET /api/test/rbac-test-success', // tested in other file
        'GET /api/test/rbac-test-fail', // tested in other file
        'GET /api/options',
        'GET /api/participantdates',
        'GET /api/participants',
        'GET /api/participants/:id',
        'POST /api/participants/massAssign',
        'GET /api/registryusers',
        'POST /api/registryusers/:id/block',
        'POST /api/registryusers/:id/unblock',
        'POST /api/registryusers/logout',
        'GET /api/config',
        'GET /api/audit-events',
      ]

      const apiRoutesInApp = _(app._router.stack)
        .filter((item) => !!item.route && !!item.route.path)
        .flatMap((item) =>
          _.map(
            _.keys(item.route.methods),
            (method) => `${method.toUpperCase()} ${item.route.path}`,
          ),
        )
        .filter((item) => _.includes(item, ' /api')) //API endpoints only
        .value()

      apiRoutesInApp.forEach((route) =>
        expect(apiRoutesWithAccessControlTests).to.contain(
          route,
          `There seems to be no access control test for "${route}" - please add it`,
        ),
      )

      apiRoutesWithAccessControlTests.forEach((route) =>
        expect(apiRoutesInApp).to.contain(
          route,
          `"${route}" seems to have been removed - please remove it from this test`,
        ),
      )
    })
  })

  describe('Participant', () => {
    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/participants').expect(UNAUTHORIZED))
      it('findById: UNAUTHORIZED', () =>
        get('/api/participants/1').expect(UNAUTHORIZED))
      it('massedit: UNAUTHORIZED', () =>
        post('/api/participants/massAssign', {
          ids: [1],
          newValue: 1,
          fieldName: 'presence',
        }).expect(UNAUTHORIZED))
    })

    describe('Authenticated user without roles', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/participants', []).expect(UNAUTHORIZED))
      it('findById: UNAUTHORIZED', () =>
        get('/api/participants/1', []).expect(UNAUTHORIZED))
      it('massedit: UNAUTHORIZED', () =>
        post(
          '/api/participants/massAssign',
          { ids: [1], newValue: 1, fieldName: 'presence' },
          [],
        ).expect(UNAUTHORIZED))
    })

    describe('registryUser', () => {
      it('find: OK', () =>
        get('/api/participants', ['registryUser']).expect(OK))
      it('findById: OK', () =>
        get('/api/participants/1', ['registryUser']).expect(OK))
      it('massedit: OK', () =>
        post(
          '/api/participants/massAssign',
          { ids: [1], newValue: 1, fieldName: 'presence' },
          ['registryUser'],
        ).expect(OK))
    })

    describe('registryAdmin', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/participants', ['registryAdmin']).expect(UNAUTHORIZED))
      it('findById: UNAUTHORIZED', () =>
        get('/api/participants/1', ['registryAdmin']).expect(UNAUTHORIZED))
      it('massedit: UNAUTHORIZED', () =>
        post(
          '/api/participants/massAssign',
          { ids: [1], newValue: 1, fieldName: 'presence' },
          ['registryAdmin'],
        ).expect(UNAUTHORIZED))
    })
  })

  describe('RegistryUser', () => {
    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/registryusers').expect(UNAUTHORIZED))
      it('logout: OK', () =>
        post('/api/registryusers/logout').expect(NO_CONTENT))
      it('block user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/block`).expect(UNAUTHORIZED))
      it('unblock user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/unblock`).expect(UNAUTHORIZED))
    })

    describe('Authenticated user without roles', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/registryusers', []).expect(UNAUTHORIZED))

      it('logout: OK', () =>
        post('/api/registryusers/logout', null, []).expect(NO_CONTENT))

      it('block user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/block`, null, []).expect(
          UNAUTHORIZED,
        ))
      it('unblock user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/unblock`, null, []).expect(
          UNAUTHORIZED,
        ))
    })

    describe('registryUser', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/registryusers', ['registryUser']).expect(UNAUTHORIZED))

      it('logout: OK', () =>
        post('/api/registryusers/logout', null, ['registryUser']).expect(
          NO_CONTENT,
        ))

      it('block user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/block`, null, [
          'registryUser',
        ]).expect(UNAUTHORIZED))
      it('unblock user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/unblock`, null, [
          'registryUser',
        ]).expect(UNAUTHORIZED))
    })

    describe('registryAdmin', () => {
      it('find: ok', () =>
        get('/api/registryusers', ['registryAdmin']).expect(OK))

      it('logout: OK', () =>
        post('/api/registryusers/logout', null, ['registryAdmin']).expect(
          NO_CONTENT,
        ))

      it('block user: NO_CONTENT', () =>
        post(`/api/registryusers/${otherUserId}/block`, null, [
          'registryAdmin',
        ]).expect(NO_CONTENT))
      it('unblock user: NO_CONTENT', () =>
        post(`/api/registryusers/${otherUserId}/unblock`, null, [
          'registryAdmin',
        ]).expect(NO_CONTENT))
    })
  })

  describe('Option', () => {
    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () => get('/api/options').expect(UNAUTHORIZED)))

    describe('registryUser', () =>
      it('find: OK', () => get('/api/options', ['registryUser']).expect(OK)))

    describe('registryAdmin', () =>
      it('find: UNAUTHORIZED', () =>
        get('/api/options', ['registryAdmin']).expect(UNAUTHORIZED)))
  })

  describe('ParticipantDate', () => {
    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () =>
        get('/api/participantdates').expect(UNAUTHORIZED)))

    describe('registryUser', () =>
      it('find: OK', () =>
        get('/api/participantdates', ['registryUser']).expect(OK)))

    describe('registryAdmin', () =>
      it('find: UNAUTHORIZED', () =>
        get('/api/participantdates', ['registryAdmin']).expect(UNAUTHORIZED)))
  })

  describe('Config', () => {
    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () => get('/api/config').expect(UNAUTHORIZED)))

    describe('registryUser', () =>
      it('find: OK', () => get('/api/config', ['registryUser']).expect(OK)))

    describe('registryAdmin', () =>
      it('find: OK', () => get('/api/config', ['registryAdmin']).expect(OK)))
  })

  describe('Audit events', () => {
    describe('Unauthorized user', () =>
      it('find: UNAUTHORIZED', () =>
        get('/api/audit-events').expect(UNAUTHORIZED)))

    describe('registryUser', () =>
      it('find: UNAUTHORIZED', () =>
        get('/api/audit-events', ['registryUser']).expect(UNAUTHORIZED)))

    describe('registryAdmin', () =>
      it('find: OK', () =>
        get('/api/audit-events', ['registryAdmin']).expect(OK)))
  })

  function getFixtures() {
    return {
      Participant: [
        {
          participantId: 1,
          firstName: 'derp',
          lastName: 'durp',
          nonScout: false,
          internationalGuest: false,
          memberNumber: '1234',
          dateOfBirth: new Date(),
          email: 'derp@example.com',
          localGroup: 'localgroup',
          campGroup: 'campGroup',
          village: 'village',
          subCamp: 'subCamp',
          ageGroup: 'vaeltaja',
        },
      ],
      ParticipantDate: [
        {
          participantId: 1,
          date: new Date(),
        },
      ],
      Option: [
        {
          property: 'subCamp',
          value: 'Kolina',
        },
      ],
      PresenceHistory: [
        {
          participantId: 1,
          presence: 3,
          timestamp: new Date(),
          authorId: 1,
        },
      ],
      Allergy: [
        {
          allergyId: 1,
          name: 'allergia',
        },
      ],
      ParticipantAllergy: [
        {
          allergyAllergyId: 1,
          participantParticipantId: 1,
        },
      ],
      Selection: [
        {
          participantId: 1,
          kuksaGroupId: 1,
          kuksaSelectionId: 1,
          groupName: 'Ryhmänimi',
          selectionName: 'Valintanimi',
        },
      ],
      SearchFilter: [
        {
          id: 111,
          name: 'derp',
          filter: '?filter=%7B"textSearch"%3A"derpderp"%7D',
        },
      ],
      User: [
        {
          id: otherUserId,
          firstName: 'derp',
          lastName: 'durp',
          password: 'password',
          memberNumber: '1234',
          email: 'derp@example.com',
          phoneNumber: '123456',
        },
      ],
    }
  }
})

function get(endpoint, roles) {
  return {
    expect: async (code) => {
      if (roles) {
        const user = await createUser(roles)
        const res = await getWithUser(endpoint, user)
        expectStatus(res.status, code)
      } else {
        await request(app).get(endpoint).expect(code)
      }
    },
  }
}

function post(endpoint, data, roles) {
  return {
    expect: async (code) => {
      if (roles) {
        const res = await postWithUser(endpoint, await createUser(roles), data)
        expectStatus(res.status, code)
      } else {
        await request(app).post(endpoint).send(data).expect(code)
      }
    },
  }
}
