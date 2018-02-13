import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Participant amount endpoint test', () => {
  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Humina',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
      'presence': 3,
    },
    {
      'participantId': 2,
      'firstName': 'Tero',
      'lastName': 'Esimerkki',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Hurma',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'presence': 3,
    },
    {
      'participantId': 3,
      'firstName': 'Jussi',
      'lastName': 'Jukola',
      'nonScout': false,
      'internationalGuest': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Humina',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'presence': 2,
    },
  ];

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createFixture('Participant', testParticipants))
  );

  function getParticipantAmount(subCamp) {
    const req = request(app)
      .get('/api/Participants/participantAmount');
    if (subCamp) {
      req.set('subCamp', subCamp);
    }
    return req;
  }

  it('should give amount of present participants in whole camp', () =>
    getParticipantAmount().then(res => {
      expect(200);
      expect(res.body).to.have.property('amount', 2);
    })
  );

  it('should give amount of present participants in one sub camp', () =>
    getParticipantAmount('Humina').then(res => {
      expect(200);
      expect(res.body).to.have.property('amount', 1);
    })
  );
});
