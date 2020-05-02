import React from 'react'

export const ErrorDialog: React.FC<{
  title: string
  message: string
  onHide: () => void
}> = ({ title, message, onHide }) => (
  <div className="error-dialog">
    <h2>{title}</h2>
    <div>{message}</div>
    <button onClick={onHide}>OK</button>
  </div>
)
