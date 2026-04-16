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
import { Location } from '@angular/common';
import { BseUccEditDetails, UccAddressDetails } from '../../models/bseUCCModel';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Shared } from '../../../shared/services/shared';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
export class AddressDetails  {
  isLoading: boolean = false;

  @Output() nextTab = new EventEmitter<any>();
  addressForm!: FormGroup;
  isEdit: boolean = false;
  clientCode: any;
  isUpdate: boolean = false;
  clieCodeFromUpdate: any;
  editedResp: any = [];
  memberList: any[] = [];

  private uccTabsFacade = inject(UCCTabsFacade);

  stateList = STATE_LIST;

  countryList = COUNTRY_LIST;

  constructor(private fb: FormBuilder, private bseUccReg: BseUCCRegister, private router: Router, private sharedSer: Shared, private location: Location,) { }


  ngOnInit() {

    this.addressForm = this.fb.group({
      firstName: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        Validators.minLength(2),
        Validators.maxLength(25)]],
      middleName: ['',
        [
          Validators.pattern(/^[A-Za-z ]+$/),
          Validators.minLength(1),
          Validators.maxLength(25)]],
      lastName: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        Validators.minLength(2),
        Validators.maxLength(25)]],
      gender: ['', Validators.required],
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

    // ✅ Pre-seed required name/gender fields from NgRx store registration data
    this.seedMandatoryFields();

    // ✅ Subscribe to NgRx store for edit mode
    this.uccTabsFacade.isEditMode$.subscribe((isEditMode) => {
      this.isEdit = isEditMode;
      console.log('[AddressDetails] isEdit from store:', this.isEdit);

      if (this.isEdit) {
        this.onEditMode();
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
      index: 0,
      state: {}
    });
  }

  navToDepoBankDetail() {
    this.router.navigate(['/app/depoBankDetails'])
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

  private seedMandatoryFields() {
    // ✅ Read from NgRx store instead of localStorage
    this.uccTabsFacade.registrationData$.subscribe((regData) => {
      if (regData) {
        this.addressForm.patchValue({
          firstName: regData.firstName || '',
          middleName: regData.middleName || '',
          lastName: regData.lastName || '',
          gender: regData.gender || ''
        });
        console.log('Address mandatory fields prefilled from NgRx store registration data');
      } else {
        console.warn('No registration data in store to prefill address form');
      }
    });
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
    // ✅ Read from NgRx store
    let bseCode: any = null;
    this.uccTabsFacade.registrationData$.subscribe((regData) => {
      bseCode = regData?.bseClientCode || null;
    }).unsubscribe();
    return bseCode;
  }

  getmandatoryDetOfRegistration() {
    // ✅ Read from NgRx store synchronously
    let result: any = null;
    this.uccTabsFacade.registrationData$.subscribe((parsed) => {
      if (!parsed) {
        result = null;
        return;
      }

      let firstName = (parsed.firstName || '').toString().trim();
      let middleName = (parsed.middleName || '').toString().trim();
      let lastName = (parsed.lastName || '').toString().trim();
      const gender = (parsed.gender || '').toString().trim();

      if ((!firstName && !middleName && !lastName) && parsed.memberDetails?.name) {
        const parts = parsed.memberDetails.name.trim().split(/\s+/);
        if (parts.length === 1) {
          firstName = parts[0];
        } else if (parts.length === 2) {
          firstName = parts[0];
          lastName = parts[1];
        } else if (parts.length > 2) {
          firstName = parts[0];
          lastName = parts[parts.length - 1];
          middleName = parts.slice(1, -1).join(' ');
        }
      }

      result = {
        firstName: firstName || null,
        middleName: middleName || null,
        lastName: lastName || null,
        gender: gender || null,
        raw: parsed
      };
    }).unsubscribe();
    return result;
  }

  mapFormToUccAddressDetails(formValue: any): UccAddressDetails {
    return {
      clieCode: this.BseClientCode,
      AddressLine1: formValue.addLine1,
      AddressLine2: formValue.addLine2,
      AddressLine3: formValue.addLine3,
      Pincode: formValue.pincode,
      City: formValue.city,
      State: formValue.state,
      Country: formValue.country
    };
  }

  submitData() {
    // ✅ Log the input instead of calling API
    const rawFormValue = this.addressForm.getRawValue();
    const input: UccAddressDetails = this.mapFormToUccAddressDetails(rawFormValue);
    console.log(input, '✅ Address input (API call commented out)');
    return
    this.nextTab.emit({
      index: 2,
      state: {}
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

  updateDataAndContinue() {
    console.log("update called");

    // ✅ Log the input instead of calling API
    const rawFormValue = this.addressForm.getRawValue();
    const input: UccAddressDetails = this.mapFormToUccAddressDetails(rawFormValue);
    console.log(input, '✅ Address update input (API call commented out)');
    return
    this.nextTab.emit({
      index: 2,
      state: {}
    });

    // API call commented out - uncomment when ready
    // if (this.addressForm.invalid) {
    //   this.addressForm.markAllAsTouched();
    //   const invalidControls = Object.keys(this.addressForm.controls)
    //     .filter(key => this.addressForm.get(key)?.invalid);
    //   console.warn('Address form invalid on submit. Invalid controls:', invalidControls);
    //   return;
    // }
    // this.isLoading = true;
    // this.bseUccReg.getUccAddressContData(input).subscribe({
    //   next: (response: { success: boolean; message: string }) => {
    //     console.log('API Response:', response);
    //     this.isLoading = false;
    //     if (response.success) {
    //       this.sharedSer.successDia(response.message).subscribe((result: any) => {
    //         if (result) {
    //           this.nextTab.emit({
    //             index: 2,
    //             state: {
    //               isUpdateKYC: true,
    //               MembID: input.MembID || null,
    //               clieCode: input.clieCode || ''
    //             }
    //           });
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
}
