export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];
      this.participantDetails = {};

      this.participantCount = 0;

      this.localGroups = [''];

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantCountUpdated: ParticipantActions.PARTICIPANT_COUNT_UPDATED,
        handleLocalGroupsLoaded: ParticipantActions.LOCAL_GROUPS_LOADED,
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

    handleLocalGroupsLoaded(localGroups) {
      this.localGroups = localGroups;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
