describe('Editable fields', () => {
  beforeEach(() => {
    cy.task('createUser', {
      email: 'masa',
      password: 'Salasana123',
    })
    cy.task('loadFixtures', 'participants-and-deps.json')
    cy.login('masa', 'Salasana123')
  })

  it('editable info field can be edited', () => {
    cy.visit('/participants/2')
    cy.contains('section', 'Lisätiedot')
      .find('textarea')
      .type('Tämä on testiteksti')
    cy.contains('section', 'Lisätiedot').contains('Tallenna').click()
    cy.reload()
    cy.contains('Tämä on testiteksti')
  })

  it('camp office notes field can be edited', () => {
    cy.visit('/participants/2')
    cy.contains('section', 'Leiritoimiston merkinnät')
      .find('textarea')
      .clear()
      .type('Leiritoimiston testimerkinnät')
    cy.contains('section', 'Leiritoimiston merkinnät')
      .contains('Tallenna')
      .click()
    cy.reload()
    cy.contains('Leiritoimiston testimerkinnät')
  })

  it('show up in the participant list', () => {
    cy.contains(/Leiriläiset/i).click()
    cy.contains('label', 'Tekstihaku').type('te')
    // This value is present in the fixtures for participant 1 (Teemu Testihenkilö)
    cy.get('[title="Muokattava teksti"]')
    // This value is present in the fixtures for participant 2 (Tero Esimerkki)
    cy.get('[title="Leiritoimiston jutut"]')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
