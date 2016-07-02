import React from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment';
import { getPresenceLabel } from './Presence';

moment.locale('fi');

export class PresenceHistory extends React.Component {

  render() {

    return (
      <Table responsive className="noborder">
        <thead>
          <tr>
            <th>Ajankohta</th>
            <th>Tila</th>
            <th>Merkitsijä</th>
          </tr>
        </thead>
        <tbody>
          { this.props.value.map( row => <tr><td>{ moment(row.timestamp).format('L [klo] LT') }</td><td>{ getPresenceLabel(row.presence) }</td><td>–</td></tr> ) }
        </tbody>
      </Table>
    );
  }
}

PresenceHistory.propTypes = {
  value: React.PropTypes.array.isRequired,
};
