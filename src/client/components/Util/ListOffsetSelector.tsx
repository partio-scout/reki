import React from 'react'
import _ from 'lodash'

type ListOffsetSelectorProps = Readonly<{
  offset: number | undefined
  limit: number | undefined
  onOffsetChanged: (neOffset: number) => void
  participantCount: number | undefined
}>

export const ListOffsetSelector: React.FC<ListOffsetSelectorProps> = ({
  offset = 0,
  limit = 1,
  onOffsetChanged,
  participantCount = 0,
}) => {
  const pageCount = Math.ceil(participantCount / limit)
  const activePageNumber = Math.floor(offset / limit)
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
    onOffsetChanged(Number(event.target.value) * limit)

  return (
    <select value={activePageNumber} onChange={handleSelect}>
      {_.range(pageCount).map((index) => (
        <option key={index} value={index}>
          {index + 1}
        </option>
      ))}
    </select>
  )
}
