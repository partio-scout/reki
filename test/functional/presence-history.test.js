import app from '../../src/server/server';
import _ from 'lodash';
import request from 'supertest';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Presence history', () => {
  const inCamp = 3;
  const tmpLeftCamp = 2;
  const leftCamp = 1;

  const testParticipants = [
    {
      'participantId': 1,
      'firstName': 'Teemu',
      'lastName': 'Testihenkilö',
      'nonScout': false,
      'localGroup': 'Testilippukunta',
      'campGroup': 'Leirilippukunta',
      'village': 'Testikylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
      'presence': 0,
      'dateOfBirth': new Date(),
      'internationalGuest': false,
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
      'dateOfBirth': new Date(),
      'internationalGuest': false,
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
      'dateOfBirth': new Date(),
      'internationalGuest': false,
    },
  ];

  beforeEach(async () => {
    const { pool } = app.locals;
    await testUtils.resetDatabase(pool);
    await testUtils.createParticipantFixtures(pool, testParticipants);
  });

  async function expectPresenceHistoryValues(expectedPresences, participantId, response) {
    const { rows } = await app.locals.pool.query(`SELECT presence
    FROM participant_presence
    WHERE participant = $1
    ORDER BY timestamp ASC`,
      [participantId]);

    const presenceHistory = _.map(rows, row => row.presence);
    expect(presenceHistory).to.eql(expectedPresences);
  }

  function postOverRest(modelInPlural, changes) {
    return request(app)
      .post(`/api/${modelInPlural}`)
      .send(changes);
  }

  it('Should save history when updating one presence', () =>
    postOverRest('participants/massAssign', { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
      .then( () => expectPresenceHistoryValues([ inCamp ], 1 ) )
  );

  it('Should save history when updating two presences', () =>
    postOverRest('participants/massAssign', { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
      .then( () => postOverRest('participants/massAssign', { ids: [ 1 ], newValue: leftCamp, fieldName: 'presence' }).expect(200) )
      .then( () => expectPresenceHistoryValues([ inCamp, leftCamp ], 1 ) )
  );

  it('Should save history when updating two participants presences at once', () =>
    postOverRest('participants/massAssign', { ids: [ 2, 3 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
      .then( () => postOverRest('participants/massAssign', { ids: [ 2, 3 ], newValue: tmpLeftCamp, fieldName: 'presence' }).expect(200) )
      .then( () => expectPresenceHistoryValues([ inCamp, tmpLeftCamp ], 2 ) )
      .then( () => expectPresenceHistoryValues([ inCamp, tmpLeftCamp ], 3 ) )
  );

  it('Should not save history when saving value doesn\'t change', () =>
    postOverRest('participants/massAssign', { ids: [ 2 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
    .then( () => postOverRest('participants/massAssign', { ids: [ 2 ], newValue: inCamp, fieldName: 'presence' }).expect(200) )
      .then( () => expectPresenceHistoryValues([ inCamp ], 2 ) )
  );

  it('Should not update wrong participants presence', () =>
    postOverRest('participants/massAssign', { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' })
      .expect(200)
      .then( () => expectPresenceHistoryValues([ ], 2 ) )
  );

  it('Should not save history when unvalid presence data', () =>
    postOverRest('participants/massAssign', { ids: [ 1 ], newValue: 'some string value', fieldName: 'presence' })
      .expect(400)
      .then( () => expectPresenceHistoryValues([ ], 1 ) )
  );

});
