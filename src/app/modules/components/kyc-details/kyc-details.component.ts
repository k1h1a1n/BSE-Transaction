import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Shared } from '../../../shared/services/shared';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { KYCRequest } from '../../models/bseUCCModel';
import { ProgressBarModule } from 'primeng/progressbar';
import { UCCTabsFacade } from '../store/facade/ucctabs.facade';

@Component({
  selector: 'app-kyc-details',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, ProgressBarModule],
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.scss']
})
export class KycDetailsComponent implements OnInit {
  isLoading: boolean = false;

  kycForm!: FormGroup;
  Validators = Validators;
  kycTypeOptions = [
    { key: 'B', value: 'BIOMETRIC KYC' },
    { key: 'C', value: 'CKYC Compliant' },
    { key: 'E', value: 'Aadhhaar EKYC PAN' },
    { key: 'K', value: 'KRA Compliant' }
  ];

  @Output() nextTab = new EventEmitter<any>();
  isEdit: boolean = false;
  isUpdate: boolean = false;
  editClientCode: string = '';
  holdingPattern: string = '';
  taxStatus: string = '';
  applicantCount: number = 1;

  private uccTabsFacade = inject(UCCTabsFacade);

  constructor(
    private fb: FormBuilder,
    private bseUccReg: BseUCCRegister,
    private sharedService: Shared,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.kycForm = this.fb.group({
      kycType1Holder: ['', Validators.required],
      kycType2Holder: [''],
      kycType3Holder: [''],
      kycTypeGuardian: [''],
      ckycNo1Holder: [{ value: '', disabled: true }],
      ckycNo2Holder: [{ value: '', disabled: true }],
      ckycNo3Holder: [{ value: '', disabled: true }],
      ckycNoGuardian: [{ value: '', disabled: true }],
    });

    // Setup CKYC conditional validation for all 4 pairs
    this.setupCKYCToggle('kycType1Holder', 'ckycNo1Holder');
    this.setupCKYCToggle('kycType2Holder', 'ckycNo2Holder');
    this.setupCKYCToggle('kycType3Holder', 'ckycNo3Holder');
    this.setupCKYCToggle('kycTypeGuardian', 'ckycNoGuardian');

    // ✅ Subscribe to NgRx store for edit mode & client code
    this.uccTabsFacade.isEditMode$.subscribe((isEditMode) => {
      this.isEdit = isEditMode;
      this.isUpdate = isEditMode;
      console.log('[KycDetails] isEdit from store:', this.isEdit);
    });

    this.uccTabsFacade.editData$.subscribe((editData) => {
      if (editData) {
        this.editClientCode = editData.cliecode || '';
        console.log('[KycDetails] editClientCode from store:', this.editClientCode);

        // In edit mode, get holding pattern & tax status from edit data and patch form
        if (this.isEdit) {
          if (editData.HoldID) this.holdingPattern = editData.HoldID;
          if (editData.TaxStatus) this.taxStatus = editData.TaxStatus;
          this.applyFieldStates();

          // Patch form with edit data
          this.kycForm.patchValue({
            kycType1Holder: editData.PH_KYCType || editData.kycType1Holder || '',
            kycType2Holder: editData.SH_KYCType || editData.kycType2Holder || '',
            kycType3Holder: editData.TH_KYCType || editData.kycType3Holder || '',
            kycTypeGuardian: editData.GD_KYCType || editData.kycTypeGuardian || '',
            ckycNo1Holder: editData.PH_CKYCNo || editData.ckycNo1Holder || '',
            ckycNo2Holder: editData.SH_CKYCNo || editData.ckycNo2Holder || '',
            ckycNo3Holder: editData.TH_CKYCNo || editData.ckycNo3Holder || '',
            ckycNoGuardian: editData.GD_CKYCNo || editData.ckycNoGuardian || '',
          });
        }
      }
    });

    // ✅ Get data from NgRx store registrationData (UccRegisterMember) for create mode
    this.uccTabsFacade.registrationData$.subscribe((regData) => {
      if (regData && !this.isEdit) {
        // regData is now UccRegisterMember with clieCode, holdingPattern, taxStatus, Applicants[]
        this.editClientCode = regData.clieCode || '';
        this.holdingPattern = regData.holdingPattern || '';
        this.taxStatus = regData.taxStatus || '';
        this.applicantCount = regData.Applicants?.length || 1;
        console.log('[KycDetails] From store → clieCode:', this.editClientCode,
          'holdingPattern:', this.holdingPattern, 'taxStatus:', this.taxStatus,
          'applicantCount:', this.applicantCount);
        this.applyFieldStates();
      }
    });
  }

  /**
   * Setup CKYC No field toggle:
   * - Enabled + required ONLY when dropdown value is 'C' (CKYC Compliant)
   * - Disabled + cleared otherwise
   */
  private setupCKYCToggle(kycTypeControl: string, ckycNoControl: string) {
    this.kycForm.get(kycTypeControl)?.valueChanges.subscribe((value) => {
      const ckycField = this.kycForm.get(ckycNoControl);
      const kycTypeField = this.kycForm.get(kycTypeControl);
      if (!ckycField || !kycTypeField) return;

      // Only toggle if the parent kycType field is enabled
      if (kycTypeField.disabled) {
        ckycField.clearValidators();
        ckycField.setValue('', { emitEvent: false });
        ckycField.disable({ emitEvent: false });
        ckycField.updateValueAndValidity({ emitEvent: false });
        return;
      }

      if (value === 'C') {
        ckycField.setValidators([Validators.required]);
        ckycField.enable({ emitEvent: false });
      } else {
        ckycField.clearValidators();
        ckycField.setValue('', { emitEvent: false });
        ckycField.disable({ emitEvent: false });
      }
      ckycField.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Apply field enable/disable based on holding pattern and tax status.
   *
   * Holding pattern:
   *   SI (Single)             → 1 applicant  → only 1st holder
   *   JO (Joint)              → 2 applicants → 1st + 2nd holder
   *   AS (Anyone or Survivor) → 3 applicants → 1st + 2nd + 3rd holder
   *
   * Tax status:
   *   02 (Minor) → enable guardian fields, disable all holder fields
   */
  private applyFieldStates() {
    const isMinor = this.taxStatus === '02';
    // Use Applicants array length from store; fallback to holding pattern map
    const fallbackMap: { [key: string]: number } = { 'SI': 1, 'JO': 2, 'AS': 3 };
    const applicantCount = this.applicantCount > 0 ? this.applicantCount : (fallbackMap[this.holdingPattern] || 1);

    console.log('[KycDetails] applyFieldStates → applicantCount:', applicantCount, 'isMinor:', isMinor);

    if (isMinor) {
      // Minor mode: disable all holder fields, enable guardian
      this.disableField('kycType1Holder');
      this.disableField('kycType2Holder');
      this.disableField('kycType3Holder');
      this.disableField('ckycNo1Holder');
      this.disableField('ckycNo2Holder');
      this.disableField('ckycNo3Holder');
      this.enableField('kycTypeGuardian', true);
      // ckycNoGuardian toggled by setupCKYCToggle when kycTypeGuardian value changes
      return;
    }

    // Not minor → disable guardian
    this.disableField('kycTypeGuardian');
    this.disableField('ckycNoGuardian');

    // 1st holder — always enabled
    this.enableField('kycType1Holder', true);
    // ckycNo1Holder toggled by setupCKYCToggle

    // 2nd holder
    if (applicantCount >= 2) {
      this.enableField('kycType2Holder', true);
    } else {
      this.disableField('kycType2Holder');
      this.disableField('ckycNo2Holder');
    }

    // 3rd holder
    if (applicantCount >= 3) {
      this.enableField('kycType3Holder', true);
    } else {
      this.disableField('kycType3Holder');
      this.disableField('ckycNo3Holder');
    }
  }

  private enableField(controlName: string, required: boolean = false) {
    const control = this.kycForm.get(controlName);
    if (!control) return;
    control.enable({ emitEvent: false });
    if (required) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  private disableField(controlName: string) {
    const control = this.kycForm.get(controlName);
    if (!control) return;
    control.clearValidators();
    control.setValue('', { emitEvent: false });
    control.disable({ emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Get client code: from edit store in edit mode, else from registration store
   */
  get clientCode(): string {
    return this.editClientCode || '';
  }

  mapFormToKYCRequest(formValue: any): KYCRequest {
    return {
      clientCode: this.clientCode,
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

  goBack() {
    this.nextTab.emit({
      index: 1,
      state: {}
    });
  }

  /**
   * Save & Continue — validate, print JSON, move to next tab
   */
  kycVerification() {
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      const invalidControls = Object.keys(this.kycForm.controls)
        .filter(key => this.kycForm.get(key)?.invalid);
      console.warn('KYC form invalid. Invalid controls:', invalidControls);
      this.sharedService.OpenAlert('Please fill all required fields correctly.');
      return;
    }

    const rawFormValue = this.kycForm.getRawValue();
    const input: KYCRequest = this.mapFormToKYCRequest(rawFormValue);
    console.log('✅ KYC Save Input JSON:', JSON.stringify(input, null, 2));

    // TODO: Uncomment API call when ready
    this.nextTab.emit({
      index: 3,
      state: {}
    });
  }

  /**
   * Update & Continue — validate, print JSON, move to next tab
   */
  kycUpdateVerification() {
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      const invalidControls = Object.keys(this.kycForm.controls)
        .filter(key => this.kycForm.get(key)?.invalid);
      console.warn('KYC form invalid. Invalid controls:', invalidControls);
      this.sharedService.OpenAlert('Please fill all required fields correctly.');
      return;
    }

    const rawFormValue = this.kycForm.getRawValue();
    const input: KYCRequest = this.mapFormToKYCRequest(rawFormValue);
    console.log('✅ KYC Update Input JSON:', JSON.stringify(input, null, 2));

    // TODO: Uncomment API call when ready
    this.nextTab.emit({
      index: 3,
      state: {}
    });
  }
}