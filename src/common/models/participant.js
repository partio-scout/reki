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
