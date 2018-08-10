/*global browser*/

describe('REKI', () =>
  it('should show a the homepage link', () =>
    browser
      .url('/')
      .getText('a=REKI')
      .should.eventually.be.ok
  )
);
