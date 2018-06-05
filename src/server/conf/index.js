import path from 'path';
import { existsSync } from 'fs';

const env = process.env.NODE_ENV || 'default';
let configFile = path.resolve(__dirname, `../../../conf/${env}.config.js`);
if (!existsSync(configFile)) {
  configFile = path.resolve(__dirname, '../../../conf/default.config.js');
}
const config = require(configFile);

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
  },
  {
    name: 'lastName',
    type: 'mandatory_field',
    dataType: 'string',
  },
  {
    name: 'memberNumber',
    type: 'mandatory_field',
    dataType: 'string',
    nullable: true,
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
  },
  {
    name: 'editableInfo',
    type: 'mandatory_field',
    dataType: 'string',
  },
];

export default {
  getFetchDateRanges: () => config.fetchDateRanges,
  getPaymentToDatesMappings: () => config.paymentToDatesMappings,
  getSelectionGroupTitles: () => config.customMultipleSelectionFields,
  getOptionFieldNames: () => config.filterableByFields,
  getAllergyFieldTitles: () => config.allergyFields,
  getActionPermissions: () => config.permissions,
  getParticipantFields: () => alwaysIncludedFields.concat(config.participantCustomFields),
};
