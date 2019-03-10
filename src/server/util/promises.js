export function fromCallback(fn) {
  return new Promise((resolve, reject) => {
    fn((err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}
