export function getParticipantActions(alt, participantResource) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId, `filter=${JSON.stringify({ include: [ { presenceHistory: 'author' }, 'allergies' ] })}` )
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

    loadParticipantList(offset, limit, order, filter, countParticipants) {
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
        count: countParticipants,
      };

      const filterString = `filter=${encodeURIComponent(JSON.stringify(filters))}`;

      return dispatch => {
        dispatch(countParticipants);
        participantResource.findAll(filterString)
          .then(participantList => {
            if (countParticipants) {
              this.participantListUpdated(participantList.result, participantList.count);
            } else {
              this.participantListUpdated(participantList);
            }
          }, err => this.participantListUpdateFailed(err));
      };
    }

    participantListUpdated(participants, newCount) {
      return {
        participants: participants,
        newCount: newCount,
      };
    }

    participantListUpdateFailed(error) {
      return error;
    }

    updateParticipantPresences(ids, newValue, offset, limit, order, filter) {
      participantResource.raw('post', 'massAssign', { body: { ids: ids, newValue: newValue, fieldName: 'presence' } })
        .then(response => this.loadParticipantList(offset, limit, order, filter),
              err => this.participantListUpdateFailed(err));
    }

    updateProperty(participantId, property, value) {
      return dispatch => {
        dispatch();
        participantResource.raw('post', 'massAssign', {
          body: { ids: participantId, fieldName: property, newValue: value } })
          .then(participants => this.participantPropertyUpdated(property, participants),
                err => this.participantUpdateFailed(err));
      };
    }

    participantPropertyUpdated(property, participants) {
      return {
        property: property,
        newValue: participants.result[0][property],
      };
    }

    participantUpdateFailed(err) {
      return err;
    }
  }

  return alt.createActions(ParticipantActions);
}
