import path from 'path';
import { existsSync } from 'fs';
import _ from 'lodash';

const env = process.env.NODE_ENV || 'default';
let configFile = path.resolve(__dirname, `../../../conf/${env}.config.js`);
if (!existsSync(configFile)) {
  configFile = path.resolve(__dirname, '../../../conf/default.config.js');
}
const config = require(configFile).default;

const alwaysIncludedFields = [
  {
    name: 'presence',
    type: 'mandatory_field',
    dataType: 'number',
  },
  {
    name: 'firstName',
    type: 'mandatory_field',
    dataType: 'string',
    searchable: true,
  },
  {
    name: 'lastName',
    type: 'mandatory_field',
    dataType: 'string',
    searchable: true,
  },
  {
    name: 'memberNumber',
    type: 'mandatory_field',
    dataType: 'string',
    nullable: true,
    searchable: true,
  },
  {
    name: 'billedDate',
    type: 'mandatory_field',
    dataType: 'date',
    nullable: true,
  },
  {
    name: 'paidDate',
    type: 'mandatory_field',
    dataType: 'date',
    nullable: true,
  },
  {
    name: 'internationalGuest',
    type: 'mandatory_field',
    dataType: 'boolean',
  },
  {
    name: 'accommodation',
    type: 'mandatory_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'localGroup',
    type: 'mandatory_field',
    dataType: 'string',
  },
  {
    name: 'campGroup',
    type: 'mandatory_field',
    dataType: 'string',
  },
  {
    name: 'subCamp',
    type: 'mandatory_field',
    dataType: 'string',
  },
  {
    name: 'village',
    type: 'mandatory_field',
    dataType: 'string',
  },
  {
    name: 'country',
    type: 'mandatory_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'nonScout',
    type: 'mandatory_field',
    dataType: 'boolean',
  },
  {
    name: 'campOfficeNotes',
    type: 'mandatory_field',
    dataType: 'string',
    searchable: true,
  },
  {
    name: 'editableInfo',
    type: 'mandatory_field',
    dataType: 'string',
    searchable: true,
  },
];

const participantFields = alwaysIncludedFields.concat(config.participantCustomFields);

const searchableFieldNames = _(participantFields).filter('searchable').map('name').value();

export default {
  getFetchDateRanges: () => config.fetchDateRanges,
  getPaymentToDatesMappings: () => config.paymentToDatesMappings,
  getSelectionGroupTitles: () => config.customMultipleSelectionFields,
  getOptionFieldNames: () => config.filterableByFields,
  getSearchableFieldNames: () => searchableFieldNames,
  getAllergyFieldTitles: () => config.allergyFields,
  getActionPermissions: () => config.permissions,
  getParticipantFields: () => participantFields,
  getRoles: () => Object.keys(config.permissions),
};
