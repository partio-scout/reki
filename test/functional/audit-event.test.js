import { expect } from 'chai';
import {
  withFixtures,
  deleteUsers,
  createUserWithRoles as createUser,
  getWithUser,
  expectStatus,
  find,
} from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

describe('Audit Event', () => {

  before(resetDatabase);
  withFixtures({
    'Participant': [
      {
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
      },
    ],
  });
  afterEach(deleteUsers);

  it('should be created when finding registryusers', async () => {
    const user = await createUser(['registryAdmin']);
    const response = await getWithUser('/api/registryusers', user);
    expectStatus(response.status, 200);
    await expectAuditEventToEventuallyExist({
      'eventType': 'find',
      'model': 'RegistryUser',
    });
  });

  it('should be created when finding participant', async () => {
    const user = await createUser(['registryUser']);
    const response = await getWithUser('/api/participants/42', user);
    expectStatus(response.status, 200);
    await expectAuditEventToEventuallyExist({
      'eventType': 'find',
      'model': 'Participant',
      'modelId': 42,
    });
  });

  async function expectAuditEventToEventuallyExist(expectedEvent) {
    const res = await find('AuditEvent', expectedEvent);
    expect(res).to.have.length(1);
    expect(res[0]).to.have.property('timestamp').that.is.not.null;
  }
});
