import React from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment';
import { getPresenceLabel } from '../../components';

export class PresenceHistory extends React.Component {
  // TODO Show name of author once backend is able to return it
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
          { this.props.value.map( row => <tr><td>{ moment(row.timestamp).format('L [klo] LT') }</td><td>{ getPresenceLabel(row.presence) }</td><td>Käyttäjä #{ row.authorId }</td></tr> ) }
        </tbody>
      </Table>
    );
  }
}

PresenceHistory.propTypes = {
  value: React.PropTypes.array.isRequired,
};
