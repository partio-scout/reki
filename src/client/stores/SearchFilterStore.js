export function getSearchFilterStore(alt, SearchFilterActions) {
  class SearchFilterStore  {
    constructor() {
      this.searchFilters = [ ];

      this.bindListeners({
        handleSearchFilterListUpdated: SearchFilterActions.SEARCH_FILTER_LIST_UPDATED,
      });
    }

    handleSearchFilterListUpdated(searchFilters) {
      this.searchFilters = searchFilters;
    }
  }

  return alt.createStore(SearchFilterStore, 'SearchFilterStore');
}
