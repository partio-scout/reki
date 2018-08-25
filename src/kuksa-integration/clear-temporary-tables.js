import { createConnection } from '../server/database';
import { usingSpinner } from './util';

const temporaryTables = [
  'kuksa_campgroup',
  'kuksa_extrainfofield',
  'kuksa_extraselection',
  'kuksa_extraselectiongroup',
  'kuksa_localgroup',
  'kuksa_participant',
  'kuksa_participantextrainfo',
  'kuksa_participantextraselection',
  'kuksa_participantpayment',
  'kuksa_participantpaymentstatus',
  'kuksa_payment',
  'kuksa_subcamp',
  'kuksa_subcamp',
  'kuksa_village',
];

const clearTemporaryTables = pool => usingSpinner(() =>
  pool.query(`TRUNCATE TABLE ${temporaryTables.join(',')}`)
);

async function main() {
  const pool = await createConnection();
  try {
    await clearTemporaryTables(pool);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  main().then(() => {
    console.log('Kuksa integration temporary tables cleared.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Temporary model creation failed: ', err);
    process.exit(1);
  });
}
