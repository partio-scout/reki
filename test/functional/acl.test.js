import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import _ from 'lodash';

const expect = chai.expect;
chai.use(chaiAsPromised);

function get(endpoint, accessToken) {
  const req = request(app)
    .get(endpoint);

  if (accessToken) {
    req.set('Authorization', accessToken);
  }

  return req;
}

function post(endpoint, data, accessToken) {
  const req = request(app)
    .post(endpoint);

  if (accessToken) {
    req.set('Authorization', accessToken);
  }

  if (data) {
    req.send(data);
  }

  return req;
}

function del(endpoint, accessToken) {
  const req = request(app)
    .delete(endpoint);

  if (accessToken) {
    req.set('Authorization', accessToken);
  }

  return req;
}

function logInUserWithoutRoles() {
  return testUtils.createFixture('RegistryUser', {
    'username': 'noRoles',
    'memberNumber': '7654321',
    'email': 'noRoles@example.org',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  }).then(() => testUtils.loginUser('noRoles', 'salasana'));
}

function logInRegistryUser() {
  return testUtils.createUserWithRoles(['registryUser'], {
    'username': 'registryUser',
    'memberNumber': '7654321',
    'email': 'registryUser@example.org',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  }).then(() => testUtils.loginUser('registryUser', 'salasana'));
}

function logInRegistryAdmin() {
  return testUtils.createUserWithRoles(['registryAdmin'], {
    'username': 'registryAdmin',
    'memberNumber': '7654321',
    'email': 'registryAdmin@example.org',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  }).then(() => testUtils.loginUser('registryAdmin', 'salasana'));
}

const OK = 200;
const NO_CONTENT = 204;
const UNAUTHORIZED = 401;

describe('http api access control', () => {
  let noRolesAccessToken;
  let registryUserAccessToken;
  let registryAdminAccessToken;
  let otherUserId;
  let noRolesUserId;
  let registryUserId;
  let registryAdminUserId;

  // Create fixtures for use in all tests - do not modify these in your tests!
  // These fixtures are created only once for performance reasons.

  before(() => resetDatabase());
  before(() => logInUserWithoutRoles().tap(at => {
    noRolesAccessToken = at.id;
    noRolesUserId = at.userId;
  }));
  before(() => logInRegistryUser().tap(at => {
    registryUserAccessToken = at.id;
    registryUserId = at.userId;
  }));
  before(() => logInRegistryAdmin().tap(at => {
    registryAdminAccessToken = at.id;
    registryAdminUserId = at.userId;
  }));

  const participantFixture = [{
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
  }];
  before(() => testUtils.createFixtureSequelize('Participant', participantFixture));

  const presenceHistoryFixture = [{
    participantId: 1,
    presence: 3,
    timestamp: new Date(),
    authorId: 1,
  }];
  before(() =>
    testUtils.createFixtureSequelize('PresenceHistory', presenceHistoryFixture)
  );

  const allergyFixture = [{
    allergyId: 1,
    name: 'allergia',
  }];

  const participantAllergyFixture = [{
    'allergyAllergyId': 1,
    'participantParticipantId': 1,
  }];

  before( async () => {
    await testUtils.createFixtureSequelize('Allergy', allergyFixture);
    await testUtils.createFixtureSequelize('ParticipantAllergy', participantAllergyFixture);
  });

  const selectionFixture = [{
    participantId: 1,
    kuksaGroupId: 1,
    kuksaSelectionId: 1,
    groupName: 'Ryhmänimi',
    selectionName: 'Valintanimi',
  }];
  before(() =>
    testUtils.createFixtureSequelize('Selection', selectionFixture)
  );

  const userFixture = {
    firstName: 'derp',
    lastName: 'durp',
    password: 'password',
    memberNumber: '1234',
    email: 'derp@example.com',
    phoneNumber: '123456',
  };
  before(() => testUtils.createFixture('RegistryUser', userFixture).tap(user => otherUserId = user.id));

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
        'GET /api/registryusers/:id',
        'POST /api/registryusers/:id/block',
        'POST /api/registryusers/:id/unblock',
        'POST /api/registryusers/logout',
        'GET /api/searchfilters',
        'DELETE /api/searchfilters/:id',
        'POST /api/searchfilters',
        'GET /api/config',
      ];

      const apiRoutesInApp = _(app._router.stack)
        .filter(item => !!item.route && !!item.route.path)
        .flatMap(item => _.map(_.keys(item.route.methods),
          method => `${method.toUpperCase()} ${item.route.path}`))
        .filter(item => _.includes(item, ' /api')) //API endpoints only
        .value();

      apiRoutesInApp.forEach(route => expect(apiRoutesWithAccessControlTests).to.contain(route,
        `There seems to be no access control test for "${route}" - please add it`));

      apiRoutesWithAccessControlTests.forEach(route => expect(apiRoutesInApp).to.contain(route,
        `"${route}" seems to have been removed - please remove it from this test`));
    });
  });

  describe('Participant', () => {
    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1').expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants', noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', noRolesAccessToken).expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, noRolesAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      it('find: OK', () => get('/api/participants', registryUserAccessToken).expect(OK));
      it('findById: OK', () => get('/api/participants/1', registryUserAccessToken).expect(OK));
      it('massedit: OK', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, registryUserAccessToken).expect(OK));
    });

    describe('registryAdmin', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, registryAdminAccessToken).expect(UNAUTHORIZED));
    });
  });

  describe('RegistryUser', () => {
    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/registryusers').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`).expect(UNAUTHORIZED));
      it('logout: UNAUTHORIZED', () => post('/api/registryusers/logout').expect(UNAUTHORIZED));
      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('noRoles', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${noRolesUserId}`, noRolesAccessToken).expect(UNAUTHORIZED));

      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null, accessTokenForLogout).expect(NO_CONTENT));

      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`, null, noRolesAccessToken).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`, null, noRolesAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('registryUser', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', registryUserAccessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, registryUserAccessToken).expect(UNAUTHORIZED));
      it('findById (own): ok', () => get(`/api/registryusers/${registryUserId}`, registryUserAccessToken).expect(OK));

      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null,  accessTokenForLogout).expect(NO_CONTENT));

      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`, null, registryUserAccessToken).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`, null, registryUserAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryAdmin', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('registryAdmin', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: ok', () => get('/api/registryusers', registryAdminAccessToken).expect(OK));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, registryAdminAccessToken).expect(UNAUTHORIZED));
      it('findById (own): ok', () => get(`/api/registryusers/${registryAdminUserId}`, registryAdminAccessToken).expect(OK));

      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null, accessTokenForLogout).expect(NO_CONTENT));

      it('block user: NO_CONTENT', () => post(`/api/registryusers/${otherUserId}/block`, null, registryAdminAccessToken).expect(NO_CONTENT));
      it('unblock user: NO_CONTENT', () => post(`/api/registryusers/${otherUserId}/unblock`, null, registryAdminAccessToken).expect(NO_CONTENT));
    });
  });

  describe('SearchFilter', () => {
    const searchFilterFixture = [{
      id: 111,
      name: 'derp',
      filter: '?filter=%7B"textSearch"%3A"derpderp"%7D',
    }];

    beforeEach( () =>
      testUtils.createFixtureSequelize('SearchFilter', searchFilterFixture)
    );
    const searchFilterFixtureToCreate = {
      id: 2,
      name: 'durp',
      filter: '?filter=%7B"textSearch"%3A"durpdurp"%7D',
    };
    afterEach(() => testUtils.deleteFixturesIfExistSequelize('SearchFilter'));

    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/searchfilters').expect(UNAUTHORIZED));
      it('create: UNAUTHORIZED', () => post('/api/searchfilters', searchFilterFixtureToCreate).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/searchfilters/111').expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      it('find: ok', () => get('/api/searchfilters', registryUserAccessToken).expect(OK));
      it('create: ok', () => post('/api/searchfilters', searchFilterFixtureToCreate, registryUserAccessToken).expect(OK));
      it('deleteById: ok', () => del('/api/searchfilters/111', registryUserAccessToken).expect(OK));
    });

    describe('registryAdmin', () => {
      it('find: UNAUTHORIZED', () => get('/api/searchfilters', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('create: UNAUTHORIZED', () => post('/api/searchfilters', searchFilterFixtureToCreate, registryAdminAccessToken).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/searchfilters/111', registryAdminAccessToken).expect(UNAUTHORIZED));
    });
  });

  describe('Option', () => {
    const optionFixture = [{
      property: 'subCamp',
      value: 'Kolina',
    }];

    beforeEach( () => testUtils.createFixtureSequelize('Option', optionFixture));
    afterEach(() => testUtils.deleteFixturesIfExistSequelize('Option'));

    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () => get('/api/options').expect(UNAUTHORIZED))
    );

    describe('registryUser', () =>
      it('find: OK', () => get('/api/options', registryUserAccessToken).expect(OK))
    );

    describe('registryAdmin', () =>
      it('find: UNAUTHORIZED', () => get('/api/options', registryAdminAccessToken).expect(UNAUTHORIZED))
    );
  });

  describe('ParticipantDate', () => {
    const dateFixture = [{
      participantId: 1,
      date: new Date(),
    }];

    beforeEach( () => testUtils.createFixtureSequelize('ParticipantDate', dateFixture));
    afterEach(() => testUtils.deleteFixturesIfExistSequelize('ParticipantDate'));

    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () => get('/api/participantdates').expect(UNAUTHORIZED))
    );

    describe('registryUser', () =>
      it('find: OK', () => get('/api/participantdates', registryUserAccessToken).expect(OK))
    );

    describe('registryAdmin', () =>
      it('find: UNAUTHORIZED', () => get('/api/participantdates', registryAdminAccessToken).expect(UNAUTHORIZED))
    );
  });

  describe('Config', () => {

    describe('Unauthenticated user', () =>
      it('find: UNAUTHORIZED', () => get('/api/config').expect(UNAUTHORIZED))
    );

    describe('registryUser', () =>
      it('find: OK', () => get('/api/config', registryUserAccessToken).expect(OK))
    );

    describe('registryAdmin', () =>
      it('find: OK', () => get('/api/config', registryAdminAccessToken).expect(OK))
    );
  });

});
