import React, { useState, useEffect, useCallback } from 'react';
import { RegistryUserTable } from './RegistryUserTable';
import { defaultOpts, withDefaultOpts } from '../../fetch';
import { useErrorContext } from '../../errors';

export function UserManagementPage() {
  const errorContext = useErrorContext();
  const { showError } = errorContext;
  const [registryUsers, setRegistryUsers] = useState([]);
  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/registryusers', defaultOpts);
      if (!response.ok) {
        showError(null, 'Couldn\'t fetch users');
      } else {
        setRegistryUsers(await response.json());
      }
    } catch (error) {
      showError(error);
    }
  }, [showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function blockUser(userId) {
    try {
      await fetch(`/api/registryusers/${userId}/block`, withDefaultOpts({ method: 'POST' }));
    } catch (e) {
      showError(e);
    }
    loadUsers();
  }

  async function unblockUser(userId) {
    try {
      await fetch(`/api/registryusers/${userId}/unblock`, withDefaultOpts({ method: 'POST' }));
    } catch (e) {
      showError(e);
    }
    loadUsers();
  }

  return (
    <main className="content-box">
      <h1>Käyttäjät</h1>
      <RegistryUserTable registryUsers={ registryUsers } onBlock={ blockUser } onUnblock={ unblockUser } />
    </main>
  );
}
