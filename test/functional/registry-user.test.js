import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

chai.use(chaiAsPromised);

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

const unBLockedUser = {
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
  let accessTokenAdmin;
  let accessTokenUser;

  beforeEach( async () => {
    await resetDatabase();
    await testUtils.createUserWithRoles(['registryUser'], blockedUser);
    accessTokenUser = await testUtils.createUserAndGetAccessToken(['registryUser'], unBLockedUser);
    accessTokenUser = accessTokenUser.id;
    accessTokenAdmin = await testUtils.createUserAndGetAccessToken(['registryAdmin'], testUser);
    accessTokenAdmin = accessTokenAdmin.id;
  });

  afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser'));

  it('GET request to registryUsers returns an array', async () => {
    await request(app).get(`/api/registryusers?access_token=${accessTokenAdmin}`)
      .expect(200)
      .expect(res => {
        expect(res.body).to.be.an('array').with.length(3);
        expect(res.body[0]).to.have.property('id').to.be.above(0);
      });
  });

  it('GET request to registryUsers returns one user when id is users own id', async () => {
    await request(app).get(`/api/registryusers/3/?access_token=${accessTokenAdmin}`)
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('id', 3);
        expect(res.body).to.have.property('username','testLooser');
        expect(res.body).to.have.property('memberNumber','00000002');
        expect(res.body).to.have.property('email','jukka.pekka@example.com');
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('firstName','Jukka');
        expect(res.body).to.have.property('lastName','Pekka');
        expect(res.body).to.have.property('phoneNumber','0000000003');
      });
  });

  it('GET request to registryUsers returns 401 when id is not users own id', async () =>
    await request(app).get(`/api/registryusers/1/?access_token=${accessTokenUser}`)
      .expect(401)
  );

  it('if user is blocked status changes in database', async () => {
    await request(app).post(`/api/registryusers/2/block?access_token=${accessTokenAdmin}`)
      .expect(204);
    const user = await app.models.RegistryUser.findById(2);
    expect(app.models.RegistryUser.isBlocked(user)).is.true;
  });

  it('if user is unblocked status changes in database', async () => {
    await request(app).post(`/api/registryusers/1/unblock?access_token=${accessTokenAdmin}`)
      .expect(204);
    const user = await app.models.RegistryUser.findById(1);
    expect(app.models.RegistryUser.isBlocked(user)).is.false;
  });

  it('logout should destroy accestoken in query param', async () => {
    await request(app).post(`/api/registryusers/logout?access_token=${accessTokenAdmin}`)
      .expect(204);
    expect(await app.models.AccessToken.findById(accessTokenAdmin)).to.be.null;
  });

  it('logout should destroy accestoken in Authorization header', async () => {
    await request(app).post('/api/registryusers/logout')
      .set('Authorization', accessTokenAdmin)
      .expect(204);
    expect(await app.models.AccessToken.findById(accessTokenAdmin)).to.be.null;
  });

});
