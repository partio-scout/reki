import React from 'react'
import moment from 'moment'
import { getPresenceLabel } from '../../components'
import { PresenceEntry } from '../../model'

export type PresenceHistoryProps = Readonly<{
  value: readonly PresenceEntry[]
}>

// TODO Show name of author once backend is able to return it
export const PresenceHistory: React.FC<PresenceHistoryProps> = (props) => (
  <table>
    <thead>
      <tr>
        <th>Ajankohta</th>
        <th>Tapahtuma</th>
        <th>Merkinnän tekijä</th>
      </tr>
    </thead>
    <tbody>
      {props.value.map((row) => {
        const time = moment(row.timestamp)
        return (
          <tr key={time.toString()}>
            <td>{time.format('L [klo] LT')}</td>
            <td>{getPresenceLabel(row.presence)}</td>
            <td>Käyttäjä #{row.authorId}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
)
