describe('Authentication', () => {
  const user = {
    email: 'masa',
    password: 'Salasana123',
    firstName: 'Matti',
    lastName: 'Mallikas',
  }

  beforeEach(() => {
    cy.task('createUser', user)
  })

  it('login link is shown when not logged in', () => {
    cy.visit('/')
    cy.contains('Kirjaudu')
  })

  it('current user name is shown when logged in', () => {
    cy.login(user.email, user.password)
    cy.contains(user.lastName)
  })

  it('logout works', () => {
    cy.login(user.email, user.password)
    cy.logout()
    cy.contains('Kirjaudu')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
