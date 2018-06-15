import app from '../../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from '../utils/test-utils';
import _ from 'lodash';
import { resetDatabase } from '../../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Text search', () => {
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
      'staffPosition': null,
      'staffPositionInGenerator': 'Tiskari',
      'editableInfo': 'Muokattava teksti',
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
      'village': 'Kylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'sudenpentu',
      'memberNumber': 345,
      'staffPosition': 'Jumppaohjaaja',
      'staffPositionInGenerator': null,
      'campOfficeNotes': 'Leiritoimiston jutut',
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
      'village': 'Kylä',
      'subCamp': 'Alaleiri',
      'ageGroup': 'seikkailija',
      'memberNumber': 859,
      'staffPosition': 'Kaivaja',
      'staffPositionInGenerator': '#Tiskari',
      'dateOfBirth': new Date(),
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

  let accessToken = null;

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createUserWithRoles(['registryUser'], adminUserFixture))
      .then(() => testUtils.createFixtureSequelize('Participant', testParticipants))
      .then(() => testUtils.loginUser(adminUserFixture.username, adminUserFixture.password))
      .then(newAccessToken => accessToken = newAccessToken.id)
  );

  function expectParticipants(expectedResult, response) {
    const firstNames = _.map(response.result, 'firstName');
    return expect(firstNames).to.have.members(expectedResult);
  }

  function queryParticipants(filter, accessToken) {
    return request(app)
      .get(`/api/participants/?access_token=${accessToken}&filter={"where":${encodeURIComponent(JSON.stringify(filter))},"skip":0,"limit":20}`)
      .expect(200);
  }

  it('Query without filters', () =>
    queryParticipants({}, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with ageGroup filter', () =>
    queryParticipants({ 'ageGroup':'sudenpentu' }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with search by last name', () =>
    queryParticipants({ 'textSearch':'Esimerkki' }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with search by first name small caps', () =>
    queryParticipants({ 'textSearch':'tero' }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with multiple filters', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'sudenpentu' },{ 'subCamp':'Alaleiri' },{ 'textSearch':'Teemu' }] }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

  it('Query with multiple filters without results', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'seikkailija' },{ 'textSearch':'Teemu' }] }, accessToken)
    .then(res => {
      expectParticipants([ ], res.body);
    })
  );

  it('Query with multiple filters without text search', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'seikkailija' },{ 'subCamp':'Alaleiri' }] }, accessToken)
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with part of name', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'sudenpentu' },{ 'textSearch':'Te' }] }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with member number', () =>
    queryParticipants({ 'textSearch':'859' }, accessToken)
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with first and last name', () =>
    queryParticipants({ 'textSearch':'Jukola Jussi' }, accessToken)
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with staff position', () =>
    queryParticipants({ 'textSearch':'Jumppaohjaaja' }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with staff position in generator', () =>
    queryParticipants({ 'textSearch':'Tiskari' }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with partial staff position', () =>
    queryParticipants({ 'textSearch':'tisk' }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with hashtag', () =>
    queryParticipants({ 'textSearch':'#Tiskari' }, accessToken)
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with camp office notes', () =>
    queryParticipants({ 'textSearch':'Leiritoimisto' }, accessToken)
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with editable info', () =>
    queryParticipants({ 'textSearch':'Muokattava' }, accessToken)
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

});
