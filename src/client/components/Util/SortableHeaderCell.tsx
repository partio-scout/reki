import React from 'react';
import { ListSortingSelector } from '../../components';
import { Ordering } from '../../model';

export type SortableHeaderCellProps = Readonly<{
  label: React.ReactNode;
  property: string;
  order: Ordering;
  orderChanged: (newORder: Ordering) => void;
}>

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({ label, property, order, orderChanged }) => (
  <th>
    <div className="sortable-header-cell">{ label } <ListSortingSelector property={ property } order={ order } orderChanged={ orderChanged } /></div>
  </th>
);
