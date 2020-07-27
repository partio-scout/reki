import React, { useState, useEffect, useCallback } from 'react'
import * as Rt from 'runtypes'
import { defaultOpts } from '../../fetch'
import { useErrorContext } from '../../errors'
import { AuditLogEntry } from '../../model'
import { AuditLogTable } from './AuditLogTable'

const AuditLogEntryArray = Rt.Array(AuditLogEntry).asReadonly()

export const AuditLogPage: React.FC = () => {
  const { showError } = useErrorContext()
  const [logEntries, setLogEntries] = useState<readonly AuditLogEntry[]>([])
  const loadLogEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/audit-events', defaultOpts)
      if (!response.ok) {
        showError('Lokitietojen lataaminen epäonnistui')
      } else {
        const json = AuditLogEntryArray.check(await response.json())

        setLogEntries(json)
      }
    } catch (error) {
      showError('Ladatuissa lokitiedoissa on virhe.', error)
    }
  }, [showError])

  useEffect(() => {
    loadLogEntries()
  }, [loadLogEntries])

  return (
    <main className="content-box">
      <h1>Muutosloki</h1>
      <AuditLogTable auditLogEntries={logEntries} />
    </main>
  )
}
