import { _ } from 'lodash';

/*
 * This is the config file used for tests - don't change it unless you plan to change the tests too!
 *
 * Use production.config.js for setting your production config and default.config.js for your dev
 * environment. If you just want to get the app running and do some development, the default config
 * files should work just fine.
 */

/*
  Extra fields to sync from Kuksa in addition to the default ones.

  Field name (name): this is the internal name of the field used by REKI. Use only lowercase letters,
  uppercase letters and numbers and camelCase. E.g. "firstName".

  Data types (dataType):
  - string: string with maximum length of 255 characters.
  - date: date, without time part
  - boolean: a true/false value
  - integer: integer value

  Field types (type):
  - participant_field: fields that exist on the participant object directly, such as
    name or member number. These are the same for all events.
    For available fields, see: https://github.com/partio-scout/kuksa-event-api-client
  - extra_info_field: configurable text field in Kuksa, e.g. "Huoltajan nimi". These
    depend on the event.
  - single_select_field: configurable single-select field in Kuksa, e.g. "Ikäkausi". These
    depend on the event.
*/
const participantCustomFields = [
  {
    name: 'nickname',
    type: 'participant_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'dateOfBirth',
    type: 'participant_field',
    dataType: 'date',
  },
  {
    name: 'phoneNumber',
    type: 'participant_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'email',
    type: 'participant_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'ageGroup',
    type: 'participant_field',
    dataType: 'string',
  },
  {
    name: 'gender',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
];

const participantTableFields = [
  'firstName',
  'lastName',
];

const filters = [
  {
    field: 'ageGroup',
    primary: true,
  },
  {
    field: 'staffPositionInGenerator',
    title: 'Pesti (kehitin)',
  },
];

const detailsPageFields = [
  {
    groupTitle: 'Yhteystiedot',
    fields: [
      'phone',
      'email',
    ],
  },
];

// Titles of the multi-select groups that should be synced from Kuksa.
// Each item represents the name of the selection group.
const customMultipleSelectionFields = [
];

const participantDatesMapper = wrappedParticipant => {
  const mappings = {
    'Su  22.7.': ['2018-07-22'],
    'Ma 23.7.': ['2018-07-23'],
    'Ti 24.7.': ['2018-07-24'],
    'Ke 25.7.': ['2018-07-25'],
    'To 26.7.': ['2018-07-26'],
    'Pe 27.7.': ['2018-07-27'],
    'La 28.7.': ['2018-07-28'],
    'Su 29.7.': ['2018-07-29'],
  };

  return _(wrappedParticipant.getAllExtraSelections('Päivät jolloin olen mukana')).flatMap(payment => mappings[payment] || []).value();
};

// Titles of multi-select fields containing the allergy information
const allergyFields = [
];

// Field by which the view can be filtered (participantFields only)
const filterableByFields = [
  'subCamp',
  'campGroup',
  'localGroup',
  'ageGroup',
  'country',
  'internationalGuest',
];

// Roles and their permissions
const permissions = {
  registryUser: [
    'perform allowed test action',
    'view searchfilters',
    'view own user information',
    'modify searchfilters',
    'view participants',
    'edit participants',
    'view app configuration',
  ],
  registryAdmin: [
    'perform disallowed test action',
    'view registry users',
    'view own user information',
    'block and unblock users',
    'view app configuration',
  ],
};

// Split fetching participants to date ranges in order to avoid overloading Kuksa
const fetchDateRanges = [
  {
    'startDate': '2017-01-01T00:00:00Z',
    'endDate': '2018-01-01T00:00:00Z',
  },
  {
    'startDate': '2018-01-01T00:00:00Z',
    'endDate': '', // Defaults to right now
  },
];

// Takes the participant as fetched from Kuksa and maps it to the participant to
// save in the database
const participantBuilderFunction = participant => {
  const p = participant;

  // Shorten family camp age group a bit
  const ageGroup = p.getExtraSelection('Olen leirillä') || 'Muu';

  // Family camp residence needs to be deduced differently
  const subCamp = p.get('kuksa_subcamp.name') || 'Muu';

  return {
    participantId: p.get('id'),
    firstName: p.get('firstName'),
    lastName: p.get('lastName'),
    nickname: p.get('nickname'),
    memberNumber: p.get('memberNumber'),
    dateOfBirth: p.get('dateOfBirth'),
    billedDate: p.getPaymentStatus('billed'),
    paidDate: p.getPaymentStatus('paid'),
    phoneNumber: p.get('phoneNumber'),
    email: p.get('email'),
    internationalGuest: !!p.get('kuksa_localgroup'), // has local group == is international guest
    diet: p.get('diet'),
    accommodation: p.get('accommodation') || 'Muu',
    localGroup: p.get('representedParty') || p.get('kuksa_localgroup.name') || 'Muu',
    campGroup: p.get('kuksa_campgroup.name') || 'Muu',
    subCamp: subCamp,
    village: p.get('kuksa_village.name') || 'Muu',
    country: p.get('kuksa_localgroup.country') || 'Suomi',
    ageGroup: ageGroup,
    // Not a scout if 1) no finnish member number and 2) not part of international group ("local group")
    nonScout: !p.get('memberNumber') && !p.get('kuksa_localgroup.name'),
  };
};

export default {
  participantCustomFields: participantCustomFields,
  participantBuilderFunction: participantBuilderFunction,
  participantDatesMapper: participantDatesMapper,
  fetchDateRanges: fetchDateRanges,
  customMultipleSelectionFields: customMultipleSelectionFields,
  filterableByFields: filterableByFields,
  allergyFields: allergyFields,
  permissions: permissions,
  participantTableFields: participantTableFields,
  filters: filters,
  detailsPageFields: detailsPageFields,
};
