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
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'village': 'Kattivaara',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
    'memberNumber': 123,
    'presence': 0,
    'internationalGuest': false,
    'dateOfBirth': new Date(),
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
    'internationalGuest': false,
    'dateOfBirth': new Date(),
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
    'internationalGuest': false,
    'dateOfBirth': new Date(),
  },
];

const testParticipantDates = [
  { participantId: 1, date: new Date(2016,6,20) },
  { participantId: 1, date: new Date(2016,6,21) },
  { participantId: 1, date: new Date(2016,6,23) },
];

describe('particpant list', () => {
  before(resetDatabase);

  beforeEach(async () => {
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    await testUtils.createFixtureSequelize('ParticipantDate', testParticipantDates);
  });

  afterEach(async () => {
    await testUtils.deleteFixturesIfExistSequelize('Participant');
    await testUtils.deleteFixturesIfExistSequelize('ParticipantDate');
  });

  async function getParticipantsWithFilter(filter) {
    const res = await testUtils.getWithRoles(`/api/participants/?filter=${filter}`, ['registryUser']);
    testUtils.expectStatus(res.status, 200);
    return res.body;
  }

  it('GET request to participants returs all participants', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":0,"limit":200}'
    );
    expect(response.result).to.be.an('array').with.length(3);
    expect(response.result[0]).to.have.property('firstName','Teemu');
  });

  it('GET request to participants with one where filter', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{"village":"Kattivaara"},"skip":0,"limit":200}'
    );
    expect(response.result).to.be.an('array').with.length(1);
    expect(response.result[0]).to.have.property('firstName','Teemu');
  });

  it('GET request to participants with several where filters', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{"and":[{"ageGroup":"sudenpentu"},{"village":"Testikylä"}]},"skip":0,"limit":200}'
    );
    expect(response.result).to.be.an('array').with.length(1);
    expect(response.result[0]).to.have.property('firstName','Tero');
  });

  it('GET request to participants returns dates', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":0,"limit":200}'
    );
    expect(response.result[0]).to.have.property('dates');
    expect(response.result[0].dates).to.be.an('array').with.length(3);
  });

  it('GET request to participants skips correct amount of participants', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":2,"limit":1}'
    );
    expect(response.result).to.be.an('array').with.length(1);
    expect(response.result[0]).to.have.property('participantId',3);
    expect(response.result[0]).to.have.property('firstName','Jussi');
  });

  it('GET request to participants limits correct amount participants', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":0,"limit":2}'
    );
    expect(response.result).to.be.an('array').with.length(2);
    expect(response.result[0]).to.have.property('participantId',1);
    expect(response.result[0]).to.have.property('firstName','Teemu');
  });

  it('GET request to participants sorts participants correctly', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":0,"limit":200,"order":"lastName DESC"}'
    );
    expect(response.result).to.be.an('array').with.length(3);
    expect(response.result[0]).to.have.property('lastName','Testihenkilö');
    expect(response.result[1]).to.have.property('lastName','Jukola');
    expect(response.result[2]).to.have.property('lastName','Esimerkki');
  });

  it('GET request to participants returns count', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":0,"limit":200}'
    );
    expect(response.count).to.equal(3);
  });

  //count should return the number of all maches regardless of the paging
  it('count is calculated correctly when skip and limit are present', async () => {
    const response = await getParticipantsWithFilter(
      '{"where":{},"skip":1,"limit":2}'
    );
    expect(response.count).to.equal(3);
  });

});
