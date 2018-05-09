import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

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
const NOT_FOUND = 404;

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
  before(() => testUtils.createFixture('Participant', participantFixture));

  const presenceHistoryFixture = {
    participantId: 1,
    presence: 3,
    timestamp: new Date(),
    authorId: 1,
  };
  before(() =>
    testUtils.createFixture('PresenceHistory', presenceHistoryFixture)
  );

  const allergyFixture = {
    allergyId: 1,
    name: 'allergia',
  };
  before(() =>
    testUtils.createFixture('Allergy', allergyFixture)
      .then(participant => testUtils.find('Participant', { participantId: participantFixture.participantId }))
      .then(participants => participants[0].allergies.add(allergyFixture.allergyId))
  );

  const selectionFixture = {
    participantId: 1,
    kuksaGroupId: 1,
    kuksaSelectionId: 1,
    groupName: 'Ryhmänimi',
    selectionName: 'Valintanimi',
  };
  before(() =>
    testUtils.createFixture('Selection', selectionFixture)
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

  describe('PresenceHistory', () => {
    it('Should not be exposed through http', () => get('/api/PresenceHistories').expect(NOT_FOUND));
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

  describe('KuksaParticipantPaymentStatus', () => {
    it('Should not be exposed through http', () => get('/api/kuksaparticipantpaymentstatuses').expect(NOT_FOUND));
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
    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1').expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne').expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count').expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants', noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', noRolesAccessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne', noRolesAccessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count', noRolesAccessToken).expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, noRolesAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants', registryUserAccessToken).expect(OK));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', registryUserAccessToken).expect(OK));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, registryUserAccessToken).expect(OK));
    });

    describe('registryAdmin', () => {
      it('find: UNAUTHORIZED', () => get('/api/participants', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get('/api/participants/1', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/participants/findOne', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('count: UNAUTHORIZED', () => get('/api/participants/count', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('massedit: UNAUTHORIZED', () => post('/api/participants/massAssign', { ids: [1], newValue: 1, fieldName: 'presence' }, registryAdminAccessToken).expect(UNAUTHORIZED));
    });
  });

  describe('Allergy', () => {

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
        it('find: UNAUTHORIZED', () => get('/api/Allergies', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Allergies/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Allergies/findOne', noRolesAccessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Allergies/1/exists', noRolesAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Allergies/count', noRolesAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { arrived: new Date() }, noRolesAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, noRolesAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        it('find: AUTHORIZED', () => get('/api/Allergies', registryUserAccessToken).expect(OK));
        it('findById: AUTHORIZED', () => get('/api/Allergies/1', registryUserAccessToken).expect(OK));
        it('findOne: AUTHORIZED', () => get('/api/Allergies/findOne', registryUserAccessToken).expect(OK));
        it('exists: AUTHORIZED', () => get('/api/Allergies/1/exists', registryUserAccessToken).expect(OK));
        it('count: AUTHORIZED', () => get('/api/Allergies/count', registryUserAccessToken).expect(OK));
        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', registryUserAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { id: 1, name: 'porkkana' }, registryUserAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, registryUserAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        it('find: AUTHORIZED', () => get('/api/Allergies', registryAdminAccessToken).expect(OK));
        it('findById: AUTHORIZED', () => get('/api/Allergies/1', registryAdminAccessToken).expect(OK));
        it('findOne: AUTHORIZED', () => get('/api/Allergies/findOne', registryAdminAccessToken).expect(OK));
        it('exists: AUTHORIZED', () => get('/api/Allergies/1/exists', registryAdminAccessToken).expect(OK));
        it('count: AUTHORIZED', () => get('/api/Allergies/count', registryAdminAccessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/Allergies', allergyFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Allergies/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Allergies/1', { id: 1, name: 'porkkana' }, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Allergies', allergyFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Allergies', { id: 1, name: 'porkkana' }, registryAdminAccessToken).expect(UNAUTHORIZED));
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
        it('find: UNAUTHORIZED', () => get('/api/participants/1/allergies', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/allergies/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/allergies/count', noRolesAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, noRolesAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        it('find: ok', () => get('/api/participants/1/allergies', registryUserAccessToken).expect(OK));
        it('findById: ok', () => get('/api/participants/1/allergies/1', registryUserAccessToken).expect(OK));
        it('count: ok', () => get('/api/participants/1/allergies/count', registryUserAccessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', registryUserAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, registryUserAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/allergies', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/allergies/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/allergies/count', registryAdminAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/allergies', allergyFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/allergies/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/allergies/1', { id: 1, name: 'porkkana' }, registryAdminAccessToken).expect(UNAUTHORIZED));
      });
    });
  });

  describe('Selection', () => {

    describe('Directly', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/Selections').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Selections/1').expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Selections/findOne').expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Selections/1/exists').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Selections/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Selections', selectionFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Selections/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Selections/1', { selectionName: 'Nimi' }).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Selections', selectionFixture).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Selections', { selectionId: 1, selectionName: 'nimi' }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        it('find: UNAUTHORIZED', () => get('/api/Selections', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Selections/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Selections/findOne', noRolesAccessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Selections/1/exists', noRolesAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Selections/count', noRolesAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Selections', selectionFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Selections/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Selections/1', { selectionName: 'Nimi' }, noRolesAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Selections', selectionFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Selections', { selectionId: 1, selectionName: 'nimi' }, noRolesAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        it('find: ok', () => get('/api/Selections', registryUserAccessToken).expect(OK));
        it('findById: ok', () => get('/api/Selections/1', registryUserAccessToken).expect(OK));
        it('findOne: ok', () => get('/api/Selections/findOne', registryUserAccessToken).expect(OK));
        it('exists: ok', () => get('/api/Selections/1/exists', registryUserAccessToken).expect(OK));
        it('count: ok', () => get('/api/Selections/count', registryUserAccessToken).expect(OK));
        it('create: UNAUTHORIZED', () => post('/api/Selections', selectionFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Selections/1', registryUserAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Selections/1', { selectionName: 'Nimi' }, registryUserAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Selections', allergyFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Selections', { selectionId: 1, selectionName: 'nimi' }, registryUserAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        it('find: UNAUTHORIZED', () => get('/api/Selections', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/Selections/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('findOne: UNAUTHORIZED', () => get('/api/Selections/findOne', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('exists: UNAUTHORIZED', () => get('/api/Selections/1/exists', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/Selections/count', registryAdminAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/Selections', selectionFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/Selections/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/Selections/1', { selectionName: 'Nimi' }, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('upsert (insert): UNAUTHORIZED', () => put('/api/Selections', selectionFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('upsert (update): UNAUTHORIZED', () => put('/api/Selections', { selectionId: 1, selectionName: 'nimi' }, registryAdminAccessToken).expect(UNAUTHORIZED));
      });
    });

    describe('Through the participant', () => {
      describe('Unauthenticated user', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/selections').expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/selections/1').expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/selections/count').expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/selections', allergyFixture).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/selections/1').expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/selections/1', { selectionName: 'Nimi' }).expect(UNAUTHORIZED));
      });

      describe('Authenticated user without roles', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/selections', noRolesAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/selections/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/selections/count', noRolesAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/selections', selectionFixture, noRolesAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/selections/1', noRolesAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/selections/1', { selectionName: 'Nimi' }, noRolesAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryUser', () => {
        it('find: ok', () => get('/api/participants/1/selections', registryUserAccessToken).expect(OK));
        it('findById: ok', () => get('/api/participants/1/selections/1', registryUserAccessToken).expect(OK));
        it('count: ok', () => get('/api/participants/1/selections/count', registryUserAccessToken).expect(OK));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/selections', selectionFixture, registryUserAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/selections/1', registryUserAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/selections/1', { selectionName: 'Nimi' }, registryUserAccessToken).expect(UNAUTHORIZED));
      });

      describe('registryAdmin', () => {
        it('find: UNAUTHORIZED', () => get('/api/participants/1/selections', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('findById: UNAUTHORIZED', () => get('/api/participants/1/selections/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('count: UNAUTHORIZED', () => get('/api/participants/1/selections/count', registryAdminAccessToken).expect(UNAUTHORIZED));

        it('create: UNAUTHORIZED', () => post('/api/participants/1/selections', allergyFixture, registryAdminAccessToken).expect(UNAUTHORIZED));
        it('deleteById: UNAUTHORIZED', () => del('/api/participants/1/selections/1', registryAdminAccessToken).expect(UNAUTHORIZED));
        it('update: UNAUTHORIZED', () => put('/api/participants/1/selections/1', { selectionName: 'Nimi' }, registryAdminAccessToken).expect(UNAUTHORIZED));
      });
    });
  });

  describe('RegistryUser', () => {
    const userFixtureToCreate = {
      firstName: 'derp',
      lastName: 'durp',
      password: 'password',
      memberNumber: '1234',
      email: 'attempted_to_create@example.com',
      phoneNumber: '123456',
    };
    afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser', { email: 'attempted_to_create@example.com' }));

    describe('Unauthenticated user', () => {
      it('find: UNAUTHORIZED', () => get('/api/registryusers').expect(UNAUTHORIZED));
      it('findById: UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne').expect(UNAUTHORIZED));
      it('exists: NOT_FOUND', () => get(`/api/registryusers/${otherUserId}/exists`).expect(NOT_FOUND));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count').expect(UNAUTHORIZED));

      it('create: NOT_FOUND', () => post('/api/registryusers', userFixtureToCreate).expect(NOT_FOUND));
      it('deleteById: NOT_FOUND', () => del(`/api/registryusers/${otherUserId}`).expect(NOT_FOUND));
      it('update: NOT_FOUND', () => put(`/api/registryusers/${otherUserId}`, { firstName: 'updated' }).expect(NOT_FOUND));
      it('upsert (insert): NOT_FOUND', () => put('/api/registryusers', userFixtureToCreate).expect(NOT_FOUND));
      it('upsert (update): NOT_FOUND', () => put('/api/registryusers', { id: 1, firstName: 'updated' }).expect(NOT_FOUND));

      it('login: NOT_FOUND', () => post('/api/registryusers/login', { email: userFixture.email, password: userFixture.password }).expect(NOT_FOUND));
      it('logout: UNAUTHORIZED', () => post('/api/registryusers/logout').expect(UNAUTHORIZED));
      it('password reset: NOT_FOUND', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }).expect(NOT_FOUND));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm').expect(UNAUTHORIZED));

      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`).expect(UNAUTHORIZED));
    });

    describe('Authenticated user without roles', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('noRoles', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, noRolesAccessToken).expect(UNAUTHORIZED));
      it('findById (own): UNAUTHORIZED', () => get(`/api/registryusers/${noRolesUserId}`, noRolesAccessToken).expect(UNAUTHORIZED));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne', noRolesAccessToken).expect(UNAUTHORIZED));
      it('exists (other user): NOT_FOUND', () => get(`/api/registryusers/${otherUserId}/exists`, noRolesAccessToken).expect(NOT_FOUND));
      it('exists (own): NOT_FOUND', () => get(`/api/registryusers/${noRolesUserId}/exists`, noRolesAccessToken).expect(NOT_FOUND));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count', noRolesAccessToken).expect(UNAUTHORIZED));

      it('create: NOT_FOUND', () => post('/api/registryusers', userFixtureToCreate, noRolesAccessToken).expect(NOT_FOUND));
      it('deleteById (other user): NOT_FOUND', () => del(`/api/registryusers/${otherUserId}`, noRolesAccessToken).expect(NOT_FOUND));
      it('deleteById (own): NOT_FOUND', () => del(`/api/registryusers/${noRolesUserId}`, noRolesAccessToken).expect(NOT_FOUND));
      it('update (other user): NOT_FOUND', () => put(`/api/registryusers/${otherUserId}`, { firstName: 'updated' }, noRolesAccessToken).expect(NOT_FOUND));
      it('update (own): NOT_FOUND', () => put(`/api/registryusers/${noRolesUserId}`, { firstName: 'updated' }, noRolesAccessToken).expect(NOT_FOUND));
      it('upsert (insert): NOT_FOUND', () => put('/api/registryusers', userFixtureToCreate, noRolesAccessToken).expect(NOT_FOUND));
      it('upsert (update): NOT_FOUND', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, noRolesAccessToken).expect(NOT_FOUND));

      it('login: NOT FOUND', () => post('/api/registryusers/login', { email: userFixture.email, password: userFixture.password }, noRolesAccessToken).expect(NOT_FOUND));
      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null, accessTokenForLogout).expect(NO_CONTENT));
      it('password reset: NOT_FOUND', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, noRolesAccessToken).expect(NOT_FOUND));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', noRolesAccessToken).expect(UNAUTHORIZED));

      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`, null, noRolesAccessToken).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`, null, noRolesAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryUser', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('registryUser', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: UNAUTHORIZED', () => get('/api/registryusers', registryUserAccessToken).expect(UNAUTHORIZED));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, registryUserAccessToken).expect(UNAUTHORIZED));
      it('findById (own): ok', () => get(`/api/registryusers/${registryUserId}`, registryUserAccessToken).expect(OK));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne', registryUserAccessToken).expect(UNAUTHORIZED));
      it('exists (other user): NOT_FOUND', () => get(`/api/registryusers/${otherUserId}/exists`, registryUserAccessToken).expect(NOT_FOUND));
      it('exists (own): NOT_FOUND', () => get(`/api/registryusers/${registryUserId}/exists`, registryUserAccessToken).expect(NOT_FOUND));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count', registryUserAccessToken).expect(UNAUTHORIZED));

      it('create: NOT_FOUND', () => post('/api/registryusers', userFixtureToCreate, registryUserAccessToken).expect(NOT_FOUND));
      it('deleteById (other user): NOT_FOUND', () => del(`/api/registryusers/${otherUserId}`, registryUserAccessToken).expect(NOT_FOUND));
      it('deleteById (own): NOT_FOUND', () => del(`/api/registryusers/${registryUserId}`, registryUserAccessToken).expect(NOT_FOUND));
      it('update (other user): NOT_FOUND', () => put(`/api/registryusers/${otherUserId}`, { firstName: 'updated' }, registryUserAccessToken).expect(NOT_FOUND));
      it('update (own): NOT_FOUND', () => put(`/api/registryusers/${registryUserId}`, { firstName: 'updated' }, registryUserAccessToken).expect(NOT_FOUND));
      it('upsert (insert): NOT_FOUND', () => put('/api/registryusers', userFixtureToCreate, registryUserAccessToken).expect(NOT_FOUND));
      it('upsert (update): NOT_FOUND', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, registryUserAccessToken).expect(NOT_FOUND));

      it('login: NOT FOUND', () => post('/api/registryusers/login', { email: userFixture.email, password: userFixture.password }, registryUserAccessToken).expect(NOT_FOUND));
      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null,  accessTokenForLogout).expect(NO_CONTENT));
      it('password reset: NOT_FOUND', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, registryUserAccessToken).expect(NOT_FOUND));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', registryUserAccessToken).expect(UNAUTHORIZED));

      it('block user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/block`, null, registryUserAccessToken).expect(UNAUTHORIZED));
      it('unblock user: UNAUTHORIZED', () => post(`/api/registryusers/${otherUserId}/unblock`, null, registryUserAccessToken).expect(UNAUTHORIZED));
    });

    describe('registryAdmin', () => {
      let accessTokenForLogout;
      before(() => testUtils.loginUser('registryAdmin', 'salasana').tap(at => accessTokenForLogout = at.id));

      it('find: ok', () => get('/api/registryusers', registryAdminAccessToken).expect(OK));
      it('findById (other user): UNAUTHORIZED', () => get(`/api/registryusers/${otherUserId}`, registryAdminAccessToken).expect(UNAUTHORIZED));
      it('findById (own): ok', () => get(`/api/registryusers/${registryAdminUserId}`, registryAdminAccessToken).expect(OK));
      it('findOne: UNAUTHORIZED', () => get('/api/registryusers/findOne', registryAdminAccessToken).expect(UNAUTHORIZED));
      it('exists (other user): NOT_FOUND', () => get(`/api/registryusers/${otherUserId}/exists`, registryAdminAccessToken).expect(NOT_FOUND));
      it('exists (own): NOT_FOUND', () => get(`/api/registryusers/${registryAdminUserId}/exists`, registryAdminAccessToken).expect(NOT_FOUND));
      it('count: UNAUTHORIZED', () => get('/api/registryusers/count', registryAdminAccessToken).expect(UNAUTHORIZED));

      it('create: NOT_FOUND', () => post('/api/registryusers', userFixtureToCreate, registryAdminAccessToken).expect(NOT_FOUND));
      it('deleteById (other user): NOT_FOUND', () => del(`/api/registryusers/${otherUserId}`, registryAdminAccessToken).expect(NOT_FOUND));
      it('deleteById (own): NOT_FOUND', () => del(`/api/registryusers/${registryAdminUserId}`, registryAdminAccessToken).expect(NOT_FOUND));
      it('update (other user): NOT_FOUND', () => put(`/api/registryusers/${otherUserId}`, { firstName: 'updated' }, registryAdminAccessToken).expect(NOT_FOUND));
      it('update (own): NOT_FOUND', () => put(`/api/registryusers/${registryAdminUserId}`, { firstName: 'updated' }, registryAdminAccessToken).expect(NOT_FOUND));
      it('upsert (insert): NOT_FOUND', () => put('/api/registryusers', userFixtureToCreate, registryAdminAccessToken).expect(NOT_FOUND));
      it('upsert (update): NOT_FOUND', () => put('/api/registryusers', { id: 1, firstName: 'updated' }, registryAdminAccessToken).expect(NOT_FOUND));

      it('login: NOT FOUND', () => post('/api/registryusers/login', { email: userFixture.email, password: userFixture.password }, registryAdminAccessToken).expect(NOT_FOUND));
      //Use separate access token for logout because the access token used here will cease working on logout
      it('logout: OK', () => post('/api/registryusers/logout', null, accessTokenForLogout).expect(NO_CONTENT));
      it('password reset: NOT_FOUND', () => post('/api/registryusers/reset', { email: 'derp@durp.com' }, registryAdminAccessToken).expect(NOT_FOUND));
      it('confirm email: UNAUTHORIZED', () => get('/api/registryusers/confirm', registryAdminAccessToken).expect(UNAUTHORIZED));

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
});
