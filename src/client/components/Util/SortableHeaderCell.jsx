import React from 'react';
import { ListSortingSelector } from '../../components';

export function SortableHeaderCell({ label, property, order, orderChanged }) {
  return (
    <th>
      <div className="sortable-header-cell">{ label } <ListSortingSelector property={ property } order={ order } orderChanged={ orderChanged } /></div>
    </th>
  );
}
