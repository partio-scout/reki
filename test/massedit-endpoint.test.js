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
  let accessToken;

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
      'inCamp': 1,
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
      'inCamp': 2,
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
      'inCamp': 2,
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

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser', 'registryAdmin'], adminUserFixture))
      .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
      .then(() => testUtils.createFixture('Participant', testParticipants))
  );

  function expectParticipantInCampValues(expectedResult, response) {
    const inCampValues = _.map(response, row => row.inCamp);
    return expect(inCampValues).to.eql(expectedResult);
  }

  function expectParticipantSubCampValues(expectedResult, response) {
    const subCampValues = _.map(response, row => row.subCamp);
    return expect(subCampValues).to.eql(expectedResult);
  }

  function queryParticipants(accessToken) {
    return request(app)
    .get(`/api/participants?access_token=${accessToken}&filter={"skip":0,"limit":20}`)
    .expect(200);
  }

  function postInstanceToDb(modelInPlural, changes, accessToken, expectStatus) {
    return request(app)
      .post(`/api/${modelInPlural}?access_token=${accessToken}`)
      .send(changes)
      .expect(expectStatus);
  }

  it('Should update whitelisted fields', () =>
    postInstanceToDb('participants/update', { ids: [1,2], newValue: 3, fieldName: 'inCamp' }, accessToken, 200)
     .then( () => queryParticipants(accessToken)
     .then( res => expectParticipantInCampValues([ 3, 3, 2 ], res.body) )
   )
  );

  it('Should not update fields that are not whitelisted', () =>
    postInstanceToDb('participants/update', { ids: [1,2], newValue: 'alaleiri2', fieldName: 'subCamp' }, accessToken, 400)
     .then( () => queryParticipants(accessToken)
     .then( res => expectParticipantSubCampValues([ 'Alaleiri', 'Alaleiri', 'Alaleiri' ], res.body) )
    )
  );

});
