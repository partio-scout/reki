describe('REKI', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
      firstName: 'Matti',
      lastName: 'Mallikas',
    })
  })

  it('displays a login link when not logged in', () => {
    cy.visit('/')
    cy.contains('Kirjaudu')
  })

  it('displays the current user when logged in', () => {
    cy.login('masa', 'Salasana123')
    cy.contains('Mallikas')
  })

  afterEach(() => {
    cy.task('deleteFixtures', 'User')
  })
})
