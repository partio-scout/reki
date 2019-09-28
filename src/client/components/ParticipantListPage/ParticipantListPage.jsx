import React from 'react';
import _ from 'lodash';
import { Table, Grid, Row, Col, Input, Glyphicon, Tooltip, OverlayTrigger  } from 'react-bootstrap';
import { getParticipantListUpdater } from './containers/ParticipantListUpdater';
import { getSortableHeaderCell } from '../Util/SortableHeaderCell';
import { getListOffsetSelectorContainer } from './containers/ListOffsetSelectorContainer';
import { getParticipantRowsContainer } from './containers/ParticipantRowsContainer';
import { getQuickFilterContainer } from './containers/QuickFilterContainer';
import { getParticipantCount } from './containers/ParticipantCount';
import { LoadingButton } from '../../components';
import { PresenceSelector } from '../../components';
import { createBrowserHistory } from 'history';

function getOrder(params) {
  try {
    const paramsOrder = params.get('order');
    return paramsOrder ? JSON.parse(paramsOrder) : {};
  } catch (err) {
    return {};
  }
}

function getFilter(params) {
  try {
    const paramsFilter = params.get('filter');
    return paramsFilter ? JSON.parse(paramsFilter) : {};
  } catch (err) {
    return {};
  }
}

function getOffset(params) {
  const offset = Number(params.get('offset'));
  return Number.isNaN(offset) ? 0 : offset;
}

function getLimit(params) {
  if (!params.has('limit')) {
    return 200;
  }
  const limit = Number(params.get('limit'));
  return Number.isNaN(limit) ? 200 : limit;
}

export function getMassEdit(participantStore) {
  class MassEdit extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        loading: false,
      };
      this.onSubmit = this.onSubmit.bind(this);
      this.onChange = this.onChange.bind(this);
      this.onStoreChanged = this.onStoreChanged.bind(this);
    }

    onSubmit(event) {
      event.preventDefault();
      if (this.state.value !== null && this.state.value !== 'null') {
        this.setState({ value: this.state.value, loading: true });
        this.props.onSubmit(this.state.value);
      }
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged() {
      this.setState({ loading: false });
    }

    onChange(event){
      event.persist();
      this.setState({ value: event.target.value });
    }

    render() {
      return (
        <form className="form-inline" onSubmit={ this.onSubmit }>
          <p>{ this.props.count } { (this.props.count == 1 ? 'henkilö' : 'henkilöä') } valittu</p>
          <PresenceSelector label="Tila" onChange={ this.onChange }/>
          <LoadingButton disabled={ !this.state.value || this.state.value === 'null'  } loading={ this.state.loading } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
        </form>
      );
    }
  }

  MassEdit.propTypes = {
    onSubmit: React.PropTypes.func,
    count: React.PropTypes.number,
  };

  return MassEdit;
}

export function getSelectAll() {
  class SelectAll extends React.Component {
    constructor(props){
      super(props);
      this.state = {};
      this.onChange = this.onChange.bind(this);
    }

    onChange(event){
      event.persist();
      this.props.onChange(event.target.checked);
    }

    render() {
      return (
        <Input type="checkbox" title="Valitse kaikki" checked={ this.props.checked } onChange={ this.onChange } />
      );
    }
  }

  SelectAll.propTypes = {
    onChange: React.PropTypes.func,
    checked: React.PropTypes.bool,
  };

  return SelectAll;
}

export function getParticipantListPage(participantStore, participantActions, searchFilterActions, searchFilterStore) {
  const ParticipantListUpdater = getParticipantListUpdater(participantActions);
  const SortableHeaderCell = getSortableHeaderCell();
  const ListOffsetSelectorContainer = getListOffsetSelectorContainer(participantStore);
  const ParticipantRowsContainer = getParticipantRowsContainer(participantStore);
  const QuickFilterContainer = getQuickFilterContainer(participantStore, participantActions, searchFilterActions, searchFilterStore);
  const ParticipantCount = getParticipantCount(participantStore);
  const MassEdit = getMassEdit(participantStore);
  const SelectAll = getSelectAll();

  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        checked: [],
        allChecked: false,
        participants: [ ],
        availableDates: [ ],
        offset: 0,
        limit: 200,
        filter: {},
        order: {},
      };

      this.onSearchFilterStoreChanged = this.onSearchFilterStoreChanged.bind(this);
      this.extractDatesFromSearchFilters = this.extractDatesFromSearchFilters.bind(this);
      this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
      this.isChecked = this.isChecked.bind(this);
      this.handleMassEdit = this.handleMassEdit.bind(this);
      this.checkAll = this.checkAll.bind(this);
      this.checkNoneOnParticipantsChanged = this.checkNoneOnParticipantsChanged.bind(this);

      this.updateHistory = params => {
        const updatedState = {
          filter: this.state.filter,
          order: this.state.order,
          offset: this.state.offset,
          limit: this.state.limit,
          ...params,
        };

        const newQueryParams = { ...updatedState };
        if (Object.keys(newQueryParams.filter).length === 0) {
          delete newQueryParams.filter;
        }
        if (Object.keys(newQueryParams.order).length === 0) {
          delete newQueryParams.order;
        }
        if (newQueryParams.offset === 0) {
          delete newQueryParams.offset;
        }
        if (newQueryParams.limit === 200) {
          delete newQueryParams.limit;
        }

        if (newQueryParams.filter) {
          newQueryParams.filter = JSON.stringify(newQueryParams.filter);
        }
        if (newQueryParams.order) {
          newQueryParams.order = JSON.stringify(newQueryParams.order);
        }

        const search = new URLSearchParams(newQueryParams).toString();
        const { pathname, hash } = this.history.location;

        this.history.push({
          pathname,
          search,
          hash,
        });
        this.setState(updatedState);
      };

      this.setFilter = (parameterName, newValue) => {
        this.updateHistory({ filter: _.pickBy({ ...this.state.filter, [parameterName]: newValue }, value => value), offset: 0 });
      };

      this.resetFilter = () => {
        this.updateHistory({ filter: '', offset: 0 });
      };

      this.setOrder = order => {
        this.updateHistory({ order });
      };

      this.setOffset = offset => {
        this.updateHistory({ offset });
      };

      this.queryToState = search => {
        const params = new URLSearchParams(search);
        const offset = getOffset(params);
        const limit = getLimit(params);
        const order = getOrder(params);
        const filter = getFilter(params);

        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
          offset,
          limit,
          order,
          filter,
        });
      };
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

    isChecked(participantId) {
      return this.state.checked.indexOf(participantId) >= 0;
    }

    checkAll(isChecked) {
      const stateChange = { checked: [], allChecked: isChecked, availableDates: this.state.availableDates };

      if (isChecked) {
        stateChange.checked = _.map(participantStore.state.participants, 'participantId');
      }

      this.setState(stateChange);
    }

    handleMassEdit(newValue) {
      participantActions.updateParticipantPresences(
        this.state.checked,
        newValue,
        this.state.offset,
        this.state.limit,
        this.state.order,
        this.state.filter,
      );
    }

    componentWillMount() {
      searchFilterActions.loadOptions.defer();
    }

    componentDidMount() {
      participantStore.listen(this.checkNoneOnParticipantsChanged);
      searchFilterStore.listen(this.onSearchFilterStoreChanged);

      this.history = createBrowserHistory();

      this.queryToState(this.history.location.search);

      this.unlistenHistory = this.history.listen((newLocation, action) => {
        if (action === 'POP') {
          this.queryToState(newLocation.search);
        }
      });
    }

    componentWillUnmount() {
      participantStore.unlisten(this.checkNoneOnParticipantsChanged);
      searchFilterStore.unlisten(this.onSearchFilterStoreChanged);
      this.unlistenHistory();
    }

    checkNoneOnParticipantsChanged() {
      const newParticipants = _.map(participantStore.state.participants, 'participantId');
      if (!_.isEqual(this.state.participants, newParticipants)) {
        this.setState({ participants: newParticipants });
        this.checkAll(false);
      }
    }

    onSearchFilterStoreChanged() {
      this.setState(this.extractDatesFromSearchFilters());
    }

    extractDatesFromSearchFilters() {
      return {
        availableDates: searchFilterStore.getState().dates || [],
      };
    }

    render() {
      const {
        order,
        offset,
        limit,
        filter,
      } = this.state;

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

      const participantListColumns = [
        { type: 'presence', property: 'presence', label: 'Tila' },
        { type: 'profileLink', property: 'firstName', label: 'Etunimi' },
        { type: 'profileLink', property: 'lastName', label: 'Sukunimi' },
        { type: 'date', property: 'dateOfBirth', label: 'Syntymäpäivä' },
        { type: 'text', property: 'staffPosition', label: 'Pesti' },
        { type: 'date', property: 'billedDate', label: 'Laskutettu' },
        { type: 'date', property: 'paidDate', label: 'Maksettu' },
        { type: 'text', property: 'memberNumber', label: 'Jäsennumero' },
        { type: 'iconWithTooltip', icon: 'info-sign', property: 'campOfficeNotes', label: campOfficeNotes },
        { type: 'iconWithTooltip', icon: 'comment', property: 'editableInfo', label: editableInfo },
        { type: 'boolean', true: 'EVP', false: 'partiolainen', property: 'nonScout', label: 'Onko partiolainen?' },
        { type: 'text', property: 'homeCity', label: 'Kotikaupunki' },
        { type: 'boolean', property: 'interestedInHomeHospitality', label: 'Home hospitality' },
        { type: 'text', property: 'email', label: 'Sähköposti' },
        { type: 'text', property: 'phoneNumber', label: 'Puhelinnumero' },
        { type: 'text', property: 'ageGroup', label: 'Ikäkausi' },
        { type: 'text', property: 'accommodation', label: 'Majoittuminen' },
        { type: 'text', property: 'localGroup', label: 'Lippukunta' },
        { type: 'text', property: 'village', label: 'Kylä' },
        { type: 'text', property: 'subCamp', label: 'Alaleiri' },
        { type: 'text', property: 'campGroup', label: 'Leirilippukunta' },
        { type: 'availableDates', label: 'Ilmoittautumispäivät' },
      ];

      return (
        <Grid fluid>
          <ParticipantListUpdater order={ order } offset={ offset } limit={ limit } filter={ filter } />
          <Row>
            <Col md={ 12 }>
              <h1>Leiriläiset</h1>
            </Col>
          </Row>
          <Row>
            <Col md={ 12 }>
              <QuickFilterContainer updateFilter={ this.setFilter } resetFilter={ this.resetFilter } filter={ filter } />
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
                      participantListColumns.map(column => column.type === 'availableDates' ? (
                        <th colSpan={ this.state.availableDates.length }>{ column.label }</th>
                      ) : (
                        <SortableHeaderCell
                          key={ column.property }
                          property={ column.property }
                          label={ column.label }
                          order={ order }
                          orderChanged={ this.setOrder }
                        />
                      ))
                    }
                  </tr>
                </thead>
                  <ParticipantRowsContainer isChecked={ this.isChecked } checkboxCallback={ this.handleCheckboxChange } columns={ participantListColumns }availableDates={ this.state.availableDates } offset={ offset }/>
                <tbody className="tfooter">
                  <tr>
                    <td></td>
                    <td><SelectAll checked={ this.state.allChecked } onChange={ this.checkAll } /></td>
                      <td colSpan={ participantListColumns.reduce((acc, elem) => acc + (elem.type === 'availableDates' ? this.state.availableDates.length || 1 : 1), 0) }><MassEdit count={ this.state.checked.length } onSubmit={ this.handleMassEdit } /></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col md={ 12 }>
              <ListOffsetSelectorContainer onOffsetChanged={ this.setOffset } offset={ offset } limit={ limit } />
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
