import React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'lodash';
import { getParticipantListUpdater, getParticipantCountUpdater, getListSortingSelector, ListOffsetSelector, ParticipantRow } from '../components';

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantStore, participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);
  const ListSortingSelector = getListSortingSelector();

  function extractState(newState) {
    const {
      participants,
      participantsOffset: offset,
      participantLimit: limit,
      participantListOrder: order,
      participantCount: count,
    } = newState;

    return {
      participants,
      offset,
      limit,
      order,
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

    handleOrderSelectionChanged(newOrder) {
      participantActions.changeParticipantListOrder(newOrder);
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
                <th>Etunimi <ListSortingSelector property="firstName" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Sukunimi <ListSortingSelector property="lastName" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Syntymäpäivä <ListSortingSelector property="dateOfBirth" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Sukupuoli <ListSortingSelector property="gender" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Onko partiolainen? <ListSortingSelector property="nonScout" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Jäsennumero <ListSortingSelector property="memberNumber" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Kotikaupunki <ListSortingSelector property="homeCity" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Uimataito <ListSortingSelector property="swimmingSkill" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Home hospitality <ListSortingSelector property="interestedInHomeHospitality" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Sähköposti <ListSortingSelector property="email" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
                <th>Puhelinnumero <ListSortingSelector property="phoneNumber" order={ this.state.order } orderChanged={ this.handleOrderSelectionChanged } /></th>
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
