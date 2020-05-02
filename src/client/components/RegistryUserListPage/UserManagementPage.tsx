import React, { useState, useEffect, useCallback } from 'react'
import * as Rt from 'runtypes'
import { RegistryUserTable } from './RegistryUserTable'
import { defaultOpts, withDefaultOpts } from '../../fetch'
import { useErrorContext } from '../../errors'
import { RegistryUser } from '../../model'

const RegistryUserArray = Rt.Array(RegistryUser).asReadonly()

export const UserManagementPage: React.FC = () => {
  const { showError } = useErrorContext()
  const [registryUsers, setRegistryUsers] = useState<readonly RegistryUser[]>(
    [],
  )
  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/registryusers', defaultOpts)
      if (!response.ok) {
        showError("Couldn't fetch users")
      } else {
        const json = RegistryUserArray.check(await response.json())

        setRegistryUsers(json)
      }
    } catch (error) {
      showError('Ladatuissa käyttäjätiedoissa on virhe.', error)
    }
  }, [showError])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function blockUser(userId: RegistryUser['id']): Promise<void> {
    try {
      await fetch(
        `/api/registryusers/${userId}/block`,
        withDefaultOpts({ method: 'POST' }),
      )
    } catch (e) {
      showError(e)
    }
    loadUsers()
  }

  async function unblockUser(userId: RegistryUser['id']): Promise<void> {
    try {
      await fetch(
        `/api/registryusers/${userId}/unblock`,
        withDefaultOpts({ method: 'POST' }),
      )
    } catch (e) {
      showError(e)
    }
    loadUsers()
  }

  return (
    <main className="content-box">
      <h1>Käyttäjät</h1>
      <RegistryUserTable
        registryUsers={registryUsers}
        onBlock={blockUser}
        onUnblock={unblockUser}
      />
    </main>
  )
}
