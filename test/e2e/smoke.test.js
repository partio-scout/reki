/*global browser*/

describe('REKI', () =>
  it('should show a login button', () =>
    browser
      .url('/')
      .getText('a=Kirjaudu sisään')
      .should.eventually.be.ok
  )
);
