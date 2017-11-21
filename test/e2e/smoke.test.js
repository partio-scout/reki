/*global browser*/

describe('REKI', () =>
  it('should show a login button', () =>
    browser
      .url('/')
      .pause(5000)
      .getText('a=Kirjaudu sisään')
      .should.eventually.be.ok
  )
);
