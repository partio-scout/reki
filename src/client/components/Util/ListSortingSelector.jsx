import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

export function getListSortingSelector() {
  function ListSortingSelector({ property, order, orderChanged }) {
    const hasProperty = Object.prototype.hasOwnProperty.call(order, property);
    const currentSort = hasProperty && order[property] || '';
    const sortGlyphName = (currentSort === 'ASC' && 'sort-by-attributes') || (currentSort === 'DESC' && 'sort-by-attributes-alt') || 'sort';

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
      <div>
        <Button onClick={ handleButtonClick } bsStyle="link" bsSize="small">
          <Glyphicon glyph={ sortGlyphName } />
        </Button>
      </div>
    );
  }

  return ListSortingSelector;
}
