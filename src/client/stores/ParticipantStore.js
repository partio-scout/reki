export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];
      this.participantDetails = {};
      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
      });
    }

    handleUpdateParticipantById(participant) {
      this.participantDetails = participant;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
