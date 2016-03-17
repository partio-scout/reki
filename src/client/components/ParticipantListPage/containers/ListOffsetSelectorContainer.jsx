import React from 'react';
import _ from 'lodash';
import { ListOffsetSelector } from '../../../components';

export function getListOffsetSelectorContainer(participantStore, participantActions) {
  class ListOffsetSelectorContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        offset: nextState.participantsOffset,
        limit: nextState.participantLimit,
        count: nextState.participantCount,
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

    handleOffsetSelectionChanged(newOffset) {
      participantActions.changeParticipantListOffset(newOffset);
    }

    render() {
      return (
        <ListOffsetSelector
          offset={ this.state.offset }
          count={ this.state.count }
          chunkSize={ this.state.limit }
          onOffsetChanged={ this.handleOffsetSelectionChanged }
        />
      );
    }
  }

  return ListOffsetSelectorContainer;
}
