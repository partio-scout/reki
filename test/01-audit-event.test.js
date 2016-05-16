import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Audit Event', () => {
  let adminuserId, userId, participantId, accessToken;
  const testUser = {
    'username': 'testUser',
    'memberNumber': '1234567',
    'email': 'testi@testailija.fi',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };
  const testParticipant = {
    'firstName': 'Testi',
    'lastName': 'Henkilö',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
  };

  beforeEach(() =>
    resetDatabase().then(() =>
      testUtils.createFixture('RegistryUser', {
        'username': 'testAdmin',
        'memberNumber': '7654321',
        'email': 'testi@adm.in',
        'password': 'salasana',
        'firstName': 'Testi',
        'lastName': 'Testailija',
        'phoneNumber': 'n/a',
      })
    ).then(adminUser => {
      adminuserId = adminUser.id;
      return testUtils.createFixture('Role', {
        name: 'admin',
      });
    }).then(role =>
      testUtils.createFixture('RoleMapping', {
        principalType: 'USER',
        principalId: adminuserId,
        roleId: role.id,
      })
    ).then(() =>
      testUtils.loginUser('testAdmin')
    ).then(newAccessToken =>
      accessToken = newAccessToken
    )
  );

  function expectAuditEventToEventuallyExist(expectedEvent) {
    return testUtils.find('AuditEvent', expectedEvent)
    .then(res => {
      expect(res).to.have.length(1);
      expect(res[0]).to.have.property('timestamp').that.is.not.null;
    });
  }

  function postInstanceToDb(modelInPlural, instance, accessToken, idProperty) {
    return request(app)
      .post(`/api/${modelInPlural}?access_token=${accessToken.id}`)
      .send(instance)
      .expect(200)
      .then(res => res.body[idProperty]);
  }

  function postChangesToDb(modelInPlural, instanceId, accessToken, changes) {
    return request(app)
      .put(`/api/${modelInPlural}/${instanceId}?access_token=${accessToken.id}`)
      .send(changes)
      .expect(200);
  }

  function queryInstanceFromDb(modelInPlural, instanceId, accessToken) {
    return request(app)
    .get(`/api/${modelInPlural}/${instanceId}?access_token=${accessToken.id}`)
    .expect(200);
  }

  function deleteInstanceFromDb(modelInPlural, instanceId, accessToken) {
    return request(app)
    .del(`/api/${modelInPlural}/${instanceId}?access_token=${accessToken.id}`)
    .expect(200);
  }

  // Test registryuser audit logs
  it('should create audit event when creating registryuser', () =>
    postInstanceToDb('RegistryUsers', testUser, accessToken, 'id')
    .then(id =>
      expectAuditEventToEventuallyExist({
        'eventType': 'add',
        'model': 'RegistryUser',
        'modelId': id,
      })
    )
  );

  it('should create audit event when updating registryuser', () =>
    postInstanceToDb('RegistryUsers', testUser, accessToken, 'id')
      .then(id => {
        userId = id;
        return postChangesToDb('RegistryUsers', userId, accessToken, { 'firstName': 'Muutos' });
      })
      .then(() =>
        expectAuditEventToEventuallyExist({
          'eventType': 'update',
          'model': 'RegistryUser',
          'modelId': userId,
        })
      )
  );

  it('should create audit event when finding registryuser', () =>
    postInstanceToDb('RegistryUsers', testUser, accessToken, 'id')
    .then(id => {
      userId = id;
      return queryInstanceFromDb('RegistryUsers', userId, accessToken);
    })
    .then(() =>
      expectAuditEventToEventuallyExist({
        'eventType': 'find',
        'model': 'RegistryUser',
        'modelId': userId,
      })
    )
  );

  it('should create audit event when deleting registryuser', () =>
    postInstanceToDb('RegistryUsers', testUser, accessToken, 'id')
    .then(id => {
      userId = id;
      return deleteInstanceFromDb('RegistryUsers', userId, accessToken);
    })
    .then(() =>
      expectAuditEventToEventuallyExist(
        {
          'eventType': 'delete',
          'model': 'RegistryUser',
          'modelId': userId,
        })
    )
  );

  // Test participant audit logs
  it('should create audit event when creating participant', () =>
    postInstanceToDb('Participants', testParticipant, accessToken, 'participantId')
    .then(id =>
      expectAuditEventToEventuallyExist({
        'eventType': 'add',
        'model': 'Participant',
        'modelId': id,
      })
    )
  );

  it('should create audit event when updating participant', () =>
    postInstanceToDb('Participants', testParticipant, accessToken, 'participantId')
      .then(id => {
        participantId = id;
        return postChangesToDb('Participants', participantId, accessToken, { 'firstName': 'Muutos' });
      })
      .then(() =>
        expectAuditEventToEventuallyExist({
          'eventType': 'update',
          'model': 'Participant',
          'modelId': participantId,
        })
      )
  );

  it('should create audit event when finding participant', () =>
    postInstanceToDb('Participants', testParticipant, accessToken, 'participantId')
    .then(id => {
      participantId = id;
      return queryInstanceFromDb('Participants', participantId, accessToken);
    })
    .then(() =>
      expectAuditEventToEventuallyExist({
        'eventType': 'find',
        'model': 'Participant',
        'modelId': participantId,
      })
    )
  );

  it('should create audit event when deleting participant', () =>
    postInstanceToDb('Participants', testParticipant, accessToken, 'participantId')
    .then(id => {
      participantId = id;
      return deleteInstanceFromDb('Participants', participantId, accessToken);
    })
    .then(() =>
      expectAuditEventToEventuallyExist(
        {
          'eventType': 'delete',
          'model': 'Participant',
          'modelId': participantId,
        })
    )
  );

});
