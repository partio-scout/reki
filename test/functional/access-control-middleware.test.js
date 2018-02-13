import app from '../../src/server/server';
import { mockReq, mockRes } from 'sinon-express-mock';
import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import accessControlMiddleware from '../../src/server/middleware/access-control.js';

const expect = chai.expect;
const assert = chai.assert;

describe('Role-Based Access Control Middleware', () => {
  const permissions = {
    'registryUser': [
      'perform allowed action',
    ],
    'registryAdmin': [
      'perform disallowed action',
    ],
  };

  let requirePermission;
  before(() => requirePermission = accessControlMiddleware(app, permissions));

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

  it('is a function', () => {
    expect(requirePermission).to.be.a('function');
  });

  it('returns a function', () => {
    expect(requirePermission('perform allowed action')).to.be.a('function');
  });

  it('allows request if user has permission', done => {
    const req = mockReq({
      query: {
        access_token: accessToken,
      },
    });
    const res = mockRes({
      send: () => { expect.fail('res.send() was called'); done(); },
      status: () => { expect.fail('res.status() was called'); done(); },
    });
    const next = () => { assert(true, 'next() was called'); done(); };
    requirePermission('perform allowed action')(req, res, next);
  });

  it('should send unauthorized when user has no permission', done => {
    const req = mockReq({
      query: {
        access_token: accessToken,
      },
    });
    const res = mockRes({
      send: val => { expect(val).to.equal('Unauthorized: You do not have permission to perform this action'); done(); },
      status: val => { expect(val).to.equal(401); return res; },
    });
    const next = () => { expect.fail('next() was called'); done(); };
    requirePermission('perform disallowed action')(req, res, next);
  });

  it('finds token from Authorization header', done => {
    const req = mockReq({
      get: header => header === 'Authorization' ? accessToken : undefined,
    });
    const res = mockRes({
      send: () => { expect.fail('res.send() was called'); done(); },
      status: () => { expect.fail('res.status() was called'); done(); },
    });
    const next = () => { assert(true, 'next() was called'); done(); };
    requirePermission('perform allowed action')(req, res, next);
  });

  it('should send unauthorized when no token is sent', done => {
    const req = mockReq({
      // workaround bug in sinon-express-mock:
      // otherwise it returns req for req.get('...') instead of undefined
      get: () => undefined,
    });
    const res = mockRes({
      send: val => { expect(val).to.equal('Unauthorized: No access token given'); done(); },
      status: val => { expect(val).to.equal(401); return res; },
    });
    const next = () => { expect.fail('next() was called'); done(); };
    requirePermission('perform allowed action')(req, res, next);
  });

  it('should send unauthorized when there is an incorrect token', done => {
    const req = mockReq({
      query: {
        access_token: 'ThisIsNotARealAccessTokenERTfsdvgerTw14fwefr23r2',
      },
    });
    const res = mockRes({
      send: val => { expect(val).to.equal('Unauthorized: Invalid access token'); done(); },
      status: val => { expect(val).to.equal(401); return res; },
    });
    const next = () => { expect.fail('next() was called'); done(); };
    requirePermission('perform allowed action')(req, res, next);
  });

  it('should send unauthorized when token is expired', done => {
    const req = mockReq({
      query: {
        access_token: accessToken,
      },
    });
    const res = mockRes({
      send: val => { expect(val).to.equal('Unauthorized: Invalid access token'); done(); },
      status: val => { expect(val).to.equal(401); return res; },
    });
    const next = () => { expect.fail('next() was called'); done(); };
    app.models.AccessToken.findById(accessToken)
      .then(token => {
        token.created = new Date('December 17, 1995 03:24:00');
        return token.save();
      })
      .then(() => requirePermission('perform allowed action')(req, res, next));
  });

});
