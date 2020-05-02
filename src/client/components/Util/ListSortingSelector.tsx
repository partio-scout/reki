import React from 'react';
import { Icon, IconType } from '..';
import { Ordering, SortDirection } from '../../model';

type ListSortingSelectorProps = Readonly<{
  property: string;
  order: Ordering;
  orderChanged: (newOrder: Ordering) => void;
}>

export const ListSortingSelector: React.FC<ListSortingSelectorProps> = ({ property, order, orderChanged }) => {
  const currentSort = order[property];

  return (
    <button className="sorting-button" onClick={ () => orderChanged(sortBy(property, nextOrderDirection(currentSort))) }>
      <Icon type={ iconTypeForSortOrder(currentSort) } />
    </button>
  );
};

function sortBy(property: string, sortDirection: SortDirection): Ordering {
  return {
    [property]: sortDirection,
  };
}

function nextOrderDirection(currentDirection: SortDirection): SortDirection {
  // Pyöräyttää sort orderia:
  // ASC -> DESC
  // DESC -> unsorted
  // unsorted -> ASC
  switch (currentDirection) {
    case 'ASC': return 'DESC';
    case 'DESC': return undefined;
    case undefined: return 'ASC';
  }
}

function iconTypeForSortOrder(currentSort: SortDirection): IconType {
  switch (currentSort) {
    case 'ASC': return 'sort-asc';
    case 'DESC': return 'sort-desc';
    case undefined: return 'sort';
  }
}
