import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Presence, Icon } from '..';

const LinkCell = ({ href, title, children }) => (
  <td>
    <a href={ href } title={ title }>
      { children }
    </a>
  </td>
);

const NoInfo = () => <small style={ { color: 'grey' } }>ei tietoa</small>;

function getNullableFormatter(finalFormatter = (x => x)) {
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
        return <td key={ column.type + column.property } />;
      }

      return availableDates.map(row => (
        <td key={ column.type + column.property + row.date }>{
          _.find(participant.dates, { date: row.date })
            ? moment(row.date).format('D.M.')
            : <Icon type="remove" />
        }</td>
      ));
    }
    case 'presence':
      return <td key={ column.type + column.property }><Presence value={ participant[column.property] } /></td>;
    case 'profileLink':
      return <LinkCell key={ column.type + column.property } href={ `participants/${participant.participantId}` } title={ participant[column.property] }>{ participant[column.property] }</LinkCell>;
    case 'date':
      return <td key={ column.type + column.property }>{ formatDate(participant[column.property]) }</td>;
    case 'iconWithTooltip':
      return participant[column.property]
        ? (
          <td key={ column.type + column.property } title={ participant[column.property] }>
            <Icon type={ column.icon } />
          </td>
        )
        : <td key={ column.type + column.property } />
      ;
    case 'boolean':
      return <td key={ column.type + column.property }><NullableBoolean value={ participant[column.property] } true={ column.true || 'kyllä' } false={ column.false || 'ei' } /></td>;
    case 'text':
    default:
      return <td key={ column.type + column.property }>{ formatNullableString(participant[column.property]) }</td>;
  }
};

export function ParticipantRow(props) {
  const checkboxCallback = props.checkboxCallback;
  const isChecked = props.isChecked;

  const onChange = event => {
    checkboxCallback(event.target.checked, props.participant.participantId);
  };

  const checked = isChecked(props.participant.participantId);

  return (
    <tr>
      <td><small style={ { color: 'grey' } }>{ 1 + props.index + props.offset }</small></td>
      <td><input type="checkbox" onChange={ onChange } checked={ checked }  /></td>
        {
          props.columns.flatMap(column => mapCell({ participant: props.participant, column, availableDates: props.availableDates }))
        }
    </tr>
  );
}
