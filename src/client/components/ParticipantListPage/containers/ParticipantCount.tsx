import React from 'react';
import Spinner from 'react-spinner';

const Count: React.FC<{ count: number | undefined }> = ({ count }) => {
  if (count === undefined) {
    return <Spinner />;
  } else {
    return <>count</>;
  }
};

export const ParticipantCount: React.FC<{ participantCount: number | undefined }> = ({ participantCount }) => (
  <div>
    Hakutuloksia: <Count count={ participantCount } />
  </div>
);
