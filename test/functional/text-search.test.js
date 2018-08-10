import app from '../../src/server/server';
import request from 'supertest';
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

  beforeEach(() =>
    resetDatabase()
      .then(() => testUtils.createFixtureSequelize('Participant', testParticipants))
  );

  function expectParticipants(expectedResult, response) {
    const firstNames = _.map(response.result, 'firstName');
    return expect(firstNames).to.have.members(expectedResult);
  }

  function queryParticipants(filter) {
    return request(app)
      .get(`/api/participants/?filter={"where":${encodeURIComponent(JSON.stringify(filter))},"skip":0,"limit":20}`)
      .expect(200);
  }

  it('Query without filters', () =>
    queryParticipants({})
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with ageGroup filter', () =>
    queryParticipants({ 'ageGroup':'sudenpentu' })
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with search by last name', () =>
    queryParticipants({ 'textSearch':'Esimerkki' })
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with search by first name small caps', () =>
    queryParticipants({ 'textSearch':'tero' })
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with multiple filters', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'sudenpentu' },{ 'subCamp':'Alaleiri' },{ 'textSearch':'Teemu' }] })
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

  it('Query with multiple filters without results', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'seikkailija' },{ 'textSearch':'Teemu' }] })
    .then(res => {
      expectParticipants([ ], res.body);
    })
  );

  it('Query with multiple filters without text search', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'seikkailija' },{ 'subCamp':'Alaleiri' }] })
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with part of name', () =>
    queryParticipants({ 'and':[{ 'ageGroup':'sudenpentu' },{ 'textSearch':'Te' }] })
    .then(res => {
      expectParticipants([ 'Tero', 'Teemu' ], res.body);
    })
  );

  it('Query with member number', () =>
    queryParticipants({ 'textSearch':'859' })
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with first and last name', () =>
    queryParticipants({ 'textSearch':'Jukola Jussi' })
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with staff position', () =>
    queryParticipants({ 'textSearch':'Jumppaohjaaja' })
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with staff position in generator', () =>
    queryParticipants({ 'textSearch':'Tiskari' })
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with partial staff position', () =>
    queryParticipants({ 'textSearch':'tisk' })
    .then(res => {
      expectParticipants([ 'Teemu', 'Jussi' ], res.body);
    })
  );

  it('Query with hashtag', () =>
    queryParticipants({ 'textSearch':'#Tiskari' })
    .then(res => {
      expectParticipants([ 'Jussi' ], res.body);
    })
  );

  it('Query with camp office notes', () =>
    queryParticipants({ 'textSearch':'Leiritoimisto' })
    .then(res => {
      expectParticipants([ 'Tero' ], res.body);
    })
  );

  it('Query with editable info', () =>
    queryParticipants({ 'textSearch':'Muokattava' })
    .then(res => {
      expectParticipants([ 'Teemu' ], res.body);
    })
  );

});
