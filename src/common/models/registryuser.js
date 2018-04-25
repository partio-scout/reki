import app from '../../server/server.js';
import Promise from 'bluebird';
import loopback from 'loopback';
import crypto from 'crypto';
import _ from 'lodash';

export default function(Registryuser) {

  Registryuser.disableRemoteMethod('findOne', true);
  Registryuser.disableRemoteMethod('exists', true);
  Registryuser.disableRemoteMethod('count', true);
  Registryuser.disableRemoteMethod('create', true);
  Registryuser.disableRemoteMethod('deleteById', true);
  Registryuser.disableRemoteMethod('update', true);
  Registryuser.disableRemoteMethod('upsert', true);
  Registryuser.disableRemoteMethod('confirm', true);
  Registryuser.disableRemoteMethod('resetPassword', true);

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
    const result = Promise.join(
      updateRegistryUser({ id: userId }, { status: 'blocked', password: newPassword }),
      deleteAccessTokens({ userId: userId })
    );

    if (callback) {
      result.asCallback(callback);
    } else {
      return result;
    }
  };

  Registryuser.unblock = function(userId, callback) {
    const updateRegistryUser = Promise.promisify(app.models.RegistryUser.updateAll, { context: app.models.RegistryUser });

    const result = updateRegistryUser({ id: userId }, { status: null });
    if (callback) {
      result.asCallback(callback);
    } else {
      return result;
    }
  };

  Registryuser.afterRemote('find', (ctx, instance, next) => {
    Promise.try(() => {
      const includePresence = ctx && ctx.result && ctx.req && ctx.req.query && ctx.req.query.includePresence;
      if (includePresence) {
        const findParticipants = Promise.promisify(app.models.Participant.find, { context: app.models.Participant });

        const memberNumbers = ctx.result.map(user => user.memberNumber);

        // To object is an undocumented function of loopback models, which is used here to force the model object into a plain javascript object.
        // Without the call setting a new property on the objects below wouldn't work.
        const keyedUsers = _.keyBy(ctx.result.map(user => user.toObject()), 'memberNumber');

        return findParticipants({ where: { memberNumber: { inq: memberNumbers } } })
          .each(participant => {
            const user = keyedUsers[participant.memberNumber];
            if (user) {
              user.presence = participant.presence;
            }
          })
          .tap(() => ctx.result = _.values(keyedUsers));
      }
    }).asCallback(next);
  });

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
