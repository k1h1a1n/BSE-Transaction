import { Component, EventEmitter, inject, Output } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Applicant, UccMemberInfo, UccRegisterMember } from '../../models/bseUCCModel';
import { Shared } from '../../../shared/services/shared';
import { Location } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { SharedEnv } from '../../../shared/environments/environment';
import { IndexedDBService } from '../../../shared';
import { UCCTabsFacade } from '../store/facade/ucctabs.facade';
import {
  TAX_STATUS_LIST, HOLDING_PATTERN_LIST, KYC_TYPE_OPTIONS, STATE_LIST, COUNTRY_LIST,
  EMAIL_DECLARATION_OPTIONS, MOBILE_DECLARATION_OPTIONS, APPLICANT_COUNT_BY_HOLDING_PATTERN,
  OCCUPATION_LIST, REGISTRATION_TYPE_OPTIONS
} from './bse-registerinvestors.constants';



@Component({
  selector: 'app-bse-registerinvestors',
  standalone: true,
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    SelectButton, InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, ProgressBarModule, AutoCompleteModule],
  templateUrl: './bse-registerinvestors.html',
  styleUrls: ['./bse-registerinvestors.scss'],
  animations: []
})
export class BseRegisterinvestors {
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private location: Location, private sharedService: Shared, private router: Router, private bseUCCService: BseUCCRegister) {
    console.log('✅ BseRegisterinvestorsComponent loaded');
  }


  taxStatusList = TAX_STATUS_LIST;

  holdingPatternList = HOLDING_PATTERN_LIST;

  kycTypeOptions = KYC_TYPE_OPTIONS;

  stateList = STATE_LIST;

  countryList = COUNTRY_LIST;

  emailDeclarationOptions = EMAIL_DECLARATION_OPTIONS;

  mobileDeclarationOptions = MOBILE_DECLARATION_OPTIONS;

  // Applicant count mapping for holding patterns
  applicantCountByHoldingPattern = APPLICANT_COUNT_BY_HOLDING_PATTERN;

  occupationList = OCCUPATION_LIST;

  registrationTypeOptions = [...REGISTRATION_TYPE_OPTIONS];


  today!: string;
  isEdit: boolean = false;  // synced from NgRx store
  memberID!: string;
  selectedTabIndex = 1;   // default tab
  selectedMemberId = '';
  selectedGrp: string = '';
  filteredMembers: any[] = [];
  filteredMembers_2: any[] = [];
  filteredMembers_3: any[] = [];
  registrationForm!: FormGroup;
  memberList: any[] = [];
  fullMemberData: any[] = [];
  groupList: any[] = [];
  filteredGroups: any[] = [];
  isSelectingGroup = false;
  groupLookupError: string | null = null;
  isGroupLookupLoading = false;
  applicants: any[] = [];  // Array to hold applicant data
  private idbsvc = inject(IndexedDBService);
  private uccTabsFacade = inject(UCCTabsFacade);
  @Output() nextTab = new EventEmitter<{ index: number, state?: any }>();

  ngOnInit() {

    this.registrationForm = this.fb.group({
      groupId: ['', Validators.required],
      groupSearch: [''],
      memberName: ['', Validators.required],
      memberSearch: [''],
      registrationType: ['New', Validators.required],
      bseClientCode: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-Z0-9]*$/)
      ]],
      // memberID: [{ value: '', disabled: true }],
      taxStatus: ['01', Validators.required],
      holdingPattern: ['', Validators.required],
      nominationOpted: ['N', Validators.required],
      nominationAuthentication: ['O', Validators.required],

      // 1st Applicant Section
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
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      gender: ['M', Validators.required],
      dob: ['', [Validators.required, this.minimumAgeValidator(18)]],

      occupation: ['', Validators.required],
      mobile: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ])],
      mobileDeclaration: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ])],

      emailDeclaration: ['', Validators.required],
      kycType: ['K', Validators.required],


      // 2nd Applicant Section
      memberName_2: [''],
      firstName_2: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        Validators.minLength(2),
        Validators.maxLength(25)]],
      middleName_2: ['',
        [
          Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
          Validators.minLength(1),
          Validators.maxLength(25)]],
      lastName_2: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        Validators.minLength(2),
        Validators.maxLength(25)]],
      pan_2: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      gender_2: ['', Validators.required],
      dob_2: ['', [Validators.required, this.minimumAgeValidator(18)]],

      occupation_2: ['', Validators.required],
      mobile_2: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ])],
      mobileDeclaration_2: ['', Validators.required],
      email_2: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ])],

      emailDeclaration_2: ['', Validators.required],
      kycType_2: ['K', Validators.required],

      // 3rd Applicant Section
      memberName_3: [''],
      firstName_3: ['',

        // [Validators.required,
        // Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        // Validators.minLength(2),
        // Validators.maxLength(25)]
        null
      ],

      middleName_3: ['',
        // [
        //   Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        //   Validators.minLength(1),
        //   Validators.maxLength(25)]
        null
      ],
      lastName_3: ['',
        // [Validators.required,
        // Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        // Validators.minLength(2),
        // Validators.maxLength(25)]
        null
      ],
      pan_3: ['',
        // [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]
        null
      ],
      gender_3: ['', null],
      dob_3: ['', null],

      occupation_3: ['', null],
      mobile_3: ['',
        // Validators.compose([
        //   Validators.required,
        //   Validators.pattern(/^[6-9]\d{9}$/)
        // ])
        null
      ],
      mobileDeclaration_3: [''],
      email_3: ['',
        //    Validators.compose([
        //   Validators.required,
        //   Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        // ])
        null
      ],

      emailDeclaration_3: ['', null],
      kycType_3: ['K', null],
    });
    this.d_V();
    this.registrationForm.patchValue({
      holdingPattern: 'SI'
    })
    this.getGroupByLogin();
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    const randomTenDigitNumber = this.generateTenDigitCode();
    this.registrationForm.get('bseClientCode')?.setValue(randomTenDigitNumber.toString());
    console.log(randomTenDigitNumber, 'randomTenDigitNumber');


    // ✅ Subscribe to NgRx store for edit mode
    this.uccTabsFacade.isEditMode$.subscribe((isEditMode) => {
      this.isEdit = isEditMode;
      console.log('[BseRegisterinvestors] isEdit from store:', this.isEdit);

      if (this.isEdit) {
        this.isEditData();
      }
      this.updateFormControlsBasedOnEditMode();
      this.updateRegistrationTypeOptions();
    });

    this.registrationForm.get('memberName')?.valueChanges.subscribe(() => {
      this.updateBSEClientCode();
      this.updateFilteredMembers();
    });

    this.registrationForm.get('memberName_2')?.valueChanges.subscribe(() => {
      this.updateFilteredMembers();
    });

    this.registrationForm.get('memberName_3')?.valueChanges.subscribe(() => {
      this.updateFilteredMembers();
    });

  }

  goToNextTab() {
    this.submitDataandContinue();
  }

  splitFullName(fullName: any) {
    const parts = fullName.trim().split(/\s+/); // split by spaces

    let firstName = '';
    let middleName = '';
    let lastName = '';

    if (parts.length === 1) {
      firstName = parts[0];
    }
    else if (parts.length === 2) {
      firstName = parts[0];
      lastName = parts[1];
    }
    else {
      firstName = parts[0];
      lastName = parts[parts.length - 1];
      middleName = parts.slice(1, -1).join(' ');  // combine remaining as middle name
    }

    return { firstName, middleName, lastName };
  }

  updateFormControlsBasedOnEditMode() {
    const controls = ['taxStatus', 'holdingPattern', 'bseClientCode', 'dob', 'pan', 'nominationOpted', 'nominationAuthentication', 'kycType'];

    controls.forEach(controlName => {
      const control = this.registrationForm.get(controlName);
      if (!control) return;

      if (this.isEdit && control.value && control.valid) {
        control.disable();

      } else if (!this.isEdit && control.disabled) {
        control.enable();
        this.getGroupMemberDetails();
      }
    });

    // Clear validators for group and member fields when in edit mode
    if (this.isEdit) {
      const fieldsToSkipValidation = ['groupId', 'groupSearch', 'memberName', 'memberSearch'];
      fieldsToSkipValidation.forEach(fieldName => {
        const control = this.registrationForm.get(fieldName);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
  }

  isEditData() {
    console.log(this.isEdit, 'isEdit from store');

    // ✅ Read edit data from NgRx store
    this.uccTabsFacade.editData$.subscribe((editData) => {
      if (editData) {
        const ucc = editData;
        this.memberID = ucc.MembID;
        console.log(ucc, this.memberID, 'edit data from store and memberId');
        console.log(ucc.cliecode, 'edited clie code');
        localStorage.setItem('editedBseClientCode', ucc.cliecode);

        const nameParts = this.splitFullName(ucc.fullname);

        this.registrationForm.patchValue({
          bseClientCode: ucc.cliecode?.trim() || '',
          firstName: nameParts.firstName,
          middleName: nameParts.middleName,
          lastName: nameParts.lastName,
          gender: ucc.ClieGend,
          dob: this.formatDateForInput(ucc.ClieDOB) || '',
          pan: ucc.CliePAN?.trim() || '',
          occupation: ucc.OccuCode?.trim() || '',
          mobile: ucc.Mobil?.trim() || '',
          mobileDeclaration: ucc.Filler1 || '',
          email: ucc.Email?.trim() || '',
          emailDeclaration: ucc.Filler2 || '',
          taxStatus: ucc.TaxStatus || '',
          holdingPattern: ucc.HoldID || '',
          kycType: ucc.PH_KYCType || '',
          nominationOpted: ucc.NomiOpt || '',
          nominationAuthentication: ucc.NomiAuthMode || '',
        });
        console.log(this.registrationForm.value, 'patched value from store');
      } else {
        console.warn('⚠️ No edit data found in store');
      }
    });
  }

  updateBSEClientCode(): void {
    const bseControl = this.registrationForm.get('bseClientCode');
    let value = bseControl?.value || '';

    if (/^\d{10}$/.test(value)) {
      const base = value.slice(0, 8);
      let lastTwo = parseInt(value.slice(8), 10);
      lastTwo = (lastTwo + 1) % 100;
      const newCode = base + lastTwo.toString().padStart(2, '0');
      bseControl?.setValue(newCode);
    }
  }

  generateTenDigitCode = (): number => {
    const min = 1_000_000_000;
    const max = 9_999_999_999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  private buildFormDefaults(overrides: Partial<Record<string, any>> = {}): Record<string, any> {
    return {
      groupId: '',
      groupSearch: '',
      memberName: '',
      memberSearch: '',
      registrationType: this.isEdit ? 'Mod' : 'New',
      bseClientCode: this.generateTenDigitCode().toString(),
      taxStatus: this.taxStatusList[0]?.value || '',
      holdingPattern: this.holdingPatternList[0]?.value || '',
      nominationOpted: 'N',
      nominationAuthentication: 'O',
      firstName: '',
      middleName: '',
      lastName: '',
      pan: '',
      gender: '',
      dob: '',
      occupation: '',
      mobile: '',
      mobileDeclaration: '',
      email: '',
      emailDeclaration: '',
      kycType: 'K',
      ...overrides
    };
  }

  private resetFormToDefaults(preserve: Partial<Record<string, any>> = {}): void {
    if (!this.registrationForm) {
      return;
    }

    const defaults = this.buildFormDefaults(preserve);
    this.registrationForm.reset({}, { emitEvent: false });
    this.registrationForm.patchValue(defaults, { emitEvent: false });
    this.registrationForm.markAsPristine();
    this.registrationForm.markAsUntouched();
    this.updateRegistrationTypeOptions();
  }

  onGroupComplete(event: AutoCompleteCompleteEvent) {
    if (this.isSelectingGroup) {
      return;
    }

    const query = event?.query?.trim() || '';

    if (this.selectedGrp && query !== this.getSelectedGroupDescription()) {
      this.registrationForm.get('groupId')?.setValue('', { emitEvent: false });
      this.selectedGrp = '';
      this.resetFormToDefaults({ groupSearch: query });
      this.memberList = [];
      this.filteredMembers = [];
      this.fullMemberData = [];
      this.selectedMemberId = '';
      localStorage.removeItem('selectedGroupID');
      localStorage.removeItem('selectedMemberData');
      localStorage.removeItem('GetGroupMembersUCC_TTL');
    }

    if (query.length < 3) {
      this.filteredGroups = [];
      return;
    }

    const normalizedQuery = query.toLowerCase();
    this.filteredGroups = this.groupList.filter(group =>
      (group.GroupDescription || '').toLowerCase().includes(normalizedQuery)
    );
  }

  onGroupSelect(event: AutoCompleteSelectEvent) {
    const selectedGroup = event?.value;
    if (selectedGroup) {
      this.selectGroup(selectedGroup);
    }
  }

  onMemberComplete(event: AutoCompleteCompleteEvent) {
    const query = (event?.query ?? '').trim().toLowerCase();

    if (!this.registrationForm.get('groupId')?.value) {
      this.filteredMembers = [];
      return;
    }

    if (!query) {
      this.filteredMembers = this.sortMembers(this.memberList);
      return;
    }

    this.filteredMembers = this.sortMembers(
      this.memberList.filter(member =>
        (member.LookUpDescription || '').toLowerCase().includes(query)
      )
    );
  }

  onMemberSelect(event: AutoCompleteSelectEvent) {
    const selectedMember = event?.value;
    if (selectedMember) {
      this.selectMember(selectedMember);
    }
  }

  private getSelectedGroupDescription(): string {
    const matchedGroup = this.groupList.find(group => group.GroupID === this.selectedGrp);
    return matchedGroup?.GroupDescription || this.registrationForm.get('groupSearch')?.value || '';
  }

  private extractMemberArray(response: any): any[] {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    const possibleCollections = [
      response.data,
      response.Data,
      response.members,
      response.MemberDetails,
      response.groupMembers,
      response.GroupMembers,
      response?.data?.GroupMembers,
      response?.data?.members,
      response?.httpResponse?.body?.GroupMembers,
      response?.result,
      response?.responseData,
    ];

    for (const collection of possibleCollections) {
      if (Array.isArray(collection)) {
        return collection;
      }
    }

    return [];
  }

  private handleMemberFetchError(message: string): void {
    this.memberList = [];
    this.filteredMembers = [];
    this.fullMemberData = [];
    localStorage.removeItem('GetGroupMembersUCC_TTL');
    this.sharedService.OpenAlert(message);
  }

  updateRegistrationTypeOptions() {
    if (!this.isEdit) {
      // Add Mode: show all, default to New (enabled), others disabled
      this.registrationTypeOptions = [
        { label: 'New', value: 'New', disabled: false },
        { label: 'Mod', value: 'Mod', disabled: true },
        // { label: 'Nom', value: 'Nom', disabled: true },
      ];
      // Ensure 'New' is selected in add mode
      this.registrationForm.get('registrationType')?.setValue('New', { emitEvent: false });
    } else {
      // ✅ Edit Mode: only "Mod" and "Nom" are selectable
      this.registrationTypeOptions = [
        { label: 'New', value: 'New', disabled: true },
        { label: 'Mod', value: 'Mod', disabled: false },
        // { label: 'Nom', value: 'Nom', disabled: false },
      ];
      // ✅ Set 'Mod' as default in edit mode to show background color
      this.registrationForm.get('registrationType')?.setValue('Mod', { emitEvent: false });
    }
  }


  onSubmit(): void {
    if (this.registrationForm.valid) {
      console.log('KYC Details:', this.registrationForm.value);
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  minimumAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const dob = new Date(value);
      const today = new Date();

      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      const isUnderage =
        age < minAge ||
        (age === minAge && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

      return isUnderage ? { underage: { requiredAge: minAge } } : null;
    };
  }


  getGroupMemberDetails() {
    if (!this.selectedGrp) {
      console.warn('⚠️ No group selected, skipping member fetch');
      return;
    }
    this.bseUCCService.getUccMemberDetails().subscribe({
      next: (res: any) => {
        console.log('Member details API response:', res);

        const memberArray = this.extractMemberArray(res);

        if (!memberArray.length) {
          this.handleMemberFetchError('No members found for the selected group.');
          return;
        }

        this.fullMemberData = memberArray;
        localStorage.setItem('GetGroupMembersUCC_TTL', JSON.stringify(memberArray));

        this.memberList = memberArray
          .map((member: any) => {
            const memberId = (member.LookUpID || member.lookUpID || member.membID || member.membId || '').toString();
            const memberDescription = member.LookUpDescription || member.lookUpDescription || member.fullName || '';
            return {
              LookUpID: memberId,
              LookUpDescription: memberDescription
            };
          })
          .filter(member => member.LookUpID && member.LookUpDescription);

        if (!this.memberList.length) {
          this.handleMemberFetchError('No members found for the selected group.');
          return;
        }

        this.filteredMembers = this.sortMembers(this.memberList);
        this.updateFilteredMembers();
        console.log(this.memberList, '✅ Transformed member list');
      },
      error: (err) => {
        console.error('❌ API Error:', err);
        this.handleMemberFetchError('Unable to fetch member details right now. Please try again.');
      }
    });
  }

  selectMember(member: any) {
    const selected = typeof member === 'string' || typeof member === 'number'
      ? this.memberList.find(m => (m.LookUpID || '').toString() === member.toString())
      : member;

    if (!selected) {
      return;
    }

    this.selectedMemberId = (selected.LookUpID || '').toString();

    this.resetFormToDefaults({
      groupId: this.selectedGrp,
      groupSearch: this.getSelectedGroupDescription(),
      memberName: this.selectedMemberId,
      memberSearch: selected.LookUpDescription
    });

    const nameParts = this.splitFullName(selected.LookUpDescription);
    this.registrationForm.patchValue({
      firstName: nameParts.firstName,
      middleName: nameParts.middleName,
      lastName: nameParts.lastName,
    },
      { emitEvent: false }
    );
    console.log('Selected ID:', this.selectedMemberId);
    console.log(this.selectedMemberId, 'selected memb id');

    this.onMemberChange(this.selectedMemberId);
  }

  private sortMembers(list: any[]) {
    return [...(list || [])].sort((a, b) =>
      (a?.LookUpDescription || '').localeCompare(b?.LookUpDescription || '', undefined, { sensitivity: 'base' })
    );
  }

  updateFilteredMembers() {
    const selected1 = this.registrationForm.get('memberName')?.value;
    const selected2 = this.registrationForm.get('memberName_2')?.value;
    const selected3 = this.registrationForm.get('memberName_3')?.value;

    // 2nd applicant: exclude member selected in 1st
    this.filteredMembers_2 = this.memberList.filter(m => m.LookUpID !== selected1);

    // 3rd applicant: exclude members selected in 1st and 2nd
    this.filteredMembers_3 = this.memberList.filter(m => m.LookUpID !== selected1 && m.LookUpID !== selected2);

    // If currently selected member_2 is now excluded, clear it
    if (selected2 && !this.filteredMembers_2.find(m => m.LookUpID === selected2)) {
      this.registrationForm.get('memberName_2')?.setValue('', { emitEvent: false });
      this.clearApplicantFields(2);
    }
    // If currently selected member_3 is now excluded, clear it
    if (selected3 && !this.filteredMembers_3.find(m => m.LookUpID === selected3)) {
      this.registrationForm.get('memberName_3')?.setValue('', { emitEvent: false });
      this.clearApplicantFields(3);
    }
  }

  clearApplicantFields(index: number) {
    const suffix = `_${index}`;
    const fields = ['firstName', 'middleName', 'lastName', 'pan', 'gender', 'dob', 'occupation', 'mobile', 'mobileDeclaration', 'email', 'emailDeclaration'];
    fields.forEach(f => {
      this.registrationForm.get(`${f}${suffix}`)?.setValue('', { emitEvent: false });
    });
  }

  selectMember_2(memberId: string) {
    const selected = this.filteredMembers_2.find(m => m.LookUpID === memberId);
    if (!selected) return;

    const fullMember = this.fullMemberData.find(member => {
      const id = (member.membID || member.membId || member.LookUpID || member.lookUpID || '').toString();
      return id === memberId;
    });

    if (fullMember) {
      const displayName = fullMember.fullName || fullMember.LookUpDescription || selected.LookUpDescription || '';
      const nameParts = this.splitFullName(displayName);
      const formattedDOB = this.formatDateForInput(fullMember.birtDate || fullMember.birthDate);
      this.registrationForm.patchValue({
        firstName_2: nameParts.firstName || fullMember.firsName || '',
        middleName_2: nameParts.middleName || fullMember.middName || '',
        lastName_2: nameParts.lastName || fullMember.lastName || '',
        dob_2: formattedDOB || '',
        pan_2: (fullMember.pan || fullMember.PAN || '').trim(),
        email_2: (fullMember.emailID || fullMember.email || '').trim(),
        mobile_2: (fullMember.mobileNo || fullMember.mobile || '').trim(),
        gender_2: fullMember.clieGender || fullMember.gender || '',
      }, { emitEvent: false });
    } else {
      const nameParts = this.splitFullName(selected.LookUpDescription);
      this.registrationForm.patchValue({
        firstName_2: nameParts.firstName,
        middleName_2: nameParts.middleName,
        lastName_2: nameParts.lastName,
      }, { emitEvent: false });
    }
    this.updateFilteredMembers();
  }

  selectMember_3(memberId: string) {
    const selected = this.filteredMembers_3.find(m => m.LookUpID === memberId);
    if (!selected) return;

    const fullMember = this.fullMemberData.find(member => {
      const id = (member.membID || member.membId || member.LookUpID || member.lookUpID || '').toString();
      return id === memberId;
    });

    if (fullMember) {
      const displayName = fullMember.fullName || fullMember.LookUpDescription || selected.LookUpDescription || '';
      const nameParts = this.splitFullName(displayName);
      const formattedDOB = this.formatDateForInput(fullMember.birtDate || fullMember.birthDate);
      this.registrationForm.patchValue({
        firstName_3: nameParts.firstName || fullMember.firsName || '',
        middleName_3: nameParts.middleName || fullMember.middName || '',
        lastName_3: nameParts.lastName || fullMember.lastName || '',
        dob_3: formattedDOB || '',
        pan_3: (fullMember.pan || fullMember.PAN || '').trim(),
        email_3: (fullMember.emailID || fullMember.email || '').trim(),
        mobile_3: (fullMember.mobileNo || fullMember.mobile || '').trim(),
        gender_3: fullMember.clieGender || fullMember.gender || '',
      }, { emitEvent: false });
    } else {
      const nameParts = this.splitFullName(selected.LookUpDescription);
      this.registrationForm.patchValue({
        firstName_3: nameParts.firstName,
        middleName_3: nameParts.middleName,
        lastName_3: nameParts.lastName,
      }, { emitEvent: false });
    }
    this.updateFilteredMembers();
  }

  restrictSpecialCharacters(event: KeyboardEvent): void {
    const allowedRegex = /^[a-zA-Z0-9]$/;
    if (!allowedRegex.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyChars(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;

    // Allow only alphabets and spaces
    input.value = input.value.replace(/[^A-Za-z ]/g, '');

    this.registrationForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  formatDateToDDMMYYYY(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateToYYYYMMDD(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatDateForInput(dob: string): string | null {
    if (!dob) return null;

    // Handle format like "17/11/1981"

    const datePart = dob.split(' ')[0];
    const parts = datePart.split(/[-\/]/); // Matches "-" OR "/"
    if (parts.length === 3) {
      // Parts could be in DD/MM/YYYY or MM/DD/YYYY depending on source.
      const p1 = parts[0].trim();
      const p2 = parts[1].trim();
      const p3 = parts[2].trim();

      // Try to detect ordering. If first part > 12 it's definitely day-first (DD/MM/YYYY).
      let day = '';
      let month = '';
      let year = '';

      if (Number(p1) > 12) {
        day = p1;
        month = p2;
        year = p3;
      } else if (Number(p2) > 12) {
        // second part > 12 => first is month
        month = p1;
        day = p2;
        year = p3;
      } else {
        // Ambiguous (both <= 12). Try both constructions and pick the valid one.
        const tryMonthFirst = new Date(`${p3}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`);
        const tryDayFirst = new Date(`${p3}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`);

        if (!isNaN(tryMonthFirst.getTime())) {
          const tf = tryMonthFirst;
          // ensure month and day match expected ranges (basic sanity)
          month = p1;
          day = p2;
          year = p3;
        } else if (!isNaN(tryDayFirst.getTime())) {
          month = p2;
          day = p1;
          year = p3;
        } else {
          // Fallback: assume month-first
          month = p1;
          day = p2;
          year = p3;
        }
      }

      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // yyyy-MM-dd
    }

    // If it's already a valid ISO string or Date, return as is
    const parsed = new Date(dob);
    return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : null;
  }

  onMemberChange(selectedLookUpID: any) {
    const targetId = selectedLookUpID?.toString();
    const selectedMember = this.fullMemberData.find(member => {
      const memberId = (member.membID || member.membId || member.LookUpID || member.lookUpID || '').toString();
      return memberId === targetId;
    });
    console.log(selectedMember, 'selected member');

    if (selectedMember) {
      // Save to NgRx store instead of localStorage
      this.uccTabsFacade.setSelectedMemberData(selectedMember);
      console.log('selectedMember', selectedMember.LookUpDescription || selectedMember.fullName);
      console.log('selected member', selectedMember.fullName);
      this.prefillForm(selectedMember);
    } else {
      this.sharedService.OpenAlert('Unable to load the selected member details. Please re-select the member.');
    }
  }

  prefillForm(member: any) {
    const formattedDOB = this.formatDateForInput(member.birtDate || member.birthDate);
    console.log('formatted DOB', formattedDOB);

    const displayName = member.fullName || member.LookUpDescription || member.lookUpDescription || '';
    const nameParts = this.splitFullName(displayName);
    this.registrationForm.patchValue({
      dob: formattedDOB || '',
      pan: (member.pan || member.PAN || '').trim(),
      // kyc: member.KYC ? 'Yes' : 'No' ,// If you want Yes/No instead of true/false

      email: (member.emailID || member.email || '').trim(),
      mobile: (member.mobileNo || member.mobile || '').trim(),
      firstName: nameParts.firstName || member.firsName || '',
      middleName: nameParts.middleName || member.middName || '',
      lastName: nameParts.lastName || member.lastName || '',
      gender: member.clieGender || member.gender

    });

    // ensure the search input shows the full name when pre-filling from member data
    this.registrationForm.get('memberSearch')?.setValue(displayName, { emitEvent: false });

    console.log('Selected ID:', member.LookUpID || member.membID);
    console.log('selected id', member.memberName);

    console.log(this.registrationForm.value);

  }

  mapFormToUccMemberInfo(formValue: any): UccMemberInfo {
    console.log(formValue, 'form value');
    return {
      clieCode: formValue.bseClientCode,
      membID: Number(formValue.memberName),
      // membID: Number(this.selectedMemberId),
      // membID: 14356,
      occupation: formValue.occupation,
      mobileNumber: formValue.mobile,
      mobileDeclaration: formValue.mobileDeclaration,
      emailID: formValue.email,
      emailDeclaration: formValue.emailDeclaration,
      birthDate: formValue.dob,
      panNumber: formValue.pan,
      taxStatus: formValue.taxStatus,
      holdingPattern: formValue.holdingPattern,
      fH_KYC_Type: formValue.kycType || '',
      nominationOpt: formValue.nominationOpted,
      nominationAuth: formValue.nominationAuthentication,
    };


  }

  private buildInput(formValue: any): UccRegisterMember {
    const applicants: Applicant[] = [];

    // Applicant 1 (always present)
    applicants.push(this.buildApplicant(formValue, 1));

    // Applicant 2 (optional)
    if (formValue.firstName_2) {
      applicants.push(this.buildApplicant(formValue, 2));
    }

    // Applicant 3 (optional)
    if (formValue.firstName_3) {
      applicants.push(this.buildApplicant(formValue, 3));
    }

    return {
      clieCode: formValue.bseClientCode,
      holdingPattern: formValue.holdingPattern,
      taxStatus: formValue.taxStatus,
      fH_KYC_Type: 'K', // Ask Pooja about this field
      nominationOpt: formValue.nominationOpted,
      nominationAuth: formValue.nominationAuthentication,
      Applicants: applicants
    };
  }

  private buildApplicant(formValue: any, index: number): Applicant {
    const suffix = index === 1 ? '' : `_${index}`;
    return {
      membID: Number(formValue[`memberName${suffix}`]),
      firstName: formValue[`firstName${suffix}`],
      middleName: formValue[`middleName${suffix}`],
      lastName: formValue[`lastName${suffix}`],
      occupation: formValue[`occupation${suffix}`],
      mobileNumber: formValue[`mobile${suffix}`],
      mobileDeclaration: formValue[`mobileDeclaration${suffix}`],
      emailID: formValue[`email${suffix}`],
      emailDeclaration: formValue[`emailDeclaration${suffix}`],
      birthDate: formValue[`dob${suffix}`],
      panNumber: formValue[`pan${suffix}`],
      gender: formValue[`gender${suffix}`] || 'O'
    };
  }

  submitDataandContinue() {
    // console.log(this.registrationForm, 'registration form');

    // if (this.registrationForm.invalid) {
    //   Object.keys(this.registrationForm.controls).forEach(field => {
    //     const control = this.registrationForm.get(field);
    //     if (control?.invalid) {
    //       console.log(field, control.errors);
    //     }
    //   });
    //   this.registrationForm.markAllAsTouched();
    //   return;
    // }
    // const rawFormValue = this.registrationForm.getRawValue();
    // console.log(rawFormValue, 'raw form value before formatting dob');
    // const input: UccRegisterMember = this.buildInput(rawFormValue);
    // console.log(input, 'input of registration');
    // return;

    // ✅ Save registration form data to NgRx store
    const rawFormValue = this.registrationForm.getRawValue();
    const selectedLookUpID = this.registrationForm?.controls['memberName']?.value;
    const selectedMemberId = (selectedLookUpID || '').toString();
    const selectedMember = this.memberList.find(member => member.LookUpID === selectedMemberId);

    rawFormValue.memberDetails = {
      id: selectedMember?.LookUpID,
      name: selectedMember?.LookUpDescription
    };

    this.uccTabsFacade.setRegistrationData(rawFormValue);
    console.log(rawFormValue, '✅ Registration data saved to NgRx store');

    this.nextTab.emit({
      index: 1,
      state: {

      }
    });

    // localStorage.setItem('uccRegistrationData', JSON.stringify(rawFormValue));
    // const selectedLookUpID = this.registrationForm?.controls['memberName']?.value;
    // const selectedMemberId = (selectedLookUpID || '').toString();
    // const selectedMember = this.memberList.find(member => member.LookUpID === selectedMemberId);

    // const formValue = this.registrationForm.getRawValue();
    // formValue.memberDetails = {
    //   id: selectedMember?.LookUpID,
    //   name: selectedMember?.LookUpDescription
    // };

    // const selectedTaxStatus = this.taxStatusList.find(
    //   ts => ts.value === formValue.taxStatus
    // );
    // formValue.taxStatusDetails = {
    //   value: selectedTaxStatus?.value,
    //   label: selectedTaxStatus?.label
    // };

    // const selectedHoldingPattern = this.holdingPatternList.find(
    //   pattern => pattern.value === formValue.holdingPattern
    // );
    // formValue.holdingPatternDetails = {
    //   value: selectedHoldingPattern?.value,
    //   label: selectedHoldingPattern?.label
    // };

    // localStorage.setItem('uccRegistrationData', JSON.stringify(formValue));
    // console.log(rawFormValue, 'raw form value');


    // const input: UccMemberInfo = this.mapFormToUccMemberInfo(rawFormValue);
    // console.log(input, 'input of registration');

    // if (this.isEdit && this.memberID) {
    //   input.membID = Number(this.memberID);
    // }
    // console.log(this.memberID, 'memb id');
    // console.log(input, 'edited input');

    // const storedData = localStorage.getItem('uccRegistrationData');
    // const parsedData = storedData ? JSON.parse(storedData) : null;

    // const bseClieCode = parsedData?.bseClientCode || '';
    // console.log('BSE Client Code:', bseClieCode);

    // this.isLoading = true;

    // this.bseUCCService.getUccRegisterData(input).subscribe({
    //   next: (response: { success: boolean; message: string }) => {
    //     console.log('API Response:', response);
    //     this.isLoading = false;
    //     if (response.success) {
    //       this.sharedService.successDia(response.message).subscribe(result => {
    //         if (result) { 
    //           this.nextTab.emit({
    //             index: 1,
    //             state: {
    //               isUpdate: false,
    //               MembID: input.membID || null,
    //               clieCode: bseClieCode || '',
    //             }
    //           });
    //         }
    //       });
    //     } else {
    //       this.isLoading = false;
    //       this.sharedService.OpenAlert('Failed to save registration details.');
    //     }
    //   },
    //   error: (err: any) => {
    //     this.isLoading = false;
    //     console.error('API Error:', err);
    //     this.sharedService.OpenAlert('Something went wrong while saving registration details.');
    //   }
    // });
  }

  updateDataandContinue() {
    console.log('method called');
    console.log(this.registrationForm, 'registration form');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    console.log('method called');

    const rawFormValue = this.registrationForm.getRawValue();
    rawFormValue.dob = this.formatDateToYYYYMMDD(rawFormValue.dob);
    console.log(rawFormValue, 'dob');

    localStorage.setItem('uccRegistrationData', JSON.stringify(rawFormValue));
    const selectedLookUpID = this.registrationForm?.controls['memberName']?.value;
    const selectedMemberId = (selectedLookUpID || '').toString();
    const selectedMember = this.memberList.find(member => member.LookUpID === selectedMemberId);

    const formValue = this.registrationForm.getRawValue();
    formValue.memberDetails = {
      id: selectedMember?.LookUpID,
      name: selectedMember?.LookUpDescription
    };

    const selectedTaxStatus = this.taxStatusList.find(
      ts => ts.value === formValue.taxStatus
    );
    formValue.taxStatusDetails = {
      value: selectedTaxStatus?.value,
      label: selectedTaxStatus?.label
    };

    const selectedHoldingPattern = this.holdingPatternList.find(
      pattern => pattern.value === formValue.holdingPattern
    );
    formValue.holdingPatternDetails = {
      value: selectedHoldingPattern?.value,
      label: selectedHoldingPattern?.label
    };

    localStorage.setItem('uccRegistrationData', JSON.stringify(formValue));
    console.log(rawFormValue, 'raw form value');

    const editedBseClientCode = localStorage.getItem('editedBseClientCode');
    console.log(editedBseClientCode, 'edited BSE Client Code');

    const input: UccMemberInfo = this.mapFormToUccMemberInfo(rawFormValue);
    console.log(input, 'input of registration');

    if (this.isEdit && this.memberID) {
      input.membID = Number(this.memberID);
      input.clieCode = editedBseClientCode || input.clieCode;
    }
    console.log(this.memberID, 'memb id');
    console.log(input, 'edited input');

    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const bseClieCode = parsedData?.bseClientCode || '';

    this.isLoading = true;

    this.bseUCCService.getUccRegisterData(input).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('API Response:', response);
        this.isLoading = false;
        if (response.success) {
          this.sharedService.successDia(response.message).subscribe(result => {
            if (result) {
              this.nextTab.emit({
                index: 1,
                state: {
                  isUpdate: true,
                  MembID: input.membID || null,
                  clieCode: editedBseClientCode || bseClieCode || ''
                }
              });
            }
          });
        } else {
          this.isLoading = false;
          this.sharedService.OpenAlert('Failed to save registration details.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.sharedService.OpenAlert('Something went wrong while saving registration details.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/registerdList']);
  }

  get getIfaEmailIdFromLocalStorage() {
    const ifaDetails = SharedEnv.IFAEmailId;
    return ifaDetails;
  }

  getGroupByLogin() {
    const ifaEmailId = this.getIfaEmailIdFromLocalStorage;

    const input = {
      loginId: ifaEmailId,
    };

    this.groupLookupError = null;
    this.isGroupLookupLoading = true;

    this.idbsvc.getData('GROUP_BY_LOGIN', 'data')
      .pipe(
        switchMap((cachedData) => {

          // ✅ If cache exists → use it
          if (cachedData && cachedData.length > 0) {
            return of(cachedData);
          }

          // ❌ Else call API
          return this.bseUCCService.getGroupByLogin(input).pipe(

            map((res: any) => {
              let groupsArray: any[] = [];

              if (Array.isArray(res)) {
                groupsArray = res;
              } else if (res && typeof res === 'object' && res.lookUpID && res.lookUpDescription) {
                groupsArray = [res];
              } else if (res?.data && Array.isArray(res.data)) {
                groupsArray = res.data;
              }

              if (!groupsArray.length) {
                throw new Error(res?.message || 'No group data found');
              }

              return groupsArray;
            }),

            tap((groupsArray: any[]) => {
              this.idbsvc.setNewCollectionData('GROUP_BY_LOGIN', 'data', groupsArray, 'DD:15')
                .subscribe({
                  error: (err) => console.error('Cache failed', err)
                });
            })
          );
        }),

        // ✅ Transform data for UI
        map((groupsArray: any[]) => {
          return groupsArray.map((group: any) => ({
            GroupID: group.lookUpID,
            GroupDescription: group.lookUpDescription || ''
          }));
        })
      )
      .subscribe({
        next: (groupList) => {
          this.groupList = groupList;
          this.filteredGroups = [...groupList];
          this.groupLookupError = null;

          console.log(groupList, '✅ Group list loaded (with cache)');
        },
        error: (err) => {
          console.error('❌ Error:', err);

          this.groupList = [];
          this.filteredGroups = [];

          const message = err?.message || 'Unable to fetch group codes.';
          this.groupLookupError = message;

          this.sharedService.OpenAlert(message);
        },
        complete: () => {
          this.isGroupLookupLoading = false;
        }
      });
  }

  selectGroup(group: any) {
    this.isSelectingGroup = true;
    this.selectedGrp = group.GroupID;
    localStorage.setItem('selectedGroupID', this.selectedGrp);

    this.resetFormToDefaults({
      groupId: group.GroupID,
      groupSearch: group.GroupDescription
    });

    this.memberList = [];
    this.filteredMembers = [];
    this.fullMemberData = [];
    this.selectedMemberId = '';

    console.log('Selected Group ID:', this.selectedGrp);
    this.groupidbyMembId().subscribe({
      next: (resolvedGroupID) => {
        if (resolvedGroupID) {
          this.getGroupMemberDetails();
        }
      },
      complete: () => {
        this.isSelectingGroup = false;
      }
    });
  }

  clearGroupSelection() {
    this.resetFormToDefaults();
    this.selectedGrp = '';
    this.filteredGroups = [...this.groupList];
    this.memberList = [];
    this.filteredMembers = [];
    this.fullMemberData = [];
    this.selectedMemberId = '';
    localStorage.removeItem('selectedGroupID');
    localStorage.removeItem('selectedMemberData');
    localStorage.removeItem('GetGroupMembersUCC_TTL');
  }

  clearMemberSelection() {
    this.resetFormToDefaults({
      groupId: this.selectedGrp,
      groupSearch: this.getSelectedGroupDescription()
    });
    this.selectedMemberId = '';
    this.filteredMembers = [...this.memberList];
    localStorage.removeItem('selectedMemberData');
  }

  groupidbyMembId() {
    return this.bseUCCService.getGroupIdByMembId().pipe(
      map((res: any) => {
        console.log(res, 'group id by memb id response');
        if (!res) {
          this.sharedService.OpenAlert('Unable to fetch the group identifier. Please try again.');
        }

        // Check if API returned success: false
        if (res?.success === false) {
          console.warn('⚠️ API returned failure:', res?.message);
          this.sharedService.OpenAlert(res?.message || 'Unable to fetch the group identifier. Please try again.');
          localStorage.removeItem('resSelectedGroupID');
          return null;
        }

        // Handle success case
        const groupID = res?.grouID || res?.GroupID || null;
        if (groupID) {
          console.log(groupID, 'group id');
          localStorage.setItem('resSelectedGroupID', groupID);
        } else {
          localStorage.removeItem('resSelectedGroupID');
        }
        return groupID;
      }),
      catchError((error) => {
        console.error('❌ API Error:', error);
        this.sharedService.OpenAlert('Unable to fetch the group identifier. Please try again.');
        return of(null);
      })
    );
  }

  d_V() {
    this.registrationForm.get('holdingPattern')?.valueChanges.subscribe((_) => {
      const __ = _;
      if (_ == 'SI') {
        this.registrationForm.get('memberName_2')?.disable();
        this.registrationForm.get('memberName_3')?.disable();
        this.registrationForm.get('firstName_2')?.disable();
        this.registrationForm.get('middleName_2')?.disable();
        this.registrationForm.get('lastName_2')?.disable();
        this.registrationForm.get('pan_2')?.disable();
        this.registrationForm.get('gender_2')?.disable();
        this.registrationForm.get('dob_2')?.disable();
        this.registrationForm.get('occupation_2')?.disable();
        this.registrationForm.get('mobile_2')?.disable();
        this.registrationForm.get('mobileDeclaration_2')?.disable();
        this.registrationForm.get('email_2')?.disable();
        this.registrationForm.get('emailDeclaration_2')?.disable();
        this.registrationForm.get('kycType_2')?.disable();
      }else if(_ == 'JO' || _ == 'AS'){
        this.registrationForm.get('memberName_2')?.enable();
        this.registrationForm.get('memberName_3')?.enable();
        this.registrationForm.get('firstName_2')?.enable();
        this.registrationForm.get('middleName_2')?.enable();
        this.registrationForm.get('lastName_2')?.enable();
        this.registrationForm.get('pan_2')?.enable();
        this.registrationForm.get('gender_2')?.enable();
        this.registrationForm.get('dob_2')?.enable();
        this.registrationForm.get('occupation_2')?.enable();
        this.registrationForm.get('mobile_2')?.enable();
        this.registrationForm.get('mobileDeclaration_2')?.enable();
        this.registrationForm.get('email_2')?.enable();
        this.registrationForm.get('emailDeclaration_2')?.enable();
      }
    })
  }

}

