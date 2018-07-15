import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router';
import { Input, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Presence } from '../index';
import { TdWithTitle } from '../../components';

class LinkCell extends React.Component {
  render() {
    return <td><Link to={ this.props.href } title={ this.props.title }>{ this.props.children }</Link></td>;
  }
}

LinkCell.propTypes = {
  href: React.PropTypes.string,
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
      memberNumber,
      phoneNumber,
      ageGroup,
      localGroup,
      subCamp,
      campGroup,
      presence,
      dates,
      campOfficeNotes,
      editableInfo,
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

    return (
      <tr>
        <td><small style={ { color: 'grey' } }>{ 1 + this.props.index + this.props.offset }</small></td>
        <td><Input type="checkbox" onChange={ onChange } checked={ checked }  /></td>
        <td><Presence value={ presence } /></td>
        <LinkCell href={ href } title={ firstName }>{ firstName }</LinkCell>
        <LinkCell href={ href } title={ lastName }>{ lastName }</LinkCell>
        <TdWithTitle value={ ageGroup } />
        <TdWithTitle value={ formatDate(dateOfBirth) } />
        <TdWithTitle value={ memberNumber } />
        <td>{ notes }</td>
        <td>{ info }</td>
        <TdWithTitle value={ formatNonScout(nonScout) } />
        <TdWithTitle value={ formatNullableString(phoneNumber) } />
        <TdWithTitle value={ localGroup } />
        <TdWithTitle value={ subCamp } />
        <TdWithTitle value={ campGroup } />
        {
          this.props.availableDates.map(row => dateCell(row.date, _.find(dates, { date: row.date })))
        }
      </tr>
    );
  }
}

ParticipantRow.propTypes = {
  participant: React.PropTypes.object.isRequired,
  index: React.PropTypes.number,
  offset: React.PropTypes.number,
  isChecked: React.PropTypes.func,
  checkboxCallback: React.PropTypes.func,
  availableDates: React.PropTypes.array.isRequired,
};
