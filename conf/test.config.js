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
    name: 'diet',
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
    name: 'staffPosition',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
    searchable: true,
  },
  {
    name: 'staffPositionInGenerator',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
    searchable: true,
  },
  {
    name: 'willOfTheWisp',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'willOfTheWispWave',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'guardianOne',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'guardianTwo',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'familyCampProgramInfo',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'childNaps',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'homeCity',
    type: 'extra_info_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'swimmingSkill',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
  {
    name: 'gender',
    type: 'single_select_field',
    dataType: 'string',
    nullable: true,
  },
];

// Titles of the multi-select groups that should be synced from Kuksa.
// Each item represents the name of the selection group.
const customMultipleSelectionFields = [
  '0-11-vuotias lapsi osallistuu',
  'Lapsi osallistuu päiväkodin toimintaan seuraavina päivinä',
  '\tLapsi osallistuu kouluikäisten ohjelmaan seuraavina päivinä',
  'Lapsen uimataito',
  'Lapsi saa poistua itsenäisesti perheleirin kokoontumispaikalta ohjelman päätyttyä',
  '\tLapsi tarvitsee päiväunien aikaan vaippaa',
];

// Map payment names to arrays of dates when the participant is present
const paymentToDatesMappings = {
  "pe 15.7.": ["2016-07-15"],
  "la 16.7.": ["2016-07-16"],
  "su 17.7.": ["2016-07-17"],
  "ma 18.7.": ["2016-07-18"],
  "ti 19.7.": ["2016-07-19"],

  "ke 20.7.": ["2016-07-20"],
  "ke 20.7. 100% alennus": ["2016-07-20"],
  "ke 20.7. 50% alennus": ["2016-07-20"],

  "to 21.7.": ["2016-07-21"],
  "to 21.7. 100% alennus": ["2016-07-21"],
  "to 21.7. 50% alennus": ["2016-07-21"],

  "pe 22.7.": ["2016-07-22"],
  "pe 22.7. 100% alennus": ["2016-07-22"],
  "pe 22.7. 50% alennus": ["2016-07-22"],

  "la 23.7.": ["2016-07-23"],
  "la 23.7. 100% alennus": ["2016-07-23"],
  "la 23.7. 50% alennus": ["2016-07-23"],

  "su 24.7.": ["2016-07-24"],
  "su 24.7. 100% alennus": ["2016-07-24"],
  "su 24.7. 50% alennus": ["2016-07-24"],

  "ma 25.7.": ["2016-07-25"],
  "ma 25.7. 100% alennus": ["2016-07-25"],
  "ma 25.7. 50% alennus": ["2016-07-25"],

  "ti 26.7.": ["2016-07-26"],
  "ti 26.7. 100% alennus": ["2016-07-26"],
  "ti 26.7. 50% alennus": ["2016-07-26"],

  "ke 27.7.": ["2016-07-27"],
  "ke 27.7. 100% alennus": ["2016-07-27"],
  "ke 27.7. 50% alennus": ["2016-07-27"],

  "to 28.7.": ["2016-07-28"],
  "pe 29.7.": ["2016-07-29"],
  "la 30.7.": ["2016-07-30"],
  "su 31.7.": ["2016-07-31"],

  "Osallistun koko leirin ajaksi": ["2016-07-20","2016-07-21","2016-07-22","2016-07-23","2016-07-24","2016-07-25","2016-07-26","2016-07-27"],
  "Osallistun koko purkuleirille (4 päivää) ja saan alennusta leirimaksusta 20 euroa. Summa hyvitetään purkuleirin jälkeen..": ["2016-07-28","2016-07-29","2016-07-30","2016-07-31"],
  "Osallistun vain rakennus-/purkuleirille tai Home Hospitalityn isäntäperheenä.": []
};

// Titles of multi-select fields containing the allergy information
const allergyFields = [
  'Ruoka-aineallergiat. Roihulla ruoka ei sisällä selleriä, kalaa tai pähkinää. Jos et löydä ruoka-aineallergiaasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
  'Erityisruokavalio. Roihulla ruoka on täysin laktoositonta. Jos et löydä erityisruokavaliotasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
];

// Field by which the view can be filtered (participantFields only)
const filterableByFields = [
  "subCamp",
  "village",
  "campGroup",
  "localGroup",
  "ageGroup",
  "childNaps",
  "accommodation",
  "country",
  "willOfTheWisp",
  "willOfTheWispWave",
  "internationalGuest"
];

// Roles and their permissions
const permissions = {
  "registryUser": [
    "perform allowed test action",
    "view searchfilters",
    "view own user information",
    "modify searchfilters",
    "view participants",
    "edit participants"
  ],
  "registryAdmin": [
    "perform disallowed test action",
    "view registry users",
    "view own user information",
    "block and unblock users"
  ]
};

// Split fetching participants to date ranges in order to avoid overloading Kuksa
const fetchDateRanges = [
  {
    "startDate": "2015-01-01T00:00:00",
    "endDate": "2016-01-22T06:00:00"
  },
  {
    "startDate": "2016-01-22T00:00:00",
    "endDate": "2016-02-25T06:00:00"
  },
  {
    "startDate": "2016-02-25T00:00:00",
    "endDate": "2016-07-15T05:00:00"
  },
  {
    "startDate": "2016-07-15T05:00:00",
    "endDate": "" // Defaults to right now
  }
];

export default {
  participantCustomFields: participantCustomFields,
  paymentToDatesMappings: paymentToDatesMappings,
  fetchDateRanges: fetchDateRanges,
  customMultipleSelectionFields: customMultipleSelectionFields,
  filterableByFields: filterableByFields,
  allergyFields: allergyFields,
  permissions: permissions,
}
