import React from 'react';
import { Table, Grid, Row, Col } from 'react-bootstrap';
import { getParticipantListUpdater } from './containers/ParticipantListUpdater';
import { getParticipantCountUpdater } from './containers/ParticipantCountUpdater';
import { getSortableHeaderCellContainer } from './containers/SortableHeaderCellContainer';
import { getListOffsetSelectorContainer } from './containers/ListOffsetSelectorContainer';
import { getParticipantRowsContainer } from './containers/ParticipantRowsContainer';
import { getQuickFilterContainer } from './containers/QuickFilterContainer';
import { getParticipantCount } from './containers/ParticipantCount';

function getOrder(query) {
  try {
    const order = query.order && JSON.parse(query.order) || {};
    return order;
  } catch (err) {
    return {};
  }
}

function getFilter(query) {
  try {
    const filter = query.filter && JSON.parse(query.filter) || {};
    return filter;
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
  const QuickFilterContainer = getQuickFilterContainer(participantStore, participantActions);
  const ParticipantCount = getParticipantCount(participantStore);

  function ParticipantListPage(props, context) {
    const order = getOrder(props.location.query);
    const offset = getOffset(props.location.query);
    const limit = getLimit(props.location.query);
    const filter = getFilter(props.location.query);

    const columnPropertyToLabelMapping = {
      firstName: 'Etunimi',
      lastName: 'Sukunimi',
      dateOfBirth: 'Syntymäpäivä',
      gender: 'Sukupuoli',
      nonScout: 'Onko partiolainen?',
      memberNumber: 'Jäsennumero',
      homeCity: 'Kotikaupunki',
      swimmingSkill: 'Uimataito',
      interestedInHomeHospitality: 'Home hospitality',
      email: 'Sähköposti',
      phoneNumber: 'Puhelinnumero',
      ageGroup: 'Ikäkausi',
      localGroup: 'Lippukunta',
      subCamp: 'Alaleiri',
      campGroup: 'Leirilippukunta',
    };

    return (
      <Grid fluid>
        <ParticipantListUpdater order={ order } offset={ offset } limit={ limit } filter={ filter } />
        <ParticipantCountUpdater filter={ filter } />

        <Row>
          <Col>
            <h1>Leiriläiset</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <QuickFilterContainer location={ props.location } filter={ filter } />
          </Col>
          <Col md={ 3 }>
            <ParticipantCount />
          </Col>
          <Col md={ 9 }>
            <ListOffsetSelectorContainer location={ props.location } offset={ offset } limit={ limit } />
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped responsive condensed>
              <thead>
                <tr>
                  {
                    Object.keys(columnPropertyToLabelMapping).map(property => (
                      <SortableHeaderCellContainer
                        key={ property }
                        property={ property }
                        label={ columnPropertyToLabelMapping[property] }
                        location={ props.location }
                        order={ order }
                      />
                    ))
                  }
                </tr>
              </thead>
              <ParticipantRowsContainer />
            </Table>
          </Col>
        </Row>
      </Grid>
    );
  }

  ParticipantListPage.propTypes = {
    location: React.PropTypes.shape({
      query: React.PropTypes.object.isRequired,
    }).isRequired,
  };

  return ParticipantListPage;
}
