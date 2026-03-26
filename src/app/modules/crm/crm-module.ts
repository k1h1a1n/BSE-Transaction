import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmRoutingModule } from './crm-routing-module';
import { Crm } from './crm';
import { BseRegisterinvestors } from '../components/bse-registerinvestors/bse-registerinvestors';
import { DepoBankDetail } from '../components/depo-bank-detail/depo-bank-detail';
import { KycDetailsComponent } from '../components/kyc-details/kyc-details.component';
import { RegisterList } from '../components/register-list/register-list';
import { UccTabs } from '../components/ucc-tabs/ucc-tabs';
import { AddressDetails } from '../components/address-details/address-details';
import { TestPortComponent } from '../components/test-port/test-port.component';
import { Fatca } from '../components/fatca/fatca';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CrmRoutingModule,
    Crm,
    BseRegisterinvestors,
    DepoBankDetail,
    KycDetailsComponent,
    RegisterList,
    UccTabs,
    AddressDetails,
    TestPortComponent,
    Fatca
  ]
})
export class CrmModule { }
