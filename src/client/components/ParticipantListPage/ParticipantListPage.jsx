import React from 'react';
import _ from 'lodash';
import { Table, Grid, Row, Col, Input, Button } from 'react-bootstrap';
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

export function getMassEdit(participantStore, participantActions) {
  class MassEdit extends React.Component {
    constructor(props){
      super(props);
      this.state = {};
      this.onSubmit = this.onSubmit.bind(this);
      this.onChange = this.onChange.bind(this);
    }

    onSubmit(event) {
      event.preventDefault();
      if (this.state.value !== null && this.state.value !== 'null') {
        this.props.onSubmit(this.state.value);
      }
    }

    onChange(event){
      event.persist();
      this.setState({ value: event.target.value });
    }

    render() {
      return (
        <form className="form-inline" onSubmit={ this.onSubmit }>
          <p>NN henkilöä valittu</p>
          <Input type="select" label="Tila" defaultValue="null" onChange={ this.onChange }>
            <option value="null">---</option>
            <option value="1">Poissa leiristä</option>
            <option value="2">Väliaikaisesti poissa leiristä</option>
            <option value="3">Leirissä</option>
          </Input>
          <Button type="submit" bsStyle="primary">Tallenna</Button>
        </form>
      );
    }
  }

  MassEdit.propTypes = {
    onSubmit: React.PropTypes.func,
  };

  return MassEdit;
}

export function getParticipantListPage(participantStore, participantActions) {
  const ParticipantListUpdater = getParticipantListUpdater(participantActions);
  const ParticipantCountUpdater = getParticipantCountUpdater(participantActions);
  const SortableHeaderCellContainer = getSortableHeaderCellContainer();
  const ListOffsetSelectorContainer = getListOffsetSelectorContainer(participantStore);
  const ParticipantRowsContainer = getParticipantRowsContainer(participantStore);
  const QuickFilterContainer = getQuickFilterContainer(participantStore, participantActions);
  const ParticipantCount = getParticipantCount(participantStore);
  const MassEdit = getMassEdit(participantStore, participantActions);

  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = { checked: new Array() };
      this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
      this.isChecked = this.isChecked.bind(this);
      this.handleMassEdit = this.handleMassEdit.bind(this);
    }

    handleCheckboxChange(isChecked, participantId) {
      const stateChange = { checked: new Array() };

      if (isChecked) {
        stateChange.checked = this.state.checked.concat([ participantId ]);
      } else {
        stateChange.checked = _(this.state.checked).without(participantId).value();
      }

      this.setState(stateChange);
    }

    isChecked(participantId) {
      return this.state.checked.indexOf(participantId) >= 0;
    }

    handleMassEdit(newValue) {
      participantActions.updateParticipantPresences(
        this.state.checked,
        newValue,
        getOffset(this.props.location.query),
        getLimit(this.props.location.query),
        getOrder(this.props.location.query),
        getFilter(this.props.location.query)
      );
    }

    changeAllCheckboxes() {
      return;
    }

    // this.state = { checked: {} };

    render() {
      const order = getOrder(this.props.location.query);
      const offset = getOffset(this.props.location.query);
      const limit = getLimit(this.props.location.query);
      const filter = getFilter(this.props.location.query);

      const columnPropertyToLabelMapping = {
        inCamp: 'Tila',
        firstName: 'Etunimi',
        lastName: 'Sukunimi',
        dateOfBirth: 'Syntymäaika',
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

      const columnCount = Object.keys(columnPropertyToLabelMapping).length;

      return (
        <Grid fluid>
          <ParticipantListUpdater order={ order } offset={ offset } limit={ limit } filter={ filter } />
          <ParticipantCountUpdater filter={ filter } />

          <Row>
            <Col md={ 12 }>
              <h1>Leiriläiset</h1>
            </Col>
          </Row>
          <Row>
            <Col md={ 12 }>
              <QuickFilterContainer location={ this.props.location } filter={ filter } />
            </Col>
          </Row>
          <Row>
            <Col md={ 2 }>
              <ParticipantCount />
            </Col>
            <Col md={ 10 }>
              <p>&nbsp;</p>
            </Col>
          </Row>
          <Row>
            <Col md={ 12 }>
              <Table striped responsive condensed>
                <thead>
                  <tr>
                    <th><Input type="checkbox" title="Valitse kaikki" onChange={ this.changeAllCheckboxes } /></th>
                    {
                      Object.keys(columnPropertyToLabelMapping).map(property => (
                        <SortableHeaderCellContainer
                          key={ property }
                          property={ property }
                          label={ columnPropertyToLabelMapping[property] }
                          location={ this.props.location }
                          order={ order }
                        />
                      ))
                    }
                  </tr>
                </thead>
                <ParticipantRowsContainer isChecked={ this.isChecked } checkboxCallback={ this.handleCheckboxChange } />
                <tbody className="tfooter">
                  <tr>
                    <td><Input type="checkbox" title="Valitse kaikki" /></td>
                    <td colSpan={ columnCount }><MassEdit onSubmit={ this.handleMassEdit } /></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col md={ 12 }>
              <ListOffsetSelectorContainer location={ this.props.location } offset={ offset } limit={ limit } />
            </Col>
          </Row>
        </Grid>
      );
    }
  }

  ParticipantListPage.propTypes = {
    location: React.PropTypes.shape({
      query: React.PropTypes.object.isRequired,
    }).isRequired,
  };

  return ParticipantListPage;
}
