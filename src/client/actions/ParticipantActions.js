export function getParticipantActions(alt, participantResource, errorActions) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId, `filter=${JSON.stringify({ include: { presenceHistory: 'author' } })}` )
          .then(participant => this.updateParticipantById(participant))
          .catch(err =>errorActions.error(err, 'Osallistujan tietojen lataaminen epäonnistui'));
      };
    }

    updateParticipantById(participant) {
      return participant;
    }

    loadParticipantList(offset, limit, order, filter) {
      function getLoopbackOrderParameter() {
        if (!order) {
          return undefined;
        }

        const strings = Object.keys(order).map(key => `${key} ${order[key]}`);
        if (strings.length === 0) {
          return undefined;
        } else if (strings.length === 1) {
          return strings[0];
        } else {
          return strings;
        }
      }

      const filters = {
        where: filter,
        skip: offset,
        limit: limit,
        order: getLoopbackOrderParameter(),
      };

      return dispatch => {
        dispatch();
        participantResource.findAll(`filter=${JSON.stringify(filters)}`)
          .then(participantList => this.participantListUpdated(participantList),
                err => errorActions.error(err, 'Osallitujia ei voitu ladata'));
      };
    }

    participantListUpdated(participants) {
      return participants;
    }

    loadParticipantCount(filter) {
      return dispatch => {
        dispatch();
        participantResource.raw('get', 'count', { filters: `where=${JSON.stringify(filter)}` })
          .then(response => this.participantCountUpdated(response.count),
                err => errorActions.error(err, 'Osallistujien lukumäärän päivitys epäonnistui'));
      };
    }

    participantCountUpdated(newCount) {
      return newCount;
    }

    updateParticipantPresences(ids, newValue, offset, limit, order, filter) {
      participantResource.raw('post', 'massAssign', { body: { ids: ids, newValue: newValue, fieldName: 'presence' } })
        .then(response => this.loadParticipantList(offset, limit, order, filter),
              err => errorActions.error(err, 'Osallistujalistan päivitys epäonnistui'));
    }
  }

  return alt.createActions(ParticipantActions);
}
