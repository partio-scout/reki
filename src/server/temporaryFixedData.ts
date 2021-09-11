export type IconType =
  | 'sort'
  | 'sort-asc'
  | 'sort-desc'
  | 'comment'
  | 'user'
  | 'remove'
  | 'info'
  | 'ok'

export type ParticipantListColumn =
  | {
      type: 'presence' | 'profileLink' | 'date' | 'text'
      property: string
      label: string
    }
  | {
      type: 'iconWithTooltip'
      property: string
      icon: IconType
      label: { icon: IconType; tooltip: string }
    }
  | {
      type: 'boolean'
      property: string
      label: string
      true?: string
      false?: string
    }
  | { type: 'availableDates'; label: string }

export const participantListColumns: readonly ParticipantListColumn[] = [
  { type: 'presence', property: 'presence', label: 'Tila' },
  { type: 'profileLink', property: 'firstName', label: 'Etunimi' },
  { type: 'profileLink', property: 'lastName', label: 'Sukunimi' },
  { type: 'date', property: 'dateOfBirth', label: 'Syntymäpäivä' },
  { type: 'text', property: 'staffPosition', label: 'Pesti' },
  { type: 'date', property: 'billedDate', label: 'Laskutettu' },
  { type: 'date', property: 'paidDate', label: 'Maksettu' },
  { type: 'text', property: 'memberNumber', label: 'Jäsennumero' },
  {
    type: 'iconWithTooltip',
    icon: 'info',
    property: 'campOfficeNotes',
    label: { icon: 'info', tooltip: 'Leiritoimiston merkinnät' },
  },
  {
    type: 'iconWithTooltip',
    icon: 'comment',
    property: 'editableInfo',
    label: { icon: 'comment', tooltip: 'Lisätiedot' },
  },
  {
    type: 'boolean',
    true: 'EVP',
    false: 'partiolainen',
    property: 'nonScout',
    label: 'Onko partiolainen?',
  },
  { type: 'text', property: 'homeCity', label: 'Kotikaupunki' },
  {
    type: 'boolean',
    property: 'interestedInHomeHospitality',
    label: 'Home hospitality',
  },
  { type: 'text', property: 'email', label: 'Sähköposti' },
  { type: 'text', property: 'phoneNumber', label: 'Puhelinnumero' },
  { type: 'text', property: 'ageGroup', label: 'Ikäkausi' },
  { type: 'text', property: 'accommodation', label: 'Majoittuminen' },
  { type: 'text', property: 'localGroup', label: 'Lippukunta' },
  { type: 'text', property: 'village', label: 'Kylä' },
  { type: 'text', property: 'subCamp', label: 'Alaleiri' },
  { type: 'text', property: 'campGroup', label: 'Leirilippukunta' },
  { type: 'availableDates', label: 'Ilmoittautumispäivät' },
]

export type QuickFilterConfiguration = readonly (readonly QuickFilterDefinition[])[]
export type QuickFilterDefinition = Readonly<
  | { type: 'debouncedTextField'; property: string; label: string }
  | { type: 'options'; property: string; label: string }
  | { type: 'presence'; label: string }
  | {
      type: 'generic'
      label: string
      properties: readonly Readonly<{ property: string; label: string }>[]
    }
  | { type: 'availableDates'; label: string }
>

export const quickFilterConfiguration: QuickFilterConfiguration = [
  [
    { type: 'options', property: 'ageGroup', label: 'Ikäkausi' },
    { type: 'presence', label: 'Tila' },
    { type: 'options', property: 'localGroup', label: 'Lippukunta' },
  ],
  [
    { type: 'options', property: 'subCamp', label: 'Alaleiri' },
    { type: 'options', property: 'village', label: 'Kylä' },
    { type: 'options', property: 'campGroup', label: 'Leirilippukunta' },
  ],
  [
    {
      type: 'generic',
      label: 'Muu kenttä',
      properties: [
        { property: 'childNaps', label: 'Lapsi nukkuu päiväunet' },
        { property: 'accommodation', label: 'Majoittautuminen' },
        { property: 'country', label: 'Maa' },
        { property: 'willOfTheWisp', label: 'Virvatuli' },
        { property: 'willOfTheWispWave', label: 'Virvatulen aalto' },
        { property: 'internationalGuest', label: 'KV-osallistuja' },
      ],
    },
  ],
]
