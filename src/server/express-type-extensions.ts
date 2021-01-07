declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string
      memberNumber: string
      sessionType: string
      roles: readonly string[]
    }
  }
}

export {}
