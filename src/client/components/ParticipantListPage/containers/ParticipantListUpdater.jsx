import React from 'react';
import _ from 'lodash';

export function getParticipantListUpdater(participantStore, participantActions) {
  class ParticipantListUpdater extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(newState) {
      const {
        participantsOffset: offset,
        participantLimit: limit,
        participantListOrder: order,
      } = newState;

      return {
        offset,
        limit,
        order,
      };
    }

    reloadList({ offset, limit, order }) {
      participantActions.loadParticipantList.defer(offset, limit, order);
    }

    componentWillMount() {
      this.reloadList(this.state);
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      const newState = this.extractState(state);

      if (!_.isEqual(this.state, newState))
        this.reloadList(newState);

      this.setState(newState);
    }

    shouldComponentUpdate() {
      return false;
    }

    render() {
      return null;
    }
  }

  return ParticipantListUpdater;
}
