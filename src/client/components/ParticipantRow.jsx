import React from 'react';
import { Link } from 'react-router';
import { Input } from 'react-bootstrap';
import { InCampStatus } from '../components';

class LinkCell extends React.Component {
  render() {
    return <td><Link to={ this.props.href }>{ this.props.children }</Link></td>;
  }
}

LinkCell.propTypes = {
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
      staffPosition,
      interestedInHomeHospitality,
      email,
      phoneNumber,
      ageGroup,
      localGroup,
      subCamp,
      campGroup,
      inCamp,
    } = this.props.participant;

    const href = `participants/${participantId}`;

    const checkboxCallback = this.props.checkboxCallback;
    const isChecked = this.props.isChecked;

    const onChange = function(event) {
      event.persist();
      checkboxCallback(event.target.checked, participantId);
    };

    const checked = isChecked(participantId);

    return (
      <tr>
        <td><Input type="checkbox" onChange={ onChange } checked={ checked }  /></td>
        <td><InCampStatus value={ inCamp } /></td>
        <LinkCell href={ href }>{ firstName }</LinkCell>
        <LinkCell href={ href }>{ lastName }</LinkCell>
        <td>{ formatDate(dateOfBirth) }</td>
        <td>{ formatGender(gender) }</td>
        <td>{ formatNonScout(nonScout) }</td>
        <td>{ memberNumber }</td>
        <td>{ formatNullableString(homeCity) }</td>
        <td>{ formatNullableString(staffPosition) }</td>
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
  isChecked: React.PropTypes.func,
  checkboxCallback: React.PropTypes.func,
};
