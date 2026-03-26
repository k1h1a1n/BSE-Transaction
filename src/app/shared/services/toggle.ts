import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Toggle {
    private _highlight$ = new BehaviorSubject<boolean>(false);
  highlight$ = this._highlight$.asObservable();

  toggleHighlight() {
    this._highlight$.next(!this._highlight$.value);
  }
}
