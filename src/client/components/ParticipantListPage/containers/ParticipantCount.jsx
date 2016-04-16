import React from 'react';
import AltContainer from 'alt-container';
import { pureShouldComponentUpdate } from './utils';

function Count(props) {
  return (
    <span>
      Haulla löytyi { props.count } tulosta
    </span>
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
