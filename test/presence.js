import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import app from '../src/server/server';
import Promise from 'bluebird';

const expect = chai.expect;

describe('ParticipantModel', () => {
  chai.use(chaiAsPromised);

  const Participant = app.models.Participant;
  const PresenceHistory = app.models.ParticipantHistory;
  const updateAllParticipants= Promise.promisify(Participant.updateAll, { context: Participant } );
  const createParticipant = Promise.promisify(Participant.create, { context: Participant } );
  const destroyAllParticipants = Promise.promisify(Participant.destroyAll, { context: Participant } );
  const destroyAllPresence = Promise.promisify(PresenceHistory.destroyAll, { context: PresenceHistory } );
  const findPresence = Promise.promisify(PresenceHistory.find, { context: PresenceHistory } );
  const findParticipant = Promise.promisify(Participant.find, { context: Participant } );
  let id;
  beforeEach( () => createParticipant( { firstName: 'Raimo', lastName:'Vormisto', nonScout: false, inCamp: 0 } ).then(r => id = r.participantId));

  afterEach( () => {
    const presence = findParticipant( { where: { participantId: id }, fields: { participantid: true } } )
    .then(result => destroyAllPresence( { participantid: result.participantid } ));
    const participant = destroyAllParticipants( { participantId: id } );
    return Promise.all([presence, participant]);
  });

  it('Should have only one presenceHistory', () => {
    const update1 = updateAllParticipants( { participantId: id }, { inCamp: 1 } );
    const update2 = updateAllParticipants( { participantId: id }, { nonScout: true } );
    const update3 = updateAllParticipants( { participantId: id }, { nonScout: false } );
    const update4 = updateAllParticipants( { participantId: id }, { inCamp: 2 } );
    return Promise.all([update1, update2, update3, update4]).delay(200)
      .then(() => findParticipant( { where: { participantId: id,  inCamp: 2 } }))
      .then(participant => expect(findPresence( { where: { participantid: participant.participantid } } )).to.eventually.have.lengthOf(1))
      .then(() => findParticipant( { where: { participantId: id,  inCamp: 2 } }))
      .then(participant => expect(findPresence( { where: {  participantid: participant.participantid } } ).then(r => r.pop().arrived)).to.eventually.not.equal(null));
  });

  it('Should have multiple presenceHistories', () => {
    const update1 = updateAllParticipants( { participantId: id }, { inCamp: 1 } );
    const update2 = updateAllParticipants( { participantId: id }, { inCamp: 2 } );
    return Promise.all([update1, update2]).delay(100).then(() =>  {
      const update3 = updateAllParticipants( { participantId: id }, { inCamp: 1 } );
      const update4 = updateAllParticipants( { participantId: id }, { inCamp: 2 } );
      const update5 = updateAllParticipants( { participantId: id }, { inCamp: 2 } );
      return Promise.all([update3, update4, update5]).delay(50)
          .then(() => findParticipant( { where: { participantId: id,  inCamp: 2 } }))
          .then(participant => expect(findPresence( { where: { participantid: participant.participantid } } )).to.eventually.have.lengthOf(2))
          .then(() => findParticipant( { where: { participantId: id,  inCamp: 2 } }))
          .then(participant => expect(findPresence( { where: {  participantid: participant.participantid } } ).then(r => r[0].arrived)).to.eventually.not.equal(null))
          .then(() => findParticipant( { where: { participantId: id,  inCamp: 2 } }))
          .then(participant => expect(findPresence( { where: {  participantid: participant.participantid } } ).then(r => r[1].arrived)).to.eventually.not.equal(null));
    });
  });
});
