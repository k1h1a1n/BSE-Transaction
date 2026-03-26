import { CommonModule } from '@angular/common';
import { COUNTRY_LIST } from './country-list';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Location } from '@angular/common';
import { BseUccEditDetails, UccAddressDetails } from '../../models/bseUCCModel';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Shared } from '../../../shared/services/shared';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider'
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {
  OnChanges,
  SimpleChanges
} from '@angular/core';

export interface TabNavigationEvent {
  index: number;
  state?: {
    isUpdateKYC: boolean;
    MembID: any;
    clieCode: any;
  };
}

@Component({
  selector: 'app-address-details',
  imports: [BreadcrumbModule, MatSelectModule, MatOptionModule, MatDividerModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, ProgressBarModule],
  templateUrl: './address-details.html',
  styleUrl: './address-details.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AddressDetails implements OnChanges {
  isLoading: boolean = false;

  //  @Output() nextTab = new EventEmitter<number>();
  @Output() nextTab = new EventEmitter<number | TabNavigationEvent>();

  @Input() tabState: any;
  addressForm!: FormGroup;
  activeTab: number = 0;
  isEdit: boolean = false;
  memberID: string = '';
  clientCode: any;
  isUpdate: boolean = false;
  clieCodeFromUpdate: any;
  memberIdFromUpdate: any;
  editedResp: any = [];
  memberList: any[] = [];



  stateList = [
    // { key: '0', value: 'Select' },
    { key: 'AN', value: 'Andaman & Nicobar' },
    { key: 'AR', value: 'ArunachalPradesh' },
    { key: 'AP', value: 'Andhra Pradesh' },
    { key: 'AS', value: 'Assam' },
    { key: 'BH', value: 'Bihar' },
    { key: 'CH', value: 'Chandigarh' },
    { key: 'CG', value: 'Chhattisgarh' },
    { key: 'DL', value: 'Delhi' },
    { key: 'GO', value: 'GOA' },
    { key: 'GU', value: 'Gujarat' },
    { key: 'HA', value: 'Haryana' },
    { key: 'HP', value: 'Himachal Pradesh' },
    { key: 'JM', value: 'Jammu & Kashmir' },
    { key: 'JK', value: 'Jharkhand' },
    { key: 'KA', value: 'Karnataka' },
    { key: 'KE', value: 'Kerala' },
    { key: 'MP', value: 'Madhya Pradesh' },
    { key: 'MA', value: 'Maharashtra' },
    { key: 'MN', value: 'Manipur' },
    { key: 'ME', value: 'Meghalaya' },
    { key: 'MI', value: 'Mizoram' },
    { key: 'NA', value: 'Nagaland' },
    { key: 'ND', value: 'New Delhi' },
    { key: 'OR', value: 'Odisha' },
    { key: 'PO', value: 'Pondicherry' },
    { key: 'PU', value: 'Punjab' },
    { key: 'RA', value: 'Rajasthan' },
    { key: 'SI', value: 'Sikkim' },
    { key: 'TN', value: 'Tamil Nadu' },
    { key: 'TR', value: 'Tripura' },
    { key: 'UP', value: 'Uttar Pradesh' },
    { key: 'UC', value: 'Uttaranchal' },
    { key: 'WB', value: 'West Bengal' },
    { key: 'DN', value: 'Dadra and Nagar Haveli' },
    { key: 'DD', value: 'Daman and Diu' }
  ];


  countryList = COUNTRY_LIST;

  constructor(private fb: FormBuilder, private bseUccReg: BseUCCRegister, private router: Router, private sharedSer: Shared, private location: Location,) { }


  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['tabState']) {
      return;
    }

    const state = changes['tabState'].currentValue;

    if (state) {
      console.log('Address Details received state:', state);

      // ✅ match emitted property name
      this.isUpdate = state.isUpdate === true;

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


    this.addressForm = this.fb.group({


      // kyc tab details
      firstName: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        Validators.minLength(2),
        Validators.maxLength(25)]],
      middleName: ['',
        [
          Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
          Validators.minLength(1),
          Validators.maxLength(25)]],
      lastName: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
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
    }
    )

    // Pre-seed required name/gender fields from stored registration data so the
    // initial submit does not fail validation silently when the UI doesn't expose
    // these controls.
    this.seedMandatoryFields();


    const navState = history.state;
    this.isUpdate = navState?.isUpdate === true;
    this.isEdit = navState?.isEdit === true;

    console.log('isEdit , isUpdate', this.isEdit, this.isUpdate);

    // if isUpdate= true
    this.memberIdFromUpdate = navState?.MembID;
    this.clieCodeFromUpdate = navState.clieCode;
    console.log('member id and clie code', this.memberIdFromUpdate, this.clieCodeFromUpdate);

    // if this is Edit = true
    if (this.isEdit) {
      this.onNavStateEdit();
    }

    // if (this.isUpdate) {
    //   this.getEditApiData(this.clieCodeFromUpdate);
    // }

    if (!this.isEdit && !this.isUpdate) {
      const selectedMemberData = JSON.parse(localStorage.getItem('selectedMemberData') || 'null');
      console.log('selectedMemberData', selectedMemberData);
      if (selectedMemberData) {
        this.prefillFormValue(selectedMemberData);
      }
    }
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
    this.location.back();
    const saved = localStorage.getItem('uccRegistrationData');
  }

  navToDepoBankDetail() {
    this.router.navigate(['/app/depoBankDetails'])
  }

  goToNextTab() {
    this.nextTab.emit(2);  // navigate to tab index 1
  }

  onNavStateEdit() {
    if (this.isEdit) {
      const navState = history.state;
      console.log(navState, 'nav state');

      if (navState?.uccAddressDetails) {
        const ucc = navState.uccAddressDetails[0];
        console.log(ucc, 'uccAddress details');

        this.memberID = ucc.MembID;
        this.clientCode = ucc.cliecode;
        console.log(this.memberID, 'member Id');

        console.log(this.clientCode, 'client code');

        const members = JSON.parse(localStorage.getItem('GetGroupMembersUCC_TTL') || '[]');

        console.log('Looking for membID:', this.memberID, typeof this.memberID);
        console.table(members.map((m: { membID: any; }) => ({ membID: m.membID, type: typeof m.membID })));

        const matchedMember = members.find(
          (m: { membID: any; }) => String(m.membID).trim() === String(this.memberID).trim()
        );

        if (matchedMember) {
          console.log('Matched Member:', matchedMember);

          const nameParts = matchedMember.fullName?.trim().split(/\s+/) || [];

          this.addressForm.patchValue({
            firstName: nameParts[0] || '',
            middleName: nameParts.length > 2 ? nameParts[1] : '',
            lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',

            addLine1: matchedMember.addressLine1?.trim() || '',
            addLine2: matchedMember.addressLine2?.trim() || '',
            addLine3: matchedMember.addressLine3?.trim() || '',
            city: matchedMember.city?.trim() || '',
            pincode: matchedMember.pinCode?.trim() || '',
            gender: matchedMember.clieGender?.trim() || ''
          });

          console.log(this.addressForm.value, 'address form value');

        } else {
          console.warn('No match found for membID:', this.memberID);
        }


      } else {
        console.warn('No match found for membID:', this.memberID);
      }

    }

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

      console.log(this.editedResp, 'editedResp');

      const ucc = this.editedResp;
      console.log(ucc, 'uccAddress details');

      this.memberID = ucc.MembID;
      this.clientCode = ucc.cliecode;
      console.log(this.memberID, 'member Id');
      console.log(this.clientCode, 'client code');
      localStorage.setItem('editedBseClientCode', ucc.cliecode);

      // const fullName = ucc?.Clieapplname1?.trim() || '';
      const fullName = ucc?.fullname?.trim() || '';
      const nameParts = fullName.split(' ');

      this.addressForm.patchValue({
        firstName: nameParts[0] || '',
        middleName: nameParts.length > 2 ? nameParts[1] : '',
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',

        addLine1: ucc?.ClienAddr1?.trim() || '',
        addLine2: ucc?.ClienAddr2?.trim() || '',
        addLine3: ucc?.ClienAddr3?.trim() || '',
        city: ucc?.ClienCity?.trim() || '',
        // state: ucc?.ClienState?.trim() || '',
        pincode: ucc?.PinCode?.trim() || '',
        // country: ucc?.Country?.trim() || '',
        gender: ucc.ClieGend?.trim() || '',
      });

      console.log('Address form patched from navState:', this.addressForm.value);
    }
  }


  nextTabSubmit(): void {
    // if (
    //   this.activeTab === 0 &&
    //   (this.addressForm.invalid)
    // ) {
    //   this.addressForm.markAllAsTouched();
    //   return;
    // }

    // if (this.activeTab < 2) {
    //   console.log('address Form value', this.addressForm.value);
    //   this.submitData();
    // }

    this.submitData();
  }

  prefillFormValue(address: any) {
    this.addressForm.patchValue({

      firstName: address.firsName?.trim() || '',
      middleName: address.middName?.trim() || '',
      lastName: address.lastName?.trim() || '',
      city: address.city?.trim() || '',
      pincode: address.pinCode?.trim() || '',
      //  state: address.state?.trim() || '',
      gender: address.clieGender?.trim() || '',
      // country: this.countryList[100],
      addLine1: address.addressLine1?.trim() || '',
      addLine2: address.addressLine2?.trim() || '',
      addLine3: address.addressLine3?.trim() || '',

    });
    console.log(this.addressForm.value, 'address form value of selected member');

  }

  private seedMandatoryFields() {
    const mandatory = this.getmandatoryDetOfRegistration();
    if (mandatory) {
      this.addressForm.patchValue({
        firstName: mandatory.firstName || '',
        middleName: mandatory.middleName || '',
        lastName: mandatory.lastName || '',
        gender: mandatory.gender || ''
      });
      console.log('Address mandatory fields prefilled from registration data');
    } else {
      console.warn('No mandatory registration data found to prefill address form');
    }
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

  getmandatoryDetOfRegistration() {
    const data = localStorage.getItem('uccRegistrationData');
    if (!data) return null;

    try {
      const parsed = JSON.parse(data || '{}');

      // Prefer explicit form fields if present
      let firstName = (parsed.firstName || parsed.firsName || parsed.FirstName || '').toString().trim();
      let middleName = (parsed.middleName || parsed.middName || parsed.MiddleName || '').toString().trim();
      let lastName = (parsed.lastName || parsed.lastName || parsed.LastName || '').toString().trim();

      // Gender may be under several keys depending on source
      const gender = (parsed.gender || parsed.clieGender || parsed.Gender || parsed.ClieGend || '').toString().trim();

      // If first/middle/last are missing but memberDetails.name exists, split that
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

      return {
        firstName: firstName || null,
        middleName: middleName || null,
        lastName: lastName || null,
        gender: gender || null,
        raw: parsed // expose raw parsed object if caller needs other keys
      };
    } catch (e) {
      console.error('Error parsing uccRegistrationData:', e);
      return null;
    }
  }

  mapFormToUccAddressDetails(formValue: any): UccAddressDetails {
    // Prefer explicit form values; fall back to parsed registration data when missing
    const mandatory = this.getmandatoryDetOfRegistration() || {} as any;

    const firstName = mandatory?.firstName || (formValue.firstName && formValue.firstName.toString().trim()) || '';
    const middleName = mandatory?.middleName || (formValue.middleName && formValue.middleName.toString().trim()) || '';
    const lastName = mandatory?.lastName || (formValue.lastName && formValue.lastName.toString().trim()) || '';
    const gender = mandatory?.gender || (formValue.gender && formValue.gender.toString().trim()) || '';
    console.log(firstName, middleName, lastName, gender, 'names in map function');
    return {
      clieCode: this.BseClientCode,
      MembID: Number(this.MemberDetailID),
      Gender: gender,
      AddressLine1: formValue.addLine1,
      AddressLine2: formValue.addLine2,
      AddressLine3: formValue.addLine3,
      Pincode: formValue.pincode,
      City: formValue.city,
      State: formValue.state,
      Country: formValue.country,
      FirstName: firstName,
      MiddleName: middleName,
      LastName: lastName
    };



  }

  submitData() {
    // if (this.addressForm.invalid) {
    //   this.addressForm.markAllAsTouched();
    //   const invalidControls = Object.keys(this.addressForm.controls)
    //     .filter(key => this.addressForm.get(key)?.invalid);
    //   console.warn('Address form invalid on submit. Invalid controls:', invalidControls);
    //   return;
    // }

    console.log('Address Form Submitted', this.addressForm.value);

    const rawFormValue = this.addressForm.getRawValue();
    console.log('Address Form Submitted', rawFormValue);

    const bseClientCode = this.BseClientCode || '';
    rawFormValue.bseClientCode = bseClientCode;

    console.log('address raw form value', rawFormValue);

    localStorage.setItem('uccAddressData', JSON.stringify(rawFormValue));

    const input: UccAddressDetails = this.mapFormToUccAddressDetails(rawFormValue);
    input.clieCode = rawFormValue.bseClientCode;

    console.log('clie code', input.clieCode);

    this.isLoading = true;

    this.bseUccReg.getUccAddressContData(input).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('API Response:', response);
        this.isLoading = false;

        if (response?.success === true) {
          this.sharedSer.successDia(response?.message).subscribe(result => {
            if (result === true) {
              this.nextTab.emit(2);  // Emit to parent to switch to KYC Details tab
            }
            // this.isLoading = false;
          }
          )
        }
        else {
          this.isLoading = false;
          this.sharedSer.OpenAlert('Failed to save address details.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration Edit Error:', err);
        this.sharedSer.OpenAlert('Something went wrong while saving address details.');
      }
    });

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

  allowOnlyNumbers(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // Remove non-numeric
    this.addressForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }





  updateDataAndContinue() {
    console.log("update called");
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      const invalidControls = Object.keys(this.addressForm.controls)
        .filter(key => this.addressForm.get(key)?.invalid);
      console.warn('Address form invalid on submit. Invalid controls:', invalidControls);
      return;
    }

    console.log('Address Form Submitted', this.addressForm.value);

    const rawFormValue = this.addressForm.getRawValue();
    console.log('Address Form Submitted', rawFormValue);

    const bseClientCode = this.BseClientCode || '';
    rawFormValue.bseClientCode = bseClientCode;

    console.log('address raw form value', rawFormValue);

    localStorage.setItem('uccAddressData', JSON.stringify(rawFormValue));


    const input: UccAddressDetails = this.mapFormToUccAddressDetails(rawFormValue);
    input.clieCode = rawFormValue.bseClientCode;
    input.MembID = this.memberIdFromUpdate || Number(this.MemberDetailID);

    console.log('clie code', input.clieCode);

    this.isLoading = true;

    this.bseUccReg.getUccAddressContData(input).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('API Response:', response);
        this.isLoading = false;

        const editedBseClientCode = localStorage.getItem('editedBseClientCode');
        console.log(editedBseClientCode, 'edited BSE Client Code');

        if (response.success) {
          this.sharedSer.successDia(response.message).subscribe((result: any) => {
            if (result) {   // result === true when OK clicked
              // Pass state with tab navigation for update mode
              this.nextTab.emit({
                index: 2,
                state: {
                  isUpdateKYC: true,
                  MembID: input.MembID || null,
                  clieCode: editedBseClientCode || input.clieCode || ''
                }
              });
            }
          });
        }
        // this.isLoading = false;

        else {
          this.isLoading = false;
          this.sharedSer.OpenAlert('Failed to save address details.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration Edit Error:', err);
        this.sharedSer.OpenAlert('Something went wrong while saving address details.');
      }
    });

  }
}
