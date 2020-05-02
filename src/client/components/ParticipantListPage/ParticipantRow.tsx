import React, { ReactNode } from 'react'
import moment from 'moment'
import _ from 'lodash'
import { Presence, Icon } from '..'
import { ParticipantListColumn } from './ParticipantListPage'
import { ParticipantOverview, AvailableDates } from '../../model'

const LinkCell: React.FC<{ href: string; title: string }> = ({
  href,
  title,
  children,
}) => (
  <td>
    <a href={href} title={title}>
      {children}
    </a>
  </td>
)

const NoInfo: React.FC = () => (
  <small style={{ color: 'grey' }}>ei tietoa</small>
)

const getNullableFormatter = (
  //: ((value: any) => React.ReactNode) => (value: any): React.ReactNode =
  finalFormatter: (value: any) => ReactNode = (x) => x,
) => (value: any): ReactNode => {
  if (value === null || value === undefined) {
    return <NoInfo />
  }
  return finalFormatter(value)
}

const NullableBoolean: React.FC<{
  value: boolean | null | undefined
  true: ReactNode
  false: ReactNode
}> = (props) => {
  if (props.value === null || props.value === undefined) {
    return <NoInfo />
  }
  return <span>{props.value ? props.true : props.false}</span>
}

const formatNullableString = getNullableFormatter()
const formatDate = (dateString: string): string | null => {
  if (!dateString) {
    return null
  }
  const date = new Date(dateString)
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

const CellContent: React.FC<{
  participant: ParticipantOverview
  column: ParticipantListColumn
  availableDates: readonly { date: string }[]
}> = ({ participant, column, availableDates }) => {
  switch (column.type) {
    case 'availableDates': {
      if (availableDates.length === 0) {
        return <td key={column.type} />
      }

      return (
        <>
          {availableDates.map((row) => (
            <td key={column.type + row.date}>
              {_.find(participant.dates, { date: row.date }) ? (
                moment(row.date).format('D.M.')
              ) : (
                <Icon type="remove" />
              )}
            </td>
          ))}
        </>
      )
    }
    case 'presence':
      return (
        <td key={column.type + column.property}>
          <Presence value={(participant as any)[column.property]} />
        </td>
      )
    case 'profileLink':
      return (
        <LinkCell
          key={column.type + column.property}
          href={`participants/${participant.participantId}`}
          title={(participant as any)[column.property]}
        >
          {(participant as any)[column.property]}
        </LinkCell>
      )
    case 'date':
      return (
        <td key={column.type + column.property}>
          {formatDate((participant as any)[column.property])}
        </td>
      )
    case 'iconWithTooltip':
      return (participant as any)[column.property] ? (
        <td
          key={column.type + column.property}
          title={(participant as any)[column.property]}
        >
          <Icon type={column.icon} />
        </td>
      ) : (
        <td key={column.type + column.property} />
      )
    case 'boolean':
      return (
        <td key={column.type + column.property}>
          <NullableBoolean
            value={(participant as any)[column.property]}
            true={column.true || 'kyllä'}
            false={column.false || 'ei'}
          />
        </td>
      )
    case 'text':
    default:
      return (
        <td key={column.type + column.property}>
          {formatNullableString((participant as any)[column.property])}
        </td>
      )
  }
}

export type ParticipantRowProps = Readonly<{
  checkboxCallback: (
    checked: boolean,
    participantId: ParticipantOverview['participantId'],
  ) => void
  isChecked: (participantId: ParticipantOverview['participantId']) => boolean
  participant: ParticipantOverview
  index: number
  offset: number
  columns: readonly ParticipantListColumn[]
  availableDates: AvailableDates
}>

export const ParticipantRow: React.FC<ParticipantRowProps> = (props) => {
  const checkboxCallback = props.checkboxCallback
  const isChecked = props.isChecked

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    checkboxCallback(event.target.checked, props.participant.participantId)
  }

  const checked = isChecked(props.participant.participantId)

  return (
    <tr>
      <td>
        <small style={{ color: 'grey' }}>
          {1 + props.index + props.offset}
        </small>
      </td>
      <td>
        <input type="checkbox" onChange={onChange} checked={checked} />
      </td>
      {props.columns.flatMap((column) => (
        <CellContent
          key={
            props.participant.participantId.toString() +
            JSON.stringify(column.label)
          }
          participant={props.participant}
          column={column}
          availableDates={props.availableDates}
        />
      ))}
    </tr>
  )
}
