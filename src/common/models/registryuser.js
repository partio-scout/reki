import app from '../../server/server.js';
import Promise from 'bluebird';
import crypto from 'crypto';

export default function(Registryuser) {

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
}
