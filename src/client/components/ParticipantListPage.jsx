import React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'lodash';
import { getParticipantListUpdater, getParticipantCountUpdater, ListOffsetSelector, ParticipantRow } from '../components';

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantStore, participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);

  function extractState(newState) {
    const {
      participants,
      participantsOffset: offset,
      participantLimit: limit,
      participantCount: count,
    } = newState;

    return {
      participants,
      offset,
      limit,
      count,
    };
  }

  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);

      this.state = extractState(participantStore.getState());
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    shouldComponentUpdate(newProps, newState) {
      const participantsChanged = !_.isEqual(this.state.participants, newState.participants);
      const countChanged = this.state.count !== newState.count;
      return participantsChanged || countChanged;
    }

    onParticipantStoreChange(state) {
      const newState = extractState(state);
      this.setState(newState);
    }

    handleOffsetSelectionChanged(newOffset) {
      participantActions.changeParticipantListOffset(newOffset);
    }

    render() {
      return (
        <div>
          <ParticipantListUpdater />
          <ParticipantCountUpdater />

          <h1>Leiriläiset</h1>
          <ListOffsetSelector
            offset={ this.state.offset }
            count={ this.state.count }
            chunkSize={ this.state.limit }
            onOffsetChanged={ this.handleOffsetSelectionChanged }
          />
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
