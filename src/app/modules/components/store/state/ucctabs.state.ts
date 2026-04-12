// ucctabs.state.ts
export interface UCCTabsState {
  currentTab: number;
  visitedTabs: number[];
}

export const initialTabState: UCCTabsState = {
  currentTab: 0,
  visitedTabs: [0]
};