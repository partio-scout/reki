import _ from 'lodash'

export interface ParticipantFieldsDef {
  name: string
  type:
    | 'mandatory_field'
    | 'participant_field'
    | 'extra_info_field'
    | 'single_select_field'
  dataType: 'STRING' | 'INTEGER' | 'DATE' | 'BOOLEAN' | 'TEXT'
  searchable?: boolean
  nullable?: boolean
}

export const participantFields: readonly ParticipantFieldsDef[] = [
  {
    name: 'presence',
    type: 'mandatory_field',
    dataType: 'INTEGER',
    nullable: true,
  },
  {
    name: 'firstName',
    type: 'mandatory_field',
    dataType: 'STRING',
    searchable: true,
  },
  {
    name: 'lastName',
    type: 'mandatory_field',
    dataType: 'STRING',
    searchable: true,
  },
  {
    name: 'memberNumber',
    type: 'mandatory_field',
    dataType: 'STRING',
    nullable: true,
    searchable: true,
  },
  {
    name: 'billedDate',
    type: 'mandatory_field',
    dataType: 'DATE',
    nullable: true,
  },
  {
    name: 'paidDate',
    type: 'mandatory_field',
    dataType: 'DATE',
    nullable: true,
  },
  {
    name: 'internationalGuest',
    type: 'mandatory_field',
    dataType: 'BOOLEAN',
  },
  {
    name: 'accommodation',
    type: 'mandatory_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'localGroup',
    type: 'mandatory_field',
    dataType: 'STRING',
  },
  {
    name: 'campGroup',
    type: 'mandatory_field',
    dataType: 'STRING',
  },
  {
    name: 'subCamp',
    type: 'mandatory_field',
    dataType: 'STRING',
  },
  {
    name: 'village',
    type: 'mandatory_field',
    dataType: 'STRING',
  },
  {
    name: 'country',
    type: 'mandatory_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'nonScout',
    type: 'mandatory_field',
    dataType: 'BOOLEAN',
  },
  {
    name: 'campOfficeNotes',
    type: 'mandatory_field',
    dataType: 'TEXT',
    searchable: true,
    nullable: true,
  },
  {
    name: 'editableInfo',
    type: 'mandatory_field',
    dataType: 'TEXT',
    searchable: true,
    nullable: true,
  },
  {
    name: 'nickname',
    type: 'participant_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'dateOfBirth',
    type: 'participant_field',
    dataType: 'DATE',
    nullable: true,
  },
  {
    name: 'phoneNumber',
    type: 'participant_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'email',
    type: 'participant_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'diet',
    type: 'participant_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'ageGroup',
    type: 'participant_field',
    dataType: 'STRING',
  },
  {
    name: 'staffPosition',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
    searchable: true,
  },
  {
    name: 'staffPositionInGenerator',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
    searchable: true,
  },
  {
    name: 'willOfTheWisp',
    type: 'single_select_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'willOfTheWispWave',
    type: 'single_select_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'guardianOne',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'guardianTwo',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'familyCampProgramInfo',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'childNaps',
    type: 'single_select_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'homeCity',
    type: 'extra_info_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'swimmingSkill',
    type: 'single_select_field',
    dataType: 'STRING',
    nullable: true,
  },
  {
    name: 'gender',
    type: 'single_select_field',
    dataType: 'STRING',
    nullable: true,
  },
]

export interface DateRange {
  startDate: string
  endDate: string
}

export const fetchDateRanges: readonly DateRange[] = [
  {
    startDate: '2015-01-01T00:00:00',
    endDate: '2016-01-22T06:00:00',
  },
  {
    startDate: '2016-01-22T00:00:00',
    endDate: '2016-02-25T06:00:00',
  },
  {
    startDate: '2016-02-25T00:00:00',
    endDate: '2016-07-15T05:00:00',
  },
  {
    startDate: '2016-07-15T05:00:00',
    endDate: '', // Defaults to right now
  },
]

interface WrappedParticipant {
  get: (name: string) => unknown
  getExtraSelection: (name: string) => unknown
  getPaymentStatus: (name: string) => unknown
  getExtraInfo: (name: string) => unknown
  getPayments: () => readonly string[]
}

export const participantBuilderFunction = (
  participant: WrappedParticipant,
): Record<string, unknown> => {
  const p = participant

  // Shorten family camp age group a bit
  let ageGroup =
    p.getExtraSelection('Osallistun seuraavan ikäkauden ohjelmaan:') || 'Muu'
  if (
    ageGroup ===
    'perheleirin ohjelmaan (0-11v.), muistathan merkitä lisätiedot osallistumisesta "vain perheleirin osallistujille" -osuuteen.'
  ) {
    ageGroup = 'perheleiri (0-11v.)'
  }

  // Family camp residence needs to be deduced differently
  let subCamp = p.get('kuksa_subcamp.name') || 'Muu'
  if (p.get('accommodation') === 'Perheleirissä') {
    subCamp = 'Riehu'
  }

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
    localGroup:
      p.get('representedParty') || p.get('kuksa_localgroup.name') || 'Muu',
    campGroup: p.get('kuksa_campgroup.name') || 'Muu',
    subCamp: subCamp,
    village: p.get('kuksa_village.name') || 'Muu',
    country: p.get('kuksa_localgroup.country') || 'Suomi',
    ageGroup: ageGroup,
    // Not a scout if 1) no finnish member number and 2) not part of international group ("local group")
    nonScout: !p.get('memberNumber') && !p.get('kuksa_localgroup.name'),
    staffPosition: p.getExtraInfo('Pesti'),
    staffPositionInGenerator: p.getExtraInfo('Pesti kehittimessä'),
    willOfTheWisp: p.getExtraSelection('Virvatuli'),
    willOfTheWispWave: p.getExtraSelection('Virvatulen aalto'),
    guardianOne: p.getExtraInfo('Leirillä olevan lapsen huoltaja (nro 1)'),
    guardianTwo: p.getExtraInfo('Leirillä olevan lapsen huoltaja (nro 2)'),
    familyCampProgramInfo: p.getExtraInfo(
      'Mikäli vastasit edelliseen kyllä, kerro tässä tarkemmin millaisesta ohjelmasta on kyse',
    ),
    childNaps: p.getExtraSelection('Lapsi nukkuu päiväunet'),
  }
}

export const participantDatesMapper = (
  wrappedParticipant: WrappedParticipant,
) => {
  // Map payment names to arrays of dates when the participant is present
  const paymentToDatesMappings: Record<string, readonly string[]> = {
    'pe 15.7.': ['2016-07-15'],
    'la 16.7.': ['2016-07-16'],
    'su 17.7.': ['2016-07-17'],
    'ma 18.7.': ['2016-07-18'],
    'ti 19.7.': ['2016-07-19'],

    'ke 20.7.': ['2016-07-20'],
    'ke 20.7. 100% alennus': ['2016-07-20'],
    'ke 20.7. 50% alennus': ['2016-07-20'],

    'to 21.7.': ['2016-07-21'],
    'to 21.7. 100% alennus': ['2016-07-21'],
    'to 21.7. 50% alennus': ['2016-07-21'],

    'pe 22.7.': ['2016-07-22'],
    'pe 22.7. 100% alennus': ['2016-07-22'],
    'pe 22.7. 50% alennus': ['2016-07-22'],

    'la 23.7.': ['2016-07-23'],
    'la 23.7. 100% alennus': ['2016-07-23'],
    'la 23.7. 50% alennus': ['2016-07-23'],

    'su 24.7.': ['2016-07-24'],
    'su 24.7. 100% alennus': ['2016-07-24'],
    'su 24.7. 50% alennus': ['2016-07-24'],

    'ma 25.7.': ['2016-07-25'],
    'ma 25.7. 100% alennus': ['2016-07-25'],
    'ma 25.7. 50% alennus': ['2016-07-25'],

    'ti 26.7.': ['2016-07-26'],
    'ti 26.7. 100% alennus': ['2016-07-26'],
    'ti 26.7. 50% alennus': ['2016-07-26'],

    'ke 27.7.': ['2016-07-27'],
    'ke 27.7. 100% alennus': ['2016-07-27'],
    'ke 27.7. 50% alennus': ['2016-07-27'],

    'to 28.7.': ['2016-07-28'],
    'pe 29.7.': ['2016-07-29'],
    'la 30.7.': ['2016-07-30'],
    'su 31.7.': ['2016-07-31'],

    'Osallistun koko leirin ajaksi': [
      '2016-07-20',
      '2016-07-21',
      '2016-07-22',
      '2016-07-23',
      '2016-07-24',
      '2016-07-25',
      '2016-07-26',
      '2016-07-27',
    ],
    'Osallistun koko purkuleirille (4 päivää) ja saan alennusta leirimaksusta 20 euroa. Summa hyvitetään purkuleirin jälkeen..': [
      '2016-07-28',
      '2016-07-29',
      '2016-07-30',
      '2016-07-31',
    ],
    'Osallistun vain rakennus-/purkuleirille tai Home Hospitalityn isäntäperheenä.': [],
  }

  return _(wrappedParticipant.getPayments()).flatMap((payment) => {
    const dateMappings = paymentToDatesMappings[payment]

    if (dateMappings === undefined) {
      console.log(
        `Warning! A mapping from payment type '${payment}' to participation dates is missing!`,
      )
    }

    return dateMappings || []
  })
}

export const selectionGroupTitles: readonly string[] = [
  '0-11-vuotias lapsi osallistuu',
  'Lapsi osallistuu päiväkodin toimintaan seuraavina päivinä',
  '\tLapsi osallistuu kouluikäisten ohjelmaan seuraavina päivinä',
  'Lapsen uimataito',
  'Lapsi saa poistua itsenäisesti perheleirin kokoontumispaikalta ohjelman päätyttyä',
  '\tLapsi tarvitsee päiväunien aikaan vaippaa',
]

export const optionFieldNames: readonly string[] = [
  'subCamp',
  'village',
  'campGroup',
  'localGroup',
  'ageGroup',
  'childNaps',
  'accommodation',
  'country',
  'willOfTheWisp',
  'willOfTheWispWave',
  'internationalGuest',
]

export const searchableFieldNames: readonly string[] = _(participantFields)
  .filter('searchable')
  .map('name')
  .value()

export const allergyFieldTitles: readonly string[] = [
  'Ruoka-aineallergiat. Roihulla ruoka ei sisällä selleriä, kalaa tai pähkinää. Jos et löydä ruoka-aineallergiaasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
  'Erityisruokavalio. Roihulla ruoka on täysin laktoositonta. Jos et löydä erityisruokavaliotasi tai sinulla on muita huomioita, ota yhteys Roihun muonitukseen: erityisruokavaliot@roihu2016.fi.',
]

export const actionPermissions = {
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
    'view audit log',
  ],
}

export const roles: ReadonlyArray<keyof typeof actionPermissions> = [
  'registryUser',
  'registryAdmin',
] as const

export const participantTableFields: readonly string[] = [
  'firstName',
  'lastName',
]

export interface Filter {
  field: string
  primary?: boolean
  title?: string
}

export const filters: readonly Filter[] = [
  {
    field: 'ageGroup',
    primary: true,
  },
  {
    field: 'staffPositionInGenerator',
    title: 'Pesti (kehitin)',
  },
]

export interface DetailsPageFieldGroup {
  groupTitle: string
  fields: readonly string[]
}

export const detailsPageFields: readonly DetailsPageFieldGroup[] = [
  {
    groupTitle: 'Yhteystiedot',
    fields: ['phone', 'email'],
  },
]
