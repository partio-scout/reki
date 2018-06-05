import path from 'path';
import { existsSync } from 'fs';

const env = process.env.NODE_ENV || 'default';
let configFile = path.resolve(__dirname, `../../../conf/${env}.config.js`);
if (!existsSync(configFile)) {
  configFile = path.resolve(__dirname, '../../../conf/default.config.js');
}
const config = require(configFile).default;

export default {
  getFetchDateRanges: () => config.fetchDateRanges,
  getPaymentToDatesMappings: () => config.paymentToDatesMappings,
  getSelectionGroupTitles: () => config.selectionGroupTitles,
  getOptionFieldNames: () => config.optionFields,
  getAllergyFieldTitles: () => config.allergyFields,
  getActionPermissions: () => config.permissions,
};
