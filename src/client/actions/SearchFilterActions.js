import _ from 'lodash';

export function getSearchFilterActions(alt, searchFilterResource, participantResource, errorActions) {
  class SearchFilterActions {
    saveSearchFilter(name, filter) {
      return dispatch => {
        dispatch();
        searchFilterResource.create({ name: name, filter: filter })
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

    loadOptions(property) {
      return dispatch => {
        dispatch();
        participantResource.findAll(`filter[fields][${property}]=true`)
          .then(response => this.optionsLoaded(property, processResults(response)),
                err => errorActions.error(err, `Hakusuodatinta ${property} ei voitu ladata`));
      };

      function processResults(result) {
        const optionStrings = result.map(obj => obj[property]);
        const uniqueStrings = _.uniq(optionStrings);
        uniqueStrings.sort();
        return _.concat([''], uniqueStrings);
      }
    }

    optionsLoaded(property, options) {
      return {
        property: property,
        options: options,
      };
    }
  }

  return alt.createActions(SearchFilterActions);
}
