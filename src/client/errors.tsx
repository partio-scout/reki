import React, {
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import { defaultOpts } from './fetch'
import * as Rt from 'runtypes'

type ErrorReport = {
  readonly message: string
  readonly details: Record<string, unknown> | undefined
}

type ErrorContextValue = {
  readonly errors: readonly ErrorReport[]
  readonly showError: (
    message: string,
    details?: Record<string, unknown>,
  ) => void
  readonly confirmLatest: () => void
}

const noOp = () => {
  /* no-op */
}

const ErrorContext = React.createContext<ErrorContextValue>({
  errors: [],
  showError: noOp,
  confirmLatest: noOp,
})

const FlashResponse = Rt.Record({
  error: Rt.Array(Rt.String).asReadonly().Or(Rt.Undefined),
}).asReadonly()

export const ErrorProvider: React.FC = ({ children }) => {
  const [errors, setErrors] = useState<readonly ErrorReport[]>([])

  const appendErrors = useCallback(
    (...newError: readonly ErrorReport[]) =>
      setErrors((e) => e.concat(newError)),
    [],
  )

  useEffect(() => {
    fetch('/flashes', defaultOpts).then(async (response) => {
      if (response.ok) {
        const json = await response.json()

        const validateResult = FlashResponse.validate(json)
        if (!validateResult.success) {
          appendErrors(
            errorReport('Palvelin lähetti huonosti muotoillun vastauksen', {
              errorMessage: validateResult.message,
              key: validateResult.key,
            }),
          )
        } else {
          const { error: newErrors } = validateResult.value

          if (newErrors && newErrors.length) {
            appendErrors(...newErrors.map((e) => errorReport(e)))
          }
        }
      }
    })
  }, [appendErrors])

  const confirmLatest = useCallback(() => {
    setErrors((e) => e.slice(1))
  }, [])
  const showError = useCallback(
    (message: string, details?: Record<string, unknown>) => {
      appendErrors(errorReport(message, details))
    },
    [appendErrors],
  )

  const errorContextValue = useMemo(
    () => ({
      errors,
      confirmLatest,
      showError,
    }),
    [errors, confirmLatest, showError],
  )

  return (
    <ErrorContext.Provider value={errorContextValue}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useErrorContext = () => useContext(ErrorContext)

function errorReport(
  message: string,
  details?: Record<string, unknown>,
): ErrorReport {
  return {
    message,
    details,
  }
}
