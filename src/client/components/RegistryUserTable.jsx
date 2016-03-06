import React from 'react';
import { Table } from 'react-bootstrap';

export function getRegistryUserTable() {
  class RegistryUserTable extends React.Component {
    render() {
      return (
        <Table striped bordered condensed>
          <thead>
          <tr>
            <th>
              Käyttäjän nimi
            </th>
            <th>
              Jäsennumero
            </th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                { 'Gandalf' }
              </td>
              <td>
                { '1234567' }
              </td>
            </tr>
            <tr>
              <td>
                { 'Mordor' }
              </td>
              <td>
                { '1234567' }
              </td>
            </tr>
          </tbody>
        </Table>
      );
    }
  }

  return RegistryUserTable;
}
