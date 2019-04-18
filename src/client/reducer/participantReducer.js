import { loop, Cmd } from 'redux-loop';
import { createReducer, always, actionCmd, payloadToStateProp } from '../redux-helpers';
import * as actions from '../actions';
import * as navigationActions from '../navigation/actions';

const initialState = {
  participants: undefined,
  participantDetails: undefined,
  participantCount: undefined,
  localGroups: [''],
  campGroups: [''],
  loading: false,
  participantDetailsParticipantId: null,
  participantDetailsCurrentEditableInfo: '',
  participantDetailsCurrentCampOfficeNotes: '',
  participantDetailsSelectedPresence: 'null',
  participantListSelectedPresence: 'null',
  participantListFilter: null,
  participantListOrder: null,
  participantListOffset: null,
  participantListLimit: null,
  saving: {
    presence: false,
    editableInfo: false,
    campOfficeNotes: false,
  },
};

export const errorActionCreator = message => error => actions.displayError({ error, message });

const handleLoadParticipantList = participantResource => (state, action) => {
  const { offset, limit, order, filter } = action.payload;

  function getLoopbackOrderParameter() {
    if (!order) {
      return undefined;
    }

    const strings = Object.keys(order).map(key => `${key} ${order[key]}`);
    if (strings.length === 0) {
      return undefined;
    } else if (strings.length === 1) {
      return strings[0];
    } else {
      return strings;
    }
  }

  const filters = {
    where: filter,
    skip: offset,
    limit: limit,
    order: getLoopbackOrderParameter(),
    include: ['dates'],
  };

  const filterString = new URLSearchParams({ filter: JSON.stringify(filters) }).toString();

  const immediateNewState = { loading: true, participantCount: undefined };

  if (!filter || Object.keys(filter).length === 0) {
    return loop(immediateNewState, Cmd.action(actions.participantListUpdated({ participants: [], newCount: 0 })));
  }

  return loop(immediateNewState, Cmd.run(
    () => participantResource.findAll(filterString),
    {
      successActionCreator: participantList => actions.participantListUpdated({ participants: participantList.result, newCount: participantList.count }),
      failActionCreator: errorActionCreator('Osallistujia ei voitu ladata'),
    },
  ));
};

const setSaving = (property, value, state) => Object.assign({}, state, { saving: Object.assign({}, state.saving, { [property]: value }) });

export const createParticipantReducer = participantResource => createReducer({
  [actions.RESET_ALL_DATA]: always(initialState),

  [actions.FETCH_PARTICIPANT_BY_ID]: (state, action) => loop({ participantDetails: undefined, saving: { campOfficeNotes: false, editableInfo: false, presence: false }  }, Cmd.run(
    () => participantResource.findById(action.payload.participantId, new URLSearchParams({ filter: JSON.stringify({ include: [ { presenceHistory: 'author' }, 'allergies', 'dates', 'selections' ] }) }).toString()),
    {
      successActionCreator: actions.updateParticipantById,
      failureActionCreator: errorActionCreator('Osallistujen tietojen lataaminen epäonnistui.'),
    },
  )),

  [actions.UPDATE_PARTICIPANT_BY_ID]: (state, action) => Object.assign({}, state, { participantDetails: action.payload, participantDetailsCurrentEditableInfo: action.payload.editableInfo, participantDetailsCurrentCampOfficeNotes: action.payload.campOfficeNotes, participantDetailsSelectedPresence: null }),

  [actions.LOAD_PARTICIPANT_LIST]: handleLoadParticipantList(participantResource),

  [actions.PARTICIPANT_LIST_UPDATED]: (state, action) => ({ loading: false, participants: action.payload.participants, participantCount: action.payload.newCount !== undefined ? action.payload.newCount : state.participantCount }),

  [actions.UPDATE_PARTICIPANT_PRESENCES]: actionCmd(action => {
    const { ids, newValue, offset, limit, order, filter } = action.payload;
    return Cmd.run(
      () => participantResource.raw('post', 'massAssign', { body: { ids: ids, newValue: newValue, fieldName: 'presence' } }),
      {
        successActionCreator: () => actions.loadParticipantList({ ids, newValue, offset, limit, order, filter }),
        failActionCreator: errorActionCreator('Osallistujan tilan päivitys epäonnistui'),
      },
    );
  }),

  [actions.UPDATE_PROPERTY]: (state, action) => {
    const { participantId, property, newValue } = action.payload;
    return loop(setSaving(property, true, state), Cmd.run(
      () => participantResource.raw('post', 'massAssign', { body: { ids: [ participantId ], fieldName: property, newValue } }),
      {
        successActionCreator: participants => actions.updatePropertySuccess({ property, participants }),
        failActionCreator: error => actions.updatePropertyFail({ property, error }),
      },
    ));
  },

  [actions.UPDATE_PROPERTY_SUCCESS]: (state, action) => loop(setSaving(action.payload.property, false, state), Cmd.list([
    action.payload.property === 'presence' ? Cmd.action(actions.fetchParticipantById({ participantId: action.payload.participants[0].participantId })) : Cmd.none,
    Cmd.action(actions.participantPropertyUpdated({ property: action.payload.property, newValue: action.payload.participants[0][action.payload.property] })),
  ])),

  [actions.UPDATE_PROPERTY_FAIL]: (state, action) => loop(setSaving(action.payload.property, false, state), Cmd.action(errorActionCreator('Osallistujan tallennus epäonnistui')(action.payload.error))),

  [actions.PARTICIPANT_PROPERTY_UPDATED]: (state, action) => ({ participantDetails: Object.assign({}, state.participantDetails, { [action.payload.property]: action.payload.newValue }) }),

  [actions.FETCH_PARTICIPANT_BY_ID_WITH_PRESENCE_HISTORY]: actionCmd(action => Cmd.run(
    () => participantResource.findById(action.payload.participantId, new URLSearchParams({ filter: JSON.stringify({ include: { presenceHistory: 'author' } }) })),
    {
      successActionCreator: actions.participantPresenceHistoryUpdated,
      failActionCreator: errorActionCreator('Osallistujan tietojen lataaminen epäonnistui'),
    },
  )),

  [actions.PARTICIPANT_PRESENCE_HISTORY_UPDATED]: (state, action) => ({ participantDetails: Object.assign({}, state.participantDetails, { presenceHistory: action.payload.presenceHistory }) }),

  [actions.SET_CURRENT_CAMP_OFFICE_NOTES]: payloadToStateProp('participantDetailsCurrentCampOfficeNotes'),

  [actions.SET_CURRENT_EDITABLE_INFO]: payloadToStateProp('participantDetailsCurrentEditableInfo'),

  [actions.SET_PARTICIPANT_DETAILS_SELECTED_PRESENCE]: payloadToStateProp('participantDetailsSelectedPresence'),
  [actions.SET_PARTICIPANT_LIST_SELECTED_PRESENCE]: payloadToStateProp('participantListSelectedPresence'),
  [actions.SET_PARTICIPANT_LIST_FILTER]: (state, action) => loop(state, Cmd.action(navigationActions.navigateToParticipantsList(cleanupQuery(mergeQueryWithState(state, action.payload))))),
  [navigationActions.NAVIGATE_TO_PARTICIPANTS_LIST]: (state, action) => loop(filterToState(getQuery(action)), Cmd.action(actions.loadParticipantList(prepareQueryForNetwork(getQuery(action))))),
  [navigationActions.NAVIGATE_TO_PARTICIPANT_DETAILS]: (state, action) => loop({ participantDetailsparticipantId: action.payload.participantId }, Cmd.action(actions.fetchParticipantById({ participantId: action.payload.participantId }))),
}, initialState);

function filterToState(filter) {
  return {
    participantListFilter: filter.filter && JSON.parse(filter.filter),
    participantListOrder: filter.order && JSON.parse(filter.order),
    participantListOffset: filter.offset,
    participantListLimit: filter.limit,
  };
}

function prepareQueryForNetwork(filter) {
  return {
    filter: filter.filter && JSON.parse(filter.filter),
    order: filter.order && JSON.parse(filter.order),
    offset: filter.offset,
    limit: filter.limit,
  };
}

function getQuery(action) {
  if (action.payload && action.payload.query) {
    return action.payload.query;
  }
  if (action.meta && action.meta.location && action.meta.location.current) {
    return action.meta.location.current.query || {};
  }

  return {};
}

function mergeQueryWithState(state, query) {
  return {
    filter: query.filter === undefined ? state.participantListFilter : query.filter,
    order: query.order === undefined ? state.participantListOrder : query.order,
    offset: query.offset === undefined ? state.participantListOffset : query.offset,
    limit: query.limit === undefined ? state.participantListLimit : query.limit,
  };
}

function cleanupQuery(query) {
  return {
    query: {
      filter: ifNotDefault(isEmptyObj, query.filter, x => JSON.stringify(x)),
      order: ifNotDefault(isEmptyObj, query.order, x => JSON.stringify(x)),
      offset: ifNotDefault(0, query.offset),
      limit: ifNotDefault(200, query.limit),
    },
  };
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

function isEmptyObj(obj) {
  return Object.keys(obj).length === 0;
}
