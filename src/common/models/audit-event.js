import Promise from 'bluebird';
import app from '../../server/server.js';

export default function (AuditEvent) {
  AuditEvent.createEvent = {};

  AuditEvent.createEvent.Participant = function(userId, instanceId, description) {
    const createAuditEvent = Promise.promisify(app.models.AuditEvent.create, { context: app.models.AuditEvent });
    return createAuditEvent(
      {
        'eventType': description,
        'model': 'Participant',
        'modelId': instanceId,
        'timestamp': (new Date()).toISOString(),
        'registryuserId': userId,
        'comment': '',
      }
    );
  };

  AuditEvent.createEvent.Registryuser = function(userId, instanceId, description) {
    const createAuditEvent = Promise.promisify(app.models.AuditEvent.create, { context: app.models.AuditEvent });
    return createAuditEvent(
      {
        'eventType': description,
        'model': 'RegistryUser',
        'modelId': instanceId,
        'timestamp': (new Date()).toISOString(),
        'registryuserId':  userId,
        'comment': '',
      }
    );
  };
}
