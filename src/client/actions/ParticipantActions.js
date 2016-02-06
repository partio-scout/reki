export function getParticipantActions(alt, Participant) {
  class ParticipantActions {

    fetchParticipantById(participantId) {
      this.dispatch();
      Participant.findById(participantId)
        .then(participant => this.actions.updateParticipantById(participant))
        .catch(err => this.actions.loadingParticipantByIdFailed(err));
    }

    updateParticipantById(participant) {
      this.dispatch(participant);
    }

    loadingParticipantByIdFailed(err) {
      this.dispatch(err);
    }

  }

  return alt.createActions(ParticipantActions);
}
