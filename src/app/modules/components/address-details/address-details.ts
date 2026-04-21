import { CommonModule } from '@angular/common';
import { COUNTRY_LIST } from './country-list';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UccAddressDetails } from '../../models/bseUCCModel';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Shared } from '../../../shared/services/shared';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { STATE_LIST } from '../bse-registerinvestors/bse-registerinvestors.constants';
import { UCCTabsFacade } from '../store/facade/ucctabs.facade';

@Component({
  selector: 'app-address-details',
  imports: [BreadcrumbModule, MatSelectModule, MatOptionModule, MatDividerModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, ProgressBarModule],
  templateUrl: './address-details.html',
  styleUrl: './address-details.scss',
  animations: []
})
export class AddressDetails {
  isLoading: boolean = false;

  @Output() nextTab = new EventEmitter<any>();
  addressForm!: FormGroup;
  isEdit: boolean = false;
  clientCode: any;
  clieCodeFromUpdate: any;
  editedResp: any = [];
  memberList: any[] = [];
  editClientCode: string = '';

  private uccTabsFacade = inject(UCCTabsFacade);

  stateList = STATE_LIST;

  countryList = COUNTRY_LIST;

  constructor(private fb: FormBuilder, private bseUccReg: BseUCCRegister, private router: Router, private sharedSer: Shared) { }


  ngOnInit() {

    this.addressForm = this.fb.group({
      state: ['MA', Validators.required],
      city: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z .'-]+$/),
      Validators.minLength(2),
      Validators.maxLength(20)]],
      pincode: ['', [Validators.required,
      Validators.pattern(/^[1-9][0-9]{5}$/)]],
      country: ['IND', Validators.required],
      addLine1: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9\s,.\-\/'#]+$/),
      Validators.minLength(10),
      Validators.maxLength(50)]],
      addLine2: ['', [
        Validators.pattern(/^[a-zA-Z0-9\s,.\-\/'#]+$/),
        Validators.minLength(5),
        Validators.maxLength(50)]],
      addLine3: ['', [
        Validators.pattern(/^[a-zA-Z0-9\s,.\-\/'#]+$/),
        Validators.minLength(5),
        Validators.maxLength(50)]],
    });

    // ✅ Subscribe to NgRx store for edit mode
    this.uccTabsFacade.isEditMode$.subscribe((isEditMode) => {
      this.isEdit = isEditMode;
      console.log('[AddressDetails] isEdit from store:', this.isEdit);

      if (this.isEdit) {
        this.onEditMode();
      }
    });

    // ✅ Get client code from NgRx store (editData in edit mode)
    this.uccTabsFacade.editData$.subscribe((editData) => {
      if (editData?.cliecode) {
        this.editClientCode = editData.cliecode;
        console.log('[AddressDetails] editClientCode from store:', this.editClientCode);
      }
    });
  }

  navigate(index: number) {
    const pages = [
      'BseRegisterinvestors',
      'addressDetails',
      'kycDetails',
      'depoBankDetails',
      'nomineeDetails'
    ];

    this.router.navigate([pages[index]]);
  }

  goBack() {
    this.nextTab.emit({
      index: 0
    });
  }

  onEditMode() {
    if (this.isEdit) {
      // ✅ Read edit data from NgRx store
      this.uccTabsFacade.editData$.subscribe((editData) => {
        if (editData) {
          const ucc = editData;
          this.clientCode = ucc.cliecode;
          console.log('[AddressDetails] edit data from store:', ucc);

          this.addressForm.patchValue({
            addLine1: ucc?.ClienAddr1?.trim() || '',
            addLine2: ucc?.ClienAddr2?.trim() || '',
            addLine3: ucc?.ClienAddr3?.trim() || '',
            city: ucc?.ClienCity?.trim() || '',
            pincode: ucc?.PinCode?.trim() || '',
          });

          console.log(this.addressForm.value, 'address form patched from store edit data');
        }
      });
    }
  }

  prefillFormValue(address: any) {
    this.addressForm.patchValue({
      city: address.city?.trim() || '',
      pincode: address.pinCode?.trim() || '',
      addLine1: address.addressLine1?.trim() || '',
      addLine2: address.addressLine2?.trim() || '',
      addLine3: address.addressLine3?.trim() || '',
    });
    console.log(this.addressForm.value, 'address form value of selected member');
  }

  get MemberDetailID(): string | null {
    // ✅ Read from NgRx store - use sync approach with a local variable
    let memberId: string | null = null;
    this.uccTabsFacade.registrationData$.subscribe((regData) => {
      memberId = regData?.memberDetails?.id || null;
    }).unsubscribe();
    return memberId;
  }

  get BseClientCode(): any {
    // ✅ Read from NgRx store (UccRegisterMember has clieCode)
    let bseCode: any = null;
    this.uccTabsFacade.registrationData$.subscribe((regData) => {
      bseCode = regData?.clieCode || null;
    }).unsubscribe();
    return bseCode;
  }

  mapFormToUccAddressDetails(formValue: any): UccAddressDetails {
    return {
      clieCode: this.isEdit ? this.editClientCode : this.BseClientCode,
      AddressLine1: formValue.addLine1,
      AddressLine2: formValue.addLine2,
      AddressLine3: formValue.addLine3,
      Pincode: formValue.pincode,
      City: formValue.city,
      State: formValue.state,
      Country: formValue.country
    };
  }

  saveAddressAndContinue(isEditMode: boolean = this.isEdit) {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      const invalidControls = Object.keys(this.addressForm.controls)
        .filter(key => this.addressForm.get(key)?.invalid);
      console.warn('Address form invalid. Invalid controls:', invalidControls);
      return;
    }

    const rawFormValue = this.addressForm.getRawValue();
    const input: UccAddressDetails = this.mapFormToUccAddressDetails(rawFormValue);

    if (isEditMode) {
      console.log('Edit mode: skipping address API and moving to next tab. Input:', JSON.stringify(input, null, 2));
      this.nextTab.emit({
        index: 2
      });
      return;
    }

    console.log('✅ Address Save Input JSON:', JSON.stringify(input, null, 2));

    // TODO: Uncomment API call when validations are confirmed
    this.nextTab.emit({
      index: 2
    });

    // API call commented out - uncomment when ready
    // if (this.addressForm.invalid) {
    //   this.addressForm.markAllAsTouched();
    //   const invalidControls = Object.keys(this.addressForm.controls)
    //     .filter(key => this.addressForm.get(key)?.invalid);
    //   console.warn('Address form invalid on submit. Invalid controls:', invalidControls);
    //   return;
    // }
    // const bseClientCode = this.BseClientCode || '';
    // rawFormValue.bseClientCode = bseClientCode;
    // this.isLoading = true;
    // this.bseUccReg.getUccAddressContData(input).subscribe({
    //   next: (response: { success: boolean; message: string }) => {
    //     console.log('API Response:', response);
    //     this.isLoading = false;
    //     if (response?.success === true) {
    //       this.sharedSer.successDia(response?.message).subscribe(result => {
    //         if (result === true) {
    //           this.nextTab.emit({ index: 2 });
    //         }
    //       });
    //     } else {
    //       this.isLoading = false;
    //       this.sharedSer.OpenAlert('Failed to save address details.');
    //     }
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     console.error('Registration Edit Error:', err);
    //     this.sharedSer.OpenAlert('Something went wrong while saving address details.');
    //   }
    // });
  }

  allowOnlyNumbers(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.addressForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }
}
