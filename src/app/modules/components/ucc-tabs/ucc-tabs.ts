import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NomineeDetail } from '../nominee-detail/nominee-detail';
import { DepoBankDetail } from '../depo-bank-detail/depo-bank-detail';
import { BseRegisterinvestors } from '../bse-registerinvestors/bse-registerinvestors';
import { MatTabsModule } from '@angular/material/tabs';
import { KycDetailsComponent } from '../kyc-details/kyc-details.component';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AddressDetails } from '../address-details/address-details';
import { UCCTabsFacade } from '../store/facade/ucctabs.facade';

@Component({
  selector: 'app-ucc-tabs',
  imports: [CommonModule, BreadcrumbModule, MatTabsModule, BseRegisterinvestors,
    NomineeDetail, DepoBankDetail, KycDetailsComponent, AddressDetails],
  templateUrl: './ucc-tabs.html',
  styleUrl: './ucc-tabs.scss'
})
export class UccTabs implements OnDestroy {
  private uccTabsFacade = inject(UCCTabsFacade);
  breadcrumb_items: MenuItem[] = [];
  home: MenuItem = {};
  selectedTabIndex: number = 0;  // First tab
  isEditMode = false;
  tabState: any = null;  // Store state passed between tabs
  currentTab$ = this.uccTabsFacade.currentTab$;
  isEditMode$ = this.uccTabsFacade.isEditMode$;
  editData$ = this.uccTabsFacade.editData$;

  constructor() {
    this.createBreadcrumbs();
  }

  ngOnInit() {
    // Read edit mode from NgRx store
    this.isEditMode$.subscribe((isEdit) => {
      this.isEditMode = isEdit;
      console.log('[UccTabs] isEditMode from store:', this.isEditMode);
    });

    this.editData$.subscribe((data) => {
      this.tabState = data;
      console.log('[UccTabs] editData from store:', this.tabState);
    });
  }

  ngOnDestroy() {
    // Reset edit mode when leaving the tabs component
    this.uccTabsFacade.resetEditMode();
  }

  goToTab(index: number) {
    console.log('Navigating to tab index:', index);
    this.uccTabsFacade.goTo(index);
  }
  private createBreadcrumbs() {
    this.breadcrumb_items = [
      { label: 'Home', routerLink: '/' },
      { label: 'CRM', routerLink: '/crm' },
      { label: 'Online MF Transactions', routerLink: '/crm' },
      { label: 'BSE Register Investors' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

}
