describe('User management', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'teppo',
      password: 'TeppoTestaa',
      firstName: 'Teppo',
      lastName: 'Testaaja',
    })
    cy.task('createUser', {
      email: 'masa',
      password: 'salasana',
      firstName: 'Masa',
      lastName: 'Mallikas',
    })
    cy.login('teppo', 'TeppoTestaa')
    cy.contains(/Käyttäjät/i).click()
  })

  it('shows the user list', () => {
    cy.contains('table', 'Teppo Testaaja')
    cy.contains('table', 'Masa Mallikas')
  })

  it('allows disabling users', () => {
    cy.contains('tr', 'Masa Mallikas').contains('Estä').click()
    cy.contains('tr', 'Masa Mallikas').contains('Salli')

    // Need to use cy.request() so that we can check the actual status code because
    // the endpoint doesn't actually return anything
    cy.request({
      url: '/login/password',
      auth: {
        username: 'masa',
        password: 'salasana',
      },
      failOnStatusCode: false,
    }).then((response) => expect(response.status).to.equal(401))
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
