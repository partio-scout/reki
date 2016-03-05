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
      let inCamp = '';
      let participantName = '';
      if (this.state.participantDetails) {
        participantName = `${this.state.participantDetails.firstName} ${this.state.participantDetails.lastName}`;

        if (this.state.participantDetails.inCamp == 0) {
          inCamp =	'Ei ole leirissä';
        } else if (this.state.participantDetails.inCamp == 1) {
          inCamp =	'Poistunut leiristä väliaikaisesti';
        } else if (this.state.participantDetails.inCamp == 2) {
          inCamp = 'Leirissä';
        } else {
          inCamp = 'Tuntematon arvo';
        }
      }

      return (
        <div>
          <Grid>
            <Row>
              <Col>
                <h2><b>{ participantName }</b></h2>
                <p>{ inCamp }</p>
              </Col>
            </Row>
          </Grid>
        </div>
			);
		}
  }

  ParticipantInCampPage.propTypes = {
    params: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
    }).isRequired,
  };

  return ParticipantInCampPage;
}
