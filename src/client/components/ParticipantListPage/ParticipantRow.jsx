import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router';
import { Input, Glyphicon } from 'react-bootstrap';
import { Presence } from '../index';

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

const formatNonScout = getNullableFormatter(nonScout => nonScout ? 'EVP' : 'partiolainen');
const formatNullableBoolean = getNullableFormatter(b => b ? 'kyllä' : 'ei');
const formatNullableString = getNullableFormatter();
const formatDate = dateString => {
  if (!dateString) {
    return null;
  }
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
      nonScout,
      billedDate,
      paidDate,
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
      village,
      accommodation,
      presence,
      dates,
    } = this.props.participant;

    const href = `participants/${participantId}`;

    const checkboxCallback = this.props.checkboxCallback;
    const isChecked = this.props.isChecked;

    const onChange = function(event) {
      event.persist();
      checkboxCallback(event.target.checked, participantId);
    };

    const checked = isChecked(participantId);

    const dateCell = (date, active) => <td>{ active ? moment(date).format('D.M.') : <Glyphicon glyph="remove" className="muted" /> }</td>;

    return (
      <tr>
        <td><Input type="checkbox" onChange={ onChange } checked={ checked }  /></td>
        <td><Presence value={ presence } /></td>
        <LinkCell href={ href } title={ firstName }>{ firstName }</LinkCell>
        <LinkCell href={ href } title={ lastName }>{ lastName }</LinkCell>
        <td title={ formatDate(dateOfBirth) }>{ formatDate(dateOfBirth) }</td>
        <td title={ formatNonScout(nonScout) }>{ formatNonScout(nonScout) }</td>
        <td title={ memberNumber }>{ memberNumber }</td>
        <td title={ formatDate(billedDate) || 'Ei' }>{ formatDate(billedDate) || 'Ei' }</td>
        <td title={ formatDate(paidDate) || 'Ei' }>{ formatDate(paidDate) || 'Ei' }</td>
        <td title={ formatNullableString(homeCity) }>{ formatNullableString(homeCity) }</td>
        <td title={ formatNullableString(staffPosition) }>{ formatNullableString(staffPosition) }</td>
        <td title={ formatNullableBoolean(interestedInHomeHospitality) }>{ formatNullableBoolean(interestedInHomeHospitality) }</td>
        <td title={ formatNullableString(email) }>{ formatNullableString(email) }</td>
        <td title={ formatNullableString(phoneNumber) }>{ formatNullableString(phoneNumber) }</td>
        <td title={ ageGroup }>{ ageGroup }</td>
        <td title={ formatNullableString(accommodation) }>{ formatNullableString(accommodation) }</td>
        <td title={ localGroup }>{ localGroup }</td>
        <td title={ village }>{ village }</td>
        <td title={ subCamp }>{ subCamp }</td>
        <td title={ campGroup }>{ campGroup }</td>
        {
          this.props.availableDates.map(row => dateCell(row.date, _.find(dates, { date: row.date })))
        }
      </tr>
    );
  }
}

ParticipantRow.propTypes = {
  participant: React.PropTypes.object.isRequired,
  isChecked: React.PropTypes.func,
  checkboxCallback: React.PropTypes.func,
  availableDates: React.PropTypes.array.isRequired,
};
