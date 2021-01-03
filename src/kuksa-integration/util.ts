export const startSpinner = (): (() => void) => {
  const P = ['\\', '|', '/', '-']
  let x = 0
  const intervalId = setInterval(() => {
    process.stdout.write(`\r${P[x++]}`)
    x = x % P.length
  }, 250)

  return () => {
    clearInterval(intervalId)
  }
}

export function withSpinner<T>(fn: () => T): T {
  const stopSpinner = startSpinner()
  try {
    return fn()
  } finally {
    stopSpinner()
  }
}
