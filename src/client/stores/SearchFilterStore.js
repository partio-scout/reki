export function getSearchFilterStore(alt, SearchFilterActions) {
  class SearchFilterStore  {
    constructor() {
      this.searchFilters = [ ];
      this.options = { };

      this.bindListeners({
        handleSearchFilterListUpdated: SearchFilterActions.SEARCH_FILTER_LIST_UPDATED,
        handleOptionsLoaded: SearchFilterActions.OPTIONS_LOADED,
        handleDateOptionsLoaded: SearchFilterActions.DATE_OPTIONS_LOADED,
      });
    }

    handleSearchFilterListUpdated(searchFilters) {
      this.searchFilters = searchFilters;
    }

    handleOptionsLoaded(options) {
      this.options = options;
    }

    handleDateOptionsLoaded(dates) {
      this.dates = dates;
    }
  }

  return alt.createStore(SearchFilterStore, 'SearchFilterStore');
}
