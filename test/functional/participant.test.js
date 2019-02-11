import app from '../../src/server/server';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';

const expect = chai.expect;
chai.use(chaiAsPromised);

const testParticipants = [{
  'participantId': 1,
  'firstName': 'Teemu',
  'lastName': 'Testihenkilö',
  'localGroup': 'Testilippukunta',
  'campGroup': 'Leirilippukunta',
  'village': 'Kylä',
  'subCamp': 'Alaleiri',
  'memberNumber': '123',
  'kuksaData': {
    'dateOfBirth': new Date(2018,5,10),
    'nonScout': false,
    'internationalGuest': false,
    'ageGroup': 'sudenpentu',
  },
}];

const testParticipantDates = [
  { id: 1, participantId: 1, date: '2016-06-20' },
  { id: 2, participantId: 1, date: '2016-06-21' },
  { id: 3, participantId: 1, date: '2016-06-23' },
];

const testParticipantPrecenceHistory = [ {
  'participantId':1,
  'presence': 1,
  'timestamp': new Date(2016,6,20),
} ];

const testAllergies = [{
  'allergyId': 1,
  'name': 'hernekeitto',
}];

const testParticipantsSelections = [{
  'selectionId': 0,
  'participantId': 1,
  'kuksaGroupId': 0,
  'kuksaSelectionId': 0,
  'groupName': 'herneenpalvojat',
  'selectionName': 'ok',
}];

const testParticipantAllergies = [{
  'allergyId': 1,
  'participantId': 1,
}];

describe('particpant', () => {

  beforeEach(async () => {
    const { pool } = app.locals;
    await testUtils.resetDatabase(pool);
    await testUtils.createParticipantFixtures(pool, testParticipants);
    await testUtils.createParticipantDateFixtures(pool, testParticipantDates);
    await testUtils.createPresenceHistoryFixtures(pool, testParticipantPrecenceHistory);
    await testUtils.createAllergyFixtures(pool, testAllergies);
    await testUtils.createSelectionFixtures(pool, testParticipantsSelections);
    await testUtils.createParticipantAllergyFixtures(pool, testParticipantAllergies);
  });

  it('request for single participant returns correct info', async () =>
    request(app)
      .get('/api/participants/1?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}')
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
      .get('/api/participants/404?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}')
      .expect(404)
  );

  it('request for participant with string id returns 404', async () =>
    request(app)
      .get('/api/participants/hello?filter={"include":[{"presenceHistory":"author"},"allergies","dates","selections"]}')
      .expect(404)
  );

});
