import app from '../../src/server/server';
import request from 'supertest';
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
      .get(`/api/test/rbac-test-success?access_token=${accessToken}`)
      .expect(200, 'You should see this!')
  );

  it('should return 401 when user has no permission', () =>
    request(app)
      .get(`/api/test/rbac-test-fail?access_token=${accessToken}`)
      .expect(401, 'Unauthorized: You do not have permission to perform this action')
  );

  it('should find token from Authorization header', () =>
    request(app)
      .get('/api/test/rbac-test-success')
      .set('Authorization', accessToken)
      .expect(200, 'You should see this!')
  );

  it('should return 401 when there is no token', () =>
    request(app)
      .get('/api/test/rbac-test-success')
      .expect(401, 'Unauthorized: No access token given')
  );

  it('should return 401 when there is an incorrect token', () =>
    request(app)
      .get('/api/test/rbac-test-success?access_token=dfgRTYERgherg€ERvrege')
      .expect(401, 'Unauthorized: Invalid access token')
  );

  it('should return 401 when the token has expired', () =>
    app.models.AccessToken.findById(accessToken)
      .then(token => {
        token.created = new Date('December 17, 1995 03:24:00');
        return token.save();
      })
      .then(() => request(app)
        .get(`/api/test/rbac-test-success?access_token=${accessToken}`)
        .expect(401, 'Unauthorized: Invalid access token')
      )
  );
});
