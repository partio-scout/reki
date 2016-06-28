import Promise from 'bluebird';
import app from '../../server/server';
import loopback from 'loopback';
import _ from 'lodash';

let createPresence;
let participant;

function alter_presence(presences) {
  const ParticipantHistory = app.models.ParticipantHistory;
  const updateAllPresence = Promise.promisify(ParticipantHistory.updateAll,
                                              { context: ParticipantHistory });
  const notInCamp = 1;
  const leftCampTemporarily = 2;
  const isInCamp = 3;

  const presence = presences.filter(presence => presence.arrived == null)
                            .map(presence => presence.id);
  if (participant.inCamp == isInCamp && presence.length == 1) {
    return updateAllPresence({ id: { inq: presence } },
                             { arrived: new Date().toISOString() });
  } else if (participant.inCamp == notInCamp || participant.inCamp == leftCampTemporarily) {
    if (presence.length == 0 ) {
      return createPresence({ departed: new Date().toISOString() })
            .then(presence => presence.participant(participant));
    }
  }
}

export default function (Participant) {
  Participant.observe('after save', ctx => {
    const ParticipantHistory = app.models.ParticipantHistory;
    if (ctx.instance) {
      participant = ctx.instance;
      const presenceHistoryRelation = participant.presenceHistory;
      createPresence = Promise.promisify(presenceHistoryRelation.create,
                                               { context: presenceHistoryRelation });
      return participant.presenceHistory({ fields: { id:true, departed:false, arrived:false } })
        .then(alter_presence);
    } else {
      const Participant = app.models.Participant;
      const findParticipant = Promise.promisify(Participant.find, { context: Participant } );
      const findPresence = Promise.promisify(ParticipantHistory.find,
                                             { context: ParticipantHistory });
      return findParticipant( ctx.where ).then(participants => Promise.all(_.map(participants, _participant => {
        participant = _participant;
        const presenceHistoryRelation = participant.presenceHistory;
        createPresence = Promise.promisify(presenceHistoryRelation.create,
                                                 { context: presenceHistoryRelation });
        return findPresence({ where: { participantId: participant.participantId } })
          .then(alter_presence);
      }))
      );
    }
  });

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
