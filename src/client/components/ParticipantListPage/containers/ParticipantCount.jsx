import React from 'react';
import Spinner from 'react-spinner';
import { connect } from 'react-redux';
import { createStateMapper } from '../../../redux-helpers';

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

function CountSpinner() {
  return (
    <div className="participant-count well">
      Hakutulokset
      <div className="h2"><Spinner /></div>
    </div>
  );
}

export function getParticipantCount(participantStore) {
  const ParticipantCount = ({ count }) => count === undefined
    ? (
      <CountSpinner />
    )
    : (
      <Count count={ count }/>
    );

  const mapStateToProps = createStateMapper({
    count: state => state.participants.participantCount,
  });

  return connect(mapStateToProps)(ParticipantCount);
}
