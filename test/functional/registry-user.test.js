import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import Promise from 'bluebird';

chai.use(chaiAsPromised);

const expect = chai.expect;

const blockUser = Promise.promisify(app.models.RegistryUser.block, { context: app.models.RegistryUser });
const unblockUser = Promise.promisify(app.models.RegistryUser.unblock, { context: app.models.RegistryUser });

  const blockedUser = {
    'username': 'testUser',
    'memberNumber': '00000000',
    'email': 'user@example.com',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': '0000000001',
  };

  const unbLockedUser = {
    'username': 'testJumala',
    'memberNumber': '00000001',
    'email': 'jumala@example.com',
    'password': 'salasananas',
    'firstName': 'Jumalan',
    'lastName': 'Poika',
    'phoneNumber': '0000000002',
  };
  
  const testUser = {
    'username': 'testLooser',
    'memberNumber': '00000002',
    'email': 'jukka.pekka@example.com',
    'password': 'salasa',
    'firstName': 'Jukka',
    'lastName': 'Pekka',
    'phoneNumber': '0000000003',
  };

describe('RegistryUser', () => {
  let accessToken;

  beforeEach( async () => {
    await resetDatabase()
    .then(() => testUtils.createUserWithRoles(['registryUser'], blockedUser))
    .then(() => testUtils.createUserWithRoles(['registryUser'], unbLockedUser))
    .then(() => testUtils.createUserWithRoles(['registryUser'], testUser));
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser']);
    accessToken = accessToken.id;
  });
  afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser'));


  it('GET request to registryUsers returns registry users', async () => {
    request(app).get(`/api/registryUsers?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(3);
      expect(res.body[0]).to.have.property('id').to.be.above(0);
    });
  })

  it('GET request to registryUsers returns one when id is users own id', async () => {
    request(app).get(`/api/registryUsers/3/?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(1);
      expect(res.body[0]).to.have.property('id', 3);
      expect(res.body[0]).to.have.property('username','testUser');
      expect(res.body[0]).to.have.property('memberNumber','00000000');
      expect(res.body[0]).to.have.property('email','user.example.com');
      expect(res.body[0]).to.have.property('password','salasana');
      expect(res.body[0]).to.have.property('firstName','Testi');
      expect(res.body[0]).to.have.property('lastName','Testailija');
      expect(res.body[0]).to.have.property('phoneNumber','n/a');
    })
  })

  it('GET request to registryUsers returns 401 when id is not users own id', async () => {
    request(app).get(`/api/registryUsers/2/?access_token=${accessToken}`)
    .expect(401)
  })

  it('if user is blocked status changes in database', async () => {
    blockUser(0);
    request(app).get(`/api/registryUsers?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body[0]).to.have.property('status','blocked');
    })
  })

  it('if user is unblocked status changes in database', async () => {
    unblockUser(1);
    request(app).get(`/api/registryUsers?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body[1].to.have.property('status','null'))
    })
  })

});
