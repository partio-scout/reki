import { expect } from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import { models } from '../../src/server/models';

const blockUser = userId => models.User.update({ blocked: true }, { where: { id: userId } });
const unblockUser = userId => models.User.update({ blocked: false }, { where: { id: userId } });

describe('RegistryUser blocking and unblocking', () => {

  before(resetDatabase);
  beforeEach(createUserFixtures);
  afterEach(testUtils.deleteUsers);

  it('new users are not blocked', () =>
    models.User.findByPk(1)
      .then(results => expect(results.blocked).to.equal(false))
  );

  it('user is blocked after blocking', () =>
    blockUser(1)
      .then(() => models.User.findByPk(1))
      .then(results => expect(results.blocked).to.equal(true))
  );

  it('user is not blocked after unblocking', () =>
    unblockUser(2)
      .then(() => models.User.findByPk(2))
      .then(results => expect(results.blocked).to.equal(false))
  );

  async function createUserFixtures() {
    await testUtils.createUserWithRoles(['registryUser'], {
      'id': 1,
      'memberNumber': '7654321',
      'email': 'user@example.com',
      'password': 'salasana',
      'firstName': 'Testi',
      'lastName': 'Testailija',
      'phoneNumber': 'n/a',
      'blocked': false,
    });
    await testUtils.createUserWithRoles(['registryUser'], {
      'id': 2,
      'memberNumber': '1234567',
      'email': 'user2@example.com',
      'password': 'salasana',
      'firstName': 'Testi',
      'lastName': 'Testailija',
      'phoneNumber': 'n/a',
      'blocked': true,
    });
  }
});
