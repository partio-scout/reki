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
}).asReadonly()
export type ParticipantOverview = Rt.Static<typeof ParticipantOverview>

export const PresenceEntry = Rt.Record({
  timestamp: Rt.String,
  presence: Rt.Number,
  authorId: Rt.Number,
}).asReadonly()
export type PresenceEntry = Rt.Static<typeof PresenceEntry>

export const ParticipantDetails = Rt.Record({
  participantId: Rt.Number,
  presence: Rt.Number.Or(Rt.Null),
  firstName: Rt.String,
  lastName: Rt.String,
  nickname: Rt.String.Or(Rt.Null),
  dateOfBirth: Rt.String,
  nonScout: Rt.Boolean,
  billedDate: Rt.String.Or(Rt.Null),
  paidDate: Rt.String.Or(Rt.Null),
  memberNumber: Rt.String.Or(Rt.Null),
  homeCity: Rt.String.Or(Rt.Null),
  country: Rt.String.Or(Rt.Null),
  email: Rt.String.Or(Rt.Null),
  phoneNumber: Rt.String.Or(Rt.Null),
  ageGroup: Rt.String.Or(Rt.Null),
  localGroup: Rt.String.Or(Rt.Null),
  subCamp: Rt.String.Or(Rt.Null),
  campGroup: Rt.String.Or(Rt.Null),
  village: Rt.String.Or(Rt.Null),
  internationalGuest: Rt.Boolean.Or(Rt.Null),
  staffPosition: Rt.String.Or(Rt.Null),
  staffPositionInGenerator: Rt.String.Or(Rt.Null),
  swimmingSkill: Rt.String.Or(Rt.Null),
  willOfTheWisp: Rt.String.Or(Rt.Null),
  willOfTheWispWave: Rt.String.Or(Rt.Null),
  guardianOne: Rt.String.Or(Rt.Null),
  guardianTwo: Rt.String.Or(Rt.Null),
  diet: Rt.String.Or(Rt.Null),
  familyCampProgramInfo: Rt.String.Or(Rt.Null),
  childNaps: Rt.String.Or(Rt.Null),
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

export const IpVersion = Rt.Union(Rt.Literal('ipv4'), Rt.Literal('ipv6'))
export type IpVersion = Rt.Static<typeof IpVersion>

export const AuditClientData = Rt.Record({
  id: Rt.Number,
  ipVersion: IpVersion,
  ipAddress: Rt.String,
  userAgent: Rt.String,
  humanReadableIpAddress: Rt.String,
}).asReadonly()
export type AuditClientData = Rt.Static<typeof AuditClientData>

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
  user: RegistryUser,
  clientDataId: Rt.Number,
  clientData: AuditClientData,
}).asReadonly()
export type AuditLogEntry = Rt.Static<typeof AuditLogEntry>
