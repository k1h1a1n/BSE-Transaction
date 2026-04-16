// ucctabs.state.ts
export interface UCCTabsState {
  currentTab: number;
  visitedTabs: number[];
  isEditMode: boolean;
  editData: any | null;
  registrationData: any | null;
  selectedMemberData: any | null;
}

export const initialTabState: UCCTabsState = {
  currentTab: 0,
  visitedTabs: [0],
  isEditMode: false,
  editData: null,
  registrationData: null,
  selectedMemberData: null
};