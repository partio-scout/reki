import React, { useMemo } from 'react'
import _ from 'lodash'
import { ParticipantOverview } from '../../model'

type SelectAllProps = Readonly<{
  checked: readonly ParticipantOverview['participantId'][]
  setChecked: (checked: readonly ParticipantOverview['participantId'][]) => void
  participants: readonly ParticipantOverview['participantId'][]
  hideLabel?: boolean
}>

export const SelectAll: React.FC<SelectAllProps> = ({
  checked,
  setChecked,
  participants,
  hideLabel,
}) => {
  const count = checked.length
  const allChecked = useMemo(
    () =>
      checked.length === 0
        ? false
        : _.every(participants, (participant) => checked.includes(participant)),
    [checked, participants],
  )
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked ? participants : [])
  }

  const label = `${count} ${count == 1 ? 'henkilö' : 'henkilöä'} valittu`

  return (
    <label>
      <input
        type="checkbox"
        title="Valitse kaikki"
        checked={allChecked}
        onChange={handleChange}
      />
      {hideLabel ? null : label}
    </label>
  )
}
