import React from 'react';
import { Link } from 'react-router';

class LinkCell extends React.Component {
  render() {
    return <td><Link to={ this.props.href } title={ this.props.title }>{ this.props.children }</Link></td>;
  }
}

LinkCell.propTypes = {
  title: React.PropTypes.string,
  href: React.PropTypes.string,
  children: React.PropTypes.node,
};

function getNullableFormatter(finalFormatter) {
  finalFormatter = finalFormatter || (x => x);
  return value => {
    if (value === null || value === undefined) {
      return <small style={ { color: 'grey' } }>ei tietoa</small>;
    }
    return finalFormatter(value);
  };
}

const formatGender = getNullableFormatter(gender => gender ? 'mies' : 'nainen');
const formatSwimmingSkill = getNullableFormatter(swimmingSkill => swimmingSkill ? 'yli 200m' : 'alle 200m');
const formatNonScout = getNullableFormatter(nonScout => nonScout ? 'EVP' : 'partiolainen');
const formatNullableBoolean = getNullableFormatter(b => b ? 'kyllä' : 'ei');
const formatNullableString = getNullableFormatter();
const formatDate = dateString => {
  const date = new Date(dateString);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export class ParticipantRow extends React.Component {
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
      ageGroup,
      localGroup,
      subCamp,
      campGroup,
    } = this.props.participant;

    const href = `participants/${participantId}`;

    const fullName = `${firstName} ${lastName}`;

    return (
      <tr>
        <LinkCell href={ href } title={ fullName }>{ firstName }</LinkCell>
        <LinkCell href={ href } title={ fullName }>{ lastName }</LinkCell>
        <td>{ formatDate(dateOfBirth) }</td>
        <td>{ formatGender(gender) }</td>
        <td>{ formatNonScout(nonScout) }</td>
        <td>{ memberNumber }</td>
        <td>{ formatNullableString(homeCity) }</td>
        <td>{ formatSwimmingSkill(swimmingSkill) }</td>
        <td>{ formatNullableBoolean(interestedInHomeHospitality) }</td>
        <td>{ formatNullableString(email) }</td>
        <td>{ formatNullableString(phoneNumber) }</td>
        <td>{ ageGroup }</td>
        <td>{ localGroup }</td>
        <td>{ subCamp }</td>
        <td>{ campGroup }</td>
      </tr>
    );
  }
}

ParticipantRow.propTypes = {
  participant: React.PropTypes.object.isRequired,
};
