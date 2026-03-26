import { Routes } from '@angular/router';
import { BseRegisterinvestors } from './modules/components/bse-registerinvestors/bse-registerinvestors';
import { DepoBankDetail } from './modules/components/depo-bank-detail/depo-bank-detail';
import { NomineeDetail } from './modules/components/nominee-detail/nominee-detail';
import { KycDetailsComponent } from './modules/components/kyc-details/kyc-details.component';
import { RegisterList } from './modules/components/register-list/register-list';
import { UccTabs } from './modules/components/ucc-tabs/ucc-tabs';
import { AddressDetails } from './modules/components/address-details/address-details';
import { TestPortComponent } from './modules/components/test-port/test-port.component';
import { Fatca } from './modules/components/fatca/fatca';
import { Sso } from './shared/components/sso/sso';
import { Layout } from './shared/components/layout/layout';

export const routes: Routes = [
  // SSO route - shows only SSO component
  {
    path: 'sso',
    component: Sso
  },
  
  // Default route - redirects to SSO
  {
    path: '',
    component: Sso,
  },

      // {
      //   path: '',
      //   component: RegisterList
      // },

  // Main layout with header and side menu - all authenticated routes go here
  {
    path: 'app',
    component: Layout,
    children: [
      {
        path: 'crm',
        loadChildren: () => import('./modules/crm/crm-module').then(m => m.CrmModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard-module').then(m => m.DashboardModule)
      },
      {
        path: 'BseRegisterinvestors',
        component: BseRegisterinvestors
      },
      {
        path: 'uccTabs',
        component: UccTabs
      },
      {
        path: 'depoBankDetails',
        component: DepoBankDetail
      },
      {
        path: 'nomineeDetails',
        component: NomineeDetail
      },
      {
        path: 'kycDetails',
        component: KycDetailsComponent
      },
      {
        path: 'registerdList',
        component: RegisterList
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
      },
      {
        path: 'BseRegisterinvestors',
        component: BseRegisterinvestors
      }
    ]
  }
];
