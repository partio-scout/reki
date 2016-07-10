import app from '../src/server/server';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { resetDatabase } from '../scripts/seed-database';
import mockKuksa from './kuksa-integration/mock/mock-kuksa';
import { exec } from 'child_process';
import Promise from 'bluebird';
import _ from 'lodash';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Kuksa integration', () => {
  const countParticipants = Promise.promisify(app.models.Participant.count, { context: app.models.Participant });
  const findParticipantById = Promise.promisify(app.models.Participant.findById, { context: app.models.Participant });
  const countAllergies = Promise.promisify(app.models.Allergy.count, { context: app.models.Allergy });
  const findAllergyById = Promise.promisify(app.models.Allergy.findById, { context: app.models.Allergy });

  before(function(done) {
    this.timeout(30000);
    return resetDatabase().then(() => {
      mockKuksa.serveFixtures('all');
      mockKuksa.start();

      const options = {
        cwd: process.CWD,
        env: _.merge(process.env, {
          KUKSA_API_ENDPOINT: mockKuksa.endpoint,
          KUKSA_API_USERNAME: mockKuksa.username,
          KUKSA_API_PASSWORD: mockKuksa.password,
          KUKSA_API_EVENTID: mockKuksa.eventid,
        }),
      };
      exec('npm run fetch-from-kuksa', options, () => done());
    });
  });

  it('produces the expected amount of results in the database',
    () => expect(countParticipants()).to.eventually.equal(53)
  );

  it('correctly transfers participant extra info (free-text fields)',
    () => expect(findParticipantById(541)).to.eventually.have.property('staffPosition', 'Perunankuorija')
  );

  it('correctly transfers participant extra selection (multiple choice fields)',
    () => expect(findParticipantById(515)).to.eventually.have.property('ageGroup', 'vaeltajat (18-22v.)')
  );

  it('correctly transfers participant local group',
    () => expect(findParticipantById(10)).to.eventually.have.property('localGroup', 'Liitukauden Liitäjät ry')
  );

  it('correctly transfers participant camp group',
    () => expect(findParticipantById(494)).to.eventually.have.property('campGroup', 'Leirilippukunta Savu')
  );

  it('correctly transfers participant village',
    () => expect(findParticipantById(508)).to.eventually.have.property('village', 'Testikylä')
  );

  it('correctly transfers participant subcamp',
    () => expect(findParticipantById(38)).to.eventually.have.property('subCamp', 'Unity')
  );

  it('sets nonScout status as true for participants with no memberNumber and no localGroup',
    () => expect(findParticipantById(515)).to.eventually.have.property('nonScout', true)
  );

  it('sets nonScout status as false if memberNumber is set',
    () => expect(findParticipantById(541)).to.eventually.have.property('nonScout', false)
  );

  it('sets nonScout status as false if localGroup is set',
    () => expect(findParticipantById(42)).to.eventually.have.property('nonScout', false)
  );

  it('sets internationalGuest status as true if localGroup is set',
    () => expect(findParticipantById(42)).to.eventually.have.property('internationalGuest', true)
  );

  it('sets internationalGuest status as false if no localGroup is set',
    () => expect(findParticipantById(542)).to.eventually.have.property('internationalGuest', false)
  );

  it('produces the expected amount of allergies in the database',
    () => expect(countAllergies()).to.eventually.equal(26)
  );

  it('correctly transfers allergies',
    () => expect(findAllergyById(415)).to.eventually.have.property('name', 'Herne, kypsä')
  );

  it('correctly transfers diets',
    () => expect(findAllergyById(406)).to.eventually.have.property('name', 'Gluteeniton')
  );

  it('sets the billed date as null if participant has not been billed',
    () => expect(findParticipantById(1)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if participant has not paid the bill',
    () => expect(findParticipantById(6)).to.eventually.have.property('paidDate', null)
  );

  it('sets the billed date if participant has been billed',
    () => expect(findParticipantById(6)).to.eventually.have.property('billedDate').that.is.a('date')
  );

  it('sets the paid date if participant has paid',
    () => expect(findParticipantById(497)).to.eventually.have.property('paidDate').that.is.a('date')
  );

  it('sets the billed date as null if payment status is missing',
    () => expect(findParticipantById(38)).to.eventually.have.property('billedDate', null)
  );

  it('sets the paid date as null if payment status is missing',
    () => expect(findParticipantById(38)).to.eventually.have.property('paidDate', null)
  );

  after(() => {
    mockKuksa.stop();
  });
});
