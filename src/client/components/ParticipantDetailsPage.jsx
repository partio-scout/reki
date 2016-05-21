import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';

export function getParticipantDetailsPage(participantStore, participantActions) {
  class ParticipantDetailsPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = participantStore.getState();
    }

    componentWillMount() {
      participantActions.fetchParticipantById(this.props.params.id);
    }

    componentDidMount() {
      participantStore.listen(this.onChange.bind(this));
    }

    componentWillUnMount() {
      participantStore.unlisten(this.onChange.bind(this));
    }

    onChange(state) {
      this.setState(state);
    }

    render() {
      const inCampStatus = () => {
        if (!this.state.participantDetails) {
          return '';
        }
        
        const inCamp = this.state.participantDetails.inCamp;
        
        if (inCamp == 0) {
          return 'Ei ole leirissä';
        } else if (inCamp == 1) {
          return 'Poistunut leiristä väliaikaisesti';
        } else if (inCamp == 2) {
          return 'Leirissä';
        } else {
          return 'Tuntematon arvo';
        }
      }
      
      let participantName = '';
      let nonScout = '';
      let dateOfBirth = '';
      let participantPhone = '';
      let homeCity = '';
      let email = '';
      let inCampCurrentState = '';
      
      if (this.state.participantDetails) {
        participantName = `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}`;
        nonScout = this.state.participantDetails.nonScout ? 'EVP' : 'Partiolainen';
        const dateOfBirthString = this.state.participantDetails.dateOfBirth;
        const [year, month, time] = dateOfBirthString && dateOfBirthString.split('-') || ['','',''];
        const day = time.substring(0,2);
        dateOfBirth = dateOfBirthString && `${day}.${month}.${year}`;
        inCampCurrentState = inCampStatus();

        participantPhone = this.state.participantDetails.phoneNumber || '-';
        homeCity = this.state.participantDetails.homeCity || '-';
        email = this.state.participantDetails.email || '-';
      }

      return (
        <div>
          <Grid>
            <Row>
              <Col>
                <h2><b>{ participantName }</b></h2>
                <p className="text-muted">{ nonScout }</p>
                <p> <b> Syntymäaika: </b> { dateOfBirth }</p>
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
                <Col md={ 3 }>
                  <Panel header="Läsnäolo">
                    <p>{ inCampCurrentState }</p>
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
