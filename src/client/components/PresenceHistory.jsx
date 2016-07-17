import React from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment';
import { getPresenceLabel } from './Presence';

export class PresenceHistory extends React.Component {
  render() {
    return (
      <Table responsive className="noborder">
        <thead>
          <tr>
            <th>Ajankohta</th>
            <th>Tapahtuma</th>
            <th>Merkinnän tekijä</th>
          </tr>
        </thead>
        <tbody>
          { this.props.value.map( row => <tr><td>{ moment(row.timestamp).format('L [klo] LT') }</td><td>{ getPresenceLabel(row.presence) }</td><td>{ row.author.firstName } { row.author.lastName }</td></tr> ) }
        </tbody>
      </Table>
    );
  }
}

PresenceHistory.propTypes = {
  value: React.PropTypes.array.isRequired,
};
