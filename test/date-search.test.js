import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import _ from 'lodash';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Date search', () => {
  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Kylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
    },
    {
      'participantId': 2,
      'firstName': 'Tero',
      'lastName': 'Esimerkki',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Kylä',
      'subCamp': 'Alaleiri2',
      'ageGroup': 'seikkailija',
      'memberNumber': 345,
    },
    {
      'participantId': 3,
      'firstName': 'Jussi',
      'lastName': 'Jukola',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Kylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
    },
  ];

  const testParticipantDates = [
    { participantId: 1, date: new Date(2016,6,20) },
    { participantId: 1, date: new Date(2016,6,21) },
    { participantId: 1, date: new Date(2016,6,22) },
    { participantId: 1, date: new Date(2016,6,23) },
    { participantId: 2, date: new Date(2016,6,22) },
    { participantId: 2, date: new Date(2016,6,23) },
    { participantId: 2, date: new Date(2016,6,27) },
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
      .then(() => testUtils.createUserWithRoles(['registryUser'], adminUserFixture))
      .then(() => testUtils.createFixture('Participant', testParticipants))
      .then(() => testUtils.createFixture('ParticipantDate', testParticipantDates))
      .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
  );

  function expectParticipants(expectedResult, response) {
    const firstNames = _.map(response, 'firstName');
    return expect(firstNames).to.have.members(expectedResult);
  }

  function queryParticipants(filter, accessToken) {
    return request(app)
      .get(`/api/participants/?access_token=${accessToken}&filter={"where":${JSON.stringify(filter)},"skip":0,"limit":20}`)
      .expect(200);
  }

  it('Query without filters', () =>
    queryParticipants({}, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with other filter', () =>
    queryParticipants({ 'ageGroup':'sudenpentu' }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

  it('Query with empty date filter', () =>
    queryParticipants({ 'dates': [] }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with one date', () =>
    queryParticipants({ 'dates': ['2016-07-22T00:00:00.000Z'] }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with one date and other filter', () =>
    queryParticipants({ 'and': [ { 'dates': ['2016-07-23T00:00:00.000Z'] }, { 'ageGroup': 'seikkailija' } ] }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with two dates', () =>
    queryParticipants({ 'dates': ['2016-07-23T00:00:00.000Z','2016-07-21T00:00:00.000Z'] }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu', 'Tero' ], res.body);
    })
  );

  it('Query with empty date filter and other filter', () =>
    queryParticipants({ 'and' : [ { 'dates': [] }, { 'subCamp': 'Alaleiri' } ] }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

});
