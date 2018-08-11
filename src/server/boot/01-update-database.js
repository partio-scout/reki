import { sequelize } from '../models';

// TODO refactor this to a script file and add tests to check models and roles are
// created correctly
export default async function(app) {
  if (!app.get('standalone')) {
    return;
  }

  await waitForDbConnection();

  await sequelize.sync({ alter: true });
}

async function waitForDbConnection() {
  let triesLeft = 5;
  const delay = exponentialBackoffDelay(1000, 1.1);

  while (true) { // eslint-disable-line no-constant-condition
    try {
      await sequelize.authenticate();
      return;
    } catch (e) {
      triesLeft--;
      if (triesLeft <= 0) {
        throw new Error('Could not connect to the database');
      }

      await delay();
    }
  }
}

function exponentialBackoffDelay(baseDelayMs, backoffMultiplier) {
  let currentDelay = baseDelayMs;
  return function delay() {
    return new Promise(resolve => {
      setTimeout(resolve, currentDelay);
      currentDelay *= backoffMultiplier;
    });
  };
}
