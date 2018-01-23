import * as testUtils from '../utils/test-utils';
/*global browser*/

describe('Search', () => {

  beforeEach(() => testUtils.createUserAndGetAccessToken(['registryUser'], 'testuser'));

  it('should initally display all results', () =>
    browser
      .url('/')
      .getText('a=Kirjaudu sisään')
      .should.eventually.be.ok
  );

  afterEach(() => testUtils.deleteFixturesIfExist('RegistryUser', { username: 'testuser' }));
});
