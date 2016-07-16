import _ from 'lodash';

export function getSearchFilterActions(alt, searchFilterResource, participantResource) {
  class SearchFilterActions {
    saveSearchFilter(name, filter) {
      return dispatch => {
        dispatch();
        searchFilterResource.create({ name: name, filter: filter })
          .then(response => this.searchFilterSaved(response),
                err => this.searchFilterActionFailed(err));
      };
    }

    searchFilterSaved(response) {
      this.loadSearchFilterList();
      return response;
    }

    searchFilterActionFailed(err) {
      return err;
    }

    deleteSearchFilter(id) {
      return dispatch => {
        dispatch();
        searchFilterResource.del(id)
          .then(res => this.searchFilterDeleted(res),
                err => this.searchFilterActionFailed(err));
      };
    }

    searchFilterDeleted(res) {
      this.loadSearchFilterList();
      return res;
    }

    loadSearchFilterList() {
      return dispatch => {
        dispatch();
        searchFilterResource.findAll()
          .then(searchFilterList => this.searchFilterListUpdated(searchFilterList),
                err => this.searchFilterActionFailed(err));
      };
    }

    searchFilterListUpdated(searchFilters) {
      return searchFilters;
    }

    loadOptions(property) {
      return dispatch => {
        dispatch();
        participantResource.findAll(`filter[fields][${property}]=true`)
          .then(response => this.optionsLoaded(property, processResults(response)),
                err => this.optionsLoadingFailed(err));
      };

      function processResults(result) {
        const optionStrings = result.map(obj => obj[property]);
        const uniqueStrings = _.uniq(optionStrings);
        uniqueStrings.sort();
        return _.concat([''], uniqueStrings);
      }
    }

    loadDateOptions(property) {
      return dispatch => {
        dispatch();
        participantResource.findAll(`filter[include]=${property}`)
          .then(response => this.optionsLoaded(property, processResults(response)),
                err => this.optionsLoadingFailed(err));
      };

      function processResults(result) {
        const optionValues = result.map(obj => obj[property]);
        const uniqueValues = _.uniqBy(_.flatMap(optionValues), 'date');
        const dates = _.mapValues(_.mapKeys(uniqueValues, 'id'), 'date');
        return dates;
      }
    }

    optionsLoaded(property, options) {
      return {
        property: property,
        options: options,
      };
    }

    optionsLoadingFailed(err) {
      return err;
    }
  }

  return alt.createActions(SearchFilterActions);
}
