import Promise from 'bluebird';
import app from '../../server/server';

export default function (Participant) {
  Participant.afterInitalize = function() {
    if (this.inCamp == false) {
      const presenceHistoryRelation = this.presenceHistory;
      const create = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
      create( { departed: null } )
        .then(result => result.participant(this))
        .catch(err => { console.error('There was an error', err); return;});
    }
  };
  Participant.afterUpdate = function(next) {
    const presenceHistoryRelation = this.presenceHistory;
    const presenceHistory = Promise.promisify(this.presenceHistory, { context: this } );
    const create = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
    const updateAll = Promise.promisify(app.models.participantHistory.updateAll, { context: app.models.participantHistory } );
    const isInCamp = 2;
    const leftCampTemporarily = 1;
    const notInCamp = 0;
      //check if latest relation doesn't have arrived value set
    presenceHistory( { fields: { id:true, departed:false, arrived:false },  where: { arrived:null } } )
      .then(result => {
        if (this.inCamp == isInCamp) {
          return updateAll( { where: { id: { inq: result.map( id => id.id ) } } } , { arrived:new Date().toISOString() } );
        } else if (this.inCamp == notInCamp || this.inCamp == leftCampTemporarily) {
        //check if latest relation has arrived value set
          if (result.length == 0 ) {
            return create( { departed: new Date().toISOString() } )
              .then(result => result.participant(this));
          }
        }
      })
      .asCallback(next);
  };
}
