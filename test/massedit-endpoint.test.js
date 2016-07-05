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

  const inCamp = 3;
  const tmpLeftCamp = 2;
  const leftCamp = 1;

  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
      'presence': leftCamp,
    },
    {
      'participantId': 2,
      'firstName': 'Tero',
      'lastName': 'Esimerkki',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'presence': leftCamp,
    },
    {
      'participantId': 3,
      'firstName': 'Jussi',
      'lastName': 'Jukola',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'presence': tmpLeftCamp,
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
    const inCampValues = _.map(response, row => row.presence);
    return expect(inCampValues).to.eql(expectedResult);
  }

  function expectParticipantSubCampValues(expectedResult, response) {
    const subCampValues = _.map(response, row => row.subCamp);
    return expect(subCampValues).to.eql(expectedResult);
  }

  function queryParticipants(accessToken) {
    return request(app)
    .get(`/api/participants?access_token=${accessToken}`)
    .expect(200);
  }

  function postInstanceToDb(modelInPlural, changes, accessToken, expectStatus) {
    return request(app)
      .post(`/api/${modelInPlural}?access_token=${accessToken}`)
      .send(changes);
  }

  it('Should update whitelisted fields', () =>
    postInstanceToDb('participants/update', { ids: [ 1,2 ], newValue: inCamp, fieldName: 'presence' }, accessToken)
      .expect(200)
      .then( () => queryParticipants(accessToken)
      .then( res => expectParticipantInCampValues([ inCamp, inCamp, tmpLeftCamp ], res.body) )
   )
  );

  it('Should not update fields that are not whitelisted', () =>
    postInstanceToDb('participants/update', { ids: [ 1,2 ], newValue: 'alaleiri2', fieldName: 'subCamp' }, accessToken)
      .expect(400)
      .then( () => queryParticipants(accessToken)
      .then( res => expectParticipantSubCampValues([ 'Alaleiri', 'Alaleiri', 'Alaleiri' ], res.body) )
    )
  );

});
