import React from 'react'
import Spinner from 'react-spinner'
import { ParticipantRow } from '../../../components'
import {
  ParticipantListColumn,
  ParticipantOverview,
  AvailableDates,
} from '../../../model'

export type ParticipantRowsContainerProps = Readonly<{
  isChecked: (participantId: ParticipantOverview['participantId']) => boolean
  checkboxCallback: (
    isChecked: boolean,
    participantId: ParticipantOverview['participantId'],
  ) => void
  columns: readonly ParticipantListColumn[]
  availableDates: AvailableDates
  offset: number
  participants: readonly ParticipantOverview[]
  loading: boolean
}>

export const ParticipantRowsContainer: React.FC<ParticipantRowsContainerProps> = ({
  isChecked,
  checkboxCallback,
  columns,
  availableDates,
  offset,
  participants,
  loading,
}) => {
  if (loading) {
    const columnCount = columns.reduce(
      (acc, elem) =>
        acc + (elem.type === 'availableDates' ? availableDates.length || 1 : 1),
      2,
    )
    return (
      <tr>
        <td colSpan={columnCount}>
          <Spinner />
        </td>
      </tr>
    )
  } else {
    return (
      <>
        {participants.map((element, index) => (
          <ParticipantRow
            key={element.participantId}
            columns={columns}
            isChecked={isChecked}
            checkboxCallback={checkboxCallback}
            availableDates={availableDates}
            participant={element}
            index={index}
            offset={offset}
          />
        ))}
      </>
    )
  }
}
