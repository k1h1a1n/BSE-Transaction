import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedEnv } from './shared/environments/environment';
import { Shared } from './shared/services/shared';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('BackofficeUCCRegisterNew');

  constructor(
    private sharedSvc: Shared,
  ) {
    this.updateEnv();
  }
  
  updateEnv() {
    console.log('UpdateEnv:', SharedEnv);
    this.sharedSvc.UpdateEnv();
  }
}

