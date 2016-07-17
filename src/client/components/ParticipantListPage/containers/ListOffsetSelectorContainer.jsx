import React from 'react';
import AltContainer from 'alt-container';
import { ListOffsetSelector } from '../../../components';
import { pureShouldComponentUpdate, changeQueryParameter } from '../../../utils';

export function getListOffsetSelectorContainer(participantStore) {
  function ListOffsetSelectorContainer(props, context) {
    return (
      <AltContainer
        stores={
          {
            count: function() {
              return { store: participantStore, value: participantStore.getState().participantCount || 0 };
            },
          }
        }
        inject={
          {
            onOffsetChanged: () => newOffset => context.router.push(changeQueryParameter(props.location, 'offset', newOffset)),
            chunkSize: props.limit,
            offset: props.offset,
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
        component={ ListOffsetSelector }
      />
    );
  }

  ListOffsetSelectorContainer.propTypes = {
    location: React.PropTypes.object.isRequired,
    offset: React.PropTypes.number.isRequired,
    limit: React.PropTypes.number.isRequired,
  };

  ListOffsetSelectorContainer.contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  return ListOffsetSelectorContainer;
}
