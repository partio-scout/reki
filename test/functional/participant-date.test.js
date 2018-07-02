import app from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

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
  { participantId: 1, date: new Date(2016,6,20) },
  { participantId: 1, date: new Date(2016,6,21) },
  { participantId: 1, date: new Date(2016,6,23) },
  { participantId: 2, date: new Date(2016,6,22) },
  { participantId: 2, date: new Date(2016,6,23) },
  { participantId: 2, date: new Date(2016,6,27) },
];

const testUser = {
  'id': 3,
  'username': 'testLooser',
  'memberNumber': '00000002',
  'email': 'jukka.pekka@example.com',
  'password': 'salasa',
  'firstName': 'Jukka',
  'lastName': 'Pekka',
  'phoneNumber': '0000000003',
};

describe('particpantDates', () => {

  let accessToken = null;

  beforeEach(async () => {
    await resetDatabase();
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser'], testUser);
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
    accessToken = accessToken.id;
  });

  afterEach(async () => {
    await testUtils.deleteFixturesIfExistSequelize('Participant');
    await testUtils.deleteFixturesIfExistSequelize('ParticipantDate');
    await testUtils.deleteFixturesIfExist('RegistryUser');
  });

  it('GET request to participantdates', async () =>
    await request(app)
    .get(`/api/participantdates/?access_token=${accessToken}&filter=[fields][date]=true`)
    .expect(200)
    .expect(res => {
      expect(res.body).to.be.an('array').with.length(5);
      expect(res.body[0]).to.have.property('date','2016-07-20T00:00:00.000Z');
      expect(res.body[1]).to.have.property('date','2016-07-21T00:00:00.000Z');
      expect(res.body[2]).to.have.property('date','2016-07-22T00:00:00.000Z');
      expect(res.body[3]).to.have.property('date','2016-07-23T00:00:00.000Z');
      expect(res.body[4]).to.have.property('date','2016-07-27T00:00:00.000Z');
    })
  );

});
