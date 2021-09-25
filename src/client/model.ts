import * as Rt from 'runtypes'

export const SortDirection = Rt.Union(
  Rt.Literal('ASC'),
  Rt.Literal('DESC'),
  Rt.Undefined,
)
export type SortDirection = Rt.Static<typeof SortDirection>

export const Ordering = Rt.Dictionary(SortDirection)
export type Ordering = Rt.Static<typeof Ordering>

export type FilterSelection = Readonly<Record<string, unknown>>

export const OptionsByProperty = Rt.Dictionary(Rt.Array(Rt.String).asReadonly())
export type OptionsByProperty = Readonly<Rt.Static<typeof OptionsByProperty>>

export const AvailableDates = Rt.Array(
  Rt.Record({ date: Rt.String }).asReadonly(),
).asReadonly()
export type AvailableDates = Rt.Static<typeof AvailableDates>

export const RegistryUser = Rt.Record({
  id: Rt.Number,
  firstName: Rt.String,
  lastName: Rt.String,
  memberNumber: Rt.String,
  phoneNumber: Rt.String,
  email: Rt.String,
  blocked: Rt.Boolean,
})
  .asReadonly()
  .And(
    Rt.Partial({
      presence: Rt.Number,
    }),
  )
export type RegistryUser = Rt.Static<typeof RegistryUser>

export const ParticipantOverview = Rt.Record({
  participantId: Rt.Number,
  dates: Rt.Array(Rt.Record({ date: Rt.String }).asReadonly()).asReadonly(),
  presence: Rt.Number.Or(Rt.Null),
  firstName: Rt.String,
  lastName: Rt.String,
  memberNumber: Rt.String.Or(Rt.Null),
  phoneNumber: Rt.String.Or(Rt.Null),
  campOfficeNotes: Rt.String,
  editableInfo: Rt.String,
  extraFields: Rt.Dictionary(
    Rt.Union(Rt.String, Rt.Boolean, Rt.Number, Rt.Null, Rt.Undefined),
  ),
}).asReadonly()
export type ParticipantOverview = Rt.Static<typeof ParticipantOverview>

export const participantDefaultFields = [
  'firstName',
  'lastName',
  'memberNumber',
  'phoneNumber',
  'campOfficeNotes',
  'editableInfo',
] as const
export const isDefaultParticipantField = (
  fieldName: string,
): fieldName is typeof participantDefaultFields[number] =>
  participantDefaultFields.indexOf(fieldName as any) !== -1

export const PresenceEntry = Rt.Record({
  timestamp: Rt.String,
  presence: Rt.Number,
  authorId: Rt.Number,
  author: RegistryUser,
}).asReadonly()
export type PresenceEntry = Rt.Static<typeof PresenceEntry>

export const ParticipantDetails = Rt.Record({
  participantId: Rt.Number,
  presence: Rt.Number.Or(Rt.Null),
  firstName: Rt.String,
  lastName: Rt.String,
  extraFields: Rt.Dictionary(
    Rt.String.Or(Rt.Null).Or(Rt.Number).Or(Rt.Boolean),
  ),
  memberNumber: Rt.String.Or(Rt.Null),
  phoneNumber: Rt.String.Or(Rt.Null),
  dates: Rt.Array(Rt.Record({ date: Rt.String }).asReadonly()).asReadonly(),
  allergies: Rt.Array(Rt.Record({ name: Rt.String }).asReadonly()).asReadonly(),
  selections: Rt.Array(
    Rt.Record({
      selectionName: Rt.String,
      groupName: Rt.String,
      kuksaGroupId: Rt.Number,
    }).asReadonly(),
  ).asReadonly(),
  presenceHistory: Rt.Array(PresenceEntry).asReadonly(),
  campOfficeNotes: Rt.String.Or(Rt.Null),
  editableInfo: Rt.String.Or(Rt.Null),
}).asReadonly()
export type ParticipantDetails = Rt.Static<typeof ParticipantDetails>

export const AuditLogEntry = Rt.Record({
  id: Rt.Number,
  eventType: Rt.String,
  model: Rt.String,
  modelId: Rt.Number.Or(Rt.Null),
  changes: Rt.Unknown,
  meta: Rt.Unknown,
  timestamp: Rt.String,
  reason: Rt.String.Or(Rt.Null),
  userId: Rt.Number,
  user: RegistryUser.Or(Rt.Null),
  ipAddress: Rt.String,
  userAgent: Rt.String,
}).asReadonly()
export type AuditLogEntry = Rt.Static<typeof AuditLogEntry>

export const IconType = Rt.Union(
  Rt.Literal('sort'),
  Rt.Literal('sort-asc'),
  Rt.Literal('sort-desc'),
  Rt.Literal('comment'),
  Rt.Literal('user'),
  Rt.Literal('remove'),
  Rt.Literal('info'),
  Rt.Literal('ok'),
)
export type IconType = Rt.Static<typeof IconType>

export const ParticipantListColumn = Rt.Union(
  Rt.Record({
    type: Rt.Union(
      Rt.Literal('presence'),
      Rt.Literal('profileLink'),
      Rt.Literal('date'),
      Rt.Literal('text'),
    ),
    property: Rt.String,
    label: Rt.String,
  }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('iconWithTooltip'),
    property: Rt.String,
    icon: IconType,
    label: Rt.Record({ icon: IconType, tooltip: Rt.String }).asReadonly(),
  }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('boolean'),
    property: Rt.String,
    label: Rt.String,
    true: Rt.String.Or(Rt.Undefined),
    false: Rt.String.Or(Rt.Undefined),
  }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('availableDates'),
    label: Rt.String,
  }).asReadonly(),
)
export type ParticipantListColumn = Rt.Static<typeof ParticipantListColumn>

export const QuickFilterDefinition = Rt.Union(
  Rt.Record({
    type: Rt.Literal('debouncedTextField'),
    property: Rt.String,
    label: Rt.String,
  }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('options'),
    property: Rt.String,
    label: Rt.String,
  }).asReadonly(),
  Rt.Record({ type: Rt.Literal('presence'), label: Rt.String }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('generic'),
    label: Rt.String,
    properties: Rt.Array(
      Rt.Record({ property: Rt.String, label: Rt.String }).asReadonly(),
    ).asReadonly(),
  }).asReadonly(),
  Rt.Record({
    type: Rt.Literal('availableDates'),
    label: Rt.String,
  }).asReadonly(),
)
export type QuickFilterDefinition = Rt.Static<typeof QuickFilterDefinition>

export const QuickFilterConfiguration = Rt.Array(
  Rt.Array(QuickFilterDefinition).asReadonly(),
).asReadonly()
export type QuickFilterConfiguration = Rt.Static<
  typeof QuickFilterConfiguration
>

export const ParticipantListFindResult = Rt.Record({
  result: Rt.Array(ParticipantOverview).asReadonly(),
  columns: Rt.Array(ParticipantListColumn).asReadonly(),
}).asReadonly()
