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
      let dateOfBirth = '';
      if (this.state.participantDetails) {
        participantName = `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}`;
        nonScout = this.state.participantDetails.nonScout ? 'EVP' : 'Partiolainen';
        const [year, month, time] = `${this.state.participantDetails.dateOfBirth}`.split('-');
        const day = `${time}`.substring(0,2);
        dateOfBirth = `${day}.${month}.${year}`;
      }

      return (
        <div>
          <h2><b>{ participantName }</b></h2>
          <p className="text-muted">{ nonScout }</p>
          <p> <b> Syntymäaika: </b> { dateOfBirth }</p>
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
