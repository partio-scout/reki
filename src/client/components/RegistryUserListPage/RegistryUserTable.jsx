import React from 'react';
import { Table, Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
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
    : <Button onClick={ onBlock } bsStyle="success">Estä sisäänkirjautuminen</Button>;

  const deleteUserButton = (
    <LinkContainer to={ `/admin/users/${registryUser.id}/delete` }>
      <Button bsStyle="danger"><Glyphicon glyph="remove"/></Button>
    </LinkContainer>
  );
  const editUserButton = (
    <LinkContainer to={ `/admin/users/${registryUser.id}/edit` }>
      <Button bsStyle="primary"><Glyphicon glyph="pencil"/></Button>
    </LinkContainer>
  );

  return (
    <tr>
      <td><Presence value={ presence } /></td>
      <td>{ `${firstName} ${lastName}` }</td>
      <td>{ memberNumber }</td>
      <td>{ phoneNumber }</td>
      <td>{ email }</td>
      <td>{ blockStatusToggleButton }</td>
      <td>{ editUserButton }</td>
      <td>{ deleteUserButton }</td>
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
          <th>Muokkaa</th>
          <th>Poista</th>
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
