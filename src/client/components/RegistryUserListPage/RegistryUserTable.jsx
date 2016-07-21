import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { Presence } from '../../components';

const RegistryUserRow = props => {
  const {
    registryUser,
    onBlock,
    onUnblock,
  } = props;

  const {
    firstName,
    lastName,
    memberNumber,
    phoneNumber,
    email,
    status,
    presence,
  } = registryUser;

  const blockStatusToggleButton = status === 'blocked'
    ? <Button onClick={ onUnblock } bsStyle="danger">Salli sisäänkirjautuminen</Button>
    : <Button onClick={ onBlock } bsStyle="danger">Estä sisäänkirjautuminen</Button>;

  return (
    <tr>
      <td><Presence value={ presence } /></td>
      <td>{ `${firstName} ${lastName}` }</td>
      <td>{ memberNumber }</td>
      <td>{ phoneNumber }</td>
      <td>{ email }</td>
      <td>{ blockStatusToggleButton }</td>
    </tr>
  );
};

RegistryUserRow.propTypes = {
  registryUser: React.PropTypes.object,
  onBlock: React.PropTypes.func,
  onUnblock: React.PropTypes.func,
};

export function RegistryUserTable(props) {
  const {
    registryUsers,
    onBlock,
    onUnblock,
  } = props;

  return (
    <Table striped responsive condensed>
      <thead>
        <tr>
          <th>Tila</th>
          <th>Nimi</th>
          <th>Jäsennumero</th>
          <th>Puhelinnumero</th>
          <th>Sähköposti</th>
          <th>Lukittu?</th>
        </tr>
      </thead>
      <tbody>
        { registryUsers.map(registryUser => (
          <RegistryUserRow
            key={ registryUser.id }
            registryUser={ registryUser }
            onBlock={ function() { onBlock(registryUser.id); } }
            onUnblock={ function() { onUnblock(registryUser.id); } }
          />
          ))
        }
      </tbody>
    </Table>
  );
}

RegistryUserTable.propTypes = {
  registryUsers: React.PropTypes.array,
  onBlock: React.PropTypes.func,
  onUnblock: React.PropTypes.func,
};
