describe('REKI', () => {
  it('displays a login link', () => {
    cy.visit('/')
    cy.contains('Kirjaudu')
  })
})
