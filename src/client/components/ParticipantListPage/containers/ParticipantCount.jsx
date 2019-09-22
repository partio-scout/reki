import React from 'react';
import Spinner from 'react-spinner';

function Count({ count }) {
  if (count === undefined) {
    return <Spinner />;
  } else {
    return count;
  }
}

export function ParticipantCount({ participantCount }) {
  return (
    <div>
      Hakutuloksia: <Count count={ participantCount } />
    </div>
  );
}
