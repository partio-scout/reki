import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Link from 'redux-first-router-link';
import { Input, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Presence } from '../index';
import { TdWithTitle } from '../../components';
import * as navigationActions from '../../navigation/actions';

class LinkCell extends React.Component {
  render() {
    return <td><Link to={ this.props.to } title={ this.props.title }>{ this.props.children }</Link></td>;
  }
}

LinkCell.propTypes = {
  to: React.PropTypes.object,
  children: React.PropTypes.node,
  title: React.PropTypes.string,
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
      campOfficeNotes,
      editableInfo,
    } = this.props.participant;

    const checkboxCallback = this.props.checkboxCallback;
    const isChecked = this.props.isChecked;

    const onChange = function(event) {
      checkboxCallback(event.target.checked, participantId);
    };

    const DateCell = ({ date, active }) => <td>{ active ? moment(date).format('D.M.') : <Glyphicon glyph="remove" className="muted" /> }</td>;

    const tooltipForNotes = (
      <Tooltip>{ campOfficeNotes }</Tooltip>
    );
    const notes = campOfficeNotes ? (
      <OverlayTrigger placement="top" overlay={ tooltipForNotes }>
        <Glyphicon glyph="info-sign" />
      </OverlayTrigger>
    ) : '';

    const tooltipForInfo = (
      <Tooltip>{ editableInfo }</Tooltip>
    );
    const info = editableInfo ? (
      <OverlayTrigger placement="top" overlay={ tooltipForInfo }>
        <Glyphicon glyph="comment" />
      </OverlayTrigger>
    ) : '';

    const to = navigationActions.navigateToParticipantDetails({ participantId });

    return (
      <tr>
        <td><small style={ { color: 'grey' } }>{ 1 + this.props.index + this.props.offset }</small></td>
        <td><Input type="checkbox" onChange={ onChange } checked={ isChecked }  /></td>
        <td><Presence value={ presence } /></td>
        <LinkCell to={ to } title={ firstName }>{ firstName }</LinkCell>
        <LinkCell to={ to } title={ lastName }>{ lastName }</LinkCell>
        <TdWithTitle value={ formatDate(dateOfBirth) } />
        <TdWithTitle value={ formatNullableString(staffPosition) } />
        <TdWithTitle value={ formatDate(billedDate) || 'Ei' } />
        <TdWithTitle value={ formatDate(paidDate) || 'Ei' } />
        <TdWithTitle value={ memberNumber } />
        <td>{ notes }</td>
        <td>{ info }</td>
        <TdWithTitle value={ formatNonScout(nonScout) } />
        <TdWithTitle value={ formatNullableString(homeCity) } />
        <TdWithTitle value={ formatNullableBoolean(interestedInHomeHospitality) } />
        <TdWithTitle value={ formatNullableString(email) } />
        <TdWithTitle value={ formatNullableString(phoneNumber) } />
        <TdWithTitle value={ ageGroup } />
        <TdWithTitle value={ formatNullableString(accommodation) } />
        <TdWithTitle value={ localGroup } />
        <TdWithTitle value={ village } />
        <TdWithTitle value={ subCamp } />
        <TdWithTitle value={ campGroup } />
        {
          this.props.availableDates.map(row => <DateCell key={ row.date } date={ row.date } active={ _.find(dates, { date: row.date }) } />)
        }
      </tr>
    );
  }
}

ParticipantRow.propTypes = {
  participant: React.PropTypes.object.isRequired,
  index: React.PropTypes.number,
  offset: React.PropTypes.number,
  isChecked: React.PropTypes.bool,
  checkboxCallback: React.PropTypes.func,
  availableDates: React.PropTypes.array.isRequired,
};
