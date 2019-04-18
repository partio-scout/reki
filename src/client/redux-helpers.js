import { loop, isLoop, getModel, getCmd } from 'redux-loop';

function handlePartialState(originalState, partialNewState) {
  if (partialNewState === originalState) {
    return originalState;
  }

  return Object.assign({}, originalState, partialNewState);
}

export const createReducer = (args, initial) => (state = initial, action) => {
  const caseReducer = args[action.type];
  if (!caseReducer) {
    return state;
  }

  const partialNewState = caseReducer(state, action);

  if (isLoop(partialNewState)) {
    return loop(handlePartialState(state, getModel(partialNewState)), getCmd(partialNewState));
  } else {
    return handlePartialState(state, partialNewState);
  }
};

export const createStateMapper = template => state => {
  const result = {};
  for (const key of Object.keys(template)) {
    result[key] = template[key](state);
  }
  return result;
};

export const actionCreator = actionType => payload => ({ type: actionType, payload });

export const payloadToState = (state, action) => action.payload;

export const always = val => () => val;

export const payloadToStateProp = propName => (state, action) => ({ [propName]: action.payload });

export const staticCmd = cmd => state => loop(state, cmd);

export const actionCmd = actionToCmd => (state, action) => loop(state, actionToCmd(action));
