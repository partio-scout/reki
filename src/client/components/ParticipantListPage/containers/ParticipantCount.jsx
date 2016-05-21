import React from 'react';
import AltContainer from 'alt-container';
import { pureShouldComponentUpdate } from './utils';

function Count(props) {
  return (
    <div className="participant-count well">
      Hakutulokset
      <div className="h2">{ props.count }</div>
    </div>
  );
}
Count.propTypes = {
  count: React.PropTypes.number,
};

export function getParticipantCount(participantStore) {
  function ParticipantCount() {
    return (
      <AltContainer
        stores={
          {
            count: () => ({ store: participantStore, value: participantStore.getState().participantCount }),
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
      >
        <Count />
      </AltContainer>
    );
  }

  return ParticipantCount;
}
