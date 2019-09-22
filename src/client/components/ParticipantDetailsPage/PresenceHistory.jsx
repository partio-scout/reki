import React from 'react';
import moment from 'moment';
import { getPresenceLabel } from '../../components';

  // TODO Show name of author once backend is able to return it
export function PresenceHistory(props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Ajankohta</th>
          <th>Tapahtuma</th>
          <th>Merkinnän tekijä</th>
        </tr>
      </thead>
      <tbody>
        { props.value.map(row => {
          const time = moment(row.timestamp);
          return (
            <tr key={ time.toString() }>
              <td>{ time.format('L [klo] LT') }</td>
              <td>{ getPresenceLabel(row.presence) }</td>
              <td>Käyttäjä #{ row.authorId }</td>
                </tr>
          );
        } ) }
      </tbody>
    </table>
  );
}
