describe('Audit log', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
    })
  })

  it('displays the login event from this session', () => {
    cy.login('masa', 'Salasana123')
    cy.contains(/Loki/i).click()
    cy.contains('login')
    cy.contains('{"method":"password"}')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
