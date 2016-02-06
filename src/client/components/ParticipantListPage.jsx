import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

class LinkCell extends React.Component {
  render() {
    return <td><Link to={ this.props.href }>{ this.props.children }</Link></td>;
  }
}

LinkCell.propTypes = {
  href: React.PropTypes.string,
  children: React.PropTypes.node,
};

class ParticipantRow extends React.Component {
  render() {
    const {
      participantId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nonScout,
      memberNumber,
      homeCity,
      swimmingSkill,
      interestedInHomeHospitality,
      email,
      phoneNumber,
    } = this.props.participant;

    function getNullableFormatter(finalFormatter) {
      finalFormatter = finalFormatter || (x => x);
      return value => {
        if (value === null || value === undefined) {
          return <small style={ { color: 'grey' } }>ei tietoa</small>;
        }
        return finalFormatter(value);
      };
    }

    const formatGender = getNullableFormatter(gender => gender ? 'nainen' : 'mies');
    const formatSwimmingSkill = getNullableFormatter(swimmingSkill => swimmingSkill ? 'yli 200m' : 'alle 200m');
    const formatNonScout = getNullableFormatter(nonScout => nonScout ? 'EVP' : 'partiolainen');
    const formatNullableBoolean = getNullableFormatter(b => b ? 'kyllä' : 'ei');
    const formatNullableString = getNullableFormatter();
    const formatDate = (x => x);

    const href = `participants/${participantId}`;

    return (
      <tr>
        <LinkCell href={ href }>{ firstName }</LinkCell>
        <LinkCell href={ href }>{ lastName }</LinkCell>
        <td>{ formatDate(dateOfBirth) }</td>
        <td>{ formatGender(gender) }</td>
        <td>{ formatNonScout(nonScout) }</td>
        <td>{ memberNumber }</td>
        <td>{ formatNullableString(homeCity) }</td>
        <td>{ formatSwimmingSkill(swimmingSkill) }</td>
        <td>{ formatNullableBoolean(interestedInHomeHospitality) }</td>
        <td>{ formatNullableString(email) }</td>
        <td>{ formatNullableString(phoneNumber) }</td>
      </tr>
    );
  }
}

ParticipantRow.propTypes = {
  participant: React.PropTypes.object.isRequired,
};

export function getParticipantListPage(participantStore, participantActions) {
  class ParticipantListPage extends React.Component {
    constructor(props) {
      super(props);

      this.state = participantStore.getState();
    }

    componentDidMount() {
      participantStore.listen(this.onParticipantStoreChange.bind(this));
      participantActions.loadParticipantList(this.state.participantsOffset, 20);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onParticipantStoreChange.bind(this));
    }

    onParticipantStoreChange(state) {
      this.setState(state);
    }

    render() {
      return (
        <div>
          <h1>Leiriläiset</h1>
          <Table striped>
            <thead>
              <tr>
                <th>Etunimi</th>
                <th>Sukunimi</th>
                <th>Syntymäpäivä</th>
                <th>Sukupuoli</th>
                <th>Onko partiolainen?</th>
                <th>Jäsennumero</th>
                <th>Kotikaupunki</th>
                <th>Uimataito</th>
                <th>Home hospitality</th>
                <th>Sähköposti</th>
                <th>Puhelinnumero</th>
              </tr>
            </thead>
            <tbody>
              { this.state.participants.map(participant => <ParticipantRow key={ participant.participantId } participant={ participant } />) }
            </tbody>
          </Table>
        </div>
      );
    }
  }

  return ParticipantListPage;
}
