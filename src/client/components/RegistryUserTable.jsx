import React from 'react';
import { Table } from 'react-bootstrap';

const RegistryUserRow = props => {
  const {
    name,
    memberNumber,
    phone,
  } = props.registryUser;

  return(
    <tr>
    <td>{ name }</td>
    <td>{ memberNumber }</td>
    <td>{ phone }</td>
  </tr>
  );
};

RegistryUserRow.propTypes = {
  registryUser: React.PropTypes.object,
};

export function getRegistryUserTable() {
  class RegistryUserTable extends React.Component {
    render() {
      return (
        <Table striped bordered condensed>
          <thead>
            <tr>
              <th>Nimi</th>
              <th>Jäsennumero</th>
              <th>Puhelinnumero</th>
            </tr>
          </thead>
          <tbody>
            { this.props.registryUsers.map(registryUser => <RegistryUserRow key={ registryUser.id } registryUser={ registryUser } />) }
          </tbody>
        </Table>
      );
    }
  }

  RegistryUserTable.propTypes = {
    registryUsers: React.PropTypes.array,
  };

  return RegistryUserTable;
}
