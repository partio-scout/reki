import React from 'react'
import moment from 'moment'
import { getPresenceLabel } from '../../components'
import { PresenceEntry } from '../../model'

export type PresenceHistoryProps = Readonly<{
  value: readonly PresenceEntry[]
}>

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
            <td>
              {row.author
                ? `${row.author.firstName} ${row.author.lastName}`
                : 'Tuntematon käyttäjä'}
              (#{row.authorId})
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)
