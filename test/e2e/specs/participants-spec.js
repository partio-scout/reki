describe('Participants', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
    })
    cy.task('loadFixtures', 'participants-and-deps.json')
    cy.login('masa', 'Salasana123')
    cy.contains(/Leiriläiset/i).click()
  })

  // REKI shouldn't show results before searching to prevent users from accidentally
  // seeing personally identifiable information
  it('are not shown in the list initially', () => {
    cy.contains('Hakutuloksia: 0')
    cy.contains('table', 'Etunimi') // participant table
      .find('tbody tr')
      .should('have.length', 0)
  })

  it('can be filtered with a search', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('label', 'Ikäkausi').find('select').select('sudenpentu')
    cy.contains('Hakutuloksia: 1')
    cy.contains('Testihenkilö')
    cy.get('body').should('not.contain', 'Toinen henkilö')
    cy.get('body').should('not.contain', 'Esimerkki')
  })

  it('will not be shown after the search is reset', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('Hakutuloksia: 2')
    cy.contains('Testihenkilö')
    cy.contains('Tyhjennä').click()
    cy.contains('Hakutuloksia: 0')
    cy.contains('table', 'Etunimi') // participant table
      .find('tbody tr')
      .should('have.length', 0)
  })

  it('can be opened from the list', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('Testihenkilö').click()
    cy.contains('Teemu Testihenkilö')
    cy.contains('synt. 1.1.1999')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
