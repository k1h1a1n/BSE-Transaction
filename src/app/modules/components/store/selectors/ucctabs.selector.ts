import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UCCTabsState } from "../state/ucctabs.state";

export const selectUcctabsState = createFeatureSelector<UCCTabsState>('ucctabs');

export const selectCurrentTab = createSelector(
    selectUcctabsState,
    (state: UCCTabsState) => state.currentTab
);
export const selectVisitedTabs = createSelector(
    selectUcctabsState,
    (state: UCCTabsState) => state.visitedTabs
);
export const selectIsEditMode = createSelector(
    selectUcctabsState,
    (state: UCCTabsState) => state.isEditMode
);
export const selectEditData = createSelector(
    selectUcctabsState,
    (state: UCCTabsState) => state.editData
);