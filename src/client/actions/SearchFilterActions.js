import _ from 'lodash';

export function getSearchFilterActions(alt, searchFilterResource, participantResource, participantDateResource) {
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

    loadDateOptions() {
      const processResults = result => _.sortedUniqBy(_.sortBy(result, 'date'), 'date');

      return dispatch => {
        dispatch();
        participantDateResource.findAll(`filter[fields][date]=true`)
          .then(response => this.optionsLoaded('dates', processResults(response)),
                err => this.optionsLoadingFailed(err));
      };
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
