import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

describe('Role-Based Access Control', () => {
  before(resetDatabase);

  let testUser;

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser']))
      .then(user => { testUser = user; }),
    );
  afterEach(testUtils.deleteUsers);

  it('should succeed when user has permission', async () => {
    const res = await testUtils.getWithUser('/api/test/rbac-test-success', testUser);
    testUtils.expectStatus(res.status, 200);
  });

  it('should return 401 when user has no permission', async () => {
    const res = await testUtils.getWithUser('/api/test/rbac-test-fail', testUser);
    testUtils.expectStatus(res.status, 401);
  });
});
