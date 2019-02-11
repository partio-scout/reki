import app from '../../src/server/server';
import _ from 'lodash';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Participant mass edit endpoint test', () => {
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
      'dateOfBirth': new Date(),
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
      'dateOfBirth': new Date(),
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
      'dateOfBirth': new Date(),
    },
  ];

  beforeEach(async () => {
    const { pool } = app.locals;
    await testUtils.resetDatabase(pool);
    await testUtils.createParticipantFixtures(pool, testParticipants);
  });

  function expectParticipantInCampValues(expectedResult, response) {
    const inCampValues = _.map(response.result, row => row.presence);
    return expect(inCampValues).to.eql(expectedResult);
  }

  function expectParticipantSubCampValues(expectedResult, response) {
    const subCampValues = _.map(response.result, row => row.subCamp);
    return expect(subCampValues).to.eql(expectedResult);
  }

  //TODO: refactor this to query DB directly
  function queryParticipants() {
    return request(app)
    .get('/api/participants')
    .expect(200);
  }

  function postInstanceToDb(modelInPlural, changes) {
    return request(app)
      .post(`/api/${modelInPlural}`)
      .send(changes);
  }

  it('Should update whitelisted fields', () =>
    postInstanceToDb('participants/massAssign', { ids: [ 1,2 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
      .expect(result => {
        expect(result.body).to.be.an('array').with.length(2);
        expect(result.body[0]).to.have.property('firstName', 'Teemu');
      })
      .then( () => queryParticipants()
      .then( res => expectParticipantInCampValues([ inCamp, inCamp, tmpLeftCamp ], res.body) )
   )
  );

  it('Should not update fields that are not whitelisted', () =>
    postInstanceToDb('participants/massAssign', { ids: [ 1,2 ], newValue: 'alaleiri2', fieldName: 'subCamp' })
      .expect(400)
      .then( () => queryParticipants()
      .then( res => expectParticipantSubCampValues([ 'Alaleiri', 'Alaleiri', 'Alaleiri' ], res.body) )
    )
  );

});
