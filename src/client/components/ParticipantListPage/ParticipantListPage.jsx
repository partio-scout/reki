import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Table, Grid, Row, Col, Input, Glyphicon, Tooltip, OverlayTrigger  } from 'react-bootstrap';
import { getSortableHeaderCellContainer } from './containers/SortableHeaderCellContainer';
import { getListOffsetSelectorContainer } from './containers/ListOffsetSelectorContainer';
import { getParticipantRowsContainer } from './containers/ParticipantRowsContainer';
import { getQuickFilterContainer } from './containers/QuickFilterContainer';
import { getParticipantCount } from './containers/ParticipantCount';
import { LoadingButton } from '../../components';
import { PresenceSelector, getParticipantSidebar } from '../../components';
import { createStateMapper } from '../../redux-helpers';
import * as actions from '../../actions';

function getOrder(order) {
  try {
    return order || {};
  } catch (err) {
    return {};
  }
}

function getFilter(filter) {
  try {
    return filter || {};
  } catch (err) {
    return {};
  }
}

function getOffset(offset) {
  return offset && Number(offset) || 0;
}

function getLimit(limit) {
  return limit && Number(limit) || 200;
}

function preventingDefault(handler) {
  return function(event) {
    event.preventDefault();
    return handler(event);
  };
}

export function getMassEdit(participantStore) {
  function MassEdit({ selectedPresence, count, loading, onSubmit, setSelectedPresence }) {
    return (
      <form className="form-inline" onSubmit={ preventingDefault(() => onSubmit(selectedPresence)) }>
        <p>{ count } { (count == 1 ? 'henkilö' : 'henkilöä') } valittu</p>
        <PresenceSelector value={ selectedPresence } label="Tila" onChange={ event => setSelectedPresence(event.target.value) }/>
        <LoadingButton type="submit" loading={ loading } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
      </form>
    );
  }

  MassEdit.propTypes = {
    onSubmit: React.PropTypes.func,
    setSelectedPresence: React.PropTypes.func,
    loading: React.PropTypes.bool.isRequired,
    count: React.PropTypes.number,
    selectedPresence: React.PropTypes.string,
  };

  const mapStateToProps = createStateMapper({
    selectedPresence: state => state.participants.participantListSelectedPresence,
  });

  const mapDispatchToProps = {
    setSelectedPresence: actions.setParticipantListSelectedPresence,
  };

  return connect(mapStateToProps, mapDispatchToProps)(MassEdit);
}

export function getSelectAll() {
  function SelectAll({ checked, onChange }) {
    return (
      <Input type="checkbox" title="Valitse kaikki" checked={ checked } onChange={ event => onChange(event.target.checked) } />
    );
  }

  SelectAll.propTypes = {
    onChange: React.PropTypes.func,
    checked: React.PropTypes.bool,
  };

  return SelectAll;
}

export function getParticipantListPage() {
  const SortableHeaderCellContainer = getSortableHeaderCellContainer();
  const ListOffsetSelectorContainer = getListOffsetSelectorContainer();
  const ParticipantRowsContainer = getParticipantRowsContainer();
  const QuickFilterContainer = getQuickFilterContainer();
  const ParticipantCount = getParticipantCount();
  const MassEdit = getMassEdit();
  const SelectAll = getSelectAll();
  const ParticipantSidebar = getParticipantSidebar();

  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        checked: [],
        allChecked: false,
      };

      this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
      this.handleMassEdit = this.handleMassEdit.bind(this);
      this.checkAll = this.checkAll.bind(this);
    }

    handleCheckboxChange(isChecked, participantId) {
      const stateChange = { checked: [], allChecked: false };

      if (isChecked) {
        stateChange.checked = this.state.checked.concat([ participantId ]);
      } else {
        stateChange.checked = _(this.state.checked).without(participantId).value();
      }

      this.setState(stateChange);
    }

    checkAll(isChecked) {
      this.setState({ checked: isChecked ? _.map(this.props.participants, 'participantId') : [], allChecked: isChecked });
    }

    handleMassEdit(newValue) {
      const { order, offset, limit, filter } = this.props;
      this.props.updateParticipantPresences({
        ids: this.state.checked,
        newValue,
        offset,
        limit,
        order,
        filter,
      });
    }

    componentWillMount() {
      this.props.loadOptions();
    }

    componentWillReceiveProps(nextProps) {
      if (!_.isEqual(this.props.participants, nextProps.participants)) {
        this.checkAll(false);
      }
    }

    render() {
      const { order, offset, limit, filter } = this.props;

      const tooltipForNotes = (
        <Tooltip>{ 'Leiritoimiston merkinnät' }</Tooltip>
      );
      const campOfficeNotes = (
        <OverlayTrigger placement="top" overlay={ tooltipForNotes }>
          <Glyphicon glyph="info-sign" />
        </OverlayTrigger>
      );

      const tooltipForInfo = (
        <Tooltip>{ 'Lisätiedot' }</Tooltip>
      );
      const editableInfo = (
        <OverlayTrigger placement="top" overlay={ tooltipForInfo }>
          <Glyphicon glyph="comment" />
        </OverlayTrigger>
      );

      const columnPropertyToLabelMapping = {
        presence: 'Tila',
        firstName: 'Etunimi',
        lastName: 'Sukunimi',
        dateOfBirth: 'Syntymäpäivä',
        staffPosition: 'Pesti',
        billedDate: 'Laskutettu',
        paidDate: 'Maksettu',
        memberNumber: 'Jäsennumero',
        campOfficeNotes: campOfficeNotes,
        editableInfo: editableInfo,
        nonScout: 'Onko partiolainen?',
        homeCity: 'Kotikaupunki',
        interestedInHomeHospitality: 'Home hospitality',
        email: 'Sähköposti',
        phoneNumber: 'Puhelinnumero',
        ageGroup: 'Ikäkausi',
        accommodation: 'Majoittuminen',
        localGroup: 'Lippukunta',
        village: 'Kylä',
        subCamp: 'Alaleiri',
        campGroup: 'Leirilippukunta',
      };

      const columnCount = Object.keys(columnPropertyToLabelMapping).length;

      return (
        <Grid fluid className="page-content">
          <Row>
            <Col sm={ 2 } className="sidebar">
              <ParticipantSidebar />
            </Col>
            <Col sm={ 10 } smOffset={ 2 } className="main">
              <Grid fluid>
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
                          <th></th>
                          <th><SelectAll checked={ this.state.allChecked } onChange={ this.checkAll } /></th>
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
                          <th colSpan={ this.props.availableDates.length }>Ilmoittautumispäivät</th>
                        </tr>
                      </thead>
                      <ParticipantRowsContainer checked={ this.state.checked } checkboxCallback={ this.handleCheckboxChange } columnCount={ Object.keys(columnPropertyToLabelMapping).length } availableDates={ this.props.availableDates } offset={ offset }/>
                      <tbody className="tfooter">
                        <tr>
                          <td></td>
                          <td><SelectAll checked={ this.state.allChecked } onChange={ this.checkAll } /></td>
                          <td colSpan={ columnCount + this.props.availableDates.length }><MassEdit count={ this.state.checked.length } onSubmit={ this.handleMassEdit } loading={ this.props.loading }/></td>
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
            </Col>
          </Row>
        </Grid>
      );
    }
  }

  const mapStateToProps = createStateMapper({
    participants: state => state.participants.participants,
    availableDates: state => state.searchFilters.dates || [],
    order: state => getOrder(state.participants.participantListOrder),
    filter: state => getFilter(state.participants.participantListFilter),
    offset: state => getOffset(state.participants.participantListOffset),
    limit: state => getLimit(state.participants.participantListLimit),
    loading: state => state.participants.loading,
  });

  const mapDispatchToProps = {
    updateParticipantPresences: actions.updateParticipantPresences,
    loadOptions: actions.loadOptions,
  };

  return connect(mapStateToProps, mapDispatchToProps)(ParticipantListPage);
}
