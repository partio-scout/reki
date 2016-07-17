import React from 'react';
import { pureShouldComponentUpdate } from '../../../utils';

export function getParticipantCountUpdater(participantActions) {
  class ParticipantCountUpdater extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
      return pureShouldComponentUpdate.call(this, nextProps, nextState);
    }

    render() {
      participantActions.loadParticipantCount.defer(this.props.filter);
      return null;
    }
  }

  ParticipantCountUpdater.propTypes = {
    filter: React.PropTypes.object,
  };

  return ParticipantCountUpdater;
}

