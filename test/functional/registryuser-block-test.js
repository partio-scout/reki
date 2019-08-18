import app from '../../src/server/server';
import { expect } from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import Promise from 'bluebird';

const blockUser = Promise.promisify(app.models.RegistryUser.block, { context: app.models.RegistryUser });
const unblockUser = Promise.promisify(app.models.RegistryUser.unblock, { context: app.models.RegistryUser });

describe('RegistryUser blocking and unblocking', () => {

  before(resetDatabase);
  beforeEach(createUserFixtures);
  afterEach(testUtils.deleteUsers);

  it('new users are not blocked', () =>
    testUtils.find('RegistryUser', { id: 1 })
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(false))
  );

  it('user is blocked after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(true))
  );

  it('user has blocked status after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(results[0].status).to.equal('blocked'))
  );

  it('user has new password after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(results[0].password).to.not.equal('salasana'))
  );

  it('user is not blocked after unblocking', () =>
    unblockUser(2)
      .then(() => testUtils.find('RegistryUser', { id: 2 }))
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(false))
  );

  it('Should not have status after unblocking', () =>
    unblockUser(2)
      .then(() => testUtils.find('RegistryUser', { id: 2 }))
      .then(results => expect(results[0].status).to.be.null)
  );

  async function createUserFixtures() {
    await testUtils.createUserWithRoles(['registryUser'], {
      'id': 1,
      'username': 'testUser',
      'memberNumber': '7654321',
      'email': 'user@example.com',
      'password': 'salasana',
      'firstName': 'Testi',
      'lastName': 'Testailija',
      'phoneNumber': 'n/a',
    });
    await testUtils.createUserWithRoles(['registryUser'], {
      'id': 2,
      'username': 'blockedTestUser',
      'memberNumber': '1234567',
      'email': 'user2@example.com',
      'password': 'salasana',
      'firstName': 'Testi',
      'lastName': 'Testailija',
      'phoneNumber': 'n/a',
      'status': 'blocked',
    });
  }
});
