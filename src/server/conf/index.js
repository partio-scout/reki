import path from 'path';
import { existsSync } from 'fs';

const env = process.env.REKI_CONF || process.env.NODE_ENV || 'default';
let configFile = path.resolve(__dirname, `../../../conf/${env}.config.js`);
if (!existsSync(configFile)) {
  configFile = path.resolve(__dirname, '../../../conf/default.config.js');
}
const config = require(configFile).default;

const searchableFieldNames = [
  'firstName',
  'lastName',
  'memberNumber',
  'extraInfo',
];

export default {
  getFetchDateRanges: () => config.fetchDateRanges,
  getParticipantBuilderFunction: () => config.participantBuilderFunction,
  getParticipantDatesMapper: () => config.participantDatesMapper,
  getSelectionGroupTitles: () => config.customMultipleSelectionFields,
  getOptionFieldNames: () => config.filterableByFields,
  getSearchableFieldNames: () => searchableFieldNames,
  getAllergyFieldTitles: () => config.allergyFields,
  getActionPermissions: () => config.permissions,
  getParticipantCustomFields: () => config.participantCustomFields,
  getRoles: () => Object.keys(config.permissions),
  getParticipantTableFields: () => config.participantTableFields,
  getFilters: () => config.filters,
  getDetailsPageFields: () => config.detailsPageFields,
};
