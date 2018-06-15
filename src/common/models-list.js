// List of LoopBack models to create
const modelList = [
  ['AccessToken', false],
  ['ACL', false],
  ['Role', true],
  ['RoleMapping', false],
  ['RegistryUser', false],
  ['AuditEvent', false],
];

export function getModelCreationList() {
  return modelList;
}
