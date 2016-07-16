/**
 * New Relic agent configuration.
 *
 * Configuration is actually read from env variables, but this file is required for New Relic
 * to function.
 *
 * See: https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration
 */
exports.config = {
  app_name: ['REKI / Dev'],
  license_key: '',
  logging: {
    level: 'info',
  },
};
