import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiDateTime from 'chai-datetime';
import mockKuksa from '../utils/kuksa-integration/mock/mock-kuksa';
import { exec } from 'child_process';
import { resetDatabase } from '../utils/test-utils';
import { createConnection } from '../../src/server/database';
import { getParticipantById, countParticipants } from '../../src/server/database/participant';
import { countOptions } from '../../src/server/database/option';
import { countAllergies, getAllergyById } from '../../src/server/database/allergy';
import { findSelectionsByGroupId, findSelectionsBySelectionId } from '../../src/server/database/selection';
import { fromCallback } from '../../src/server/promises';

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chaiDateTime);

describe('Kuksa integration', () => {
  let pool;

  before(async function() {
    this.timeout(800000);
    pool = await createConnection();
    await resetDatabase(pool);
    mockKuksa.serveFixtures('all');
    mockKuksa.start();
    await fromCallback(cb => exec('npm run fetch-from-kuksa', mockKuksa.getOptionsForExec(), cb));
  });

  it('produces the expected amount of results in the database',
    () => expect(countParticipants(pool)).to.eventually.equal(53)
  );

  it('correctly transfers participant extra info (free-text fields)',
    () => expect(getParticipantById(pool, 541)).to.eventually.have.property('staffPosition', 'Perunankuorija')
  );

  it('correctly transfers participant extra selection (multiple choice fields)',
    () => expect(getParticipantById(pool, 515)).to.eventually.have.property('ageGroup', 'vaeltajat (18-22v.)')
  );

  it('correctly transfers participant local group',
    () => expect(getParticipantById(pool, 10)).to.eventually.have.property('localGroup', 'Liitukauden Liitäjät ry')
  );

  it('correctly transfers participant camp group',
    () => expect(getParticipantById(pool, 494)).to.eventually.have.property('campGroup', 'Leirilippukunta Savu')
  );

  it('correctly transfers participant village',
    () => expect(getParticipantById(pool, 508)).to.eventually.have.property('village', 'Testikylä')
  );

  it('correctly transfers participant subcamp',
    () => expect(getParticipantById(pool, 38)).to.eventually.have.property('subCamp', 'Unity')
  );

  it('sets nonScout status as true for participants with no memberNumber and no localGroup',
    () => expect(getParticipantById(pool, 515)).to.eventually.have.property('nonScout', true)
  );

  it('sets nonScout status as false if memberNumber is set',
    () => expect(getParticipantById(pool, 541)).to.eventually.have.property('nonScout', false)
  );

  it('sets nonScout status as false if localGroup is set',
    () => expect(getParticipantById(pool, 42)).to.eventually.have.property('nonScout', false)
  );

  it('sets internationalGuest status as true if localGroup is set',
    () => expect(getParticipantById(pool, 42)).to.eventually.have.property('internationalGuest', true)
  );

  it('sets internationalGuest status as false if no localGroup is set',
    () => expect(getParticipantById(pool, 542)).to.eventually.have.property('internationalGuest', false)
  );

  it('produces the expected amount of allergies in the database',
    () => expect(countAllergies(pool)).to.eventually.equal(26)
  );

  it('correctly transfers allergies',
    () => expect(getAllergyById(pool, 415)).to.eventually.have.property('name', 'Herne, kypsä')
  );

  it('correctly transfers diets',
    () => expect(getAllergyById(pool, 406)).to.eventually.have.property('name', 'Gluteeniton')
  );

  it('correctly transfers participants allergies',
    () => expect(getParticipantById(pool, 448)).to.eventually.have.deep.property('allergies[0]', 'Porkkana, kypsä')
  );

  it('sets the billed date as null if participant has not been billed',
    () => expect(getParticipantById(pool, 1)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if participant has not paid the bill',
    () => expect(getParticipantById(pool, 6)).to.eventually.have.property('paidDate', null)
  );

  it('sets the billed date if participant has been billed',
    () => expect(getParticipantById(pool, 6)).to.eventually.have.property('billedDate').that.is.a('string')
  );

  it('sets the paid date if participant has paid',
    () => expect(getParticipantById(pool, 497)).to.eventually.have.property('paidDate').that.is.a('string')
  );

  it('sets the billed date as null if payment status is missing',
    () => expect(getParticipantById(pool, 38)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if payment status is missing',
    () => expect(getParticipantById(pool, 38)).to.eventually.have.property('paidDate', null)
  );

  it('sets the correct amount of dates for participants with individual dates',
    () => expect(getParticipantById(pool, 448))
      .to.eventually.have.property('dates').that.has.length(2)
  );

  it('sets the correct amount of dates for participants with full camp',
    () => expect(getParticipantById(pool, 497))
      .to.eventually.have.property('dates').that.has.length(8)
  );

  it('sets the correct date for participants',
    () => getParticipantById(pool, 448)
      .then(participant => {
        expect(participant).to.have.deep.property('dates[1]');
        expect(participant.dates[0].date).to.equal('2016-07-23');
        expect(participant.dates[1].date).to.equal('2016-07-24');
      })
  );

  it('sets the correct amount of dates even when the dates overlap',
    () => expect(getParticipantById(pool, 1))
      .to.eventually.have.property('dates').that.has.length(2)
  );

  it('produces the expected amount of selections',
    () => expect(findSelectionsByGroupId(pool, 94).then(x => x.length)).to.eventually.equal(9)
  );

  it('produces expected selection',
    () => findSelectionsBySelectionId(pool, 487)
      .then(s => {
        expect(s).to.have.length(1);
        expect(s[0]).to.have.property('participantParticipantId', 544);
        expect(s[0]).to.have.property('groupName', 'Lapsi tarvitsee päiväunien aikaan vaippaa');
        expect(s[0]).to.have.property('selectionName', 'Ei');
      })
  );

  it('builds options in advance',
    () => expect(countOptions(pool)).to.eventually.be.above(0)
  );

  it('creates each option only once',
    () => expect(countOptions(pool, {
      property: 'subCamp',
      value: 'Unity',
    })).to.eventually.equal(1)
  );

  it('builds correct amount of options',
    () => expect(countOptions(pool, {
      property: 'village',
    })).to.eventually.equal(4)
  );

  //TODO Check it saves correct options for each field

  after(() => {
    mockKuksa.stop();
    pool.end();
  });
});
