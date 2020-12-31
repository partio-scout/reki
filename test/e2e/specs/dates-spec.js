describe('Participant dates', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
    })
    cy.task('loadFixtures', 'participants-and-deps.json')
    cy.login('masa', 'Salasana123')
    cy.contains(/Leiriläiset/i).click()
  })

  it('are shown in the participant list', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    // Is registered for 24.7.
    cy.contains('tr', 'Testihenkilö').contains('24.7.')
    // Isn't registered for 25.7.
    cy.contains('tr', 'Testihenkilö').contains('25.7.').should('have.length', 0)
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
