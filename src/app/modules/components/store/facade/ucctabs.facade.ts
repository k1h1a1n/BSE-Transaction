import { inject, Injectable } from "@angular/core";
import { selectCurrentTab, selectEditData, selectIsEditMode, selectRegistrationData, selectVisitedTabs } from "../selectors/ucctabs.selector";
import { Store } from "@ngrx/store";
import { goToTab, nextTab, previousTab, resetEditMode, setEditMode, setRegistrationData } from "../actions/ucctabs.action";

@Injectable({ providedIn: 'root' })
export class UCCTabsFacade {
  private store = inject(Store);
  currentTab$ = this.store.select(selectCurrentTab);
  visitedTabs$ = this.store.select(selectVisitedTabs);
  isEditMode$ = this.store.select(selectIsEditMode);
  editData$ = this.store.select(selectEditData);
  registrationData$ = this.store.select(selectRegistrationData);

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

  setEditMode(isEditMode: boolean, editData: any | null = null) {
    console.log('Dispatching setEditMode action:', isEditMode, editData);
    this.store.dispatch(setEditMode({ isEditMode, editData }));
  }

  resetEditMode() {
    console.log('Dispatching resetEditMode action');
    this.store.dispatch(resetEditMode());
  }

  setRegistrationData(data: any) {
    console.log('Dispatching setRegistrationData action:', data);
    this.store.dispatch(setRegistrationData({ registrationData: data }));
  }
}