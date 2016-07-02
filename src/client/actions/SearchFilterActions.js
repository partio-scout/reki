export function getSearchFilterActions(alt, searchFilterResource) {
  class SearchFilterActions {
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

    deleteSearchFilter(id) {
      return dispatch => {
        dispatch();
        searchFilterResource.del(id)
          .then(res => this.searchFilterDeleted(res),
                err => this.searchFilterDeletingFailed(err));
      };
    }

    searchFilterDeleted(res) {
      this.loadSearchFilterList();
      return res;
    }

    searchFilterDeletingFailed(err) {
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

  return alt.createActions(SearchFilterActions);
}
