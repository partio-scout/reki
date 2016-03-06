import React from 'react';
import { getRegistryUserTable } from './RegistryUserTable';

const RegistryUserTable = getRegistryUserTable();

export function getUserManagementPage() {
  class UserManagementPage extends React.Component {
    render() {
      return (
        <div>
          <h1>Käyttäjät</h1>
          <RegistryUserTable/>
        </div>
      );
    }
  }

  return UserManagementPage;
}
