export function getParticipantStore(alt, ParticipantActions) {
  class ParticipantStore  {
    constructor() {
      this.participants = [ ];

      this.bindListeners({
      });
    }
  }

  return alt.createStore(ParticipantStore, 'ParticipantStore');
}
