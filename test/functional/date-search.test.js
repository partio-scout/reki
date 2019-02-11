import configureApp from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import _ from 'lodash';
import { createConnection } from '../../src/server/database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe.only('Date search', () => {
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
      'village': 'Kylä',
      'subCamp': 'Alaleiri2',
      'ageGroup': 'seikkailija',
      'memberNumber': 345,
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
      'village': 'Kylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'dateOfBirth': new Date(),
    },
  ];

  const testParticipantDates = [
    { participant: 1, date: '2016-06-20' },
    { participant: 1, date: '2016-06-21' },
    { participant: 1, date: '2016-06-22' },
    { participant: 1, date: '2016-06-23' },
    { participant: 2, date: '2016-06-22' },
    { participant: 2, date: '2016-06-23' },
    { participant: 2, date: '2016-06-27' },
  ];

  let app;
  let pool;

  before(async () => {
    pool = await createConnection();
    app = configureApp(pool);
  });

  after(() => {
    pool.end();
  });

  beforeEach(async () => {
    await testUtils.resetDatabase(pool);
    await testUtils.createParticipantFixtures(pool, testParticipants);
    await testUtils.createParticipantDateFixtures(pool, testParticipantDates);
  });

  function expectParticipants(expectedResult, response) {
    console.log(response, expectedResult);
    const firstNames = _.map(response.result, 'firstName');
    return expect(firstNames).to.have.members(expectedResult);
  }

  function queryParticipants(filter, accessToken) {
    return request(app)
      .get(`/api/participants/?filter={"where":${JSON.stringify(filter)},"skip":0,"limit":20}`)
      .expect(200);
  }

  it('Query without filters', () =>
    queryParticipants({})
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with other filter', () =>
    queryParticipants({ 'ageGroup':'sudenpentu' })
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

  it('Query with empty date filter', () =>
    queryParticipants({ 'dates': [] })
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with one date', () =>
    queryParticipants({ 'dates': ['2016-07-22'] })
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with one date and other filter', () =>
    queryParticipants({ 'and': [ { 'dates': ['2016-07-23T00:00:00.000Z'] }, { 'ageGroup': 'seikkailija' } ] })
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with two dates', () =>
    queryParticipants({ 'dates': ['2016-07-23T00:00:00.000Z','2016-07-21T00:00:00.000Z'] })
    .then(res => {
      expectParticipants([ 'Teemu', 'Tero' ], res.body);
    })
  );

  it('Query with empty date filter and other filter', () =>
    queryParticipants({ 'and' : [ { 'dates': [] }, { 'subCamp': 'Alaleiri' } ] })
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query returns all dates of participant, not just matching ones', () =>
    queryParticipants({ 'dates': ['2016-07-22T00:00:00.000Z'] })
    .then(res => {
      expect(res.body.result[0].firstName).to.equal('Teemu');
      expect(res.body.result[0].dates).to.have.length(4);
    })
  );

});
