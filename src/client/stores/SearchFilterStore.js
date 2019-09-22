export function getSearchFilterStore(alt, SearchFilterActions) {
  class SearchFilterStore  {
    constructor() {
      this.options = { };
      this.dates = [];

      this.bindListeners({
        handleOptionsLoaded: SearchFilterActions.OPTIONS_LOADED,
        handleDateOptionsLoaded: SearchFilterActions.DATE_OPTIONS_LOADED,
      });
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
