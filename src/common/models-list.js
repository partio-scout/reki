// Format: [<modelname>, <create fixtures>]
// <modelname>: string, as defined in model definition json
// <create fixtures>: boolean, set true to create fixtures when seeding database
//                    Fixtures need to be defined in a json array in a file called
//                    <modelname>.json inside the src/common/fixtures directory
// The order of these models is important for database row creation!
const modelList = [
  ['AccessToken', false],
  ['ACL', false],
  ['Role', false],
  ['RoleMapping', false],
  ['Registryuser', false],
  ['Participant', false],
];

export function getModelCreationList() {
  return modelList.map(modelEntry => modelEntry[0]);
}

export function getFixtureCreationList() {
  return modelList.filter(modelEntry => modelEntry[1]).map(modelEntry => modelEntry[0]);
}
