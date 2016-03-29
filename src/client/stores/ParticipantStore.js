export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];
      this.participantDetails = {};

      this.participantsOffset = 0;
      this.participantCount = 0;
      this.participantLimit = 20;
      this.participantListOrder = {};

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantCountUpdated: ParticipantActions.PARTICIPANT_COUNT_UPDATED,
        handleChangeParticipantListOffset: ParticipantActions.CHANGE_PARTICIPANT_LIST_OFFSET,
        handleChangeParticipantListLimit: ParticipantActions.CHANGE_PARTICIPANT_LIST_LIMIT,
        handleChangeParticipantListOrder: ParticipantActions.CHANGE_PARTICIPANT_LIST_ORDER,
      });
    }

    handleUpdateParticipantById(participant) {
      this.participantDetails = participant;
    }

    handleParticipantListUpdated(participants) {
      this.participants = participants;
    }

    handleParticipantCountUpdated(newCount) {
      this.participantCount = newCount;
    }

    handleChangeParticipantListLimit(newLimit) {
      this.participantLimit = newLimit;
    }

    handleChangeParticipantListOffset(newOffset) {
      this.participantsOffset = newOffset;
    }

    handleChangeParticipantListOrder(newOrder) {
      this.participantListOrder = newOrder;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
