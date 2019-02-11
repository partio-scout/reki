import _ from 'lodash';
import chai from 'chai';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import { models } from '../../src/server/models';

const expect = chai.expect;

describe('Presence history', () => {
  const inCamp = 3;
  const tmpLeftCamp = 2;
  const leftCamp = 1;

  let user;

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

  before(resetDatabase);

  beforeEach(async () => {
    await testUtils.createFixtureSequelize('Participant', testParticipants);
    user = await testUtils.createUserWithRoles(['registryUser']);
  });

  afterEach(() => testUtils.deleteFixturesIfExistSequelize('Participant'));

  function expectPresenceHistoryValues(expectedPresences, participantId, response) {
    return models.PresenceHistory.findAll({
      where: { participantParticipantId: participantId },
      order: [[ 'id', 'ASC' ]],
    }).then(rows => {
      const presenceHistory = _.map(rows, row => row.presence);
      expect(presenceHistory).to.eql(expectedPresences);
    });
  }

  function expectPresenceAuthorValue(expectedAuthors, participantId, response) {
    return models.PresenceHistory.findAll({ where: { participantParticipantId: participantId } })
      .then( rows => {
        const AuthorHistory = _.map(rows, row => row.authorId);
        expect(AuthorHistory).to.eql(expectedAuthors);
      }
    );
  }

  it('Should save history when updating one presence', async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    await expectPresenceHistoryValues([ inCamp ], 1 );
  });

  it('Should save author correctly when updating presence twice', async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    const res2 = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: tmpLeftCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res2.status, 200);
    await expectPresenceAuthorValue([ user.id, user.id ], 1 );
  });

  it('Should save history when updating presences twice', async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    const res2 = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: leftCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res2.status, 200);
    await expectPresenceHistoryValues([ inCamp, leftCamp ], 1 );
  });

  it("Should save history when updating two participants' presences at once", async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 2, 3 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    const res2 = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 2, 3 ], newValue: tmpLeftCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res2.status, 200);
    await expectPresenceHistoryValues([ inCamp, tmpLeftCamp ], 2 );
    await expectPresenceHistoryValues([ inCamp, tmpLeftCamp ], 3 );
  });

  it('Should not save history when saving value doesn\'t change', async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 2 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    const res2 = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 2 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res2.status, 200);
    await expectPresenceHistoryValues([ inCamp ], 2 );
  });

  it("Should not update wrong participants' presence", async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: inCamp, fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 200);
    await expectPresenceHistoryValues([ ], 2 );
  });

  it('Should not save history when invalid presence data', async () => {
    const res = await testUtils.postWithUser(
      '/api/participants/massAssign',
      user,
      { ids: [ 1 ], newValue: 'some string value', fieldName: 'presence' }
    );
    testUtils.expectStatus(res.status, 400);
    await expectPresenceHistoryValues([ ], 1 );
  });

});
