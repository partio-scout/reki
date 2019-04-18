import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import { getSortableHeaderCell } from '../../../components';

export function getSortableHeaderCellContainer() {
  const SortableHeaderCell = getSortableHeaderCell();

  function SortableHeaderCellContainer(props, context) {
    function handleOrderChanged(newOrder) {
      // const stringified = newOrder && Object.keys(newOrder).length > newOrder;
      props.setParticipantListFilter({ order: newOrder });
    }

    return (
      <SortableHeaderCell
        { ...props }
        orderChanged={ handleOrderChanged }
      />
    );
  }

  SortableHeaderCellContainer.propTypes = {
    order: React.PropTypes.object.isRequired,
    property: React.PropTypes.string.isRequired,
    label: React.PropTypes.node.isRequired,
  };

  return connect(null, { setParticipantListFilter: actions.setParticipantListFilter })(SortableHeaderCellContainer);
}
