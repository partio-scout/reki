import React from 'react'

export type PropertyTextAreaProps = Readonly<{
  onChange: (
    property: string,
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void
  value: string
  rows?: number
  property: string
}>
export const PropertyTextArea: React.FC<PropertyTextAreaProps> = ({
  value,
  onChange,
  rows,
  property,
}) => (
  <textarea
    value={value}
    onChange={(event) => onChange(property, event)}
    rows={rows}
  />
)
