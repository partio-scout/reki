import app from '../src/server/server';
import _ from 'lodash';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Promise from 'bluebird';
import * as testUtils from './utils/test-utils';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Presence history', () => {
  let accessToken;

  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
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
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'presence': 0,
    },
  ];

  const adminUserFixture = {
    'username': 'testAdmin',
    'memberNumber': '7654321',
    'email': 'testi@adm.in',
    'password': 'salasana',
    'phone': 'n/a',
    'firstName': 'Testi',
    'lastName': 'Admin',
  };

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser', 'registryAdmin'], adminUserFixture))
      .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
      .then(() => testUtils.createFixture('Participant', testParticipants))
  );

  function expectPresenceHistoryValues(expectedPresences, participantId, response) {
    const PresenceHistory = app.models.PresenceHistory;

    const findHistory = Promise.promisify(PresenceHistory.find, { context: PresenceHistory } );

    return findHistory({ where: { participantId: participantId } })
      .then( rows => {
        const presenceHistory = _.map(rows, row => row.presence);
        expect(presenceHistory).to.eql(expectedPresences);
      }
    );
  }

  function expectPresenceAuthorValue(expectedAuthors, participantId, response) {
    const PresenceHistory = app.models.PresenceHistory;

    const findHistory = Promise.promisify(PresenceHistory.find, { context: PresenceHistory } );

    return findHistory({ where: { participantId: participantId } })
      .then( rows => {
        const AuthorHistory = _.map(rows, row => row.authorId);
        expect(AuthorHistory).to.eql(expectedAuthors);
      }
    );
  }

  function postInstanceToDb(modelInPlural, changes, accessToken) {
    return request(app)
      .post(`/api/${modelInPlural}?access_token=${accessToken}`)
      .send(changes)
      .expect(200);
  }

  it('Should save history when updating one presence', () =>
    postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 3, fieldName: 'presence' }, accessToken)
      .then( () => expectPresenceHistoryValues([ 3 ], 1 ) )
  );

  it('Should save author correctly when updating presence', () =>
    postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 3, fieldName: 'presence' }, accessToken)
      .then( () => postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 2, fieldName: 'presence' }, accessToken))
      .then( () => expectPresenceAuthorValue([ 1, 1 ], 1 ) )
  );

  it('Should save history when updating two presences', () =>
    postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 3, fieldName: 'presence' }, accessToken)
      .then( () => postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 2, fieldName: 'presence' }, accessToken))
      .then( () => expectPresenceHistoryValues([ 3, 2 ], 1 ) )
  );

  it('Should save history when updating two participants presences at once', () =>
    postInstanceToDb('participants/update', { ids: [ 2, 3 ], newValue: 3, fieldName: 'presence' }, accessToken)
      .then( () => postInstanceToDb('participants/update', { ids: [ 2, 3 ], newValue: 2, fieldName: 'presence' }, accessToken))
      .then( () => expectPresenceHistoryValues([ 3, 2 ], 2 ) )
      .then( () => expectPresenceHistoryValues([ 3, 2 ], 3 ) )
  );

  it('Should not save history when saving value doesn\'t change', () =>
    postInstanceToDb('participants/update', { ids: [ 2 ], newValue: 3, fieldName: 'presence' }, accessToken)
    .then( () => postInstanceToDb('participants/update', { ids: [ 2 ], newValue: 3, fieldName: 'presence' }, accessToken))
      .then( () => expectPresenceHistoryValues([ 3 ], 2 ) )
  );

  it('Should not update wrong participants presence', () =>
    postInstanceToDb('participants/update', { ids: [ 1 ], newValue: 3, fieldName: 'presence' }, accessToken)
      .then( () => expectPresenceHistoryValues([ ], 2 ) )
  );

});
