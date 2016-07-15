export function getParticipantActions(alt, participantResource) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId, `filter=${JSON.stringify({ include: [ { presenceHistory: 'author' }, 'dates' ] })}` )
          .then(participant => this.updateParticipantById(participant))
          .catch(err => this.loadingParticipantByIdFailed(err));
      };
    }

    updateParticipantById(participant) {
      return participant;
    }

    loadingParticipantByIdFailed(err) {
      return err;
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
                err => this.participantListUpdateFailed(err));
      };
    }

    participantListUpdated(participants) {
      return participants;
    }

    participantListUpdateFailed(error) {
      return error;
    }

    loadParticipantCount(filter) {
      return dispatch => {
        dispatch();
        participantResource.raw('get', 'count', { filters: `where=${JSON.stringify(filter)}` })
          .then(response => this.participantCountUpdated(response.count),
                err => this.participantCountUpdateFailed(err));
      };
    }

    participantCountUpdated(newCount) {
      return newCount;
    }

    participantCountUpdateFailed(err) {
      return err;
    }

    updateParticipantPresences(ids, newValue, offset, limit, order, filter) {
      participantResource.raw('post', 'massAssign', { body: { ids: ids, newValue: newValue, fieldName: 'presence' } })
        .then(response => this.loadParticipantList(offset, limit, order, filter),
              err => this.participantListUpdateFailed(err));
    }
  }

  return alt.createActions(ParticipantActions);
}
