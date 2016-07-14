export default function (PresenceHistory) {
  // Creating read only endpoint
  PresenceHistory.disableRemoteMethod('create', true);
  PresenceHistory.disableRemoteMethod('upsert', true);
  PresenceHistory.disableRemoteMethod('deleteById', true);
  PresenceHistory.disableRemoteMethod('updateAll', true);
  PresenceHistory.disableRemoteMethod('updateAttributes', false);
  PresenceHistory.disableRemoteMethod('createChangeStream', true);
}
