export function getParticipantStore(alt, ParticipantActions, RegistryUserActions) {
  class ParticipantStore  {
    constructor() {
      this.resetAllData();

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantPropertyUpdated: ParticipantActions.PARTICIPANT_PROPERTY_UPDATED,
        resetAllData: RegistryUserActions.RESET_ALL_DATA,
      });
    }

    handleUpdateParticipantById(participant) {
      this.participantDetails = participant;
    }

    handleParticipantListUpdated({ participants, newCount }) {
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

    resetAllData() {
      this.participants = [ ];
      this.participantDetails = {};
      this.participantCount = 0;

      this.localGroups = [''];
      this.campGroups = [''];
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
