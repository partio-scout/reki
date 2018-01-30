import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

chai.use(chaiAsPromised);

describe('Role-Based Access Control', () => {
  let accessToken;

  const testUser = {
    'username': 'testUser',
    'memberNumber': '1234567',
    'email': 'testi@testailija.fi',
    'password': 'salasana',
    'firstName': 'Testi',
    'lastName': 'Testailija',
    'phoneNumber': 'n/a',
  };

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser'], testUser))
      .then(() => testUtils.loginUser(testUser.username, testUser.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
    );

  it('should succeed when user has permission', () =>
    request(app)
      .get(`/api/rbac-test-success?access_token=${accessToken}`)
      .expect(200)
  );

  it('should return 401 when user has no permission', () =>
    request(app)
      .get(`/api/rbac-test-fail?access_token=${accessToken}`)
      .expect(401)
  );
});
