import React from 'react';

export function getRegistryUserTable() {
  class RegistryUserTable extends React.Component {
    render() {
      return (
        <table striped>
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
          </tbody>
        </table>
      );
    }
  }

  return RegistryUserTable;
}
