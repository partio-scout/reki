import _ from 'lodash';

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

    loadLocalGroups() {
      function processResults(result) {
        const localGroupStrings = result.map(obj => obj.localGroup);
        const uniqueStrings = _.uniq(localGroupStrings);
        uniqueStrings.sort();
        return _.concat([''], uniqueStrings);
      }

      return dispatch => {
        dispatch();
        participantResource.findAll('filter[fields][localGroup]=true')
          .then(response => this.localGroupsLoaded(processResults(response)),
                err => this.localGroupLoadingFailed(err));
      };
    }

    localGroupsLoaded(localGroups) {
      return localGroups;
    }

    localGroupLoadingFailed(err) {
      return err;
    }

    loadCampGroups() {
      function processResults(result) {
        const campGroupStrings = result.map(obj => obj.campGroup);
        const uniqueStrings = _.uniq(campGroupStrings);
        uniqueStrings.sort();
        return _.concat([''], uniqueStrings);
      }

      return dispatch => {
        dispatch();
        participantResource.findAll('filter[fields][campGroup]=true')
          .then(response => this.campGroupsLoaded(processResults(response)),
                err => this.campGroupLoadingFailed(err));
      };
    }

    campGroupsLoaded(campGroups) {
      return campGroups;
    }

    campGroupLoadingFailed(err) {
      return err;
    }

    updateParticipantPresences(ids, newValue, offset, limit, order, filter) {
      participantResource.raw('post', 'update', { body: { ids: ids, newValue: newValue, fieldName: 'inCamp' } })
        .then(response => this.loadParticipantList(offset, limit, order, filter),
              err => this.participantListUpdateFailed(err));
    }
  }

  return alt.createActions(ParticipantActions);
}
