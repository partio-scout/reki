import { actionCreator } from '../redux-helpers';

export const NAVIGATE_TO_HOME = 'NAVIGATE_TO_HOME';
export const NAVIGATE_TO_PARTICIPANTS_LIST = 'NAVIGATE_TO_PARTICIPANTS_LIST';
export const NAVIGATE_TO_PARTICIPANT_DETAILS = 'NAVIGATE_TO_PARTICIPANT_DETAILS';
export const NAVIGATE_TO_LOGIN = 'NAVIGATE_TO_LOGIN';
export const NAVIGATE_TO_ADMIN = 'NAVIGATE_TO_ADMIN';

export const navigateToHome = actionCreator(NAVIGATE_TO_HOME);
export const navigateToParticipantsList = actionCreator(NAVIGATE_TO_PARTICIPANTS_LIST);
export const navigateToParticipantDetails = actionCreator(NAVIGATE_TO_PARTICIPANT_DETAILS);
export const navigateToLogin = actionCreator(NAVIGATE_TO_LOGIN);
export const navigateToAdmin = actionCreator(NAVIGATE_TO_ADMIN);
