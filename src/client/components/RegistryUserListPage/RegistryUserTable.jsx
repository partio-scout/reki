import React from 'react';
import { Presence } from '../../components';
import { Table } from '../Table';

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
    presence,
    blocked,
  } = registryUser;

  const blockStatusToggleButton = blocked
    ? <button onClick={ onUnblock }>Salli sisäänkirjautuminen</button>
    : <button onClick={ onBlock }>Estä sisäänkirjautuminen</button>;

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

export function RegistryUserTable(props) {
  const {
    registryUsers,
    onBlock,
    onUnblock,
  } = props;

  return (
    <Table>
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
