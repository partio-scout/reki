module.exports = {
  'db': {
    'url': process.env.DATABASE_URL || process.env.OPENSHIFT_POSTGRESQL_DB_URL,
  },
};
