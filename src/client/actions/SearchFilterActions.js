import _ from 'lodash';

export function getSearchFilterActions(alt, searchFilterResource, participantResource, participantDateResource, optionResource, errorActions) {
  class SearchFilterActions {
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
        participantDateResource.findAll('filter[fields][date]=true')
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
