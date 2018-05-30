import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
//import Promise from 'bluebird';
//import { models } from '../../src/server/models';

const expect = chai.expect;
chai.use(chaiAsPromised);

const testParticipants = [ {
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
} ];

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

const testParticipantDates = [
  { id: 1, participantId: 1, date: new Date(2016,6,20) },
  { id: 2, participantId: 1, date: new Date(2016,6,21) },
  { id: 3, participantId: 1, date: new Date(2016,6,23) },
];

const testParticipantPrecenceHistory = [ {
  'participantParticipantId':1,
  'presence': 1,
  'timestamp': new Date(2016,6,20),
  'authorId': 3,
} ];

const testAllergies = [ {
  'allergyId': 1,
  'name': 'hernekeitto',
} ];

const testParticipantsSelections = [ {
  'selectionId': 0,
  'participantParticipantId': 1,
  'kuksaGroupId': 0,
  'kuksaSelectionId': 0,
  'groupName': 'herneenpalvojat',
  'selectionName': 'ok',
} ];

const testParticipantAllergies = [ {
  'allergyAllergyId': 1,
  'participantParticipantId': 1,
} ];

describe('particpant', () => {

  let accessToken = null;

  beforeEach(async () => {
    await resetDatabase();
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
    await testUtils.createFixtureSequelize('PresenceHistory', testParticipantPrecenceHistory);
    await testUtils.createFixtureSequelize('Allergy', testAllergies);
    await testUtils.createFixtureSequelize('Selection', testParticipantsSelections);
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser'], testUser);
    accessToken = accessToken.id;
    await testUtils.createFixtureSequelize('ParticipantAllergy', testParticipantAllergies);
  });

  afterEach(async () => {
    await testUtils.deleteFixturesIfExistSequelize('Participant');
    await testUtils.deleteFixturesIfExistSequelize('ParticipantDate');
    await testUtils.deleteFixturesIfExist('RegistryUser');
    await testUtils.deleteFixturesIfExistSequelize('PresenceHistory');
    await testUtils.deleteFixturesIfExistSequelize('Allergy');
    await testUtils.deleteFixturesIfExistSequelize('Selection');
  });

  it('request for single participant returns correct info', async () =>
    request(app)
      .get(`/api/participants/1?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('firstName','Teemu');
        expect(res.body).to.have.property('dates');
        expect(res.body.dates).to.be.an('array').with.length(3);
        expect(res.body).to.have.property('allergies');
        expect(res.body.allergies).to.be.an('array').with.length(1);
        expect(res.body).to.have.property('presenceHistory');
        expect(res.body.presenceHistory).to.be.an('array').with.length(1);
        expect(res.body.presenceHistory[0]).to.have.property('presence',1);
        expect(res.body).to.have.property('selections');
        expect(res.body.selections).to.be.an('array').with.length(1);
        expect(res.body.selections[0]).to.have.property('groupName', 'herneenpalvojat');
        expect(res.body.selections[0]).to.have.property('selectionName', 'ok');
      })
  );

  it('request for unknown participant id returns 404', async () =>
    request(app)
      .get(`/api/participants/404?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}&access_token=${accessToken}`)
      .expect(404)
  );

  it('request for participant with string id returns 404', async () =>
    request(app)
      .get(`/api/participants/hello?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}&access_token=${accessToken}`)
      .expect(404)
  );

});
