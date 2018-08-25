export function fromCallback(handler) {
  return new Promise((resolve, reject) => {
    handler((err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}
