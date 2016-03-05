import React from 'react';
import { Table } from 'react-bootstrap';
import { ParticipantRow } from './ParticipantRow';

export function getParticipantListPage(participantStore, participantActions) {
  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);

      this.state = participantStore.getState();
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
      participantActions.loadParticipantList(this.state.participantsOffset, 20);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      this.setState(state);
    }

    render() {
      return (
        <div>
          <h1>Leiriläiset</h1>
          <Table striped>
            <thead>
              <tr>
                <th>Etunimi</th>
                <th>Sukunimi</th>
                <th>Syntymäpäivä</th>
                <th>Sukupuoli</th>
                <th>Onko partiolainen?</th>
                <th>Jäsennumero</th>
                <th>Kotikaupunki</th>
                <th>Uimataito</th>
                <th>Home hospitality</th>
                <th>Sähköposti</th>
                <th>Puhelinnumero</th>
              </tr>
            </thead>
            <tbody>
              { this.state.participants.map(participant => <ParticipantRow key={ participant.participantId } participant={ participant } />) }
            </tbody>
          </Table>
        </div>
      );
    }
  }

  return ParticipantListPage;
}
