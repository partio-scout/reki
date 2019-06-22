import React from 'react';
import moment from 'moment';
import Spinner from 'react-spinner';
import { Row, Col, Panel } from 'react-bootstrap';
import { Presence } from '../../components';
import { PresenceHistory } from '../../components';
import { PropertyTextArea } from '../../components';
import { LoadingButton } from '../../components';
import { PresenceSelector } from '../../components';

export function getParticipantDetailsPage(participantStore, participantActions) {

  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      const state = participantStore.getState();
      state.campOfficeNotesSaving = false;
      state.editableInfoSaving = false;
      state.presenceSaving = false;
      state.selectedPresence = null;
      this.state = state;

      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.onPresenceChange = this.onPresenceChange.bind(this);
      this.saveCampOfficeNotes = this.saveCampOfficeNotes.bind(this);
      this.saveEditableInfo = this.saveEditableInfo.bind(this);
      this.savePresence = this.savePresence.bind(this);
      this.save = this.save.bind(this);
    }

    componentWillMount() {
      participantActions.fetchParticipantById(this.props.params.id);
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      const newState = state;
      state.campOfficeNotesSaving = false;
      state.editableInfoSaving = false;
      state.presenceSaving = false;
      this.setState(newState);
    }

    onPresenceChange(event) {
      const newState = this.state;
      newState.selectedPresence = event.target.value;
      this.setState(newState);
    }

    handleChange(property, event) {
      const participantDetails = this.state.participantDetails;
      participantDetails[property] = event.target.value;
      this.setState({ participantDetails: participantDetails, campOfficeNotesSaving: false, editableInfoSaving: false });
    }

    saveCampOfficeNotes() {
      const newState = this.state;
      newState.campOfficeNotesSaving = true;
      this.setState(newState);
      this.save('campOfficeNotes');
    }

    saveEditableInfo() {
      const newState = this.state;
      newState.editableInfoSaving = true;
      this.setState(newState);
      this.save('editableInfo');
    }

    savePresence() {
      if (this.state.selectedPresence) {
        participantActions.updateProperty(this.state.participantDetails.participantId, 'presence', this.state.selectedPresence);
      }
    }

    save(property) {
      participantActions.updateProperty(
        this.state.participantDetails.participantId,
        property,
        this.state.participantDetails[property]);
    }

    render() {
      if (this.state.participantDetails) {
        const {
          firstName,
          lastName,
          nickname,
          dateOfBirth,
          nonScout,
          billedDate,
          paidDate,
          memberNumber,
          email,
          phoneNumber,
          localGroup,
        } = this.state.participantDetails;

        const participantName = `${firstName} ${lastName}`;
        const participantStatus = nonScout ? 'EVP' : `Partiolainen (jäsennumero: ${memberNumber})`;

        const formattedBilledDate = billedDate ? moment(billedDate).format('D.M.YYYY') : '–';
        const formattedPaidDate = paidDate ? moment(paidDate).format('D.M.YYYY') : '–';

        const presence = this.state.participantDetails.presence;
        const presenceHistory = this.state.participantDetails.presenceHistory || [];

        return (
          <div>
            <Row>
              <Col md={ 12 }>
                <h2>
                  { participantName }
                  <small> (synt. { moment(dateOfBirth).format('D.M.YYYY') })</small>
                </h2>
                <h4 className="text-muted margin-bottom">{ participantStatus }</h4>
              </Col>
            </Row>
            <Row>
              <Col md={ 3 }>
                <Panel header="Yhteystiedot">
                  <dl>
                    <dt>Puhelin</dt>
                    <dd>{ phoneNumber || '–' }</dd>
                    <dt>Sähköposti</dt>
                    <dd>{ email || '–' }</dd>
                  </dl>
                </Panel>
                <Panel header="Laskutustiedot">
                  <dl>
                    <dt>Laskutettu</dt>
                    <dd>{ formattedBilledDate || '–' }</dd>
                    <dt>Maksettu</dt>
                    <dd>{ formattedPaidDate || '–' }</dd>
                  </dl>
                </Panel>
                <Panel header="Osallistujan tiedot">
                  <dl>
                    <dt>Partionimi</dt>
                    <dd>{ nickname || '–' }</dd>
                    <dt>Lippukunta</dt>
                    <dd>{ localGroup || '–' }</dd>
                  </dl>
                </Panel>
              </Col>
              <Col md={ 9 }>
                <Panel header="Läsnäolo">
                 <Presence value={ presence } />
                 <form className="form-inline">
                   <PresenceSelector onChange={ this.onPresenceChange } label="Muuta tilaa" />
                   <LoadingButton loading={ this.state.presenceSaving } onClick={ this.savePresence } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
                 </form>
                 <PresenceHistory value={ presenceHistory } />
                </Panel>
                <Panel header="Leiritoimiston merkinnät">
                  <PropertyTextArea
                    property= "campOfficeNotes"
                    value={ this.state.participantDetails.campOfficeNotes }
                    onChange= { this.handleChange }
                    rows={ 8 }
                  />
                  <LoadingButton loading={ this.state.campOfficeNotesSaving } onClick={ this.saveCampOfficeNotes } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
                </Panel>
                <Panel header="Lisätiedot">
                  <PropertyTextArea
                    property= "editableInfo"
                    value={ this.state.participantDetails.editableInfo }
                    onChange= { this.handleChange }
                    rows={ 6 }
                  />
                  <LoadingButton loading={ this.state.editableInfoSaving } onClick={ this.saveEditableInfo } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
                </Panel>
              </Col>
            </Row>
          </div>
        );
      } else {
        return (
          <Spinner />
        );
      }
    }
  }

  ParticipantDetailsPage.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return ParticipantDetailsPage;
}
