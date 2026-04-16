import { createReducer, on } from "@ngrx/store";
import { initialTabState, UCCTabsState } from "../state/ucctabs.state";
import * as UCCTabsActions from '../actions/ucctabs.action';
export const ucctabsReducer = createReducer(
  initialTabState,

  on(UCCTabsActions.goToTab, (state : UCCTabsState, { tabIndex }) => {
    console.log('[Reducer] goToTab → Incoming index:', tabIndex);
    console.log('[Reducer] Previous state:', state);

    const newState = {
      ...state,
      currentTab: tabIndex,
      visitedTabs: [...new Set([...state.visitedTabs, tabIndex])]
    };

    console.log('[Reducer] New state after goToTab:', newState);

    return newState;
  }),

  on(UCCTabsActions.nextTab, (state : UCCTabsState) => {
    const next = state.currentTab + 1;

    console.log('[Reducer] nextTab → Current:', state.currentTab, 'Next:', next);
    console.log('[Reducer] Previous state:', state);

    const newState = {
      ...state,
      currentTab: next,
      visitedTabs: [...new Set([...state.visitedTabs, next])]
    };

    console.log('[Reducer] New state after nextTab:', newState);

    return newState;
  }),

  on(UCCTabsActions.previousTab, (state : UCCTabsState) => {
    const prev = state.currentTab > 0 ? state.currentTab - 1 : 0;

    console.log('[Reducer] previousTab → Current:', state.currentTab, 'Prev:', prev);
    console.log('[Reducer] Previous state:', state);

    const newState = {
      ...state,
      currentTab: prev
    };

    console.log('[Reducer] New state after previousTab:', newState);

    return newState;
  }),

  on(UCCTabsActions.setEditMode, (state: UCCTabsState, { isEditMode, editData }) => {
    console.log('[Reducer] setEditMode → isEditMode:', isEditMode);
    console.log('[Reducer] setEditMode → editData:', editData);

    return {
      ...state,
      isEditMode,
      editData
    };
  }),

  on(UCCTabsActions.resetEditMode, (state: UCCTabsState) => {
    console.log('[Reducer] resetEditMode');

    return {
      ...state,
      isEditMode: false,
      editData: null
    };
  }),

  on(UCCTabsActions.setRegistrationData, (state: UCCTabsState, { registrationData }) => {
    console.log('[Reducer] setRegistrationData:', registrationData);
    return {
      ...state,
      registrationData
    };
  }),

  on(UCCTabsActions.setSelectedMemberData, (state: UCCTabsState, { selectedMemberData }) => {
    console.log('[Reducer] setSelectedMemberData:', selectedMemberData);
    return {
      ...state,
      selectedMemberData
    };
  })
);