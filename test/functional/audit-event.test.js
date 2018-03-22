import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Audit Event', () => {
  let accessToken;

  const adminUserFixture = {
    'username': 'testAdmin',
    'memberNumber': '7654321',
    'email': 'testi@adm.in',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };
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
    'participantId': 42,
    'firstName': 'Testi',
    'lastName': 'Henkilö',
    'nonScout': false,
    'internationalGuest': true,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'village': 'Kylä',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
  };

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser', 'registryAdmin'], adminUserFixture))
      .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
  );

  function expectAuditEventToEventuallyExist(expectedEvent) {
    return testUtils.find('AuditEvent', expectedEvent)
      .then(res => {
        expect(res).to.have.length(1);
        expect(res[0]).to.have.property('timestamp').that.is.not.null;
      });
  }

  function queryInstanceFromDb(modelInPlural, instanceId, accessToken) {
    return request(app)
      .get(`/api/${modelInPlural}/${instanceId}?access_token=${accessToken}`)
      .expect(200);
  }

  it('should create audit event when finding registryusers', async () => {
    await testUtils.createFixture('RegistryUser', testUser);
    await request(app).get(`/api/registryusers/?access_token=${accessToken}`)
      .expect(200);
    await expectAuditEventToEventuallyExist({
      'eventType': 'find',
      'model': 'RegistryUser',
    });
  });

  it('should create audit event when finding participant', () =>
    testUtils.createFixture('Participant', testParticipant)
      .then(participant => queryInstanceFromDb('Participants', participant.participantId, accessToken)
        .then(() => expectAuditEventToEventuallyExist({
          'eventType': 'find',
          'model': 'Participant',
          'modelId': participant.participantId,
        }))
      )
  );
});
