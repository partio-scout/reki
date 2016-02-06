import React from 'react';

export function getParticipantListPage() {
  class ParticipantListPage extends React.Component {
    render() {
      return (
        <h1>Leiriläiset</h1>
      );
    }
  }

  return ParticipantListPage;
}
