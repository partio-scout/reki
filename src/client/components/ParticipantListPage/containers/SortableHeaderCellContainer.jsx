import React from 'react';
import _ from 'lodash';
import { getSortableHeaderCell } from '../../../components';

export function getSortableHeaderCellContainer(participantStore, participantActions) {
  const SortableHeaderCell = getSortableHeaderCell();

  class SortableHeaderCellContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        order: nextState.participantListOrder,
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

    handleOrderSelectionChanged(newOrder) {
      participantActions.changeParticipantListOrder(newOrder);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    }

    render() {
      return (
        <SortableHeaderCell
          { ...this.props }
          order={ this.state.order }
          orderChanged={ this.handleOrderSelectionChanged }
        />
      );
    }
  }

  return SortableHeaderCellContainer;
}
