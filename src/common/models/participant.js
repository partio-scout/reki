import Promise from 'bluebird';
import app from '../../server/server';

export default function (Participant) {
  Participant.afterInitalize = function() {
    if (this.inCamp == false) {
      const presenceHistoryRelation = this.presenceHistory;
      const create = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
      create( { departed: null } )
        .then(result => result.participant(this))
        .catch(err => err)
    }
  }
  Participant.afterUpdate = function(next) {
    const presenceHistoryRelation = this.presenceHistory;
    const presenceHistory = Promise.promisify(this.presenceHistory, { context: this } );
    if (this.inCamp == 2) {
      const updateAll = Promise.promisify(app.models.participantHistory.updateAll, { context: app.models.participantHistory } );
      //check if latest relation doesn't have arrived value set
      presenceHistory( { fields: { id:true, departed:false, arrived:false },  where: { arrived:null } } )
        .then(result =>
          updateAll( { where: { id: { inq: result.map( id => id.id ) } } } , { arrived:new Date().toISOString() } )
            .catch(err => err)
        )
        .catch(err => err);
    } else if (this.inCamp == 0 || this.inCamp == 1) {
      const create = Promise.promisify(presenceHistoryRelation.create, { context: presenceHistoryRelation } );
			//check if latest relation has arrived value set
      presenceHistory( { fields: { id:true, departed:false, arrived:false } , where: { arrived:null } } )
        .then(result => {
          if (result.length() == 0 ) {
            return create( { departed: new Date().toISOString() } )
              .then(result => result.participant(this))
              .catch(err => err);
          }
        })
      .catch(err => err);
    }
    next();
  };
}
