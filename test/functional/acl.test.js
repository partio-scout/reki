import { configureApp } from '../../src/server/server'
import request from 'supertest'
import { expect, assert } from 'chai'
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

// In the metadata express keeps in its routers, it stores a regex that is used to match incoming requests
// to route handlers. This regex takes such a regex in string form, and extracts the URL path from it.
const expressRouteRegex = /^\/\^\\(\/.*)\\\/\?\(\?=\\\/\|\$\)\/i$/i

const app = configureApp(false, true)

describe('HTTP API access control', () => {
  const otherUserId = 123

  before(resetDatabase)
  withFixtures(getFixtures())

  describe('Access control tests', () => {
    const apiRoutesWithAccessControlTests = new Set([
      'GET /api/test/rbac-test-success', // tested in other file
      'GET /api/test/rbac-test-fail', // tested in other file
      'GET /api/options',
      'GET /api/participantdates',
      'GET /api/participants',
      'GET /api/participants/:id(\\d+)',
      'POST /api/participants/massAssign',
      'GET /api/registryusers',
      'POST /api/registryusers/:id/block',
      'POST /api/registryusers/:id/unblock',
      'GET /api/config',
      'GET /api/audit-events',
    ])

    function* getRoutes(router, prefix = '') {
      for (const item of router.stack) {
        if (item.name === 'router') {
          const prefix = item.regexp
            .toString()
            .match(expressRouteRegex)[1]
            .replace(/\\/g, '')
          yield* getRoutes(item.handle, prefix)
        } else if (!!item.route && !!item.route.path) {
          for (const method of Object.keys(item.route.methods)) {
            yield `${method.toUpperCase()} ${prefix}${item.route.path}`
          }
        }
      }
    }

    const apiRoutesInApp = new Set(
      Array.from(getRoutes(app._router)).filter((item) =>
        item.includes(' /api'),
      ),
    ) //API endpoints only

    for (const route of apiRoutesInApp) {
      it(`should have access control test for ${route}`, () => {
        /*
          If this test just failed, it means that you probably added, moved or removed an API endpoint.
          To make this test pass, write the relevant tests for your endpoint in this file and update the
          list of known endpoints below - even if your endpoint is accessible to everyone (which
          it probably shouldn't be). It's very important to have access control tests for all
          endpoints.
        */
        assert(
          apiRoutesWithAccessControlTests.has(route),
          `There seems to be no access control test for "${route}" - please add it`,
        )
      })
    }

    for (const route of apiRoutesWithAccessControlTests) {
      it(`should have route for access control test testing ${route}`, () => {
        /*
          If this test just failed, it means that you probably added, moved or removed an API endpoint.
          To make this test pass, write the relevant tests for your endpoint in this file and update the
          list of known endpoints below - even if your endpoint is accessible to everyone (which
          it probably shouldn't be). It's very important to have access control tests for all
          endpoints.
        */
        assert(
          apiRoutesInApp.has(route),
          `"${route}" seems to have been removed - please add the route handler back, or remove this route from the list of expected routes`,
        )
      })
    }
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
      it('block user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/block`).expect(UNAUTHORIZED))
      it('unblock user: UNAUTHORIZED', () =>
        post(`/api/registryusers/${otherUserId}/unblock`).expect(UNAUTHORIZED))
    })

    describe('Authenticated user without roles', () => {
      it('find: UNAUTHORIZED', () =>
        get('/api/registryusers', []).expect(UNAUTHORIZED))

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
      // user has to be before PresenceHistory
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
          authorId: otherUserId,
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
    }
  }
})

function get(endpoint, roles) {
  return {
    expect: async (code) => {
      if (roles) {
        const user = await createUser(roles)
        const res = await getWithUser(app, endpoint, user)
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
        const res = await postWithUser(
          app,
          endpoint,
          await createUser(roles),
          data,
        )
        expectStatus(res.status, code)
      } else {
        await request(app).post(endpoint).send(data).expect(code)
      }
    },
  }
}
