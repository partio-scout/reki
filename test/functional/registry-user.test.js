import app from '../../src/server/server';
import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;

const blockedUser = {
  'id': 1,
  'username': 'testUser',
  'memberNumber': '00000000',
  'email': 'user@example.com',
  'password': 'salasana',
  'firstName': 'Testi',
  'lastName': 'Testailija',
  'phoneNumber': '0000000001',
  'status': 'blocked',
};

const unblockedUser = {
  'id': 2,
  'username': 'testJumala',
  'memberNumber': '00000001',
  'email': 'jumala@example.com',
  'password': 'salasananas',
  'firstName': 'Jumalan',
  'lastName': 'Poika',
  'phoneNumber': '0000000002',
};

const testUser = {
  'id': 3,
  'username': 'testLooser',
  'memberNumber': '00000002',
  'email': 'jukka.pekka@example.com',
  'password': 'salasa',
  'firstName': 'Jukka',
  'lastName': 'Pekka',
  'phoneNumber': '0000000003',
};

describe('RegistryUser', () => {
  let user;

  before(resetDatabase);

  beforeEach(async () => {
    await testUtils.createUserWithRoles(['registryUser'], blockedUser);
    await testUtils.createUserWithRoles(['registryUser'], unblockedUser);
    user = await testUtils.createUserWithRoles(['registryAdmin'], testUser);
  });

  afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser'));

  it('GET request to registryUsers returns an array of all users', async () => {
    const res = await testUtils.getWithUser('/api/registryusers', user);
    testUtils.expectStatus(res.status, 200);
    expect(res.body).to.be.an('array').with.length(3);
    expect(res.body[0]).to.have.property('id').to.be.above(0);
  });

  it('GET request to registryUsers returns one user when id is users own id', async () => {
    const res = await testUtils.getWithUser('/api/registryusers/3', user);
    testUtils.expectStatus(res.status, 200);

    expect(res.body).to.have.property('id', 3);
    expect(res.body).to.have.property('username','testLooser');
    expect(res.body).to.have.property('memberNumber','00000002');
    expect(res.body).to.have.property('email','jukka.pekka@example.com');
    expect(res.body).to.not.have.property('password');
    expect(res.body).to.have.property('firstName','Jukka');
    expect(res.body).to.have.property('lastName','Pekka');
    expect(res.body).to.have.property('phoneNumber','0000000003');
  });

  it('GET request to registryUsers returns 401 when id is not users own id', async () => {
    const res = await testUtils.getWithUser('/api/registryusers/1', user);
    testUtils.expectStatus(res.status, 401);
  });

  it('if user is blocked status changes in database', async () => {
    const res = await testUtils.postWithUser('/api/registryusers/2/block', user, null);
    testUtils.expectStatus(res.status, 204);

    const affectedUser = await app.models.RegistryUser.findById(2);
    expect(app.models.RegistryUser.isBlocked(affectedUser)).is.true;
  });

  it('if user is unblocked status changes in database', async () => {
    const res = await testUtils.postWithUser('/api/registryusers/1/unblock', user, null);
    testUtils.expectStatus(res.status, 204);

    const affectedUser = await app.models.RegistryUser.findById(1);
    expect(app.models.RegistryUser.isBlocked(affectedUser)).is.false;
  });
});
