import { loop, Cmd } from 'redux-loop';
import { createReducer, actionCmd, staticCmd, payloadToStateProp } from '../redux-helpers';
import * as actions from '../actions';
import _ from 'lodash';

const initialState = {
  searchFilters: [],
  options: {},
  dates: [],
};

const errorActionCreator = message => error => actions.displayError({ error, message });

export const createSearchFilterReducer = (searchFilterResource, optionResource, participantDateResource) => createReducer({
  [actions.LOAD_SEARCH_FILTER_LIST]: staticCmd(Cmd.run(
    () => searchFilterResource.findAll().catch(() => []),
    { successActionCreator: actions.searchFilterListUpdated }
  )),
  [actions.SEARCH_FILTER_LIST_UPDATED]: payloadToStateProp('searchFilters'),

  [actions.SAVE_SEARCH_FILTER]: (state, action) => loop(state, Cmd.run(
    getFullState => searchFilterResource.create({ name: action.payload, filter: getSearchFilter(getFullState()) }),
    {
      args: [Cmd.getState],
      successActionCreator: actions.loadSearchFilterList,
      failActionCreator: errorActionCreator('Haun tallennus epäonnistui'),
    })),
  [actions.DELETE_SEARCH_FILTER]: actionCmd(action => Cmd.run(
    () => searchFilterResource.del(action.payload),
    {
      successActionCreator: actions.loadSearchFilterList,
      failActionCreator: errorActionCreator('Tallennetun haun poisto epäonnistui'),
    })),
  [actions.LOAD_OPTIONS]: actionCmd(action => Cmd.run(
    () => optionResource.findAll(),
    {
      successActionCreator: actions.optionsLoaded,
      failActionCreator: errorActionCreator('Hakusuodattimia ei voitu ladata'),
    })),
  [actions.OPTIONS_LOADED]: (state, action) => ({ options: processReceivedOptions(action.payload) }),
  [actions.LOAD_DATE_OPTIONS]: actionCmd(action => Cmd.run(
    () => participantDateResource.findAll('filter[fields][date]=true'),
    {
      successActionCreator: actions.dateOptionsLoaded,
      failActionCreator: errorActionCreator('Leiripäiviä ei voitu ladata'),
    })),
  [actions.DATE_OPTIONS_LOADED]: (state, action) => ({ dates: processDateOptions(action.payload) }),
}, initialState);

function processReceivedOptions(response) {
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

function processDateOptions(result) {
  return  _.sortedUniqBy(_.sortBy(result, 'date'), 'date');
}

function getSearchFilter(state) {
  return new URLSearchParams([
    ['filter', ifNotDefault(isEmptyObject, state.participants.participantListFilter, x => JSON.stringify(x))],
    ['order', ifNotDefault(isEmptyObject, state.participants.participantListOrder, x => JSON.stringify(x))],
  ].filter(x => x[1])).toString();
}

function ifNotDefault(def, value, transform) {
  if (value === undefined || value === null) {
    return undefined;
  } else if (typeof def === 'function' && def(value) === true) {
    return undefined;
  } else if (value === def) {
    return undefined;
  }

  return transform ? transform(value) : value;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
