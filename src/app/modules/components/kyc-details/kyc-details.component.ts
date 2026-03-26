import { Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { NomineeDetail } from '../nominee-detail/nominee-detail';
import { DepoBankDetail } from '../depo-bank-detail/depo-bank-detail';
import { MenuItem } from 'primeng/api';
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Shared } from '../../../shared/services/shared';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { BseUccEditDetails, KYCRequest } from '../../models/bseUCCModel';
import { ProgressBarModule } from 'primeng/progressbar';

export interface TabNavigationEvent {
  index: number;
  state?: {
    isUpdateBank: boolean;
    MembID: any;
    clieCode: any;
  };
}
@Component({
  selector: 'app-kyc-details',
   imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, 
     InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule,  MatSelectModule,
    MatOptionModule, ProgressBarModule],
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.scss']
})
export class KycDetailsComponent implements OnInit, OnChanges{
// selectedTabIndex = 1;
  isLoading: boolean = false;
  
  kycForm!: FormGroup;
  Validators = Validators; // Expose Validators to template
  kycTypeOptions = [
    { key: 'B', value: 'BIOMETRIC KYC' },
    { key: 'C', value: 'CKYC Compliant' },
    { key: 'E', value: 'Aadhhaar EKYC PAN' },
    { key: 'K', value: 'KRA Compliant' }
  ];

    breadcrumb_items: MenuItem[] = [];
  home: MenuItem = {};
  // @Output() nextTab = new EventEmitter<number>();
  @Output() nextTab = new EventEmitter<number | TabNavigationEvent>();
   @Input() tabState: any;
   isUpdate: boolean = false;
   memberIdFromUpdate: any;
   clieCodeFromUpdate: any;
  editedResp: any;

  constructor(private fb: FormBuilder, private bseUccReg: BseUCCRegister, private sharedService: Shared, private router: Router, private location:Location) { }
  // ngOnChanges(changes: SimpleChanges): void {
  //    if (changes['tabState'] && changes['tabState'].currentValue) {
  //     console.log(
  //       'Address Details received state:',
  //       changes['tabState'].currentValue
  //     );

  //     const state = changes['tabState'].currentValue;
  //     console.log(state, 'state');
      

  //     this.isUpdate = state.isUpdateKYC === true;
  //     this.memberIdFromUpdate = state.MembID;
  //     this.clieCodeFromUpdate = state.clieCode;
  //     console.log('isUpdate in ngOnChanges:', this.isUpdate);
      
   
  //   }
  // }

ngOnChanges(changes: SimpleChanges): void {

  if (!changes['tabState']) {
    return;
  }

  const state = changes['tabState'].currentValue;

  if (state) {
    console.log('kyc Details received state:', state);

    // ✅ match emitted property name
    this.isUpdate = state.isUpdateKYC === true;

    this.memberIdFromUpdate = state.MembID ?? null;
    this.clieCodeFromUpdate = state.clieCode ?? '';

    console.log('isUpdate in ngOnChanges:', this.isUpdate);

    if (this.isUpdate && this.clieCodeFromUpdate) {
      this.getEditApiData(this.clieCodeFromUpdate);
    }

  } else {
    // ✅ RESET for normal mode
    this.isUpdate = false;
    this.memberIdFromUpdate = null;
    this.clieCodeFromUpdate = '';

    console.log('Normal mode → update cleared');
  }
}


  ngOnInit() {
    //     this.breadcrumb_items = [
    //   { label: 'Home', routerLink: '/' },
    //   { label: 'CRM', routerLink: '/crm' },
    //   { label: 'Online MF Transactions', routerLink: '/crm' },
    //   { label: 'BSE Register Investors' },
    // ];
    // this.home = { icon: 'pi pi-home', routerLink: '/' };

    this.kycForm = this.fb.group({


      // kyc tab details
      kycType1Holder: ['', Validators.required],
      kycType2Holder: [''],
      kycType3Holder: [''],
      kycTypeGuardian: [''],
      ckycNo1Holder: [''],
      ckycNo2Holder: [''],
      ckycNo3Holder: [''],
      ckycNoGuardian: [''],
    });

    // Add listeners to make CKYC fields required when KYC Type is selected (setup first)
    this.setupCKYCValidation();

    localStorage.getItem('uccRegistrationData');
    // Load holding pattern from localStorage and disable fields accordingly (run after setting up listeners)
    this.loadHoldingPatternAndSetFieldStates();

          
    // if (this.isUpdate) {
    //   this.getEditApiData(this.clieCodeFromUpdate);
    // }
  }


    getEditApiData(bseCode: any) {
      const input: BseUccEditDetails = {
        clieCode: bseCode
      };
      return this.bseUccReg.editUccDetails(input).subscribe({
        next: (res) => {
          console.log(res, 'res Edit api');
          this.editedResp = res[0];
          console.log(this.editedResp, 'edited resp');
          this.onUpdate();
        },
  
        error: (err) => {
          console.error('Error fetching edit data', err);
  
        }
      })
    }
  
    onUpdate() {
      if (this.isUpdate) {
        const navState = history.state;
        console.log(navState, 'nav state');
         console.log(this.editedResp);
        localStorage.setItem('editedBseClientCode', this.editedResp.cliecode);
  
        this.kycForm.patchValue({
          kycType1Holder: this.editedResp.kycType1Holder || '',
          kycType2Holder: this.editedResp.kycType2Holder || '',
          kycType3Holder: this.editedResp.kycType3Holder || '',
          kycTypeGuardian: this.editedResp.kycTypeGuardian || '',
          ckycNo1Holder: this.editedResp.ckycNo1Holder || '',
          ckycNo2Holder: this.editedResp.ckycNo2Holder || '',
          ckycNo3Holder: this.editedResp.ckycNo3Holder || '',
          ckycNoGuardian: this.editedResp.ckycNoGuardian || ''
        });
  
       
  this.loadHoldingPatternAndSetFieldStates();
      }
    }
  // This method can be called from parent to refresh field states
  public refreshFieldStates() {
    this.loadHoldingPatternAndSetFieldStates();

  }


//     navigate(index: number) {
//   const pages = [
//     'BseRegisterinvestors',
//     'addressDetails',
//     'kycDetails',
//     'depoBankDetails',
//     'nomineeDetails'
//   ];

//   this.router.navigate([pages[index]]);
// }

  setupCKYCValidation() {
    this.kycForm.get('ckycNo1Holder')?.disable();
    // 1st Holder CKYC validation based on KYC Type selection
    this.kycForm.get('kycType1Holder')?.valueChanges.subscribe(value => {
      this.syncPrimaryCkycField(value);
    });
    this.syncPrimaryCkycField(this.kycForm.get('kycType1Holder')?.value);

    // 2nd Holder CKYC validation based on KYC Type selection
    this.kycForm.get('kycType2Holder')?.valueChanges.subscribe(value => {
      const kycTypeField = this.kycForm.get('kycType2Holder');
      const ckycField = this.kycForm.get('ckycNo2Holder');
      // Only enable if the KYC type field itself is enabled (respects holding pattern)
      if (value && kycTypeField?.enabled) {
        ckycField?.setValidators([Validators.required]);
        ckycField?.enable();
      } else if (!kycTypeField?.enabled) {
        // If KYC type is disabled (due to holding pattern), keep CKYC disabled
        ckycField?.clearValidators();
        ckycField?.disable();
      } else {
        ckycField?.clearValidators();
      }
      ckycField?.updateValueAndValidity();
    });

    // 3rd Holder CKYC validation based on KYC Type selection
    this.kycForm.get('kycType3Holder')?.valueChanges.subscribe(value => {
      const kycTypeField = this.kycForm.get('kycType3Holder');
      const ckycField = this.kycForm.get('ckycNo3Holder');
      // Only enable if the KYC type field itself is enabled (respects holding pattern)
      if (value && kycTypeField?.enabled) {
        ckycField?.setValidators([Validators.required]);
        ckycField?.enable();
      } else if (!kycTypeField?.enabled) {
        // If KYC type is disabled (due to holding pattern), keep CKYC disabled
        ckycField?.clearValidators();
        ckycField?.disable();
    // Guardian CKYC validation based on KYC Type selection
    this.kycForm.get('kycTypeGuardian')?.valueChanges.subscribe(value => {
      const kycTypeField = this.kycForm.get('kycTypeGuardian');
      const ckycField = this.kycForm.get('ckycNoGuardian');
      // Only enable if the KYC type field itself is enabled (respects holding pattern)
      if (value && kycTypeField?.enabled) {
        ckycField?.setValidators([Validators.required]);
        ckycField?.enable();
      } else if (!kycTypeField?.enabled) {
        // If KYC type is disabled (due to holding pattern), keep CKYC disabled
        ckycField?.clearValidators();
        ckycField?.disable();
      } else {
        ckycField?.clearValidators();
      }
      ckycField?.updateValueAndValidity();
    }); ckycField?.setValidators([Validators.required]);
        ckycField?.enable();
      } else {
        ckycField?.clearValidators();
      }
      ckycField?.updateValueAndValidity();
    });
  }

  loadHoldingPatternAndSetFieldStates() {
    const storedData = localStorage.getItem('uccRegistrationData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const holdingPattern = parsedData?.holdingPatternDetails?.value || parsedData?.holdingPattern;
        
        console.log('Holding Pattern:', holdingPattern);

        // If holding pattern is 'SI' (Single), disable 2nd, 3rd holder and guardian fields
        if (holdingPattern === 'SI') {
          this.kycForm.get('kycType2Holder')?.disable();
          this.kycForm.get('kycType2Holder')?.clearValidators();
          this.kycForm.get('kycType2Holder')?.updateValueAndValidity();
          
          this.kycForm.get('kycType3Holder')?.disable();
          this.kycForm.get('kycType3Holder')?.clearValidators();
          this.kycForm.get('kycType3Holder')?.updateValueAndValidity();
          
          this.kycForm.get('kycTypeGuardian')?.disable();
          this.kycForm.get('kycTypeGuardian')?.clearValidators();
          this.kycForm.get('kycTypeGuardian')?.updateValueAndValidity();
          
          this.kycForm.get('ckycNo2Holder')?.disable();
          this.kycForm.get('ckycNo2Holder')?.clearValidators();
          this.kycForm.get('ckycNo2Holder')?.updateValueAndValidity();

          this.kycForm.get('ckycNo3Holder')?.disable();
          this.kycForm.get('ckycNo3Holder')?.clearValidators();
          this.kycForm.get('ckycNo3Holder')?.updateValueAndValidity();

          this.kycForm.get('ckycNoGuardian')?.disable();
          this.kycForm.get('ckycNoGuardian')?.clearValidators();
          this.kycForm.get('ckycNoGuardian')?.updateValueAndValidity();
          
          console.log('Holding pattern is Single - disabled 2nd, 3rd holder and guardian fields');
        } else {
          // For other holding patterns (Joint, etc.), enable all fields and make them required
          this.kycForm.get('kycType2Holder')?.enable();
          this.kycForm.get('kycType2Holder')?.setValidators([Validators.required]);
          this.kycForm.get('kycType2Holder')?.updateValueAndValidity();
          
          this.kycForm.get('kycType3Holder')?.enable();
          this.kycForm.get('kycType3Holder')?.setValidators([Validators.required]);
          this.kycForm.get('kycType3Holder')?.updateValueAndValidity();
          
          this.kycForm.get('kycTypeGuardian')?.enable();
          this.kycForm.get('kycTypeGuardian')?.setValidators([Validators.required]);
          this.kycForm.get('kycTypeGuardian')?.updateValueAndValidity();
          
          this.kycForm.get('ckycNo2Holder')?.enable();
           this.kycForm.get('ckycNo2Holder')?.setValidators([Validators.required]);
          this.kycForm.get('ckycNo2Holder')?.updateValueAndValidity();

          this.kycForm.get('ckycNo3Holder')?.enable();
           this.kycForm.get('ckycNo3Holder')?.setValidators([Validators.required]);
          this.kycForm.get('ckycNo3Holder')?.updateValueAndValidity();

          this.kycForm.get('ckycNoGuardian')?.enable();
          this.kycForm.get('ckycNoGuardian')?.setValidators([Validators.required]);
          this.kycForm.get('ckycNoGuardian')?.updateValueAndValidity();
          
          console.log('Holding pattern is not Single - enabled all fields with required validation');
        }
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
      }
    }
  }

  private syncPrimaryCkycField(value: string | null | undefined) {
    const ckycField = this.kycForm.get('ckycNo1Holder');
    if (!ckycField) {
      return;
    }

    if (value === 'C') {
      ckycField.setValidators([Validators.required]);
      ckycField.enable();
    } else {
      ckycField.clearValidators();
      ckycField.setValue('');
      ckycField.disable();
    }

    ckycField.updateValueAndValidity({ emitEvent: false });
  }

goToNextTab() {
  this.nextTab.emit(3);  // navigate to tab index 1
}


  navToDepoBankDetail(){
    this.router.navigate(['/app/depoBankDetails'])
  }

    goBack() {
    this.location.back();
        const saved = localStorage.getItem('uccRegistrationData');
  }

      get BseClientCode(): any {
    const data = localStorage.getItem('uccRegistrationData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed?.bseClientCode || null;
      } catch (e) {
        console.error('Invalid JSON in localStorage:', e);
      }
    }
    return null;
  }


  
  get MemberDetailID(): string | null {
    const data = localStorage.getItem('uccRegistrationData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed?.memberDetails?.id || null;
      } catch (e) {
        console.error('Error parsing uccRegistrationData:', e);
      }
    }
    return null;
  }

  mapFormToUccAddressDetails(formValue: any): KYCRequest {
    return {
    clientCode: this.BseClientCode,
  kycType1Holder: formValue.kycType1Holder || '',
  kycType2Holder: formValue.kycType2Holder || '',
  kycType3Holder: formValue.kycType3Holder || '',
  kycTypeGuardian: formValue.kycTypeGuardian || '',
  ckycNo1Holder: formValue.ckycNo1Holder || '',
  ckycNo2Holder: formValue.ckycNo2Holder || '',
  ckycNo3Holder: formValue.ckycNo3Holder || '',  
  ckycNoGuardian: formValue.ckycNoGuardian || ''
    };
  }


  kycVerification() {
    // Validate form before proceeding
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      this.sharedService.OpenAlert('Please fill all required fields correctly.');
      return;
    }

    this.loadHoldingPatternAndSetFieldStates();
    console.log('KYC Verification form data:', this.kycForm.value);
    
    // Get raw value to include disabled fields
    let kycFormValue = this.mapFormToUccAddressDetails(this.kycForm.getRawValue());
   
    console.log(kycFormValue,'kyc form value');
    
    // Implement KYC verification logic here
  //   this.sharedService.successDia('KYC Verification Successful!').subscribe(result => {
  // }

this.isLoading = true;

this.bseUccReg.getKycVerification(kycFormValue).subscribe(response => {
      console.log('KYC Verification response:', response);
           this.isLoading = false;
      if (response && response.success === true) {
        this.sharedService.successDia('KYC Saved Successfully!').subscribe(result => {
          if (result) {   // result === true when OK clicked
              this.nextTab.emit(3);  
              //  this.router.navigate(['/app/depoBankDetails']);
          }
          // this.isLoading = false;
        });
      } else {
        this.isLoading = false;
        this.sharedService.OpenAlert('KYC Saving Failed: ' + (response.message || 'Unknown error'));
      }
    }, error => {
      this.isLoading = false;
      this.sharedService.OpenAlert('KYC Saving Error: ' + (error.message || 'Unknown error'));
    });
  }

  kycUpdateVerification(){
    console.log("cupdate method called");
      // Validate form before proceeding
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      this.sharedService.OpenAlert('Please fill all required fields correctly.');
      return;
    }

    this.loadHoldingPatternAndSetFieldStates();
    console.log('KYC Verification form data:', this.kycForm.value);
    
    // Get raw value to include disabled fields
    // let kycFormValue: KYCRequest = this.mapFormToUccAddressDetails(this.kycForm.getRawValue());
   
    // console.log(kycFormValue,'kyc form value');
    
   
     const editedBseClientCode = localStorage.getItem('editedBseClientCode');
    console.log(editedBseClientCode, 'edited BSE Client Code');

     const input: KYCRequest = this.mapFormToUccAddressDetails(this.kycForm.getRawValue());
        input.clientCode =  this.BseClientCode || '';
console.log(input,'kyc form value');

this.isLoading = true;



this.bseUccReg.getKycVerification(input).subscribe(response => {
      console.log('KYC Verification response:', response);
           this.isLoading = false;
      if (response && response.success === true) {
        this.sharedService.successDia('KYC Saved Successfully!').subscribe(result => {
          if (result) {   // result === true when OK clicked
           this.nextTab.emit({
                      index: 3,
                      state: {
                        isUpdateBank: true,
                        MembID: this.MemberDetailID || null,
                        clieCode:   editedBseClientCode || input.clientCode || ''
                      }
                    });
          }
          // this.isLoading = false;
        });
      } else {
        this.isLoading = false;
        this.sharedService.OpenAlert('KYC Saving Failed: ' + (response.message || 'Unknown error'));
      }
    }, error => {
      this.isLoading = false;
      this.sharedService.OpenAlert('KYC Saving Error: ' + (error.message || 'Unknown error'));
    });
  }
}