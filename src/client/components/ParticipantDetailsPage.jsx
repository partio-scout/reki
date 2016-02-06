import React from 'react';

export function getParticipantDetailsPage(ParticipantStore, ParticipantActions) {
  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = ParticipantStore.getState();
    }

    componentWillMount() {
      ParticipantActions.fetchParticipantById(this.props.params.id);
    }

    componentDidMount() {
      ParticipantStore.listen(this.onChange);
    }

    componentWillUnMount() {
      ParticipantStore.unlisten(this.onChange);
    }

    onChange(state) {
      this.setState(state);
    }

    render() {
      let participantName = '';
      if (this.state.participantDetails) {
        participantName = this.state.participantDetails.firstName;
      }

      return (
        <div>
          <h1>{ `Leiriläinen ${this.props.params.id}` }</h1>
          { participantName }
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

