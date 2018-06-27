// List of LoopBack models to create
const modelList = [
  'AccessToken',
  'ACL',
  'Role',
  'RoleMapping',
  'RegistryUser',
  'AuditEvent',
];

export function getModelCreationList() {
  return modelList;
}
