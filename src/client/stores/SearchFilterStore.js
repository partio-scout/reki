export function getSearchFilterStore(alt, SearchFilterActions) {
  class SearchFilterStore  {
    constructor() {
      this.searchFilters = [ ];
      this.options = { };

      this.bindListeners({
        handleSearchFilterListUpdated: SearchFilterActions.SEARCH_FILTER_LIST_UPDATED,
        handleOptionsLoaded: SearchFilterActions.OPTIONS_LOADED,
      });
    }

    handleSearchFilterListUpdated(searchFilters) {
      this.searchFilters = searchFilters;
    }

    handleOptionsLoaded({ property, options }) {
      this.options[property] = options;
    }
  }

  return alt.createStore(SearchFilterStore, 'SearchFilterStore');
}
