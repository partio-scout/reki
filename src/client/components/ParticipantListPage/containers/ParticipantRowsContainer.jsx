import React from 'react';
import _ from 'lodash';
import { ParticipantRow } from '../../../components';

export function getParticipantRowsContainer(participantStore) {
  class ParticipantRowsContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        participants: nextState.participants,
      };
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      const newState = this.extractState(state);
      this.setState(newState);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !_.isEqual(this.state, nextState);
    }

    render() {
      return (
        <tbody>
          { this.state.participants.map(participant => <ParticipantRow key={ participant.participantId } participant={ participant } />) }
        </tbody>
      );
    }
  }

  return ParticipantRowsContainer;
}
