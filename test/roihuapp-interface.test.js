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
      'email': 'teemu@example.com',
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

    before(() => resetDatabase()
      .then(() => testUtils.createUserWithRoles(['roihuapp'], appUser))
      .then(() => testUtils.createFixture('Participant', testParticipants))
      .then(() => testUtils.loginUser(appUser.username, appUser.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
    );

    it('returns only selected fields', () => {
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
        'email',
        'nickname',
        'country',
      ];

      return request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
        .query({ memberNumber: 123 })
        .expect(200)
        .expect(res => expect(res.body).to.have.keys(filedsToExpect));
    });

    it('returns correct user by membernumber', () =>
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ memberNumber: 123 })
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('firstName', 'Teemu');
        expect(res.body).to.have.property('lastName', 'Testihenkilö');
      })
    );

    it('returns correct user by email', () =>
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ email: 'teemu@example.com' })
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('firstName', 'Teemu');
        expect(res.body).to.have.property('lastName', 'Testihenkilö');
      })
    );

    it('returns error when user is not found by membernumber', () =>
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ memberNumber: 123456789 })
      .expect(404)
    );

    it('returns error when user is not found by email', () =>
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .query({ email: 'no_email@example.com' })
      .expect(404)
    );

    it('returns error when both email and membernumber are missing', () =>
      request(app).get(`/api/Participants/appInformation?access_token=${accessToken}`)
      .expect(400)
    );
  });
});
