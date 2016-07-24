export function getParticipantStore(alt, ParticipantActions, RegistryUserActions) {
  class ParticipantStore  {
    constructor() {
      this.resetAllData();

      this.bindListeners({
        handleFetchParticipantById: ParticipantActions.FETCH_PARTICIPANT_BY_ID,
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleLoadParticipantList: ParticipantActions.LOAD_PARTICIPANT_LIST,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantPropertyUpdated: ParticipantActions.PARTICIPANT_PROPERTY_UPDATED,
        handleParticipantPresenceHistoryUpdated: ParticipantActions.PARTICIPANT_PRESENCE_HISTORY_UPDATED,
        resetAllData: RegistryUserActions.RESET_ALL_DATA,
      });
    }

    handleFetchParticipantById() {
      this.participantDetails = undefined;
    }

    handleUpdateParticipantById(participant) {
      this.participantDetails = participant;
    }

    handleLoadParticipantList(countParticipants) {
      this.loading = true;
      if (countParticipants) {
        this.participantCount = undefined;
      }
    }

    handleParticipantListUpdated({ participants, newCount }) {
      this.loading = false;
      this.participants = participants;
      if (newCount !== undefined) {
        this.participantCount = newCount;
      }
    }

    handleParticipantCountUpdated(newCount) {
      this.participantCount = newCount;
    }

    handleParticipantPropertyUpdated({ property, newValue }) {
      this.participantDetails[property] = newValue;
    }

    handleParticipantPresenceHistoryUpdated(participant) {
      this.participantDetails.presenceHistory = participant.presenceHistory;
    }

    resetAllData() {
      this.participants = undefined;
      this.participantDetails = undefined;
      this.participantCount = undefined;

      this.localGroups = [''];
      this.campGroups = [''];
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
