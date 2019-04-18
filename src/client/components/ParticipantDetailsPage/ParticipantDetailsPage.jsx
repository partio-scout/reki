import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import Spinner from 'react-spinner';
import { Row, Col, Panel } from 'react-bootstrap';
import { Presence } from '../../components';
import { ParticipantDates } from './ParticipantDates';
import { PresenceHistory } from '../../components';
import { PropertyTextArea } from '../../components';
import { LoadingButton } from '../../components';
import { PresenceSelector } from '../../components';
import { createStateMapper } from '../../redux-helpers';
import * as actions from '../../actions';

export function getParticipantDetailsPage() {
  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.onPresenceChange = this.onPresenceChange.bind(this);
      this.saveCampOfficeNotes = this.saveCampOfficeNotes.bind(this);
      this.saveEditableInfo = this.saveEditableInfo.bind(this);
      this.savePresence = this.savePresence.bind(this);
      this.save = this.save.bind(this);
    }

    onPresenceChange(event) {
      this.props.setSelectedPresence(event.target.value);
    }

    handleChange(property, event) {
      if (property == 'campOfficeNotes') {
        this.props.setCurrentCampOfficeNotes(event.target.value);
      }
      if (property == 'editableInfo') {
        this.props.setCurrentEditableInfo(event.target.value);
      }
    }

    saveCampOfficeNotes() {
      this.save('campOfficeNotes', this.props.currentCampOfficeNotes);
    }

    saveEditableInfo() {
      this.save('editableInfo', this.props.currentEditableInfo);
    }

    savePresence() {
      if (this.props.selectedPresence) {
        this.save('presence', this.props.selectedPresence);
      }
    }

    save(property, newValue) {
      this.props.updateProperty({
        participantId: this.props.participantDetails.participantId,
        property,
        newValue,
      });
    }

    render() {
      if (this.props.participantDetails) {
        const {
          firstName,
          lastName,
          nickname,
          dateOfBirth,
          nonScout,
          billedDate,
          paidDate,
          memberNumber,
          homeCity,
          country,
          email,
          phoneNumber,
          ageGroup,
          localGroup,
          subCamp,
          campGroup,
          village,
          internationalGuest,
          staffPosition,
          staffPositionInGenerator,
          swimmingSkill,
          willOfTheWisp,
          willOfTheWispWave,
          guardianOne,
          guardianTwo,
          diet,
          familyCampProgramInfo,
          childNaps,
          dates,
          allergies,
          selections,
        } = this.props.participantDetails;

        const participantName = `${firstName} ${lastName}`;
        const participantStatus = internationalGuest ? 'KV-osallistuja' : ( nonScout ? 'EVP' : `Partiolainen (jäsennumero: ${memberNumber})` );

        const formattedBilledDate = billedDate ? moment(billedDate).format('D.M.YYYY') : '–';
        const formattedPaidDate = paidDate ? moment(paidDate).format('D.M.YYYY') : '–';

        const presence = this.props.participantDetails.presence;
        const presenceHistory = this.props.participantDetails.presenceHistory || [];

        const allergyNames = _.map(allergies, row => row.name);

        const familyCampSelections = _.groupBy(selections, row => row.kuksaGroupId);

        const renderedFamilyCampSelections = _.map(familyCampSelections, selection => {
          const rows = _.map(selection, row => <dd>{ row.selectionName }</dd>);
          return <dl className="margin-top-0"><dt>{ _.head(selection).groupName }</dt>{ rows }</dl>;
        });

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
                    <dt>Huoltajat</dt>
                    <dd>{ guardianOne || '–' }</dd>
                    <dd>{ guardianTwo || '–' }</dd>
                    <dt>Kotikunta</dt>
                    <dd>{ homeCity || '–' }</dd>
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
                <Panel header="Pesti">
                  <dl>
                    <dt>Pesti</dt>
                    <dd>{ staffPosition || '–' }</dd>
                    <dt>Pestitieto kehittimestä</dt>
                    <dd>{ staffPositionInGenerator || '–' }</dd>
                  </dl>
                </Panel>
                <Panel header="Osallistujan tiedot">
                  <dl>
                    <dt>Partionimi</dt>
                    <dd>{ nickname || '–' }</dd>
                    <dt>Ikäkausi</dt>
                    <dd>{ ageGroup || '–' }</dd>
                    <dt>Uimataito</dt>
                    <dd>{ swimmingSkill || '–' }</dd>
                    <dt>Lippukunta</dt>
                    <dd>{ localGroup || '–' }</dd>
                    <dt>Maa</dt>
                    <dd>{ country || '–' }</dd>
                    <dt>Leirilippukunta</dt>
                    <dd>{ campGroup || '–' }</dd>
                    <dt>Kylä</dt>
                    <dd>{ village || '–' }</dd>
                    <dt>Alaleiri</dt>
                    <dd>{ subCamp || '–' }</dd>
                    <dt>Virvatuli</dt>
                    <dd>{ willOfTheWisp || '–' }</dd>
                    <dt>Virvatuliaalto</dt>
                    <dd>{ willOfTheWispWave || '–' }</dd>
                  </dl>
                </Panel>
                <Panel header="Perheleiri">
                  <dl>
                    <dt>Ohjelma</dt>
                    <dd>{ familyCampProgramInfo || '–' }</dd>
                    <dt>Päiväunet</dt>
                    <dd>{ childNaps || '–' }</dd>
                  </dl>
                  { renderedFamilyCampSelections }
                </Panel>
              </Col>
              <Col md={ 9 }>
                <Panel header="Läsnäolo">
                 <Presence value={ presence } />
                 <form className="form-inline">
                   <PresenceSelector onChange={ this.onPresenceChange } value={ this.props.selectedPresence } label="Muuta tilaa" />
                   <LoadingButton loading={ this.props.presenceSaving } onClick={ this.savePresence } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
                 </form>
                 <PresenceHistory value={ presenceHistory } />
                </Panel>
                <Panel header="Ilmoittautumispäivät">
                  <ParticipantDates dates={ dates } />
                </Panel>
                <Panel header="Allergiat ja erityisruokavaliot">
                  { _.isEmpty(allergyNames) && _.isEmpty(diet)  ? <p>Ei allergioita</p> : '' }
                  { allergyNames ? <p>{ allergyNames.join(', ') }</p> : '' }
                  { diet ? <p>{ diet }</p> : '' }
                </Panel>
                <Panel header="Leiritoimiston merkinnät">
                  <PropertyTextArea
                    property= "campOfficeNotes"
                    value={ this.props.currentCampOfficeNotes }
                    onChange= { this.handleChange }
                    rows={ 8 }
                  />
                  <LoadingButton loading={ this.props.campOfficeNotesSaving } onClick={ this.saveCampOfficeNotes } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
                </Panel>
                <Panel header="Lisätiedot">
                  <PropertyTextArea
                    property= "editableInfo"
                    value={ this.props.currentEditableInfo }
                    onChange= { this.handleChange }
                    rows={ 6 }
                  />
                  <LoadingButton loading={ this.props.editableInfoSaving } onClick={ this.saveEditableInfo } bsStyle="primary" label="Tallenna" labelWhileLoading="Tallennetaan…"/>
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

  const mapStateToProps = createStateMapper({
    participantDetails: state => state.participants.participantDetails,
    presenceSaving: state => state.participants.saving && state.participants.saving.presence,
    campOfficeNotesSaving: state => state.participants.saving && state.participants.saving.campOfficeNotes,
    editableInfoSaving: state => state.participants.saving && state.participants.saving.editableInfo,
    currentCampOfficeNotes: state => state.participants.participantDetailsCurrentCampOfficeNotes,
    currentEditableInfo: state => state.participants.participantDetailsCurrentEditableInfo,
    selectedPresence: state => state.participants.participantDetailsSelectedPresence,
  });

  const mapDispatchToProps = {
    fetchParticipantById: actions.fetchParticipantById,
    setSelectedPresence: actions.setParticipantDetailsSelectedPresence,
    setCurrentCampOfficeNotes: actions.setCurrentCampOfficeNotes,
    setCurrentEditableInfo: actions.setCurrentEditableInfo,
    updateProperty: actions.updateProperty,
  };

  return connect(mapStateToProps, mapDispatchToProps)(ParticipantDetailsPage);
}
