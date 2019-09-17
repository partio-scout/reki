import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiDateTime from 'chai-datetime';
import { resetDatabase } from '../../scripts/seed-database';
import mockKuksa from '../utils/kuksa-integration/mock/mock-kuksa';
import { exec } from 'child_process';
import moment from 'moment';
import { models } from '../../src/server/models';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chaiDateTime);

describe('Kuksa integration (yes, this is very slow)', () => {

  before(function(done) {
    this.timeout(800000);
    resetDatabase().then(() => {
      mockKuksa.serveFixtures('all');
      mockKuksa.start();
      exec('npm run fetch-from-kuksa', mockKuksa.getOptionsForExec(), e => done(e));
    });
  });

  it('produces the expected amount of results in the database',
    () => expect(models.Participant.count()).to.eventually.equal(53)
  );

  it('correctly transfers participant extra info (free-text fields)',
    () => expect(models.Participant.findByPk(541)).to.eventually.have.property('staffPosition', 'Perunankuorija')
  );

  it('correctly transfers participant extra selection (multiple choice fields)',
    () => expect(models.Participant.findByPk(515)).to.eventually.have.property('ageGroup', 'vaeltajat (18-22v.)')
  );

  it('correctly transfers participant local group',
    () => expect(models.Participant.findByPk(10)).to.eventually.have.property('localGroup', 'Liitukauden Liitäjät ry')
  );

  it('correctly transfers participant camp group',
    () => expect(models.Participant.findByPk(494)).to.eventually.have.property('campGroup', 'Leirilippukunta Savu')
  );

  it('correctly transfers participant village',
    () => expect(models.Participant.findByPk(508)).to.eventually.have.property('village', 'Testikylä')
  );

  it('correctly transfers participant subcamp',
    () => expect(models.Participant.findByPk(38)).to.eventually.have.property('subCamp', 'Unity')
  );

  it('sets nonScout status as true for participants with no memberNumber and no localGroup',
    () => expect(models.Participant.findByPk(515)).to.eventually.have.property('nonScout', true)
  );

  it('sets nonScout status as false if memberNumber is set',
    () => expect(models.Participant.findByPk(541)).to.eventually.have.property('nonScout', false)
  );

  it('sets nonScout status as false if localGroup is set',
    () => expect(models.Participant.findByPk(42)).to.eventually.have.property('nonScout', false)
  );

  it('sets internationalGuest status as true if localGroup is set',
    () => expect(models.Participant.findByPk(42)).to.eventually.have.property('internationalGuest', true)
  );

  it('sets internationalGuest status as false if no localGroup is set',
    () => expect(models.Participant.findByPk(542)).to.eventually.have.property('internationalGuest', false)
  );

  it('produces the expected amount of allergies in the database',
    () => expect(models.Allergy.count()).to.eventually.equal(26)
  );

  it('correctly transfers allergies',
    () => expect(models.Allergy.findByPk(415)).to.eventually.have.property('name', 'Herne, kypsä')
  );

  it('correctly transfers diets',
    () => expect(models.Allergy.findByPk(406)).to.eventually.have.property('name', 'Gluteeniton')
  );

  it('correctly transfers participants allergies',
    () => expect(models.Participant.findByPk(448, { include: models.Allergy })).to.eventually.have.nested.property('allergies[0].name', 'Porkkana, kypsä')
  );

  it('sets the billed date as null if participant has not been billed',
    () => expect(models.Participant.findByPk(1)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if participant has not paid the bill',
    () => expect(models.Participant.findByPk(6)).to.eventually.have.property('paidDate', null)
  );

  it('sets the billed date if participant has been billed',
    () => expect(models.Participant.findByPk(6)).to.eventually.have.property('billedDate').that.is.a('date')
  );

  it('sets the paid date if participant has paid',
    () => expect(models.Participant.findByPk(497)).to.eventually.have.property('paidDate').that.is.a('date')
  );

  it('sets the billed date as null if payment status is missing',
    () => expect(models.Participant.findByPk(38)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if payment status is missing',
    () => expect(models.Participant.findByPk(38)).to.eventually.have.property('paidDate', null)
  );

  it('sets the correct amount of dates for participants with individual dates',
    () => expect(models.Participant.findByPk(448, { include: [ 'dates' ] }))
      .to.eventually.have.property('dates').that.has.length(2)
  );

  it('sets the correct amount of dates for participants with full camp',
    () => expect(models.Participant.findByPk(497, { include: [ 'dates' ] } ))
      .to.eventually.have.property('dates').that.has.length(8)
  );

  it('sets the correct date for participants',
    () => models.Participant.findByPk(448, { include: { all: true } })
      .then(participant => {
        expect(participant).to.have.nested.property('dates[1].date');
        expect(participant.dates[0].date).to.equalDate(moment('2016-07-23').toDate());
        expect(participant.dates[1].date).to.equalDate(moment('2016-07-24').toDate());
      })
  );

  it('sets the correct amount of dates even when the dates overlap',
    () => expect(models.Participant.findByPk(1, { include: [ 'dates' ] }))
      .to.eventually.have.property('dates').that.has.length(2)
  );

  it('produces the expected amount of selections',
    () => expect(models.Selection.count({ where: { kuksaGroupId: 94 } })).to.eventually.equal(9)
  );

  it('produces expected selection',
    () => models.Selection.findAll({ where: { kuksaSelectionId: 487 } })
      .then(s => {
        expect(s).to.have.length(1);
        expect(s[0]).to.have.property('participantParticipantId', 544);
        expect(s[0]).to.have.property('groupName', 'Lapsi tarvitsee päiväunien aikaan vaippaa');
        expect(s[0]).to.have.property('selectionName', 'Ei');
      })
  );

  it('builds options in advance',
    () => expect(models.Option.count()).to.eventually.be.above(0)
  );

  it('creates each option only once',
    () => expect(models.Option.count({
      where: { property: 'subCamp', value: 'Unity' },
    })).to.eventually.equal(1)
  );

  it('builds correct amount of options',
    () => expect(models.Option.count({
      where: { property: 'village' },
    })).to.eventually.equal(4)
  );

  //TODO Check it saves correct options for each field

  after(() => {
    mockKuksa.stop();
  });
});
