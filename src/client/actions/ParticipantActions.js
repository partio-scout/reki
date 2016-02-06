export function getParticipantActions(alt, participantResource) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId)
          .then(participant => this.updateParticipantById(participant))
          .catch(err => this.loadingParticipantByIdFailed(err));
      };
    }

    updateParticipantById(participant) {
      return participant;
    }

    loadingParticipantByIdFailed(err) {
      return err;
    }

    loadParticipantList(offset, limit) {
      const filters = {
        skip: offset,
        limit: limit,
      };

      return dispatch => {
        dispatch();
        participantResource.findAll(`filter=${JSON.stringify(filters)}`)
          .then(participantList => this.participantListUpdated(offset, participantList),
                err => this.participantListUpdateFailed(err));
      };
    }

    participantListUpdated(offset, participants) {
      return { offset, participants };
    }

    participantListUpdateFailed(error) {
      return error;
    }
  }

  return alt.createActions(ParticipantActions);
}
