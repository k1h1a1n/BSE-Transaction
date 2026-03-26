import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    Dashboard
    
  ]
})
export class DashboardModule { }
