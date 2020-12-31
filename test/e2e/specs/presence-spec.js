describe('Presence', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
      firstName: 'Etunimi',
    })
    cy.task('loadFixtures', 'participants-and-deps.json')
    cy.login('masa', 'Salasana123')
  })

  it('can be changed from the participant list', () => {
    cy.contains(/Leiriläiset/i).click()
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('tr', 'Testihenkilö').find('[type="checkbox"]').check()
    cy.contains('form', '1 henkilö valittu')
      .find('select')
      .select('Saapunut leiriin')
    cy.contains('Tallenna').click()

    cy.get('[title*="Saapunut"]').should('have.length', 1)
    cy.visit('/participants/1')
    cy.contains('tr', 'Saapunut leiriin')
  })

  it('history is recorded on the participant page', () => {
    cy.visit('/participants/1')
    cy.contains('label', 'Muuta tilaa')
      .find('select')
      .select('Saapunut leiriin')
    cy.contains('Tallenna').click()
    cy.contains('tr', 'Saapunut leiriin')
    cy.contains('label', 'Muuta tilaa')
      .find('select')
      .select('Poistunut leiristä')
    cy.contains('Tallenna').click()

    cy.contains('tr', 'Poistunut leiristä').contains('Etunimi')
    cy.contains('tr', 'Saapunut leiriin').contains('Etunimi')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
