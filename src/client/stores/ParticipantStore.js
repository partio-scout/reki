export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participantsOffset = 0;
      this.participants = [ ];
      this.participantDetails = {};
      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
      });
    }

    handleUpdateParticipantById(participant) {
      this.participantDetails = participant;
    }

    handleParticipantListUpdated({ offset, participants }) {
      this.participantsOffset = offset;
      this.participants = participants;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
