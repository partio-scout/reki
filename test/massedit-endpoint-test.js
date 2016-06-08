import app from '../src/server/server';
import _ from 'lodash';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Participant mass edit endpoint test', () => {
  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
      'inCamp': 0,
    },
    {
      'participantId': 2,
      'firstName': 'Tero',
      'lastName': 'Esimerkki',
      'nonScout': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'inCamp': 0,
    },
    {
      'participantId': 3,
      'firstName': 'Jussi',
      'lastName': 'Jukola',
      'nonScout': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'inCamp': 0,
    },
  ];

  const adminUserFixture = {
    'username': 'testAdmin',
    'memberNumber': '7654321',
    'email': 'testi@adm.in',
    'password': 'salasana',
    'phone': 'n/a',
    'firstName': 'Testi',
    'lastName': 'Admin',
  };

  let accessToken = null;

  beforeEach(() =>
    resetDatabase()
    .then(() => testUtils.createUserWithRoles(['admin'], adminUserFixture))
    .then(() => testUtils.createFixture('Participant', testParticipants))
    .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
    .then(newAccessToken => accessToken = newAccessToken.id)
  );

  function expectParticipantInCampValues(expectedResult, response) {
    const inCampValues = _.map(response, row => row.inCamp);
    return expect(inCampValues).to.eql(expectedResult);
  }

  function queryParticipants(accessToken) {
    return request(app)
    .get(`/api/participants/?access_token=${accessToken}`)
    .expect(200);
  }

  function postInstanceToDb(modelInPlural, changes, accessToken) {
    return request(app)
      .post(`/api/${modelInPlural}?access_token=${accessToken}`)
      .send(changes)
      .expect(200);
  }

  it('Should update right rows', () =>
    postInstanceToDb('participants/update', { ids: [1,2], newValue: 3, fieldName: 'inCamp' }, accessToken)
      .then( () => queryParticipants(accessToken)
      .then( res => expectParticipantInCampValues([ 3, 3, 0 ], res.body) )
    )
  );

  it('Should not update wrong fields', () =>
    postInstanceToDb('participants/update', { ids: [1,2], newValue: 3, fieldName: 'subCamp' }, accessToken)
      .then( () => queryParticipants(accessToken)
      .then( res => expectParticipantInCampValues([ 0, 0, 0 ], res.body) )
    )
  );

});
