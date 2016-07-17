import React from 'react';
import moment from 'moment';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { Presence } from '../components';
import { PresenceHistory } from '../components';
import { PropertyTextArea } from '../components';

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
          participantId,
          firstName,
          lastName,
          dateOfBirth,
          nonScout,
          billedDate,
          paidDate,
          memberNumber,
          homeCity,
          email,
          phoneNumber,
          ageGroup,
          localGroup,
          subCamp,
          campGroup,
          village,
          dates,
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
          allergies,
        } = this.state.participantDetails;

        const participantName = `${firstName} ${lastName}`;
        const participantStatus = internationalGuest ? 'KV-osallistuja' : ( nonScout ? 'EVP' : `Partiolainen (jäsennumero: ${memberNumber})` );

        const formattedBilledDate = billedDate ? moment(billedDate).format('D.M.YYYY') : '–';
        const formattedPaidDate = paidDate ? moment(paidDate).format('D.M.YYYY') : '–';

        const presence = this.state.participantDetails.presence;
        const presenceHistory = this.state.participantDetails.presenceHistory || [];

        const allergyNames = _.map(allergies, row => row.name);

        console.log(this.state.participantDetails);

        return (
          <div>
            <Grid>
              <Row>
                <Col md={ 12 }>
                  <h2>{ participantName }</h2>
                  <p className="text-muted">{ participantStatus }</p>
                  <p className="text-muted">Syntymäaika: { moment(dateOfBirth).format('D.M.YYYY') }</p>
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
                    </dl>
                  </Panel>
                  <Panel header="Osallistujan tiedot">
                    <dl>
                      <dt>Ikäkausi</dt>
                      <dd>{ ageGroup }</dd>
                      { swimmingSkill ? <dt>Uimataito</dt> : '' }
                      { swimmingSkill ? <dd>{ swimmingSkill }</dd> : '' }
                      <dt>Lippukunta</dt>
                      <dd>{ localGroup }</dd>
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
                <Col md={ 8 }>
                  <Panel header="Läsnäolo">
                   <Presence value={ presence } />
                   <PresenceHistory value={ presenceHistory } />
                  </Panel>
                  <Panel header="Allergiat ja erityisruokavaliot">
                    { allergyNames || diet  ? '' : <p>Ei allergioita</p> }
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
            </Grid>
          </div>
        );
      } else {
        return (
          <div></div>
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
