Object.keys(require.cache).forEach(key => { delete require.cache[key]; });

import app from '../src/server/server';
import request from 'supertest-as-promised';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as testUtils from './utils/test-utils';
import _ from 'lodash';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Text search', () => {
  let adminuserId, accessToken;

  const testParticipants = new Array();

  testParticipants.push({
    'firstName': 'Teemu',
    'lastName': 'Testihenkilö',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
    'memberNumber': 123,
  });
  testParticipants.push({
    'firstName': 'Tero',
    'lastName': 'Esimerkki',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'subCamp': 'Alaleiri',
    'ageGroup': 'sudenpentu',
    'memberNumber': 345,
  });
  testParticipants.push({
    'firstName': 'Jussi',
    'lastName': 'Jukola',
    'nonScout': false,
    'localGroup': 'Testilippukunta',
    'campGroup': 'Leirilippukunta',
    'subCamp': 'Alaleiri',
    'ageGroup': 'seikkailija',
    'memberNumber': 859,
  });

  beforeEach(() =>
    resetDatabase().then(() =>
      testUtils.createFixture('RegistryUser', {
        'username': 'testAdmin',
        'memberNumber': '7654321',
        'email': 'testi@adm.in',
        'password': 'salasana',
        'phone': 'n/a',
        'firstName': 'Testi',
        'lastName': 'Admin',
      })
    ).then(adminUser => {
      adminuserId = adminUser.id;
      return testUtils.createFixture('Role', {
        name: 'admin',
      });
    }).then(role =>
      testUtils.createFixture('RoleMapping', {
        principalType: 'USER',
        principalId: adminuserId,
        roleId: role.id,
      })
    ).then(() =>
      testUtils.loginUser('testAdmin')
    ).then(newAccessToken =>
      accessToken = newAccessToken
    ).then(() =>
      testUtils.createFixture('Participant', testParticipants)
    )
  );

  function expectParticipants(expectedResult, response) {
    const firstNames = _.map(response, 'firstName');
    // console.log(firstNames);
    // console.log(expectedResult);
    return expect(firstNames).to.have.members(expectedResult);
  }

  function queryParticipants(filter, accessToken) {
    return request(app)
    .get(`/api/participants/?access_token=${accessToken}&filter={"where":${JSON.stringify(filter)},"skip":0,"limit":20}`)
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

  it('Query with search by first name', () =>
    queryParticipants({ 'textSearch':'Tero' }, accessToken)
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

});
