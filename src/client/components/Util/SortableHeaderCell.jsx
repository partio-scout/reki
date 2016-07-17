import React from 'react';
import { getListSortingSelector } from '../../components';

export function getSortableHeaderCell() {
  const ListSortingSelector = getListSortingSelector();

  function SortableHeaderCell({ label, property, order, orderChanged }) {
    return (
      <th className="sortable">{ label }
        <ListSortingSelector property={ property } order={ order } orderChanged={ orderChanged } />
      </th>
    );
  }

  return SortableHeaderCell;
}
