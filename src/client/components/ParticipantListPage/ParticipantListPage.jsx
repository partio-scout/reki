import React from 'react';
import { Table } from 'react-bootstrap';
import { getParticipantListUpdater } from './containers/ParticipantListUpdater';
import { getParticipantCountUpdater } from './containers/ParticipantCountUpdater';
import { getSortableHeaderCellContainer } from './containers/SortableHeaderCellContainer';
import { getListOffsetSelectorContainer } from './containers/ListOffsetSelectorContainer';
import { getParticipantRowsContainer } from './containers/ParticipantRowsContainer';

function getOrder(query) {
  try {
    const order = query.order && JSON.parse(query.order) || {};
    return order;
  } catch (err) {
    return {};
  }
}

function getOffset(query) {
  return query.offset && Number(query.offset) || 0;
}

function getLimit(query) {
  return query.limit && Number(query.limit) || 20;
}

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);
  const SortableHeaderCellContainer = getSortableHeaderCellContainer();
  const ListOffsetSelectorContainer = getListOffsetSelectorContainer(participantStore);
  const ParticipantRowsContainer = getParticipantRowsContainer(participantStore);

  function ParticipantListPage(props, context) {
    const order = getOrder(props.location.query);
    const offset = getOffset(props.location.query);
    const limit = getLimit(props.location.query);

    return (
      <div>
        <ParticipantListUpdater order={ order } offset={ offset } limit={ limit } />
        <ParticipantCountUpdater />

        <h1>Leiriläiset</h1>
        <ListOffsetSelectorContainer location={ props.location } offset={ offset } limit={ limit } />
        <Table striped>
          <thead>
            <tr>
              <SortableHeaderCellContainer label="Etunimi" property="firstName" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Sukunimi" property="lastName" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Syntymäpäivä" property="dateOfBirth" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Sukupuoli" property="gender" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Onko partiolainen?" property="nonScout" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Jäsennumero" property="memberNumber" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Kotikaupunki" property="homeCity" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Uimataito" property="swimmingSkill" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Home hospitality" property="interestedInHomeHospitality" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Sähköposti" property="email" location={ props.location } order={ order } />
              <SortableHeaderCellContainer label="Puhelinnumero" property="phoneNumber" location={ props.location } order={ order } />
            </tr>
          </thead>
          <ParticipantRowsContainer />
        </Table>
      </div>
    );
  }

  ParticipantListPage.propTypes = {
    location: React.PropTypes.shape({
      query: React.PropTypes.object.isRequired,
    }).isRequired,
  };

  return ParticipantListPage;
}
