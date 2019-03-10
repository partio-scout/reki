import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { createUserWithRoles, getWithUser, expectStatus } from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

chai.use(chaiAsPromised);

describe('Role-Based Access Control', () => {
  const testUserDetails = {
    'username': 'testUser',
    'memberNumber': '1234567',
    'email': 'testi@testailija.fi',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };

  let testUser;

  beforeEach(() =>
    resetDatabase()
      .then(() => createUserWithRoles(['registryUser'], testUserDetails))
      .then(user => { testUser = user; })
    );

  it('should succeed when user has permission', async () => {
    const res = await getWithUser('/api/test/rbac-test-success', testUser);
    expectStatus(res.status, 200);
  });

  it('should return 401 when user has no permission', async () => {
    const res = await getWithUser('/api/test/rbac-test-fail', testUser);
    expectStatus(res.status, 401);
  });
});
