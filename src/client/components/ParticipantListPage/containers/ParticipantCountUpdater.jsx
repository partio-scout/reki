import React from 'react';

export function getParticipantCountUpdater(participantActions) {
  class ParticipantCountUpdater extends React.Component {
    componentWillMount() {
      participantActions.loadParticipantCount();
    }

    shouldComponentUpdate() {
      return false;
    }

    render() {
      return null;
    }
  }

  return ParticipantCountUpdater;
}

