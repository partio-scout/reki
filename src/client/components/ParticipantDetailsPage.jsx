import React from 'react';

export function getParticipantDetailsPage() {
  class ParticipantDetailsPage extends React.Component {
    render() {
      return (
        <h1>{ `Leiriläinen ${this.props.params.id}` }</h1>
      );
    }
  }

  ParticipantDetailsPage.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return ParticipantDetailsPage;
}

