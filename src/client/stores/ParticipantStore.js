export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];
      this.participantDetails = {};

      this.participantCount = 0;
      this.registryUsers = [ ];

      this.bindListeners({
        handleUpdateParticipantById: ParticipantActions.UPDATE_PARTICIPANT_BY_ID,
        handleParticipantListUpdated: ParticipantActions.PARTICIPANT_LIST_UPDATED,
        handleParticipantCountUpdated: ParticipantActions.PARTICIPANT_COUNT_UPDATED,
        handleRegistryUserListUpdated: ParticipantActions.REGISTRY_USER_LIST_UPDATED,
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

    handleRegistryUserListUpdated(registryUsers) {
      this.registryUsers = registryUsers;
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
