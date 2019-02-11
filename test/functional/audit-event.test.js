import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Audit Event', () => {
  const testUser = {
    'username': 'testUser',
    'memberNumber': '1234567',
    'email': 'testi@testailija.fi',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };
  const testParticipants = [{
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
    'dateOfBirth': new Date(),
  }];

  beforeEach(async () => {
    await resetDatabase();
    await testUtils.createFixture('RegistryUser', testUser);
    await testUtils.createFixtureSequelize('Participant', testParticipants);
  });

  async function expectAuditEventToEventuallyExist(expectedEvent) {
    const res = await testUtils.find('AuditEvent', expectedEvent);
    expect(res).to.have.length(1);
    expect(res[0]).to.have.property('timestamp').that.is.not.null;
  }

  it('should create audit event when finding registryusers', async () => {
    const user = await testUtils.createUserWithRoles(['registryAdmin']);
    const response = await testUtils.getWithUser('/api/registryusers', user);
    testUtils.expectStatus(response.status, 200);
    await expectAuditEventToEventuallyExist({
      'eventType': 'find',
      'model': 'RegistryUser',
    });
  });

  it('should create audit event when finding participant', async () => {
    const user = await testUtils.createUserWithRoles(['registryUser']);
    const response = await testUtils.getWithUser('/api/participants/42', user);
    testUtils.expectStatus(response.status, 200);
    await expectAuditEventToEventuallyExist({
      'eventType': 'find',
      'model': 'Participant',
      'modelId': 42,
    });
  });

  after(resetDatabase);
});
