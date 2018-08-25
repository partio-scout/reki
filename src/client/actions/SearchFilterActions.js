import _ from 'lodash';

export function getSearchFilterActions(alt, searchFilterResource, participantResource, participantDateResource, optionResource, errorActions) {
  class SearchFilterActions {
    saveSearchFilter(name, filter) {
      return dispatch => {
        dispatch();
        const freeText = filter.textSearch || '';
        const dates = filter.dates || [];
        const fields = _.omit(filter, ['textSearch', 'dates']);
        searchFilterResource.create({ name, freeText, dates, fields })
          .then(response => this.searchFilterSaved(response),
                err => errorActions.error(err, 'Haun tallennus epäonnistui'));
      };
    }

    searchFilterSaved(response) {
      this.loadSearchFilterList();
      return response;
    }

    deleteSearchFilter(id) {
      return dispatch => {
        dispatch();
        searchFilterResource.del(id)
          .then(res => this.searchFilterDeleted(res),
                err => errorActions.error(err, 'Tallennetun haun poisto epäonnistui'));
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
                err => errorActions.error(err, 'Tallennettuja hakuja ei voitu ladata'));
      };
    }

    searchFilterListUpdated(searchFilters) {
      return searchFilters;
    }

    loadOptions() {
      return dispatch => {
        dispatch();
        optionResource.findAll()
          .then(response => this.optionsLoaded(processResults(response)),
                err => errorActions.error(err, 'Hakusuodattimia ei voitu ladata'));
      };

      function processResults(response) {
        //TODO Clean up after a good night's sleep
        const x = {};
        for (let i = 0; i < response.length; i++) {
          const property = response[i].property;
          if (x[property]) {
            x[property].push(response[i].value);
          } else {
            x[property] = [''];
            x[property].push(response[i].value);
          }
        }
        return x;
      }
    }

    loadDateOptions() {
      const processResults = result => _.sortedUniqBy(_.sortBy(result, 'date'), 'date');

      return dispatch => {
        dispatch();
        participantDateResource.findAll()
          .then(response => this.dateOptionsLoaded(processResults(response)),
                err => this.optionsLoadingFailed(err));
      };
    }

    optionsLoaded(options) {
      return options;
    }

    dateOptionsLoaded(options) {
      return options;
    }
  }

  return alt.createActions(SearchFilterActions);
}
