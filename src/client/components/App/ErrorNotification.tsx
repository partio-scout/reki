import React from 'react'
import { ErrorDialog } from '..'
import { useErrorContext } from '../../errors'

export const ErrorNotification: React.FC = () => {
  const { errors, confirmLatest } = useErrorContext()

  if (errors.length === 0) {
    return null
  }

  const newestError = errors[errors.length - 1]
  const message = newestError.message

  return (
    <ErrorDialog
      title="Ups! Nyt tapahtui virhe..."
      message={message}
      onHide={() => {
        confirmLatest()
      }}
    />
  )
}
