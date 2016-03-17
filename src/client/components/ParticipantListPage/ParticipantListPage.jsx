import React from 'react';
import { Table } from 'react-bootstrap';
import { getParticipantListUpdater } from './containers/ParticipantListUpdater';
import { getParticipantCountUpdater } from './containers/ParticipantCountUpdater';
import { getSortableHeaderCellContainer } from './containers/SortableHeaderCellContainer';
import { getListOffsetSelectorContainer } from './containers/ListOffsetSelectorContainer';
import { getParticipantRowsContainer } from './containers/ParticipantRowsContainer';

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantStore, participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);
  const SortableHeaderCellContainer = getSortableHeaderCellContainer(participantStore, participantActions);
  const ListOffsetSelectorContainer = getListOffsetSelectorContainer(participantStore, participantActions);
  const ParticipantRowsContainer = getParticipantRowsContainer(participantStore);

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
