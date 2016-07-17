import app from '../../server/server.js';
import Promise from 'bluebird';
import loopback from 'loopback';
import crypto from 'crypto';

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

  Registryuser.disableRemoteMethod('login', process.env.ENABLE_OFFLINE_LOGIN !== 'true');

  Registryuser.isBlocked = function(user) {
    return user.status === 'blocked';
  };

  Registryuser.block = function(userId, callback) {
    const updateRegistryUser = Promise.promisify(app.models.RegistryUser.updateAll, { context: app.models.RegistryUser });
    const deleteAccessTokens = Promise.promisify(app.models.AccessToken.destroyAll, { context: app.models.AccessToken });

    const newPassword = crypto.randomBytes(24).toString('hex');

    Promise.join(
      updateRegistryUser({ id: userId }, { status: 'blocked', password: newPassword }),
      deleteAccessTokens({ userId: userId })
    ).asCallback(callback);
  };

  Registryuser.unblock = function(userId, callback) {
    const updateRegistryUser = Promise.promisify(app.models.RegistryUser.updateAll, { context: app.models.RegistryUser });

    updateRegistryUser({ id: userId }, { status: null }).asCallback(callback);
  };

  Registryuser.remoteMethod('block',
    {
      http: { path: '/:id/block', verb: 'post' },
      accepts: [
        { arg: 'id', type: 'number', required: 'true' },
      ],
    }
  );

  Registryuser.remoteMethod('unblock',
    {
      http: { path: '/:id/unblock', verb: 'post' },
      accepts: [
        { arg: 'id', type: 'number', required: 'true' },
      ],
    }
  );
}
