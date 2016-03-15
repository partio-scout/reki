import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';
import Promise from 'bluebird';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Audit Event', () => {
  let adminuserId, userId, participantId;

  before(() => resetDatabase());

  beforeEach(done =>
    testUtils.createFixture('Registryuser', {
      'username': 'testAdmin',
      'memberNumber': '7654321',
      'email': 'testi@adm.in',
      'password': 'salasana',
      'name': 'Testi Admin',
      'phone': 'n/a',
    }).then(adminUser => {
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
    ).then(unused =>
      testUtils.loginUser('testAdmin')
    ).then(accessToken =>
      request(app)
        .post(`/api/Registryusers?access_token=${accessToken.id}`)
        .send({
          'username': 'testUser',
          'memberNumber': '1234567',
          'email': 'testi@testailija.fi',
          'password': 'salasana',
          'name': 'Testi Testailija',
          'phone': 'n/a',
        })
        .expect(200)
        .then(res => {
          userId = res.body.id;
          return accessToken;
        })
    ).then(accessToken =>
      request(app)
      .post(`/api/Participants?access_token=${accessToken.id}`)
      .send({
        'firstName': 'Testi',
        'lastName': 'Henkilö',
        'nonScout': false,
      })
      .expect(200)
      .then(res => {
        participantId = res.body.participantId;
        return accessToken;
      })
    ).then(accessToken =>
      request(app)
      .put(`/api/Registryusers/${userId}?access_token=${accessToken.id}`)
      .send({
        'name': 'Testi',
      })
      .expect(200)
      .then(res => accessToken)
    ).then(accessToken =>
      request(app)
      .get(`/api/Registryusers/${userId}?access_token=${accessToken.id}`)
      .expect(200)
      .then(res => accessToken)
    ).then(accessToken =>
      request(app)
      .put(`/api/Participants/${participantId}?access_token=${accessToken.id}`)
      .send({
        'nonScout': true,
      })
      .expect(200)
      .then(res => accessToken)
    ).then(accessToken =>
      request(app)
      .get(`/api/Participants/${participantId}?access_token=${accessToken.id}`)
      .expect(200)
      .then(res => accessToken)
    ).then(accessToken =>
      request(app)
      .del(`/api/Registryusers/${userId}?access_token=${accessToken.id}`)
      .expect(200)
      .then(res => accessToken)
    ).then(accessToken =>
      request(app)
      .del(`/api/Participants/${participantId}?access_token=${accessToken.id}`)
      .expect(200)
      .then(res => accessToken)
    ).nodeify(done)
  );

  afterEach(done => {
    Promise.join(
      testUtils.deleteFixturesIfExist('Registryuser'),
      testUtils.deleteFixturesIfExist('Participant'),
      testUtils.deleteFixturesIfExist('AuditEvent'),
      testUtils.deleteFixturesIfExist('RoleMapping'),
      testUtils.deleteFixturesIfExist('Role')
    ).nodeify(done);
  });

  function expectAuditEventToEventuallyExist(expectedEvent, cb) {
    setTimeout(() => {
      testUtils.find('AuditEvent', expectedEvent).then(res => {
        try {
          expect(res).to.have.length(1);
          expect(res[0]).to.have.property('timestamp').that.is.not.null;
          cb();
        } catch (e) {
          cb(e);
        }
      });
    }, 100);
  }

  // Test registryuser audit logs
  it('should create audit event when creating registryuser', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'add',
        'model': 'Registryuser',
        'modelId': userId,
      }, done);
  });

  it('should create audit event when updating registryuser', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'update',
        'model': 'Registryuser',
        'modelId': userId,
      }, done);
  });

  it('should create audit event when finding registryuser', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'find',
        'model': 'Registryuser',
        'modelId': userId,
      }, done);
  });

  it('should create audit event when deleting registryuser', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'delete',
        'model': 'Registryuser',
        'modelId': userId,
      }, done);
  });

  // Test participant audit logs
  it('should create audit event when creating participant', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'add',
        'model': 'Participant',
        'modelId': participantId,
      }, done);
  });

  it('should create audit event when updating participant', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'update',
        'model': 'Participant',
        'modelId': participantId,
      }, done);
  });

  it('should create audit event when finding participant', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'find',
        'model': 'Participant',
        'modelId': participantId,
      }, done);
  });

  it('should create audit event when deleting participant', done => {
    expectAuditEventToEventuallyExist(
      {
        'eventType': 'delete',
        'model': 'Participant',
        'modelId': participantId,
      }, done);
  });
});
