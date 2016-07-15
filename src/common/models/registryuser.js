import app from '../../server/server.js';
import Promise from 'bluebird';
import loopback from 'loopback';

export default function(Registryuser) {
  Registryuser.afterRemote('create', (ctx, registryuserInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Registryuser(userId, registryuserInstance.id, 'add')
    .asCallback(next);
  });

  Registryuser.beforeRemote('findById', (ctx, registryuserInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Registryuser(userId, ctx.req.params.id, 'find')
    .asCallback(next);
  });

  Registryuser.beforeRemote('prototype.updateAttributes', (ctx, registryuserInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Registryuser(userId, ctx.req.params.id, 'update')
    .asCallback(next);
  });

  Registryuser.observe('before delete', (ctx, next) => {
    const findRegistryuser = Promise.promisify(app.models.RegistryUser.find, { context: app.models.RegistryUser });
    if (ctx.instance) {
      const userId = loopback.getCurrentContext() ? loopback.getCurrentContext().get('accessToken').userId : 0;
      app.models.AuditEvent.createEvent.Registryuser(userId, ctx.instance.registryuserId, 'delete')
      .asCallback(next);
    } else {
      findRegistryuser({ where: ctx.where, fields: { id: true } })
        .each(registryuser => {
          const userId = (loopback.getCurrentContext() && loopback.getCurrentContext().get('accessToken')) ? loopback.getCurrentContext().get('accessToken').userId : 0;
          return app.models.AuditEvent.createEvent.Registryuser(userId, registryuser.id, 'delete');
        }).asCallback(next);
    }
  });

  Registryuser.disableRemoteMethod('login', !(process.env.ENABLE_OFFLINE_LOGIN === 'true'));
}
