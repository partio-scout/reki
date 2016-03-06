export default function (AuditEvent) {
  AuditEvent.createEvent = {};

  AuditEvent.createEvent.Participant = function(userId, instanceId, description) {
    AuditEvent.create(
      {
        'eventType': description,
        'model': 'Participant',
        'modelId': instanceId,
        'timestamp': (new Date()).toISOString(),
        'registryuserId': userId,
        'comment': '',
      },
      (err,instance) => {if (err) {throw err;} return;});
  };

  AuditEvent.createEvent.Registryuser = function(userId, instanceId, description) {
    AuditEvent.create(
      {
        'eventType': description,
        'model': 'Registryuser',
        'modelId': instanceId,
        'timestamp': (new Date()).toISOString(),
        'registryuserId':  userId,
        'comment': '',
      },
      (err,instance) => {if (err) {throw err;} return;});
  };
}
