import React from 'react';

export function getUserManagementPage() {
  class UserManagementPage extends React.Component {
    render() {
      return (
        <h1>Käyttäjät</h1>
      );
    }
  }

  return UserManagementPage;
}
