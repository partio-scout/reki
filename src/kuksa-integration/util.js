export const startSpinner = () => {
  const P = ['\\', '|', '/', '-'];
  let x = 0;
  const intervalId = setInterval(() => {
    process.stdout.write(`\r${P[x++]}`);
    x = x % P.length;
  }, 250);

  return () => { clearInterval(intervalId); };
};

export const usingSpinner = handler => {
  const stopSpinner = startSpinner();
  try {
    return handler();
  } finally {
    stopSpinner();
  }
};
