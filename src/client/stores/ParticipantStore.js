export function getParticipantStore(alt, ParticipantActions, RegistryUserActions) {
  class ParticipantStore  {
    constructor() {
      this.resetAllData();

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantCountUpdated: ParticipantActions.PARTICIPANT_COUNT_UPDATED,
        handleSubCampsLoaded: ParticipantActions.SUB_CAMPS_LOADED,
        handleLocalGroupsLoaded: ParticipantActions.LOCAL_GROUPS_LOADED,
        handleCampGroupsLoaded: ParticipantActions.CAMP_GROUPS_LOADED,
        resetAllData: RegistryUserActions.RESET_ALL_DATA,
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

    handleSubCampsLoaded(subCamps) {
      this.subCamps = subCamps;
    }

    handleLocalGroupsLoaded(localGroups) {
      this.localGroups = localGroups;
    }

    handleCampGroupsLoaded(campGroups) {
      this.campGroups = campGroups;
    }

    resetAllData() {
      this.participants = [ ];
      this.participantDetails = {};
      this.participantCount = 0;

      this.subCamps = ['']
      this.localGroups = [''];
      this.campGroups = [''];
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
