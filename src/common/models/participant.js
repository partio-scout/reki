import Promise from 'bluebird';
import app from '../../server/server';

export default function (Participant) {
  Participant.observe('after save', (ctx, next) => {

    const ParticipantHistory = app.models.ParticipantHistory;
    const updateAllPresence = Promise.promisify(ParticipantHistory.updateAll, { context: ParticipantHistory } );
    if (ctx.instance) {
      const participant = ctx.instance;
      const presenceHistoryRelation = participant.presenceHistory;
      const createPresence = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
      const isInCamp = 2;
      const leftCampTemporarily = 1;
      const notInCamp = 0;
      participant.presenceHistory( { fields: { id:true, departed:false, arrived:false } } )
        .then(result => {
          const presence = result.filter(presence => presence.arrived == null);
          if (participant.inCamp == isInCamp && presence.length == 1) {
            return updateAllPresence( { where: { id: { inq: presence.map( id => id.id ) } } } , { arrived:new Date().toISOString() } );
          } else if (participant.inCamp == notInCamp || participant.inCamp == leftCampTemporarily) {
            if (presence.length == 0 ) {
              return createPresence( { departed: new Date().toISOString() } )
                .then(result => result.participant(participant));
            }
          }
        }).then(next);
    } else {
      const Participant = app.models.Participant;
      const findParticipant = Promise.promisify(Participant.find, { context: Participant } );
      const findPresence = Promise.promisify(ParticipantHistory.find, { context: ParticipantHistory } );
      const isInCamp = 2;
      const leftCampTemporarily = 1;
      const notInCamp = 0;
      findParticipant( ctx.where ).then(participants => {
        participants.forEach( (participant, index, array) => {
          const presenceHistoryRelation = participant.presenceHistory;
          const createPresence = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
          findPresence( { where:{ participantId: participant.participantId } } ).then( result => {
            const presence = result.filter(presence => presence.arrived == null);
            if (participant.inCamp == isInCamp) {
              return updateAllPresence( { id: { inq: presence.map( id => id.id ) } }  , { arrived:new Date().toISOString() } );
            } else if (participant.inCamp == notInCamp || participant.inCamp == leftCampTemporarily) {
              if (presence.length == 0 ) {
                return createPresence( { departed: new Date().toISOString() } )
                  .then(presence => presence.participant(participant));
              }
            }
          });
        });
      }).then(next);
    }
  });
}
