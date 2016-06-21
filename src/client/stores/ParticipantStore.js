export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];
      this.participantDetails = {};
      this.participantCount = 0;

      this.localGroups = [''];
      this.campGroups = [''];

      this.searchFilters = [ ];

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantCountUpdated: ParticipantActions.PARTICIPANT_COUNT_UPDATED,
        handleLocalGroupsLoaded: ParticipantActions.LOCAL_GROUPS_LOADED,
        handleCampGroupsLoaded: ParticipantActions.CAMP_GROUPS_LOADED,
        handleSearchFilterListUpdated: ParticipantActions.SEARCH_FILTER_LIST_UPDATED,
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

    handleCampGroupsLoaded(campGroups) {
      this.campGroups = campGroups;
    }

    handleSearchFilterListUpdated(searchFilters) {
      this.searchFilters = searchFilters;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
