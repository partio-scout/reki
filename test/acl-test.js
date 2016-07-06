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

function put(endpoint, data, accessToken) {
  const req = request(app)
    .put(endpoint);

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
      internationalGuest: false,
      memberNumber: '1234',
      dateOfBirth: new Date(),
      email: 'derp@example.com',
      localGroup: 'localgroup',
      campGroup: 'campGroup',
      village: 'village',
      subCamp: 'subCamp',
      ageGroup: 'vaeltaja',
    };
    const participantFixture2 = {
      participantId: 2,
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

      it('massedit: UNAUTHORIZED', () => post('/api/participants/update', { ids: [1], newValue: 1, fieldName: 'presence' }).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessToken;

      beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

      it('find: UNAUTHORIZED', () => get('/api/participants', accessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', accessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne', accessToken).expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get('/api/participants/1/exists', accessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count', accessToken).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/participants/1', accessToken).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put('/api/participants/1', { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/participants', { participantId: 1, firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post('/api/participants/update', { ids: [1], newValue: 1, fieldName: 'presence' }, accessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessToken;

      beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

      it('find: UNAUTHORIZED', () => get('/api/participants', accessToken).expect(OK));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', accessToken).expect(OK));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne', accessToken).expect(OK));
      it('exists: UNAUTHORIZED', () => get('/api/participants/1/exists', accessToken).expect(OK));
      it('count: UNAUTHORIZED', () => get('/api/participants/count', accessToken).expect(OK));

      it('create: UNAUTHORIZED', () => post('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/participants/1', accessToken).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put('/api/participants/1', { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/participants', { participantId: 1, firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post('/api/participants/update', { ids: [1], newValue: 1, fieldName: 'presence' }, accessToken).expect(OK));
    });

    describe('registryAdmin', () => {
      let accessToken;

      beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

      it('find: UNAUTHORIZED', () => get('/api/participants', accessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', accessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne', accessToken).expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get('/api/participants/1/exists', accessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count', accessToken).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del('/api/participants/1', accessToken).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put('/api/participants/1', { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/participants', participantFixture2, accessToken).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/participants', { participantId: 1, firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));

      it('massedit: UNAUTHORIZED', () => post('/api/participants/update', { ids: [1], newValue: 1, fieldName: 'presence' }, accessToken).expect(UNAUTHORIZED));
    });
  });

  describe('PresenceHistory', () => {
    const participantFixture = {
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
    };
    const presenceHistoryFixture = {
      participantId: 1,
      presence: 3,
      timestamp: new Date(),
      authorId: 1,
    };

    beforeEach(() =>
      testUtils.createFixture('Participant', participantFixture)
        .then(() => testUtils.createFixture('PresenceHistory', presenceHistoryFixture))
    );

    describe('Directly', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/PresenceHistories').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/PresenceHistories/1').expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/PresenceHistories/findOne').expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/PresenceHistories/1/exists').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/PresenceHistories/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/PresenceHistories', presenceHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/PresenceHistories/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/PresenceHistories/1', { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/PresenceHistories', presenceHistoryFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/PresenceHistories', { id: 1, departed: new Date() }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/PresenceHistories', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/PresenceHistories/findOne', accessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/PresenceHistories/1/exists', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/PresenceHistories/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/PresenceHistories/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/PresenceHistories', { id: 1, departed: new Date() }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/PresenceHistories', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/PresenceHistories/findOne', accessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/PresenceHistories/1/exists', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/PresenceHistories/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/PresenceHistories/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/PresenceHistories', { id: 1, departed: new Date() }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/PresenceHistories', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/PresenceHistories/findOne', accessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/PresenceHistories/1/exists', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/PresenceHistories/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/PresenceHistories/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/PresenceHistories/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/PresenceHistories', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/PresenceHistories', { id: 1, departed: new Date() }, accessToken).expect(UNAUTHORIZED));
      });
    });

    describe('Through the participant', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/1').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/presenceHistory', presenceHistoryFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/presenceHistory/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/presenceHistory/1', { arrived: new Date() }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/1', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/presenceHistory', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/presenceHistory/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/presenceHistory/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: ok', () => get('/api/participants/1/presenceHistory', accessToken).expect(OK));
        it('findById: ok', () => get('/api/participants/1/presenceHistory/1', accessToken).expect(OK));
        it('count: ok', () => get('/api/participants/1/presenceHistory/count', accessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/presenceHistory', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/presenceHistory/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/presenceHistory/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/1', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/presenceHistory/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/presenceHistory', presenceHistoryFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/presenceHistory/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/presenceHistory/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
      });
    });
  });

  describe('Allergy', () => {
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
      village: 'Kylä',
    };
    const allergyFixture = {
      allergyId: 1,
      name: 'allergia',
    };

    beforeEach(() =>
      testUtils.createFixture('Allergy', allergyFixture)
        .then(() => testUtils.createFixture('Participant', participantFixture))
        .then(participant => testUtils.find('Participant', { where: { participantId: participant.participantId } }))
        .then(participants => participants[0].allergies.add(allergyFixture.allergyId))
    );

    describe('Directly', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/Allergies').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Allergies/1').expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Allergies/findOne').expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Allergies/1/exists').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Allergies/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { arrived: new Date() }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/Allergies', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Allergies/1', accessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Allergies/findOne', accessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Allergies/1/exists', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Allergies/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { arrived: new Date() }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: AUTHORIZED', () => get('/api/Allergies', accessToken).expect(OK));
        it('findById: AUTHORIZED', () => get('/api/Allergies/1', accessToken).expect(OK));
        it('findOne: AUTHORIZED', () => get('/api/Allergies/findOne', accessToken).expect(OK));
        it('exists: AUTHORIZED', () => get('/api/Allergies/1/exists', accessToken).expect(OK));
        it('count: AUTHORIZED', () => get('/api/Allergies/count', accessToken).expect(OK));
        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: AUTHORIZED', () => get('/api/Allergies', accessToken).expect(OK));
        it('findById: AUTHORIZED', () => get('/api/Allergies/1', accessToken).expect(OK));
        it('findOne: AUTHORIZED', () => get('/api/Allergies/findOne', accessToken).expect(OK));
        it('exists: AUTHORIZED', () => get('/api/Allergies/1/exists', accessToken).expect(OK));
        it('count: AUTHORIZED', () => get('/api/Allergies/count', accessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
      });
    });

    describe('Through the participant', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/allergies').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/allergies/1').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/allergies/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        let accessToken;

        beforeEach(() => logInUserWithoutRoles().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/participants/1/allergies', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/allergies/1', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/allergies/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        let accessToken;

        beforeEach(() => logInRegistryUser().tap(at => accessToken = at.id));

        it('find: ok', () => get('/api/participants/1/allergies', accessToken).expect(OK));
        it('findById: ok', () => get('/api/participants/1/allergies/1', accessToken).expect(OK));
        it('count: ok', () => get('/api/participants/1/allergies/count', accessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        let accessToken;

        beforeEach(() => logInRegistryAdmin().tap(at => accessToken = at.id));

        it('find: UNAUTHORIZED', () => get('/api/participants/1/allergies', accessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/allergies/1', accessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/allergies/count', accessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, accessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', accessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, accessToken).expect(UNAUTHORIZED));
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
      it('find: UNAUTHORIZED', () => get('/api/registryusers').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/registryusers/${userId}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne').expect(UNAUTHORIZED));
      it('exists: UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists`).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count').expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/registryusers', userFixture2).expect(UNAUTHORIZED));
      it('deleteById: UNAUTHORIZED', () => del(`/api/registryusers/${userId}`).expect(UNAUTHORIZED));
      it('update: UNAUTHORIZED', () => put(`/api/registryusers/${userId}`, { firstName: 'updated' }).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/registryusers', userFixture2).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/registryusers', { id: 1, firstName: 'updated' }).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post('/api/registryusers/login', { email: userFixture1.email, password: userFixture1.password }).expect(UNAUTHORIZED));
      it('logout: UNAUTHORIZED', () => post('/api/registryusers/logout').expect(UNAUTHORIZED));
      it('password reset: UNAUTHORIZED', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm').expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInUserWithoutRoles().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', accessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}`, accessToken).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}`, accessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne', accessToken).expect(UNAUTHORIZED));
      it('exists (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists`, accessToken).expect(UNAUTHORIZED));
      it('exists (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}/exists`, accessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count', accessToken).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/registryusers', userFixture2, accessToken).expect(UNAUTHORIZED));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}`, accessToken).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}`, accessToken).expect(UNAUTHORIZED));
      it('update (other user): UNAUTHORIZED', () => put(`/api/registryusers/${userId}`, { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('update (own): UNAUTHORIZED', () => put(`/api/registryusers/${ownUserId}`, { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/registryusers', userFixture2, accessToken).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post('/api/registryusers/login', { email: userFixture1.email, password: userFixture1.password }, accessToken).expect(UNAUTHORIZED));
      it('logout: OK', () => post('/api/registryusers/logout', null, accessToken).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, accessToken).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', accessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInRegistryUser().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', accessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}`, accessToken).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}`, accessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne', accessToken).expect(UNAUTHORIZED));
      it('exists (other user): UNAUTHORIZED', () => get(`/api/registryusers/${userId}/exists`, accessToken).expect(UNAUTHORIZED));
      it('exists (own): UNAUTHORIZED', () => get(`/api/registryusers/${ownUserId}/exists`, accessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count', accessToken).expect(UNAUTHORIZED));

      it('create: UNAUTHORIZED', () => post('/api/registryusers', userFixture2, accessToken).expect(UNAUTHORIZED));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}`, accessToken).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}`, accessToken).expect(UNAUTHORIZED));
      it('update (other user): UNAUTHORIZED', () => put(`/api/registryusers/${userId}`, { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('update (own): UNAUTHORIZED', () => put(`/api/registryusers/${ownUserId}`, { firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));
      it('upsert (insert): UNAUTHORIZED', () => put('/api/registryusers', userFixture2, accessToken).expect(UNAUTHORIZED));
      it('upsert (update): UNAUTHORIZED', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, accessToken).expect(UNAUTHORIZED));

      it('login: UNAUTHORIZED', () => post('/api/registryusers/login', { email: userFixture1.email, password: userFixture1.password }, accessToken).expect(UNAUTHORIZED));
      it('logout: OK', () => post('/api/registryusers/logout', null,  accessToken).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, accessToken).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', accessToken).expect(UNAUTHORIZED));
    });

    describe('registryAdmin', () => {
      let accessToken;
      let ownUserId;

      beforeEach(() => logInRegistryAdmin().tap(at => {
        accessToken = at.id;
        ownUserId = at.userId;
      }));

      it('find: ok', () => get('/api/registryusers', accessToken).expect(OK));
      it('findById (other user): ok', () => get(`/api/registryusers/${userId}`, accessToken).expect(OK));
      it('findById (own): ok', () => get(`/api/registryusers/${ownUserId}`, accessToken).expect(OK));
      it('findOne: ok', () => get('/api/registryusers/findOne', accessToken).expect(OK));
      it('exists (other user): ok', () => get(`/api/registryusers/${userId}/exists`, accessToken).expect(OK));
      it('exists (own): ok', () => get(`/api/registryusers/${ownUserId}/exists`, accessToken).expect(OK));
      it('count: ok', () => get('/api/registryusers/count', accessToken).expect(OK));

      it('create: ok', () => post('/api/registryusers', userFixture2, accessToken).expect(OK));
      it('deleteById (other user): UNAUTHORIZED', () => del(`/api/registryusers/${userId}`, accessToken).expect(UNAUTHORIZED));
      it('deleteById (own): UNAUTHORIZED', () => del(`/api/registryusers/${ownUserId}`, accessToken).expect(UNAUTHORIZED));
      it('update (other user): ok', () => put(`/api/registryusers/${userId}`, { firstName: 'updated' }, accessToken).expect(OK));
      it('update (own): ok', () => put(`/api/registryusers/${ownUserId}`, { firstName: 'updated' }, accessToken).expect(OK));
      it('upsert (insert): ok', () => put('/api/registryusers', userFixture2, accessToken).expect(OK));
      it('upsert (update): ok', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, accessToken).expect(OK));

      it('login: UNAUTHORIZED', () => post('/api/registryusers/login', { email: userFixture1.email, password: userFixture1.password }, accessToken).expect(UNAUTHORIZED));
      it('logout: OK', () => post('/api/registryusers/logout', null, accessToken).expect(NO_CONTENT));
      it('password reset: UNAUTHORIZED', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, accessToken).expect(UNAUTHORIZED));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', accessToken).expect(UNAUTHORIZED));
    });
  });
});
