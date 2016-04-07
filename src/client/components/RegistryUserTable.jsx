import React from 'react';
import { Table } from 'react-bootstrap';

const RegistryUserRow = props => {
  const {
    firstName,
    lastName,
    memberNumber,
    phoneNumber,
  } = props.registryUser;

  return(
    <tr>
    <td>{ `${firstName} ${lastName}` }</td>
    <td>{ memberNumber }</td>
    <td>{ phoneNumber }</td>
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
            { this.props.registryUsers.map(registryUser => <RegistryUserRow key={ registryUser.registryUserId } registryUser={ registryUser } />) }
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
