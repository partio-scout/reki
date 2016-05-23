import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import app from '../src/server/server';
import Promise from 'bluebird';
import { resetDatabase } from '../scripts/seed-database';

const expect = chai.expect;

describe('Participant change event', () => {
  chai.use(chaiAsPromised);

  const Participant = app.models.Participant;
  const PresenceHistory = app.models.ParticipantHistory;
  const updateAllParticipants= Promise.promisify(Participant.updateAll, { context: Participant });
  const createParticipant = Promise.promisify(Participant.create, { context: Participant });
  const destroyAllParticipants = Promise.promisify(Participant.destroyAll, { context: Participant });
  const destroyAllPresence = Promise.promisify(PresenceHistory.destroyAll, { context: PresenceHistory });
  const findPresence = Promise.promisify(PresenceHistory.find, { context: PresenceHistory });
  const findParticipant = Promise.promisify(Participant.find, { context: Participant });
  let id;
  beforeEach(() => resetDatabase().then(() =>
                    createParticipant({ firstName: 'Raimo', lastName:'Vormisto',
                        nonScout: false, inCamp: 0,  localGroup: 'testi', campGroup: 'testi',
                        subCamp: 'testi', ageGroup: 'testi' }).then(r => id = r.participantId)
                  )
  );

  afterEach( () => {
    const presence = destroyAllPresence();
    const participant = destroyAllParticipants({ participantId: id });
    return Promise.all([presence, participant]);
  });

  it('Should have only one presenceHistory', () => {
    const update1 = updateAllParticipants({ participantId: id }, { inCamp: 2 });
    return Promise.all([update1])
      .then(() => {
        const update2 = updateAllParticipants({ participantId: id }, { nonScout: true });
        const update3 = updateAllParticipants({ participantId: id }, { nonScout: false });
        const update4 = updateAllParticipants({ participantId: id }, { inCamp: 3 });
        return Promise.all([update2, update3, update4])
          .then(() => findParticipant({ where: { participantId: id,  inCamp: 3 } }))
          .then(participant => expect(findPresence({ where:
                                                   { participantid: participant.participantid } }))
                                      .to.eventually.have.lengthOf(1))
          .then(() => findParticipant({ where: { participantId: id,  inCamp: 3 } }))
          .then(participant => expect(findPresence({ where: {  participantid: participant.participantid } })
                                      .then(r => r.pop().arrived)).to.eventually.not.equal(null));
      });
  });

  it('Should have multiple presenceHistories', () => updateAllParticipants({ participantId: id }, { inCamp: 1 })
      .then(() => updateAllParticipants({ participantId: id }, { inCamp: 3 })
          .then(() => updateAllParticipants({ participantId: id }, { inCamp: 1 })
            .then(() => updateAllParticipants({ participantId: id }, { inCamp: 3 }))
      )
    ).then(() => expect(findPresence({ participantid: id })).to.eventually.have.lengthOf(2))
  );
});
