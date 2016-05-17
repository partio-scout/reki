import app from '../../server/server.js';
import Promise from 'bluebird';
import loopback from 'loopback';
import _ from 'lodash';

export default function (Participant) {

  function handleTextSearch(ctx, participantInstance, next) {

    if (ctx.args.where && _.isString(ctx.args.where)) {
      ctx.args.where = JSON.parse(ctx.args.where);
    }

    if (ctx.args.filter && _.isString(ctx.args.filter)) {
      ctx.args.filter = JSON.parse(ctx.args.filter);
    }

    if (ctx.args.where) {
      ctx.args.where = constructTextSearchFilters(ctx.args.where);
    } else if (ctx.args.filter.where) {
      ctx.args.filter.where = constructTextSearchFilters(ctx.args.filter.where);
    }

    next();

    function nameQuery(string, string2) {
      const array = new Array();
      array.push({ firstName: { like: `%${string}%` } });
      array.push({ lastName: { like: `%${string2}%` } });
      return array;
    }

    function constructTextSearchArray(string) {

      const or = nameQuery(string, string);

      if (_.isInteger(parseInt(string))) {
        or.push({ memberNumber: parseInt(string) });
      }

      const splitted = string.split(' ', 2);

      if (splitted.length === 2) {
        or.push(nameQuery(splitted[0], splitted[1]));
        or.push(nameQuery(splitted[1], splitted[0]));
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
}
