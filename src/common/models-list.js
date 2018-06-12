// List of LoopBack models to create
const modelList = [
  'AccessToken',
  'ACL',
  'Role',
  'RoleMapping',
  'RegistryUser',
  'Allergy',
  'Participant',
  'ParticipantAllergy',
  'ParticipantDate',
  'PresenceHistory',
  'AuditEvent',
  'Selection',
];

export function getModelCreationList() {
  return modelList;
}
