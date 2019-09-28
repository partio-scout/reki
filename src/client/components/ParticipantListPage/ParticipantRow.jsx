import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Input, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Presence } from '../index';
import { TdWithTitle } from '../../components';

class LinkCell extends React.Component {
  render() {
    return <td><a href={ this.props.href } title={ this.props.title }>{ this.props.children }</a></td>;
  }
}

LinkCell.propTypes = {
  href: React.PropTypes.string,
  children: React.PropTypes.node,
  title: React.PropTypes.string,
};

const NoInfo = () => <small style={ { color: 'grey' } }>ei tietoa</small>;

function getNullableFormatter(finalFormatter) {
  finalFormatter = finalFormatter || (x => x);
  return value => {
    if (value === null || value === undefined) {
      return <NoInfo />;
    }
    return finalFormatter(value);
  };
}

const NullableBoolean = props => {
  if (props.value === null || props.value === undefined) {
    return <NoInfo />;
  }
  return <span>{ props.value ? props.true : props.false }</span>;
};

const formatNullableString = getNullableFormatter();
const formatDate = dateString => {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const mapCell = ({ participant, column, availableDates }) => {
  switch (column.type) {
    case 'availableDates': {
      if (availableDates.length === 0) {
        return <td />;
      }

      return availableDates.map(row => (
        <td>{
          _.find(participant.dates, { date: row.date })
            ? moment(row.date).format('D.M.')
            : <Glyphicon glyph="remove" className="muted" />
        }</td>
      ));
    }
    case 'presence':
      return <td><Presence value={ participant[column.property] } /></td>;
    case 'profileLink':
      return <LinkCell href={ `participants/${participant.participantId}` } title={ participant[column.property] }>{ participant[column.property] }</LinkCell>;
    case 'date':
      return <TdWithTitle value={ formatDate(participant[column.property]) } />;
    case 'iconWithTooltip':
      return participant[column.property]
        ? (
          <td>
            <OverlayTrigger placement="top" overlay={ <Tooltip>{ participant[column.property] }</Tooltip> }>
              <Glyphicon glyph={ column.icon } />
            </OverlayTrigger>
          </td>
        )
        : <td />
      ;
    case 'boolean':
      return <TdWithTitle value={ <NullableBoolean value={ participant[column.property] } true={ column.true || 'kyllä' } false={ column.false || 'ei' } /> } />;
    case 'text':
    default:
      return <TdWithTitle value={ formatNullableString(participant[column.property]) } />;
  }
};

export class ParticipantRow extends React.Component {
  render() {
    const checkboxCallback = this.props.checkboxCallback;
    const isChecked = this.props.isChecked;

    const onChange = event => {
      checkboxCallback(event.target.checked, this.props.participant.participantId);
    };

    const checked = isChecked(this.props.participant.participantId);

    return (
      <tr>
        <td><small style={ { color: 'grey' } }>{ 1 + this.props.index + this.props.offset }</small></td>
        <td><Input type="checkbox" onChange={ onChange } checked={ checked }  /></td>
          {
            this.props.columns.flatMap(column => mapCell({ participant: this.props.participant, column, availableDates: this.props.availableDates }))
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
