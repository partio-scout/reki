import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Roihuapp interface', () => {
  let accessToken;
  const appUser = {
    firstName: 'Roihuapp',
    lastName: 'Roihuapp',
    username: 'roihuappuser',
    password: 'salasana',
    email: 'testi@testi.testi',
  };

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
      'phoneNumber': 888,
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
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'phoneNumber': 999,
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
      'phoneNumber': 777,
    },
  ];

  describe('roihuapp user role', () => {

    before(done => {
      resetDatabase()
        .then(() => testUtils.createUserWithRoles(['roihuapp'], appUser))
        .then(() => testUtils.createFixture('Participant', testParticipants))
        .then(() => testUtils.loginUser(appUser.username, appUser.password))
        .then(newAccessToken => accessToken = newAccessToken.id)
        .nodeify(done);
    });

    it('returns only selected fields', done => {
      const filedsToExpect = [
        'firstName',
        'lastName',
        'phoneNumber',
        'localGroup',
        'campGroup',
        'subCamp',
        'village',
        'ageGroup',
        'memberNumber',
      ];

      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ memberNumber: 123 })
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.keys(filedsToExpect);
      }).end(done);
    });

    it('returns correct user by membernumber', done => {
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ memberNumber: 123 })
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('firstName', 'Teemu');
        expect(res.body).to.have.property('lastName', 'Testihenkilö');
      }).end(done);
    });

    it('returns error when user is not found', () => {
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ memberNumber: 123456789 })
      .expect(404);
    });
  });
});
