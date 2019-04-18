import { actionCreator } from '../redux-helpers';
// Tämä tiedosto kokoaa kaikki actions-kansion tiedostot yhteen moduuliin

export const DISPLAY_ERROR = 'DISPLAY_ERROR';
/** { error?: any, message: string } */
export const displayError = actionCreator(DISPLAY_ERROR);

export const CONFIRM_ERROR = 'CONFIRM_ERROR';
/** no payload */
export const confirmError = actionCreator(CONFIRM_ERROR);

/** no payload */
export const LOAD_FLASHES = 'LOAD_FLASHES';
export const loadFlashes = actionCreator(LOAD_FLASHES);

export const RESET_ALL_DATA = 'RESET_ALL_DATA';
/** no payload */
export const resetAllData = actionCreator(RESET_ALL_DATA);

export const LOAD_REGISTRY_USER_LIST = 'LOAD_REGISTRY_USER_LIST';
/** no payload */
export const loadRegistryUserList = actionCreator(LOAD_REGISTRY_USER_LIST);

export const REGISTRY_USER_LIST_UPDATED = 'REGISTRY_USER_LIST_UPDATED';
/** RegistryUser[] */
export const registryUserListUpdated = actionCreator(REGISTRY_USER_LIST_UPDATED);

export const UPDATE_LOGIN_STATUS = 'UPDATE_LOGIN_STATUS';
/** { loggedIn: boolean } */
export const updateLoginStatus = actionCreator(UPDATE_LOGIN_STATUS);

export const LOAD_CURRENT_USER = 'LOAD_CURRENT_USER';
/** no payload */
export const loadCurrentUser = actionCreator(LOAD_CURRENT_USER);

export const CURRENT_USER_UPDATED = 'CURRENT_USER_UPDATED';
/** RegistryUser | null */
export const currentUserUpdated = actionCreator(CURRENT_USER_UPDATED);

export const LOGIN_OFFLINE = 'LOGIN_OFFLINE';
/** { email: string, password: string } */
export const loginOffline = actionCreator(LOGIN_OFFLINE);

export const LOGIN_OFFLINE_SUCCESS = 'LOGIN_OFFLINE_SUCCESS';
/** no payload */
export const loginOfflineSuccess = actionCreator(LOGIN_OFFLINE_SUCCESS);

export const LOGIN_OFFLINE_FAILED = 'LOGIN_OFFLINE_FAILED';
/** any (error) */
export const loginOfflineFailed = actionCreator(LOGIN_OFFLINE_FAILED);

export const OFFLINE_LOGIN_NOT_ENABLED = 'OFFLINE_LOGIN_NOT_ENABLED';
/** no payload */
export const offlineLoginNotEnabled = actionCreator(OFFLINE_LOGIN_NOT_ENABLED);

export const LOGOUT_CURRENT_USER = 'LOGOUT_CURRENT_USER';
/** no payload */
export const logoutCurrentUser = actionCreator(LOGOUT_CURRENT_USER);

export const CURRENT_USER_LOGGED_OUT = 'CURRENT_USER_LOGGED_OUT';
/** no payload */
export const currentUserLoggedOut = actionCreator(CURRENT_USER_LOGGED_OUT);

export const BLOCK_USER = 'BLOCK_USER';
/** { userId: string } */
export const blockUser = actionCreator(BLOCK_USER);

export const UNBLOCK_USER = 'UNBLOCK_USER';
/** { userId: string } */
export const unblockUser = actionCreator(UNBLOCK_USER);

export const FETCH_PARTICIPANT_BY_ID = 'FETCH_PARTICIPANT_BY_ID';
/** { participantId: string } */
export const fetchParticipantById = actionCreator(FETCH_PARTICIPANT_BY_ID);

export const UPDATE_PARTICIPANT_BY_ID = 'UPDATE_PARTICIPANT_BY_ID';
/** no payload */
export const updateParticipantById = actionCreator(UPDATE_PARTICIPANT_BY_ID);

export const LOAD_PARTICIPANT_LIST = 'LOAD_PARTICIPANT_LIST';
/** no payload */
export const loadParticipantList = actionCreator(LOAD_PARTICIPANT_LIST);

export const PARTICIPANT_LIST_UPDATED = 'PARTICIPANT_LIST_UPDATED';
/** no payload */
export const participantListUpdated = actionCreator(PARTICIPANT_LIST_UPDATED);

export const UPDATE_PARTICIPANT_PRESENCES = 'UPDATE_PARTICIPANT_PRESENCES';
/** { ids: string[], newValue: string, offset: number, limit: number, order: string, filter: string } */
export const updateParticipantPresences = actionCreator(UPDATE_PARTICIPANT_PRESENCES);

export const UPDATE_PARTICIPANT_PROPERTY = 'UPDATE_PARTICIPANT_PROPERTY';
/** { participantId: string, property: string, newValue: any } */
export const updateParticipantProperty = actionCreator(UPDATE_PARTICIPANT_PROPERTY);

export const UPDATE_PARTICIPANT_PROPERTY_SUCCESS = 'UPDATE_PARTICIPANT_PROPERTY_SUCCESS';
/** { property string, participants: [Participant} } */
export const updateParticipatPropertySuccess = actionCreator(UPDATE_PARTICIPANT_PROPERTY_SUCCESS);

export const UPDATE_PARTICIPANT_PROPERTY_FAIL = 'UPDATE_PARTICIPANT_PROPERTY_FAIL';
/** { property string, error: any } */
export const updateParticipatPropertyFail = actionCreator(UPDATE_PARTICIPANT_PROPERTY_FAIL);

export const PARTICIPANT_PROPERTY_UPDATED = 'PARTICIPANT_PROPERTY_UPDATED';
/** no payload */
export const participantPropertyUpdated = actionCreator(PARTICIPANT_PROPERTY_UPDATED);

export const PARTICIPANT_PRESENCE_HISTORY_UPDATED = 'PARTICIPANT_PRESENCE_HISTORY_UPDATED';
/** no payload */
export const participantPresenceHistoryUpdated = actionCreator(PARTICIPANT_PRESENCE_HISTORY_UPDATED);

export const SET_CURRENT_CAMP_OFFICE_NOTES = 'SET_CURRENT_CAMP_OFFICE_NOTES';
/** string */
export const setCurrentCampOfficeNotes = actionCreator(SET_CURRENT_CAMP_OFFICE_NOTES);

export const SET_CURRENT_EDITABLE_INFO = 'SET_CURRENT_EDITABLE_INFO';
/** string */
export const setCurrentEditableInfo = actionCreator(SET_CURRENT_EDITABLE_INFO);

export const SET_PARTICIPANT_DETAILS_SELECTED_PRESENCE = 'SET_PARTICIPANT_DETAILS_SELECTED_PRESENCE';
/** 'null' | '1' | '2' | '3' */
export const setParticipantDetailsSelectedPresence = actionCreator(SET_PARTICIPANT_DETAILS_SELECTED_PRESENCE);

export const SET_PARTICIPANT_LIST_SELECTED_PRESENCE = 'SET_PARTICIPANT_LIST_SELECTED_PRESENCE';
/** 'null' | '1' | '2' | '3' */
export const setParticipantListSelectedPresence = actionCreator(SET_PARTICIPANT_LIST_SELECTED_PRESENCE);

export const SET_PARTICIPANT_LIST_FILTER = 'SET_PARTICIPANT_LIST_FILTER';
/** { filter: json-string, order: json-string, offset: number, limit: number } */
export const setParticipantListFilter = actionCreator(SET_PARTICIPANT_LIST_FILTER);

export const SEARCH_FILTER_LIST_UPDATED = 'SEARCH_FILTER_LIST_UPDATED';
/** SearchFilter[] */
export const searchFilterListUpdated = actionCreator(SEARCH_FILTER_LIST_UPDATED);

export const OPTIONS_LOADED = 'OPTIONS_LOADED';
/** Options */
export const optionsLoaded = actionCreator(OPTIONS_LOADED);

export const DATE_OPTIONS_LOADED = 'DATE_OPTIONS_LOADED';
/** DateOption[] */
export const dateOptionsLoaded = actionCreator(DATE_OPTIONS_LOADED);

export const SAVE_SEARCH_FILTER = 'SAVE_SEARCH_FILTER';
/** */
export const saveSearchFilter = actionCreator(SAVE_SEARCH_FILTER);

export const DELETE_SEARCH_FILTER = 'DELETE_SEARCH_FILTER';
/** */
export const deleteSearchFilter = actionCreator(DELETE_SEARCH_FILTER);

export const LOAD_OPTIONS = 'LOAD_OPTIONS';
/** */
export const loadOptions = actionCreator(LOAD_OPTIONS);

export const LOAD_DATE_OPTIONS = 'LOAD_DATE_OPTIONS';
/** */
export const loadDateOptions = actionCreator(LOAD_DATE_OPTIONS);

export const LOAD_SEARCH_FILTER_LIST = 'LOAD_SEARCH_FILTER_LIST';
/** */
export const loadSearchFilterList = actionCreator(LOAD_SEARCH_FILTER_LIST);

export const UPDATE_PROPERTY = 'UPDATE_PROPERTY';
/** { participantId: string, property: string, newValue: any } */
export const updateProperty = actionCreator(UPDATE_PROPERTY);

export const UPDATE_PROPERTY_SUCCESS = 'UPDATE_PROPERTY_SUCCESS';
export const updatePropertySuccess = actionCreator(UPDATE_PROPERTY_SUCCESS);

export const UPDATE_PROPERTY_FAIL = 'UPDATE_PROPERTY_FAIL';
export const updatePropertyFail = actionCreator(UPDATE_PROPERTY_FAIL);
