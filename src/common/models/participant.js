import Promise from 'bluebird';
import app from '../../server/server';
import loopback from 'loopback';
import _ from 'lodash';

export default function (Participant) {

  function handleTextSearch(ctx, participantInstance, next) {
    const args = ctx && ctx.args || null;
    if (args) {
      if (args.where && _.isString(args.where)) {
        args.where = JSON.parse(args.where);
      }

      if (args.filter && _.isString(args.filter)) {
        args.filter = JSON.parse(args.filter);
      }

      if (args.where) {
        args.where = constructTextSearchFilters(args.where);
      } else if (args.filter && args.filter.where) {
        args.filter.where = constructTextSearchFilters(args.filter.where);
      }
    }

    next();

    function nameQuery(string, string2) {
      const stripRegex = function(s) {
        // Remove all charactes except alphabets (with umlauts and accents), numbers and dash
        return s.replace(/[^A-zÀ-úÀ-ÿ0-9-]/ig, '');
      };
      const array = new Array();
      array.push({ firstName: { regexp: `/${stripRegex(string)}/i` } });
      array.push({ lastName: { regexp: `/${stripRegex(string2)}/i` } });
      return array;
    }

    function constructTextSearchArray(string) {

      const or = nameQuery(string, string);

      if (_.isInteger(parseInt(string))) {
        or.push({ memberNumber: parseInt(string) });
      }

      const splitted = string.split(' ', 2);

      if (splitted.length === 2) {
        or.push({ and: nameQuery(splitted[0], splitted[1]) });
        or.push({ and: nameQuery(splitted[1], splitted[0]) });
      }

      return or;
    }

    function constructTextSearchFilters(where) {

      if (_.isString(where)) {
        where = JSON.parse(where);
      }

      // if multiple filters
      if (where['and'] && where['and'].length > 0) {

        where['and'].map((value, index, ar) => {
          if (value.textSearch && value.textSearch.length > 0) {
            const name = {};
            name.or = constructTextSearchArray(value.textSearch);

            where['and'].splice(index,1);
            where['and'].push(name);
          }
        });

      } else if (where.textSearch && where.textSearch.length > 0) {

        const textSearchString = where.textSearch;

        delete where.textSearch;
        where.or = constructTextSearchArray(textSearchString);

      }

      return (where.length > 0 ? JSON.stringify(where) : where);
    }
  }

  Participant.afterRemote('create', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, participantInstance.participantId, 'add')
    .asCallback(next);
  });

  Participant.beforeRemote('findById', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, ctx.req.params.id, 'find')
    .asCallback(next);
  });

  Participant.beforeRemote('prototype.updateAttributes', (ctx, participantInstance, next) => {
    const userId = ctx.req.accessToken ? ctx.req.accessToken.userId : 0;
    app.models.AuditEvent.createEvent.Participant(userId, ctx.req.params.id, 'update')
    .asCallback(next);
  });

  Participant.beforeRemote('find', handleTextSearch);

  Participant.beforeRemote('count', handleTextSearch);

  Participant.observe('before delete', (ctx, next) => {
    const findParticipant = Promise.promisify(app.models.Participant.find, { context: app.models.Participant });
    if (ctx.instance) {
      const userId = loopback.getCurrentContext() ? loopback.getCurrentContext().get('accessToken').userId : 0;
      app.models.AuditEvent.createEvent.Participant(userId, ctx.instance.participantId, 'delete')
      .asCallback(next);
    } else {
      findParticipant({ where: ctx.where, fields: { participantId: true } })
        .each(participant => {
          const userId = (loopback.getCurrentContext() && loopback.getCurrentContext().get('accessToken')) ? loopback.getCurrentContext().get('accessToken').userId : 0;
          return app.models.AuditEvent.createEvent.Participant(userId, participant.participantId, 'delete');
        }).asCallback(next);
    }
  });

  Participant.observe('before save', (ctx, next) => {
    const PresenceHistory = app.models.PresenceHistory;

    let data;

    if (ctx.instance) {
      data = ctx.instance;
    } else {
      data = ctx.data;
    }

    const getParticipantById = Promise.promisify(Participant.findById, { context: Participant });
    const createPresenceHistory = Promise.promisify(PresenceHistory.create, { context: PresenceHistory });

    getParticipantById(data.participantId)
      .then( currentParticipant => {
        if ( currentParticipant != null && currentParticipant.presence != data.presence ) {
          return createPresenceHistory({ participantId: data.participantId, presence: data.presence, timestamp: new Date() });
        }
      }).asCallback(next);
  });

  Participant.massAssignField = (ids, fieldName, newValue, callback) => {
    Participant.findByIds(ids).then(rows => {
      const updates = _.map(rows, row => {
        row[fieldName] = newValue;
        return row.save();
      });
      Promise.all(updates).nodeify(callback);
    });
    // todo: white list fields that can be changed
  };

  Participant.remoteMethod('massAssignField',
    {
      http: { path: '/update', verb: 'post' },
      accepts: [
        { arg: 'ids', type: 'array', required: 'true' },
        { arg: 'fieldName', type: 'string', required: 'true' },
        { arg: 'newValue', type: 'string', required: 'true' },
      ],
      returns: { arg: 'result', type: 'string' },
    }
  );
}
