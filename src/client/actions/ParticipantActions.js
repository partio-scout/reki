export function getParticipantActions(alt, participantResource) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId)
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

    loadParticipantList(offset, limit, order) {
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

    changeParticipantListOffset(newOffset) {
      return newOffset;
    }

    changeParticipantListLimit(newLimit) {
      return newLimit;
    }

    changeParticipantListOrder(newOrder) {
      return newOrder;
    }

    loadParticipantCount() {
      return dispatch => {
        dispatch();
        participantResource.raw('get', 'count')
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
  }

  return alt.createActions(ParticipantActions);
}
