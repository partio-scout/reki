import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import _ from 'lodash';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;

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
    { participantId: 1, date: new Date(2016,6,20) },
    { participantId: 1, date: new Date(2016,6,21) },
    { participantId: 1, date: new Date(2016,6,22) },
    { participantId: 1, date: new Date(2016,6,23) },
    { participantId: 2, date: new Date(2016,6,22) },
    { participantId: 2, date: new Date(2016,6,23) },
    { participantId: 2, date: new Date(2016,6,27) },
  ];

  // Since we're only querying, not changing state, we only add the fixtures once
  before(async () => {
    await resetDatabase();
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
  });

  after(resetDatabase);

  async function queryParticipants(filter) {
    const res = await testUtils.getWithRoles(
      `/api/participants/?filter={"where":${JSON.stringify(filter)},"skip":0,"limit":20}`,
      ['registryUser']
    );
    testUtils.expectStatus(res.status, 200);
    return res;
  }

  async function expectParticipantsForQuery(query, expectedParticipants) {
    const res = await queryParticipants(query);
    const firstNames = _.map(res.body.result, 'firstName');
    return expect(firstNames).to.have.members(expectedParticipants);
  }

  it('Query without filters', () =>
    expectParticipantsForQuery({}, [ 'Tero', 'Teemu', 'Jussi' ])
  );

  it('Query with other filter', () =>
    expectParticipantsForQuery({ 'ageGroup':'sudenpentu' }, [ 'Teemu' ])
  );

  it('Query with empty date filter', () =>
    expectParticipantsForQuery({ 'dates': [] }, [ 'Tero', 'Teemu', 'Jussi' ])
  );

  it('Query with one date', () =>
    expectParticipantsForQuery({ 'dates': ['2016-07-22T00:00:00.000Z'] }, [ 'Tero', 'Teemu' ])
  );

  it('Query with one date and other filter', () =>
    expectParticipantsForQuery(
      { 'and': [ { 'dates': ['2016-07-23T00:00:00.000Z'] }, { 'ageGroup': 'seikkailija' } ] },
      [ 'Tero' ]
    )
  );

  it('Query with two dates', () =>
    expectParticipantsForQuery(
      { 'dates': ['2016-07-23T00:00:00.000Z','2016-07-21T00:00:00.000Z'] },
      [ 'Teemu', 'Tero' ]
    )
  );

  it('Query with empty date filter and other filter', () =>
    expectParticipantsForQuery(
      { 'and' : [ { 'dates': [] }, { 'subCamp': 'Alaleiri' } ] },
      [ 'Teemu', 'Jussi' ]
    )
  );

  it('Query returns all dates of participant, not just matching ones', async () => {
    const res = await queryParticipants({ 'dates': ['2016-07-22T00:00:00.000Z'] });
    expect(res.body.result[0].firstName).to.equal('Teemu');
    expect(res.body.result[0].dates).to.have.length(4);
  });

});
