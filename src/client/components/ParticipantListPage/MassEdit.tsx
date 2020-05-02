import React, { useState } from 'react'
import { LoadingButton, PresenceSelector } from '..'
import { SelectAll } from './SelectAll'
import { ParticipantOverview } from '../../model'

type MassEditProps = Readonly<{
  onSubmit: (value: number) => void
  checked: readonly ParticipantOverview['participantId'][]
  participants: readonly ParticipantOverview['participantId'][]
  setChecked: (
    checkedParticipants: readonly ParticipantOverview['participantId'][],
  ) => void
  participantsLoading: boolean
}>

export const MassEdit: React.FC<MassEditProps> = ({
  onSubmit,
  checked,
  participants,
  setChecked,
  participantsLoading,
}) => {
  const [value, setValue] = useState<number | undefined>(undefined)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value !== undefined) {
      onSubmit(value)
    }
  }

  const handleChange = (p: unknown, newValue: number | undefined) =>
    setValue(newValue)
  const count = checked.length

  return (
    <form className="mass-edit" onSubmit={handleSubmit}>
      <SelectAll
        checked={checked}
        participants={participants}
        setChecked={setChecked}
      />
      <PresenceSelector
        inline
        label="Tila"
        onChange={handleChange}
        currentSelection={{ presence: value }}
        property="presence"
      />
      <LoadingButton
        disabled={!value || count === 0}
        loading={participantsLoading}
        label="Tallenna"
        labelWhileLoading="Tallennetaan…"
      />
    </form>
  )
}
