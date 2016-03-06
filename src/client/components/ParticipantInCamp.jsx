import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
export function getParticipantInCampPage(participantStore, participantActions) {
  class ParticipantInCampPage extends React.Component {
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
  return (
        <div>
          <Grid>
            <Row>
              <Col>
                <h2><b>{ this.formatParticipantName() }</b></h2>
                <p>{ this.inCampStatus() }</p>
              </Col>
            </Row>
          </Grid>
        </div>
			);
		}

    inCampStatus() {
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

    formatParticipantName() {
      return this.state.participantDetails && `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}` || '';
    }
  }
  ParticipantInCampPage.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return ParticipantInCampPage;
}
