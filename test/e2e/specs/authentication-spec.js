describe('Authentication', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
      firstName: 'Matti',
      lastName: 'Mallikas',
    })
  })

  it('login link is shown when not logged in', () => {
    cy.visit('/')
    cy.contains('Kirjaudu')
  })

  it('current user name is shown when logged in', () => {
    cy.login('masa', 'Salasana123')
    cy.contains('Mallikas')
  })

  it('logout works', () => {
    cy.login('masa', 'Salasana123')
    cy.logout()
    cy.contains('Kirjaudu')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
