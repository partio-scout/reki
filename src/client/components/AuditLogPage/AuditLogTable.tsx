import React from 'react'
import moment from 'moment'
import { Table } from '../Table'
import { AuditLogEntry } from '../../model'

type AuditLogTableRowProps = Readonly<{
  auditLogEntry: AuditLogEntry
}>

const AuditLogTableRow: React.FC<AuditLogTableRowProps> = (props) => {
  const { auditLogEntry } = props
  const {
    id,
    user,
    eventType,
    model,
    modelId,
    clientData,
    meta,
    changes,
  } = auditLogEntry
  const { humanReadableIpAddress } = clientData
  const time = moment(auditLogEntry.timestamp)

  return (
    <tr>
      <td>{id}</td>
      <td>
        {model}
        {modelId ? ` #${modelId}` : ''}
      </td>
      <td>{eventType}</td>
      <td>
        {user ? (
          <span>
            {user.firstName} {user.lastName}
          </span>
        ) : (
          'Tuntematon käyttäjä'
        )}{' '}
        (#{user.id})
      </td>
      <td>{time.format('L [klo] LT')}</td>
      <td>{humanReadableIpAddress}</td>
      <td>{JSON.stringify(meta)}</td>
      <td>{JSON.stringify(changes)}</td>
    </tr>
  )
}

type AuditLogTableProps = Readonly<{
  auditLogEntries: readonly AuditLogEntry[]
}>

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  auditLogEntries,
}) => (
  <Table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Kohde</th>
        <th>Tapahtuma</th>
        <th>Käyttäjä</th>
        <th>Ajankohta</th>
        <th>IP-osoite</th>
        <th>Meta</th>
        <th>Muutokset</th>
      </tr>
    </thead>
    <tbody>
      {auditLogEntries.map((auditLogEntry) => (
        <AuditLogTableRow
          key={auditLogEntry.id}
          auditLogEntry={auditLogEntry}
        />
      ))}
    </tbody>
  </Table>
)
