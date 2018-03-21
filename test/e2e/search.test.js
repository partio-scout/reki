/*global browser*/
import * as testUtils from '../utils/test-utils';
import { resetDatabase } from '../../scripts/seed-database';
import mockKuksa from '../utils/kuksa-integration/mock/mock-kuksa';
import { exec } from 'child_process';

const testUser = {
  'id': 3,
  'username': 'testLooser',
  'memberNumber': '00000002',
  'email': 'jukka.pekka@example.com',
  'password': 'salasa',
  'firstName': 'Jukka',
  'lastName': 'Pekka',
  'phoneNumber': '0000000003',
};

describe.skip('Search', () => {
  let accessToken;

  // Only run this once because it's so heavy and these tests don't change state
  before(function(done) {
    this.timeout(80000);
    return resetDatabase().then(() => {
      mockKuksa.serveFixtures('all');
      mockKuksa.start();
      exec('npm run fetch-from-kuksa', mockKuksa.getOptionsForExec(), () => done());
    });
  });

  beforeEach(async () => {
    accessToken = await testUtils.createUserAndGetAccessToken(['registryUser'], testUser);
    accessToken = accessToken.id;
  });

  it('should initally display all results', () =>
    browser
      .url(`/dev-login/${accessToken.id}`)
      .waitForVisible('a=Kirjaudu ulos') // logged in
      .click('a=Leiriläiset')
      .waitForVisible('53')
      .getText('.participant-count .h2').should.eventually.equal('53')
      //TODO also test how many rows are in the table
  );

  afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser', { username: 'testuser' }));

  after(() => {
    mockKuksa.stop();
  });

  after(() => resetDatabase());
});
