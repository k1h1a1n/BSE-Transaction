import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NomineeDetail } from '../nominee-detail/nominee-detail';
import { DepoBankDetail } from '../depo-bank-detail/depo-bank-detail';
import { BseRegisterinvestors } from '../bse-registerinvestors/bse-registerinvestors';
import { MatTabsModule } from '@angular/material/tabs';
import { KycDetailsComponent } from '../kyc-details/kyc-details.component';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AddressDetails } from '../address-details/address-details';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ucc-tabs',
  imports: [CommonModule, BreadcrumbModule, MatTabsModule, NomineeDetail, DepoBankDetail, BseRegisterinvestors,
    KycDetailsComponent, RouterOutlet, AddressDetails ],
  //  imports: [CommonModule, RouterOutlet, BreadcrumbModule, MatTabsModule],
  templateUrl: './ucc-tabs.html',
  styleUrl: './ucc-tabs.scss',
 
})
export class UccTabs {
    @ViewChild(KycDetailsComponent) kycDetailsComp?: KycDetailsComponent;
  breadcrumb_items: MenuItem[] = [];
  home: MenuItem = {};
  selectedTabIndex: number = 0;  // First tab
  isEditMode = false;
  isEdit: boolean = false;
  tabState: any = null;  // Store state passed between tabs

  constructor(private router: Router) {
  }


// @Input() selectedIndex: number = 0;
// @Output() onTabChange = new EventEmitter<number>();

tabChanged(i: number) {
  // this.onTabChange.emit(i);
}



  
  ngOnInit(){
    console.log('ucc tabs called');
        const navState = history.state;
            console.log(navState,'nav state');
            
    this.isEdit = navState?.isEdit === true;

    console.log(this.isEdit,'isEdit');

        this.breadcrumb_items = [
      { label: 'Home', routerLink: '/' },
      { label: 'CRM', routerLink: '/crm' },
      { label: 'Online MF Transactions', routerLink: '/crm' },
      { label: 'BSE Register Investors' },
    ];
        this.home = { icon: 'pi pi-home', routerLink: '/' };


     
  }


// goToTab(event: {index: number, state?: any} | number) {
//   // Handle both old format (number) and new format (object with index and state)
//   if (typeof event === 'number') {
//     this.selectedTabIndex = event;
//   } else {
//     this.selectedTabIndex = event.index;
//     if (event.state) {
//       this.tabState = event.state;
//       console.log('Tab state received:', this.tabState);
//     }
//   }
//   console.log(this.selectedTabIndex,' selected index');

//   // If KYC Details tab is selected (index 2), refresh field states
//   if (this.selectedTabIndex === 2 && this.kycDetailsComp) {
//     this.kycDetailsComp.refreshFieldStates();
//   }
// }


tabStates: { [index: number]: any } = {};

goToTab(event: { index: number; state?: any } | number) {

  if (typeof event === 'number') {
    this.selectedTabIndex = event;
    return;
  }

  this.selectedTabIndex = event.index;

  // ✅ store state ONLY for that tab - create new object reference to trigger change detection
  this.tabStates[event.index] = event.state ? { ...event.state } : null;

  console.log('Tab state map:', this.tabStates);

   // If KYC Details tab is selected (index 2), refresh field states
  if (this.selectedTabIndex === 2 && this.kycDetailsComp) {
    this.kycDetailsComp.refreshFieldStates();
  }
}

 

}
