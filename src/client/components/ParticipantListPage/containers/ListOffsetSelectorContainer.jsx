import React from 'react';
import AltContainer from 'alt-container';
import { ListOffsetSelector } from '../../../components';
import { pureShouldComponentUpdate } from './utils';

export function getListOffsetSelectorContainer(participantStore, participantActions) {
  function ListOffsetSelectorContainer() {
    return (
      <AltContainer
        stores={
          {
            offset: function() {
              return { store: participantStore, value: participantStore.getState().participantsOffset };
            },
            chunkSize: function() {
              return { store: participantStore, value: participantStore.getState().participantLimit };
            },
            count: function() {
              return { store: participantStore, value: participantStore.getState().participantCount };
            },
          }
        }
        actions={
          function() {
            return {
              onOffsetChanged: newOffset => participantActions.changeParticipantListOffset(newOffset),
            };
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
        component={ ListOffsetSelector }
      />
    );
  }

  return ListOffsetSelectorContainer;
}
