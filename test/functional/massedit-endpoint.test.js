import { models } from '../../src/server/models';
import _ from 'lodash';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Participant mass edit endpoint test', () => {
  const inCamp = 3;
  const tmpLeftCamp = 2;
  const leftCamp = 1;

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
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 123,
      'presence': leftCamp,
      'dateOfBirth': new Date(),
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
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'presence': leftCamp,
      'dateOfBirth': new Date(),
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
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'presence': tmpLeftCamp,
      'dateOfBirth': new Date(),
    },
  ];

  beforeEach(async() => {
    await resetDatabase();
    await testUtils.createFixtureSequelize('Participant', testParticipants);
  });

  after(resetDatabase);

  it('Should update whitelisted fields', async () => {
    const res = await testUtils.postWithRoles('/api/participants/massAssign', ['registryUser'], {
      ids: [ 1,2 ],
      newValue: inCamp,
      fieldName: 'presence',
    });

    testUtils.expectStatus(res.status, 200);
    expect(res.body).to.be.an('array').with.length(2);
    expect(res.body[0]).to.have.property('firstName', 'Teemu');

    const participants = await models.Participant.findAll({ order: ['participantId'] });
    expect(_.map(participants, 'presence')).to.eql([ inCamp, inCamp, tmpLeftCamp ]);
  });

  it('Should not update fields that are not whitelisted', async () => {
    const res = await testUtils.postWithRoles('/api/participants/massAssign', ['registryUser'], {
      ids: [ 1,2 ],
      newValue: 'alaleiri2',
      fieldName: 'subCamp',
    });

    testUtils.expectStatus(res.status, 400);

    const participants = await models.Participant.findAll({ order: ['participantId'] });
    expect(_.map(participants, 'subCamp')).to.eql([ 'Alaleiri', 'Alaleiri', 'Alaleiri' ]);
  });

});
