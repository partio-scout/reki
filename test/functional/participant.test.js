import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

const testParticipants = [{
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
}];

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

const testAllergies = [{
  'allergyId': 1,
  'name': 'hernekeitto',
}];

const testParticipantsSelections = [{
  'selectionId': 0,
  'participantParticipantId': 1,
  'kuksaGroupId': 0,
  'kuksaSelectionId': 0,
  'groupName': 'herneenpalvojat',
  'selectionName': 'ok',
}];

const testParticipantAllergies = [{
  'allergyAllergyId': 1,
  'participantParticipantId': 1,
}];

describe('particpant', () => {

  before(resetDatabase);

  beforeEach(async () => {
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
    await testUtils.createFixtureSequelize('PresenceHistory', testParticipantPrecenceHistory);
    await testUtils.createFixtureSequelize('Allergy', testAllergies);
    await testUtils.createFixtureSequelize('Selection', testParticipantsSelections);
    await testUtils.createFixtureSequelize('ParticipantAllergy', testParticipantAllergies);
  });

  afterEach(async () => {
    await testUtils.deleteFixturesIfExistSequelize('Participant');
    await testUtils.deleteFixturesIfExistSequelize('ParticipantDate');
    await testUtils.deleteFixturesIfExistSequelize('PresenceHistory');
    await testUtils.deleteFixturesIfExistSequelize('Allergy');
    await testUtils.deleteFixturesIfExistSequelize('Selection');
    await testUtils.deleteFixturesIfExistSequelize('ParticipantAllergy');
  });

  it('request for single participant returns correct info', async () => {
    const res = await testUtils.getWithRoles('/api/participants/1', ['registryUser']);
    testUtils.expectStatus(res.status, 200);

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
  });

  it('request for unknown participant id returns 404', async () => {
    const res = await testUtils.getWithRoles('/api/participants/404', ['registryUser']);
    testUtils.expectStatus(res.status, 404);
  });

  it('request for participant with string id returns 404', async () => {
    const res = await testUtils.getWithRoles('/api/participants/hello', ['registryUser']);
    testUtils.expectStatus(res.status, 404);
  });

});
