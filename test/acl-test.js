import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';

chai.use(chaiAsPromised);

const testUser = {
  'username': 'testUser',
  'memberNumber': '7654321',
  'email': 'testi@adm.in',
  'password': 'salasana',
  'firstName': 'Testi',
  'lastName': 'Testailija',
  'phoneNumber': 'n/a',
};

function get(endpoint) {
  return request(app)
    .get(endpoint);
}

function post(endpoint, data) {
  return request(app)
    .post(endpoint)
    .send(data);
}

function put(endpoint, data) {
  return request(app)
    .put(endpoint)
    .send(data);
}

function del(endpoint) {
  return request(app)
    .delete(endpoint);
}

function logInUserWithoutRoles() {
  return testUtils.createFixture('RegistryUser', testUser)
    .then(() => testUtils.loginUser(testUser.username, testUser.password));
}

function logInRegistryUser() {
  return testUtils.createUserWithRoles(['registryUser'], testUser)
    .then(() => testUtils.loginUser(testUser.username, testUser.password));
}

function logInRegistryAdmin() {
  return testUtils.createUserWithRoles(['registryAdmin'], testUser)
    .then(() => testUtils.loginUser(testUser.username, testUser.password));
}

const OK = 200;
const NO_CONTENT = 204;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;

describe('http api access control', () => {
  beforeEach(() => resetDatabase());

  describe('AuditEvent', () => {
    it('Should not be exposed through http', () => get('/api/auditevents').expect(NOT_FOUND));
  });

  describe('Role', () => {
    it('Should not be exposed through http', () => get('/api/roles').expect(NOT_FOUND));
  });

  describe('RoleMapping', () => {
    it('Should not be exposed through http', () => get('/api/rolemappings').expect(NOT_FOUND));
  });

  describe('ACL', () => {
    it('Should not be exposed through http', () => get('/api/acls').expect(NOT_FOUND));
  });

  describe('AccessToken', () => {
    it('Should not be exposed through http', () => get('/api/accesstokens').expect(NOT_FOUND));
  });

  describe('KuksaSubCamp', () => {
    it('Should not be exposed through http', () => get('/api/kuksasubcamps').expect(NOT_FOUND));
  });

  describe('KuksaVillage', () => {
    it('Should not be exposed through http', () => get('/api/kuksavillages').expect(NOT_FOUND));
  });

  describe('KuksaCampGroup', () => {
    it('Should not be exposed through http', () => get('/api/kuksacampgroups').expect(NOT_FOUND));
  });

  describe('KuksaLocalGroup', () => {
    it('Should not be exposed through http', () => get('/api/kuksalocalgroups').expect(NOT_FOUND));
  });

  describe('KuksaParticipant', () => {
    it('Should not be exposed through http', () => get('/api/kuksaparticipants').expect(NOT_FOUND));
  });

  describe('KuksaExtraInfoField', () => {
    it('Should not be exposed through http', () => get('/api/kuksaextrainfofields').expect(NOT_FOUND));
  });

  describe('KuksaParticipantExtraInfo', () => {
    it('Should not be exposed through http', () => get('/api/kuksaparticipantextrainfos').expect(NOT_FOUND));
  });

  describe('KuksaExtraSelectionGroup', () => {
    it('Should not be exposed through http', () => get('/api/kuksaextraselectiongroups').expect(NOT_FOUND));
  });

  describe('KuksaExtraSelection', () => {
    it('Should not be exposed through http', () => get('/api/kuksaextraselections').expect(NOT_FOUND));
  });

  describe('KuksaParticipantExtraSelection', () => {
    it('Should not be exposed through http', () => get('/api/kuksaparticipantextraselections').expect(NOT_FOUND));
  });

  describe('Participant', () => {
    const participantFixture1 = {
      participantId: 1,
      firstName: 'derp',
      lastName: 'durp',
      nonScout: false,
      memberNumber: '1234',
      dateOfBirth: new Date(),
      email: 'derp@example.com',
      localGroup: 'localgroup',
      campGroup: 'campGroup',
      subCamp: 'subCamp',
      ageGroup: 'vaeltaja',
    };
    const participantFixture2 = {
      participantId: 2,
      firstName: 'derp',
      lastName: 'durp',
      nonScout: false,
      memberNumber: '1234',
      dateOfBirth: new Date(),
      email: 'derp@example.com',
      localGroup: 'localgroup',
      campGroup: 'campGroup',
      subCamp: 'subCamp',
      ageGroup: 'vaeltaja',
    };

    beforeEach(() => testUtils.createFixture('Participant', participantFixture1));

    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1').expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne').expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get('/api/participants/1/exists').expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count').expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/participants', participantFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/participants/1').expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put('/api/participants/1', { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/participants', participantFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/participants', { participantId: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post(`/api/participants/update`, { ids: [1], newValue: 1, fieldName: 'inCamp' }).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessToken;

      beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

      it('find: UNAUTHORIZED', () => get(`/api/participants?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/participants/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get(`/api/participants/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get(`/api/participants/1/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get(`/api/participants/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put(`/api/participants/1?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, { participantId: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post(`/api/participants/update?access_token=${accessToken}`, { ids: [1], newValue: 1, fieldName: 'inCamp' }).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessToken;

      beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

      it('find: ok', () => get(`/api/participants/?access_token=${accessToken}`).expect(OK));
      it('findById: ok', () => get(`/api/participants/1?access_token=${accessToken}`).expect(OK));
      it('findOne: ok', () => get(`/api/participants/findOne?access_token=${accessToken}`).expect(OK));
      it('exists: ok', () => get(`/api/participants/1/exists?access_token=${accessToken}`).expect(OK));
      it('count: ok', () => get(`/api/participants/count/?access_token=${accessToken}`).expect(OK));

      it('create: UNAUTHORIZED', () => post(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put(`/api/participants/1?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, { participantId: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('massedit: ok', () => post(`/api/participants/update?access_token=${accessToken}`, { ids: [1], newValue: 1, fieldName: 'inCamp' }).expect(OK));
    });

    describe('registryAdmin', () => {
      let accessToken;

      beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

      it('find: UNAUTHORIZED', () => get(`/api/participants/?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/participants/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get(`/api/participants/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get(`/api/participants/1/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get(`/api/participants/count/?access_token=${accessToken}`).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put(`/api/participants/1?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, participantFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/participants?access_token=${accessToken}`, { participantId: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post(`/api/participants/update?access_token=${accessToken}`, { ids: [1], newValue: 1, fieldName: 'inCamp' }).expect(UNAUTHORIZED));
    });
  });

  describe('ParticipantHistory', () => {
    const participantFixture = {
      participantId: 1,
      firstName: 'derp',
      lastName: 'durp',
      nonScout: false,
      memberNumber: '1234',
      dateOfBirth: new Date(),
      email: 'derp@example.com',
      localGroup: 'localgroup',
      campGroup: 'campGroup',
      subCamp: 'subCamp',
      ageGroup: 'vaeltaja',
    };
    const participantHistoryFixture = {
      participantId: 1,
      departed: new Date(),
    };

    beforeEach(() =>
      testUtils.createFixture('Participant', participantFixture)
        .then(() => testUtils.createFixture('ParticipantHistory', participantHistoryFixture))
    );

    describe('Directly', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/participanthistories').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participanthistories/1').expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/participanthistories/findOne').expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/participanthistories/1/exists').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participanthistories/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participanthistories', participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participanthistories/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participanthistories/1', { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/participanthistories', participantHistoryFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/participanthistories', { id: 1, departed: new Date() }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get(`/api/participanthistories?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get(`/api/participanthistories/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get(`/api/participanthistories/1/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get(`/api/participanthistories/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participanthistories/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, { id: 1, departed: new Date() }).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get(`/api/participanthistories?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get(`/api/participanthistories/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get(`/api/participanthistories/1/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get(`/api/participanthistories/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participanthistories/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, { id: 1, departed: new Date() }).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get(`/api/participanthistories?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get(`/api/participanthistories/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get(`/api/participanthistories/1/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get(`/api/participanthistories/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participanthistories/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participanthistories/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put(`/api/participanthistories?access_token=${accessToken}`, { id: 1, departed: new Date() }).expect(UNAUTHORIZED));
      });
    });

    describe('Through the participant', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/1').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/presenceHistory', participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/presenceHistory/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/presenceHistory/1', { arrived: new Date() }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post(`/api/participants/1/presenceHistory?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: ok', () => get(`/api/participants/1/presenceHistory?access_token=${accessToken}`).expect(OK));
        it('findById: ok', () => get(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(OK));
        it('count: ok', () => get(`/api/participants/1/presenceHistory/count?access_token=${accessToken}`).expect(OK));

        it('create: UNAUTHORIZED', () => post(`/api/participants/1/presenceHistory?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get(`/api/participants/1/presenceHistory/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post(`/api/participants/1/presenceHistory?access_token=${accessToken}`, participantHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put(`/api/participants/1/presenceHistory/1?access_token=${accessToken}`, { arrived: new Date() }).expect(UNAUTHORIZED));
      });
    });
  });

  describe('RegistryUser', () => {
    const userFixture1 = {
      firstName: 'derp',
      lastName: 'durp',
      password: 'password',
      memberNumber: '1234',
      email: 'derp@example.com',
      phoneNumber: '123456',
    };
    const userFixture2 = {
      firstName: 'derp',
      lastName: 'durp',
      password: 'password',
      memberNumber: '1234',
      email: 'herp@example.com',
      phoneNumber: '123456',
    };

    let userId;

    beforeEach(() => testUtils.createFixture('RegistryUser', userFixture1).tap(user => userId = user.id));

    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get(`/api/registryusers`).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/registryusers/${userId}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get(`/api/registryusers/findOne`).expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get(`/api/registryusers/count`).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post(`/api/registryusers`, userFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del(`/api/registryusers/${userId}`).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put(`/api/registryusers/${userId}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/registryusers`, userFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/registryusers`, { id: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post(`/api/registryusers/login`, { email: userFixture1.email, password: userFixture1.password }).expect(UNAUTHORIZED));
      it('logout: UNAUTHORIZED', () => post(`/api/registryusers/logout`).expect(UNAUTHORIZED));
      it('password reset: UNAUTHORIZED', () => post(`/api/registryusers/reset`, { email: 'derp@durp.com' }).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get(`/api/registryusers/confirm`).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInUserWithoutRoles().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: UNAUTHORIZED', () => get(`/api/registryusers?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get(`/api/registryusers/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get(`/api/registryusers/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(UNAUTHORIZED));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update (other user): UNAUTHORIZED', () => put(`/api/registryusers/${userId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('update (own): UNAUTHORIZED', () => put(`/api/registryusers/${ownUserId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/registryusers?access_token=${accessToken}`, { id: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post(`/api/registryusers/login?access_token=${accessToken}`, { email: userFixture1.email, password: userFixture1.password }).expect(UNAUTHORIZED));
      it('logout: OK', () => post(`/api/registryusers/logout?access_token=${accessToken}`).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post(`/api/registryusers/reset?access_token=${accessToken}`, { email: 'derp@durp.com' }).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get(`/api/registryusers/confirm?access_token=${accessToken}`).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInRegistryUser().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: UNAUTHORIZED', () => get(`/api/registryusers?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get(`/api/registryusers/findOne?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('exists (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}/exists?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get(`/api/registryusers/count?access_token=${accessToken}`).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(UNAUTHORIZED));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update (other user): UNAUTHORIZED', () => put(`/api/registryusers/${userId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('update (own): UNAUTHORIZED', () => put(`/api/registryusers/${ownUserId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put(`/api/registryusers?access_token=${accessToken}`, { id: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post(`/api/registryusers/login?access_token=${accessToken}`, { email: userFixture1.email, password: userFixture1.password }).expect(UNAUTHORIZED));
      it('logout: OK', () => post(`/api/registryusers/logout?access_token=${accessToken}`).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post(`/api/registryusers/reset?access_token=${accessToken}`, { email: 'derp@durp.com' }).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get(`/api/registryusers/confirm?access_token=${accessToken}`).expect(UNAUTHORIZED));
    });

    describe('registryAdmin', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInRegistryAdmin().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: ok', () => get(`/api/registryusers?access_token=${accessToken}`).expect(OK));
      it('findById (other user): ok', () => get(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(OK));
      it('findById (own): ok', () => get(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(OK));
      it('findOne: ok', () => get(`/api/registryusers/findOne?access_token=${accessToken}`).expect(OK));
      it('exists (other user): ok', () => get(`/api/registryusers/${userId}/exists?access_token=${accessToken}`).expect(OK));
      it('exists (own): ok', () => get(`/api/registryusers/${ownUserId}/exists?access_token=${accessToken}`).expect(OK));
      it('count: ok', () => get(`/api/registryusers/count?access_token=${accessToken}`).expect(OK));

      it('create: ok', () => post(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(OK));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}?access_token=${accessToken}`).expect(UNAUTHORIZED));
      it('update (other user): ok', () => put(`/api/registryusers/${userId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(OK));
      it('update (own): ok', () => put(`/api/registryusers/${ownUserId}?access_token=${accessToken}`, { firstName: 'updated' }).expect(OK));
      it('upsert (insert): ok', () => put(`/api/registryusers?access_token=${accessToken}`, userFixture2).expect(OK));
      it('upsert (update): ok', () => put(`/api/registryusers?access_token=${accessToken}`, { id: 1, firstName: 'updated' }).expect(OK));

      it('login: UNAUTHORIZED', () => post(`/api/registryusers/login?access_token=${accessToken}`, { email: userFixture1.email, password: userFixture1.password }).expect(UNAUTHORIZED));
      it('logout: OK', () => post(`/api/registryusers/logout?access_token=${accessToken}`).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post(`/api/registryusers/reset?access_token=${accessToken}`, { email: 'derp@durp.com' }).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get(`/api/registryusers/confirm?access_token=${accessToken}`).expect(UNAUTHORIZED));
    });
  });
});
