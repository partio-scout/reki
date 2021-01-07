export function fromCallback<T>(
  fn: (callback: (err: any, result: T) => void) => void,
) {
  return new Promise<T>((resolve, reject) => {
    fn((err, value) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}
