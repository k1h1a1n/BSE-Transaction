import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { BseRegisterinvestors } from '../components/bse-registerinvestors/bse-registerinvestors';
import { SharedModule } from 'primeng/api';
import { DepoBankDetail } from '../components/depo-bank-detail/depo-bank-detail';
import { NomineeDetail } from '../components/nominee-detail/nominee-detail';
import { KycDetailsComponent } from '../components/kyc-details/kyc-details.component';
import { RegisterList } from '../components/register-list/register-list';
import { UccTabs } from '../components/ucc-tabs/ucc-tabs';
import { AddressDetails } from '../components/address-details/address-details';
import { TestPortComponent } from '../components/test-port/test-port.component';
import { Fatca } from '../components/fatca/fatca';

const routes: Routes = [
  
  {
    path: 'BseRegisterinvestors',
    component: BseRegisterinvestors
  },
  {
    path: 'depoBankDetails',
    component:DepoBankDetail
  },
  {
    path:'nomineeDetails',
    component:NomineeDetail
  },
  {
    path:'kycDetails',
    component: KycDetailsComponent
  },
    {
    path:'registerdList',
    component: RegisterList
  },
  {
    path: 'uccTabs',
    component: UccTabs
  },
  {
    path: 'addressDetails',
    component: AddressDetails
  },
   {
          path: 'testPort',
          component: TestPortComponent
        },
        {
          path: 'fatca',
          component: Fatca 
        }

//   {
//   path: 'crm',
//   component: UccTabs,
//   children: [
//     { path: '1st-applicant', component: BseRegisterinvestors },
//     { path: 'address-details', component: AddressDetails },
//     { path: 'kyc-details', component: KycDetailsComponent },
//     { path: 'bank-details', component: DepoBankDetail },
//     { path: 'nominee-details', component:  NomineeDetail },
//     { path: '', redirectTo: '1st-applicant', pathMatch: 'full' }
//   ]
// }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    BseRegisterinvestors,
    KycDetailsComponent,
    
  ]
})
export class CrmRoutingModule { }
