export function getParticipantActions(alt, participantResource, errorActions) {
  class ParticipantActions {
    fetchParticipantById(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId, `filter=${JSON.stringify({ include: [ { presenceHistory: 'author' }, 'allergies', 'dates', 'selections' ] })}` )
          .then(participant => this.updateParticipantById(participant))
          .catch(err =>errorActions.error(err, 'Osallistujan tietojen lataaminen epäonnistui'));
      };
    }

    updateParticipantById(participant) {
      return participant;
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
        include: ['dates'],
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
          }, err => errorActions.error(err, 'Osallistujia ei voitu ladata'));
      };
    }

    participantListUpdated(participants, newCount) {
      return {
        participants: participants,
        newCount: newCount,
      };
    }

    updateParticipantPresences(ids, newValue, offset, limit, order, filter) {
      return dispatch => {
        dispatch();
        participantResource.raw('post', 'massAssign', { body: { ids: ids, newValue: newValue, fieldName: 'presence' } })
          .then(response => this.loadParticipantList(offset, limit, order, filter),
                err => errorActions.error(err, 'Osallistujien tilan päivitys epäonnistui'));
      };
    }

    updateProperty(participantId, property, value) {
      return dispatch => {
        dispatch();
        participantResource.raw('post', 'massAssign', {
          body: { ids: [ participantId ], fieldName: property, newValue: value } })
          .then(participants => {
            if (property === 'presence') {
              this.fetchParticipantByIdWithPresenceHistory(participants[0].participantId);
            }
            this.participantPropertyUpdated(property, participants);
          }, err => errorActions.error(err, 'Osallistujan tallennus epäonnistui'));
      };
    }

    participantPropertyUpdated(property, participants) {
      return {
        property: property,
        newValue: participants[0][property],
      };
    }

    fetchParticipantByIdWithPresenceHistory(participantId) {
      return dispatch => {
        dispatch();
        participantResource.findById(participantId, `filter=${JSON.stringify({ include: { presenceHistory: 'author' } })}`)
        .then(participant => this.participantPresenceHistoryUpdated(participant),
              err => errorActions.error(err, 'Osallistujan tietojen lataaminen epäonnistui.'));
      };
    }

    participantPresenceHistoryUpdated(participant) {
      return participant;
    }
  }

  return alt.createActions(ParticipantActions);
}
