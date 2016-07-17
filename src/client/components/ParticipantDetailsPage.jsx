import React from 'react';
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
      let participantName = '';
      let nonScout = '';
      let dateOfBirth = '';
      let participantPhone = '';
      let homeCity = '';
      let email = '';
      let presence = '';
      let presenceHistory = '';

      if (this.state.participantDetails) {
        participantName = `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}`;
        nonScout = this.state.participantDetails.nonScout ? 'EVP' : 'Partiolainen';
        const dateOfBirthString = this.state.participantDetails.dateOfBirth;
        const [year, month, time] = dateOfBirthString && dateOfBirthString.split('-') || ['','',''];
        const day = time.substring(0,2);
        dateOfBirth = dateOfBirthString && `${day}.${month}.${year}`;
        presence = this.state.participantDetails.presence;
        presenceHistory = this.state.participantDetails.presenceHistory || [];

        participantPhone = this.state.participantDetails.phoneNumber || '-';
        homeCity = this.state.participantDetails.homeCity || '-';
        email = this.state.participantDetails.email || '-';
      }

      return (
        <div>
          <Grid>
            <Row>
              <Col md={ 12 }>
                <h2><b>{ participantName }</b></h2>
                <p className="text-muted">{ nonScout }</p>
                <p><b>Syntymäaika: </b> { dateOfBirth }</p>
              </Col>
            </Row>
            <Row>
              <Col md={ 3 }>
                <Panel header="Yhteystiedot">
                  <p className="text-muted"> Puhelin </p>
                  <p >{ participantPhone }</p>
                  <p className="text-muted"> Kotikaupunki</p>
                  <p >{ homeCity }</p>
                  <p className="text-muted"> Sähköposti</p>
                  <p >{ email }</p>
                </Panel>
              </Col>
                <Col md={ 6 }>
                  <Panel header="Läsnäolo">
                    <Presence value={ presence } />
                    <PresenceHistory value={ presenceHistory } />
                  </Panel>
                </Col>
            </Row>
            <Row>
              <Col md={ 9 }>
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
    }
  }

  ParticipantDetailsPage.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return ParticipantDetailsPage;
}
