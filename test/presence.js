import assert from 'assert';
import app from '../src/server/server.js';
import Promise from 'bluebird';
describe('ParticipantModel', () => {
  const db = app.models.Participant;
  const create = Promise.promisify(db.create, { context: db });
  const presenceHistory = Promise.promisify(db.presenceHistory, { context: db });
  const updateAttribute = Promise.promisify(db.updateAttribute, { context: db });
  const participant = create( { firstName: 'Matti', lastName:'Meikäläinen', nonScout: false, inCamp: false } )
    .catch(result => result)
    .catch(err => err);
  it('Should have only one presenceHistory', () => {
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: false } ).catch(err => err);
    assert.equal(participant.presenceHistory().then(result => result).length, 1);
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: true } ).catch(err => err);
    assert.equal(participant.presenceHistory().then(result => result).length, 1);
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: false } ).catch(err => err);
    assert.equal(participant.presenceHistory().then(result => result).length, 2);
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: true } ).catch(err => err);
    assert.equal(participant.presenceHistory().then(result => result).length, 2);
  });
  it('Should have only one history with arrived null', () => {
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: true } ).catch(err => err);
    for (let i = 0, len = 10; i < len; i++) {
      updateAttribute( { where: { id: participant.participantid } }, { inCamp: false } ).catch(err => err);
      updateAttribute( { where: { id: participant.participantid } }, { inCamp: true } ).catch(err => err);
      assert.equal(participant.presenceHistory().then(result => result).length, i+2);
    }
    updateAttribute( { where: { id: participant.participantid } }, { inCamp: false } ).catch(err => err);
    assert.equal(participant.presenceHistory().then(result => result).length, 12);
    assert.equal(presenceHistory( { where: { arrived: null } } ).then(result => result).length, 1);
  });
});
