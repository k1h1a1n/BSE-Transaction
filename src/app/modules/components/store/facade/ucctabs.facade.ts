import { inject, Injectable } from "@angular/core";
import { selectCurrentTab, selectVisitedTabs } from "../selectors/ucctabs.selector";
import { Store } from "@ngrx/store";
import { goToTab, nextTab, previousTab } from "../actions/ucctabs.action";

@Injectable({ providedIn: 'root' })
export class UCCTabsFacade {
  private store = inject(Store);
  currentTab$ = this.store.select(selectCurrentTab);
  visitedTabs$ = this.store.select(selectVisitedTabs);

  next() {
    this.store.dispatch(nextTab());
  }

  prev() {
    this.store.dispatch(previousTab());
  }

  goTo(tab: number) {
    console.log('Dispatching goToTab action with index:', tab);
    this.store.dispatch(goToTab({ tabIndex: tab }));
  }
}