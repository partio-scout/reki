import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { defaultOpts } from './fetch';

const ErrorContext = React.createContext();

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    fetch('/flashes', defaultOpts)
      .then(response => {
        if (response.ok) {
          return response.json().then(body => {
            const newErrors = body.error || [];

            if (newErrors.length) {
              setErrors(errors.concat(newErrors.map(e => newError(null, e))));
            }
          });
        }
      });
  });

  const confirmLatest = useCallback(() => { setErrors(e => e.slice(1)); }, []);
  const showError = useCallback((error, message) => {
    setErrors(e => e.concat(newError(error, message)));
  }, []);

  const errorContextValue = useMemo(() => ({
    errors,
    confirmLatest,
    showError,
  }), [errors, confirmLatest, showError]);

  return (
    <ErrorContext.Provider value={ errorContextValue }>
      { children }
    </ErrorContext.Provider>
  );
}

export const useErrorContext = () => useContext(ErrorContext);

function newError(error, message) {
  return {
    error: error,
    message: message || error.message,
    rootCause: getRootCause(error),
  };
}

function getRootCause(error) {
  if (!error) {
    return null;
  }
  if (error.status === 401) {
    return 'Ei käyttöoikeutta';
  } else if (error.status === 503) {
    return 'Järjestelmää huolletaan';
  }
  return null;
}
