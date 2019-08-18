import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;

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
    'dateOfBirth': new Date(2018,5,10),
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
    'dateOfBirth': new Date(2018,5,10),
  },
];

const testParticipantDates = [
  { participantId: 1, date: new Date(Date.UTC(2016,6,20)) },
  { participantId: 1, date: new Date(Date.UTC(2016,6,21)) },
  { participantId: 1, date: new Date(Date.UTC(2016,6,23)) },
  { participantId: 2, date: new Date(Date.UTC(2016,6,22)) },
  { participantId: 2, date: new Date(Date.UTC(2016,6,23)) },
  { participantId: 2, date: new Date(Date.UTC(2016,6,27)) },
];

describe('particpantDates endpoint', () => {
  let user;

  beforeEach(async () => {
    await resetDatabase();
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
    user = await testUtils.createUserWithRoles(['registryUser']);
  });

  afterEach(resetDatabase);

  it('it returns unique dates when participants may be present', async () => {
    const res = await testUtils.getWithUser('/api/participantdates', user);

    testUtils.expectStatus(res.status, 200);

    expect(res.body).to.be.an('array').with.length(5);
    expect(res.body[0]).to.have.property('date','2016-07-20T00:00:00.000Z');
    expect(res.body[1]).to.have.property('date','2016-07-21T00:00:00.000Z');
    expect(res.body[2]).to.have.property('date','2016-07-22T00:00:00.000Z');
    expect(res.body[3]).to.have.property('date','2016-07-23T00:00:00.000Z');
    expect(res.body[4]).to.have.property('date','2016-07-27T00:00:00.000Z');
  });

});
