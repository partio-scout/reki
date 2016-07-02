import _ from 'lodash';

export function getParticipantActions(alt, participantResource, searchFilterResource) {
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

    saveSearchFilter(name, filter) {
      return dispatch => {
        dispatch();
        searchFilterResource.create({ name: name, filter: filter })
          .then(response => this.SearchFilterSaved(response),
                err => this.saveSearhFilterFailed(err));
      };
    }

    SearchFilterSaved(response) {
      this.loadSearchFilterList();
      return response;
    }

    saveSearhFilterFailed(err) {
      return err;
    }

    loadSearchFilterList() {
      return dispatch => {
        dispatch();
        searchFilterResource.findAll()
          .then(searchFilterList => this.searchFilterListUpdated(searchFilterList),
                err => this.searchFilterListUpdatedFailed(err));
      };
    }

    searchFilterListUpdated(searchFilters) {
      return searchFilters;
    }

    searchFilterListUpdatedFailed(error) {
      return error;
    }
  }

  return alt.createActions(ParticipantActions);
}
