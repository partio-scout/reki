import React from 'react';
import AltContainer from 'alt-container';
import { ListOffsetSelector } from '../../../components';
import { pureShouldComponentUpdate } from '../../../utils';

export function getListOffsetSelectorContainer(participantStore) {
  function ListOffsetSelectorContainer(props) {
    return (
      <AltContainer
        stores={ {
          count: function() {
            return { store: participantStore, value: participantStore.getState().participantCount || 0 };
          },
        } }
        inject={ {
          chunkSize: props.limit,
          offset: props.offset,
        } }
        actions={ {
          onOffsetChanged: props.onOffsetChanged,
        } }
        shouldComponentUpdate={ pureShouldComponentUpdate }
        component={ ListOffsetSelector }
      />
    );
  }
  return ListOffsetSelectorContainer;
}
