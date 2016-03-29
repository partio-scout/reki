import React from 'react';
import AltContainer from 'alt-container';
import { getSortableHeaderCell } from '../../../components';
import { pureShouldComponentUpdate } from './utils';

export function getSortableHeaderCellContainer(participantStore, participantActions) {
  const SortableHeaderCell = getSortableHeaderCell();

  function SortableHeaderCellContainer(props) {
    return (
      <AltContainer
        stores={
          {
            order: () => ({ store: participantStore, value: participantStore.getState().participantListOrder }),
          }
        }
        actions={
          function() {
            return {
              orderChanged: newOrder => participantActions.changeParticipantListOrder(newOrder),
            };
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
      >
        <SortableHeaderCell
          { ...props }
        />
      </AltContainer>
    );
  }

  return SortableHeaderCellContainer;
}
