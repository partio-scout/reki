import app from '../../server/server.js';
import Promise from 'bluebird';
import loopback from 'loopback';

export default function (Participant) {
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

  Participant.beforeRemote('find', (ctx, participantInstance, next) => {

    function constructTextSearchArray(string) {
      const or = new Array();

      or.push({ firstName: { like: `%${string}%` } });
      or.push({ lastName: { like: `%${string}%` } });
      or.push({ memberNumber: parseInt(string) });

      const splitted = string.split(' ', 2);

      if (splitted.length > 1) {

        let and = new Array();
        and.push({ firstName: { like: `%${splitted[0]}%` } });
        and.push({ lastName: { like: `%${splitted[1]}%` } });

        or.push({ and });

        and = new Array();
        and.push({ firstName: { like: `%${splitted[1]}%` } });
        and.push({ lastName: { like: `%${splitted[0]}%` } });

        or.push({ and });

      }

      return or;
    }

    const filter = JSON.parse(ctx.args.filter);

    // if multiple filters
    if (filter.where['and'] != undefined) {

      filter.where['and'].map((value, index, ar) => {
        if (value.textSearch != undefined && value.textSearch.length > 0) {
          const name = {};
          name.or = constructTextSearchArray(value.textSearch);

          filter.where['and'].splice(index,1);
          filter.where['and'].push(name);
        }
      });

    } else if (filter.where.textSearch != undefined && filter.where.textSearch.length > 0) {

      const textSearchString = filter.where.textSearch;

      delete filter.where.textSearch;

      filter.where.or = constructTextSearchArray(textSearchString);
    }

    ctx.args.filter = JSON.stringify(filter);

    next();
  });


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
