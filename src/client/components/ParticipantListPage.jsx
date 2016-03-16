import React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'lodash';
import { getParticipantListUpdater, getParticipantCountUpdater, getSortableHeaderCell, ListOffsetSelector, ParticipantRow } from '../components';

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantStore, participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);
  const SortableHeaderCell = getSortableHeaderCell();

  class SortableHeaderCellContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        order: nextState.participantListOrder,
      };
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      const newState = this.extractState(state);
      this.setState(newState);
    }

    handleOrderSelectionChanged(newOrder) {
      participantActions.changeParticipantListOrder(newOrder);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    }

    render() {
      return (
        <SortableHeaderCell
          { ...this.props }
          order={ this.state.order }
          orderChanged={ this.handleOrderSelectionChanged }
        />
      );
    }
  }

  class ParticipantRowsContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        participants: nextState.participants,
      };
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      const newState = this.extractState(state);
      this.setState(newState);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !_.isEqual(this.state, nextState);
    }

    render() {
      return (
        <tbody>
          { this.state.participants.map(participant => <ParticipantRow key={ participant.participantId } participant={ participant } />) }
        </tbody>
      );
    }
  }

  class ListOffsetSelectorContainer extends React.Component {
    constructor(props) {
      super(props);

      this.state = this.extractState(participantStore.getState());
    }

    extractState(nextState) {
      return {
        offset: nextState.participantsOffset,
        limit: nextState.participantLimit,
        count: nextState.participantCount,
      };
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      const newState = this.extractState(state);
      this.setState(newState);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !_.isEqual(this.state, nextState);
    }

    handleOffsetSelectionChanged(newOffset) {
      participantActions.changeParticipantListOffset(newOffset);
    }

    render() {
      return (
        <ListOffsetSelector
          offset={ this.state.offset }
          count={ this.state.count }
          chunkSize={ this.state.limit }
          onOffsetChanged={ this.handleOffsetSelectionChanged }
        />
      );
    }
  }

  function ParticipantListPage() {
    return (
      <div>
        <ParticipantListUpdater />
        <ParticipantCountUpdater />

        <h1>Leiriläiset</h1>
        <ListOffsetSelectorContainer />
        <Table striped>
          <thead>
            <tr>
              <SortableHeaderCellContainer label="Etunimi" property="firstName" />
              <SortableHeaderCellContainer label="Sukunimi" property="lastName" />
              <SortableHeaderCellContainer label="Syntymäpäivä" property="dateOfBirth" />
              <SortableHeaderCellContainer label="Sukupuoli" property="gender" />
              <SortableHeaderCellContainer label="Onko partiolainen?" property="nonScout" />
              <SortableHeaderCellContainer label="Jäsennumero" property="memberNumber" />
              <SortableHeaderCellContainer label="Kotikaupunki" property="homeCity" />
              <SortableHeaderCellContainer label="Uimataito" property="swimmingSkill" />
              <SortableHeaderCellContainer label="Home hospitality" property="interestedInHomeHospitality" />
              <SortableHeaderCellContainer label="Sähköposti" property="email" />
              <SortableHeaderCellContainer label="Puhelinnumero" property="phoneNumber" />
            </tr>
          </thead>
          <ParticipantRowsContainer />
        </Table>
      </div>
    );
  }

  return ParticipantListPage;
}
