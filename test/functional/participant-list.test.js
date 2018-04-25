import app from '../../src/server/server';
import request from 'supertest-as-promised';
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
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'village': 'Kattivaara',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
    'memberNumber': 123,
    'presence': 0,
  },
  {
    'participantId': 2,
    'firstName': 'Tero',
    'lastName': 'Esimerkki',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'village': 'Testikylä',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
    'memberNumber': 345,
    'presence': 0,
  },
  {
    'participantId': 3,
    'firstName': 'Jussi',
    'lastName': 'Jukola',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'village': 'Testikylä',
    'subCamp': 'Alaleiri',
    'ageGroup': 'seikkailija',
    'memberNumber': 859,
    'presence': 0,
  },
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

const testParticipantDates = [
  { participantId: 1, date: new Date(2016,6,20) },
  { participantId: 1, date: new Date(2016,6,21) },
  { participantId: 1, date: new Date(2016,6,23) },
];

describe('particpant', () => {

  let accessToken = null;

  beforeEach(async () => {
    await resetDatabase();
    await testUtils.createFixture('Participant', testParticipants);
    await testUtils.createFixture('ParticipantDate', testParticipantDates);
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser'], testUser);
    accessToken = accessToken.id;
  });

  afterEach(async () => {
    await testUtils.deleteFixturesIfExist('Participant');
    await testUtils.deleteFixturesIfExist('ParticipantDate');
    await testUtils.deleteFixturesIfExist('RegistryUser');
  });

  it('GET request to participants returs all participants', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":0,"limit":200,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.result).to.be.an('array').with.length(3);
        expect(res.body.result[0]).to.have.property('firstName','Teemu');
      })
  );

  it('GET request to participants with filters', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{"village":"Kattivaara"},"skip":0,"limit":200,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.result).to.be.an('array').with.length(1);
        expect(res.body.result[0]).to.have.property('firstName','Teemu');
      })
  );

  it('GET request to participants returns dates', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":0,"limit":200,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.result[0]).to.have.property('dates');
        expect(res.body.result[0].dates).to.be.an('array').with.length(3);
      })
  );

  it('GET request to participants skips correct amount of participants', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":2,"limit":1,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.result).to.be.an('array').with.length(1);
        expect(res.body.result[0]).to.have.property('participantId',3);
        expect(res.body.result[0]).to.have.property('firstName','Jussi');
      })
  );

  it('GET request to participants limits correct amount participants', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":0,"limit":2,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.result).to.be.an('array').with.length(2);
        expect(res.body.result[0]).to.have.property('participantId',1);
        expect(res.body.result[0]).to.have.property('firstName','Teemu');
      })
  );

  it('GET request to participants returns count', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":0,"limit":200,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.count).to.equal(3);
      })
  );

  //count should retrun the number of all maches regardless of the paging
  it('count is calculated correctly when skip and limit are present', async () =>
    request(app)
      .get(`/api/participants/?filter={"where":{},"skip":1,"limit":2,"include":["dates"],"count":true}&access_token=${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.count).to.equal(3);
      })
  );

});
