import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

const testUser = {
  'id': 1,
  'username': 'testLooser',
  'memberNumber': '00000002',
  'email': 'jukka.pekka@example.com',
  'password': 'salasa',
  'firstName': 'Jukka',
  'lastName': 'Pekka',
  'phoneNumber': '0000000003',
};

const testOptions = [
  {
    'id':0,
    'property': 'village',
    'value': 'Mallikylä'
  },
  {
    'id':1,
    'property': 'village',
    'value': 'muu'
  },
  {
    'id':2,
    'property': 'campGroup',
    'value': 'muu'
  }
];

describe('Options', () => {

  let accessToken = null;

  beforeEach( async () => {
    await resetDatabase();
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser'], testUser);
    await testUtils.createFixture('Option', testOptions);
    accessToken = accessToken.id;
  });

  it('GET request to options', async () =>
    await request(app)
    .get(`/api/options/?access_token=${accessToken}`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(3);
      expect(res.body[0]).to.have.property('property','village');
      expect(res.body[0]).to.have.property('value','Mallikylä');
      expect(res.body[1]).to.have.property('property','village');
      expect(res.body[1]).to.have.property('value','muu');
      expect(res.body[2]).to.have.property('property','campGroup');
      expect(res.body[2]).to.have.property('value','muu');
    })
  );

});
