import React from 'react';

export function getParticipantDetailsPage(participantStore, participantActions) {
  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = participantStore.getState();
    }

    componentWillMount() {
      participantActions.fetchParticipantById(this.props.params.id);
    }

    componentDidMount() {
      participantStore.listen(this.onChange.bind(this));
    }

    componentWillUnMount() {
      participantStore.unlisten(this.onChange.bind(this));
    }

    onChange(state) {
      this.setState(state);
    }

    render() {
      let participantName = '';
      let nonScout = '';
      if (this.state.participantDetails) {
        participantName = `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}`;
        nonScout = this.state.participantDetails.nonScout ? 'EVP' : 'Partiolainen';
      }

      return (
        <div>
          <h1><b>{ participantName }</b></h1>
          <p>{ nonScout }</p>
        </div>
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
