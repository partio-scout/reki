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

  it('can be filtered with a search', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('label', 'Ikäkausi').find('select').select('sudenpentu')
    cy.contains('Testihenkilö')
    cy.get('body').should('not.contain', 'Toinen henkilö')
    cy.get('body').should('not.contain', 'Esimerkki')
  })

  it('can be opened from the list', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('Testihenkilö').click()
    cy.contains('Teemu Testihenkilö')
    cy.contains('synt. 1.1.1999')
  })

  it('can be marked present and absent', () => {
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('tr', 'Testihenkilö').find('[type="checkbox"]').check()
    cy.contains('form', '1 henkilö valittu')
      .find('select')
      .select('Saapunut leiriin')
    cy.contains('Tallenna').click()

    cy.visit('/participants/1')
    cy.contains('tr', 'Saapunut leiriin')
    cy.contains('label', 'Muuta tilaa')
      .find('select')
      .select('Poistunut leiristä')
    cy.contains('Tallenna').click()
    cy.contains('tr', 'Poistunut leiristä')

    cy.contains(/Leiriläiset/i).click()
    cy.contains('label', 'Tekstihaku').type('tee')
    cy.contains('tr', 'Testihenkilö').find('[title="Poistunut leiristä"]')
  })

  afterEach(() => {
    cy.task('deleteAllFixtures')
  })
})
