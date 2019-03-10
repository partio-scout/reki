import app from '../../src/server/server';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import Promise from 'bluebird';

chai.use(chaiAsPromised);

const expect = chai.expect;

const blockUser = Promise.promisify(app.models.RegistryUser.block, { context: app.models.RegistryUser });
const unblockUser = Promise.promisify(app.models.RegistryUser.unblock, { context: app.models.RegistryUser });

const testUser = {
  'username': 'testUser',
  'memberNumber': '7654321',
  'email': 'user@example.com',
  'password': 'salasana',
  'firstName': 'Testi',
  'lastName': 'Testailija',
  'phoneNumber': 'n/a',
};

const blockedTestUser = {
  'username': 'blockedTestUser',
  'memberNumber': '1234567',
  'email': 'user2@example.com',
  'password': 'salasana',
  'firstName': 'Testi',
  'lastName': 'Testailija',
  'phoneNumber': 'n/a',
  'status': 'blocked',
};

describe('Registryuser blocking', () => {
  beforeEach(() =>
    resetDatabase()
    .then(() => testUtils.createUserWithRoles(['registryUser'], testUser))
    .then(() => testUtils.createUserWithRoles(['registryUser'], blockedTestUser))
  );

  it('New user should not be blocked', () =>
    testUtils.find('RegistryUser', { id: 1 })
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(false))
  );

  it('Should be blocked after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(true))
  );

  it('Should have blocked status after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(results[0].status).to.equal('blocked'))
  );

  it('Should have new password after blocking', () =>
    blockUser(1)
      .then(() => testUtils.find('RegistryUser', { id: 1 }))
      .then(results => expect(results[0].password).to.not.equal(testUser.password))
  );

  it('Should not be blocked after unblocking', () =>
    unblockUser(2)
      .then(() => testUtils.find('RegistryUser', { id: 2 }))
      .then(results => expect(app.models.RegistryUser.isBlocked(results[0])).to.equal(false))
  );

  it('Should not have status after unblocking', () =>
    unblockUser(2)
      .then(() => testUtils.find('RegistryUser', { id: 2 }))
      .then(results => expect(results[0].status).to.be.null)
  );
});
