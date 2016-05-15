import React from 'react';
import { getSortableHeaderCell } from '../../../components';
import { changeQueryParameter } from '../../../utils';

export function getSortableHeaderCellContainer() {
  const SortableHeaderCell = getSortableHeaderCell();

  function SortableHeaderCellContainer(props, context) {
    function handleOrderChanged(newOrder) {
      const stringified = newOrder && Object.keys(newOrder).length > 0 && JSON.stringify(newOrder);
      const newLocation = changeQueryParameter(props.location, 'order', stringified);
      context.router.push(newLocation);
    }

    return (
      <SortableHeaderCell
        { ...props }
        orderChanged={ handleOrderChanged }
      />
    );
  }

  SortableHeaderCellContainer.propTypes = {
    location: React.PropTypes.object.isRequired,
    order: React.PropTypes.object.isRequired,
    property: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
  };

  SortableHeaderCellContainer.contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  return SortableHeaderCellContainer;
}
