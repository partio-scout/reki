import { Cmd } from 'redux-loop';
import { createReducer, staticCmd, actionCmd } from '../redux-helpers';
import * as actions from '../actions';
import { defaultOpts } from '../fetch';

function getRootCause(error) {
  if (!error) {
    return null;
  }
  if (error.status === 401) {
    return 'Ei käyttöoikeutta';
  } else if (error.status === 503) {
    return 'Järjestelmää huolletaan';
  }
  return null;
}

export const errorReducer = createReducer({
  [actions.DISPLAY_ERROR]: (state, action) => ({
    errors: state.errors.concat({
      error: action.payload.error,
      message: action.payload.message,
      rootCause: getRootCause(action.payload.error),
    }),
  }),

  [actions.CONFIRM_ERROR]: state => ({ errors: state.errors.slice(1) }),

  [actions.LOAD_FLASHES]: staticCmd(Cmd.run(
    () => fetch('/flashes', defaultOpts).then(response => response.ok ? response.json() : []),
    {
      successActionCreator: actions.loadFlashesSuccess,
    })),

  [actions.LOAD_FLASHES_SUCCESS]: actionCmd(action => Cmd.list(
    (action.payload || []).map(errorMessage => Cmd.action(actions.displayError(null, errorMessage)))
    )),
}, { errors: [] });
