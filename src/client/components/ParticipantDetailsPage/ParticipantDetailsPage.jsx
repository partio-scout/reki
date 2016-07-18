import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Spinner from 'react-spinner';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { Presence } from '../../components';
import { ParticipantDates } from './ParticipantDates';
import { PresenceHistory } from '../../components';
import { PropertyTextArea } from '../../components';

export function getParticipantDetailsPage(participantStore, participantActions) {

  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = participantStore.getState();
      this.onStoreChanged = this.onStoreChanged.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.saveCampOfficeNotes = this.saveCampOfficeNotes.bind(this);
      this.saveEditableInfo = this.saveEditableInfo.bind(this);
      this.save = this.save.bind(this);
    }

    componentWillMount() {
      participantActions.fetchParticipantById(this.props.params.id);
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanged);
    }

    componentWillUnMount() {
      participantStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged(state) {
      this.setState(state);
    }

    handleChange(property, event) {
      const participantDetails = this.state.participantDetails;
      participantDetails[property] = event.target.value;
      this.setState({ participantDetails: participantDetails });
    }

    saveCampOfficeNotes() {
      this.save('campOfficeNotes');
    }

    saveEditableInfo() {
      this.save('editableInfo');
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
        } = this.state.participantDetails;

        const participantName = `${firstName} ${lastName}`;
        const participantStatus = internationalGuest ? 'KV-osallistuja' : ( nonScout ? 'EVP' : `Partiolainen (jäsennumero: ${memberNumber})` );

        const formattedBilledDate = billedDate ? moment(billedDate).format('D.M.YYYY') : '–';
        const formattedPaidDate = paidDate ? moment(paidDate).format('D.M.YYYY') : '–';

        const presence = this.state.participantDetails.presence;
        const presenceHistory = this.state.participantDetails.presenceHistory || [];

        const allergyNames = _.map(allergies, row => row.name);

        const familyCampDetails = (program, naps) =>
          <Panel header="Perheleiri">
            <dl>
              { program ? <dt>Ohjelma</dt> : '' }
              { program ? <dd>{ program }</dd> : '' }
              { naps ? <dt>Päiväunet</dt> : '' }
              { naps ? <dd>{ naps }</dd> : '' }
            </dl>
          </Panel>;

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
                    <dd>{ phoneNumber }</dd>
                    <dt>Sähköposti</dt>
                    <dd>{ email }</dd>
                    { guardianOne || guardianTwo ? <dt>Huoltajat</dt> : '' }
                    { guardianOne ? <dd>{ guardianOne }</dd> : '' }
                    { guardianTwo ? <dd>{ guardianTwo }</dd> : '' }
                    { homeCity ? <dt>Kotikunta</dt> : '' }
                    { homeCity ? <dd>{ homeCity }</dd> : '' }
                  </dl>
                </Panel>
                { familyCampProgramInfo || childNaps ? familyCampDetails(familyCampProgramInfo, childNaps) : '' }
                <Panel header="Pesti">
                  { staffPosition || staffPositionInGenerator  ? '' : <p>Ei pestiä</p> }
                  <dl>
                    { staffPosition ? <dt>Pesti</dt> : '' }
                    { staffPosition ? <dd>{ staffPosition }</dd> : '' }
                    { staffPositionInGenerator ? <dt>Pestitieto kehittimestä</dt> : '' }
                    { staffPositionInGenerator ? <dd>{ staffPositionInGenerator }</dd> : '' }
                  </dl>
                </Panel>
                <Panel header="Osallistujan tiedot">
                  <dl>
                    <dt>Partionimi</dt>
                    <dd>{ nickname || '' }</dd>
                    <dt>Ikäkausi</dt>
                    <dd>{ ageGroup }</dd>
                    { swimmingSkill ? <dt>Uimataito</dt> : '' }
                    { swimmingSkill ? <dd>{ swimmingSkill }</dd> : '' }
                    <dt>Lippukunta</dt>
                    <dd>{ localGroup }</dd>
                    <dt>Maa</dt>
                    <dd>{ country }</dd>
                    <dt>Leirilippukunta</dt>
                    <dd>{ campGroup }</dd>
                    <dt>Kylä</dt>
                    <dd>{ village }</dd>
                    <dt>Alaleiri</dt>
                    <dd>{ subCamp }</dd>
                    { willOfTheWisp ? <dt>Virvatuli</dt> : '' }
                    { willOfTheWisp ? <dd>{ willOfTheWisp }</dd> : '' }
                    { willOfTheWispWave ? <dt>Virvatuliaalto</dt> : '' }
                    { willOfTheWispWave ? <dd>{ willOfTheWispWave }</dd> : '' }
                  </dl>
                </Panel>
                <Panel header="Laskutustiedot">
                  <dl>
                    <dt>Laskutettu</dt>
                    <dd>{ formattedBilledDate }</dd>
                    <dt>Maksettu</dt>
                    <dd>{ formattedPaidDate }</dd>
                  </dl>
                </Panel>
              </Col>
              <Col md={ 9 }>
                <Panel header="Läsnäolo">
                 <Presence value={ presence } />
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
                    value={ this.state.participantDetails.campOfficeNotes }
                    onChange= { this.handleChange }
                    rows={ 8 }
                  />
                  <Button bsStyle="primary" onClick={ this.saveCampOfficeNotes }>
                    Tallenna
                  </Button>
                </Panel>
                <Panel header="Lisätiedot">
                  <PropertyTextArea
                    property= "editableInfo"
                    value={ this.state.participantDetails.editableInfo }
                    onChange= { this.handleChange }
                    rows={ 6 }
                  />
                  <Button bsStyle="primary" onClick={ this.saveEditableInfo }>
                    Tallenna
                  </Button>
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
