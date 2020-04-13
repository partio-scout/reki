import React from 'react';
import { Icon } from '..';

export function ListSortingSelector({ property, order, orderChanged }) {
  const hasProperty = Object.prototype.hasOwnProperty.call(order, property);
  const currentSort = hasProperty && order[property] || '';
  const sortGlyphName = (currentSort === 'ASC' && 'sort-asc') || (currentSort === 'DESC' && 'sort-desc') || 'sort';

  function handleButtonClick() {
    // Pyöräyttää sort orderia:
    // ASC -> DESC
    // DESC -> unsorted
    // unsorted -> ASC
    if (!orderChanged) {
      return;
    }

    const newOrder = {};
    if (currentSort === 'ASC') {
      newOrder[property] = 'DESC';
    }
    if (currentSort === '') {
      newOrder[property] = 'ASC';
    }
    orderChanged(newOrder);
  }

  return (
    <button className="sorting-button" onClick={ handleButtonClick }>
      <Icon type={ sortGlyphName } />
    </button>
  );
}
