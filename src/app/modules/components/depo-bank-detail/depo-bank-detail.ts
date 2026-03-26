import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Router } from '@angular/router';
import { distinctUntilChanged, skip, Subject, takeUntil } from 'rxjs';
import { BankDetailsModel, bseBankListApiInput, deleteBankData, uccBankDetails } from '../../models/bseUCCModel';
import { MenuItem } from 'primeng/api';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Shared } from '../../../shared/services/shared';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { ProgressBarModule } from 'primeng/progressbar';

export interface TabNavigationEvent {
  index: number;
  state?: {
    isUpdateNominee: boolean;
    MembID: any;
    clieCode: any;
  };
}


@Component({
  selector: 'app-depo-bank-detail',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    InputTextModule, MatDividerModule, MatListModule, MatTableModule, MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, ProgressBarModule],
  templateUrl: './depo-bank-detail.html',
  styleUrl: './depo-bank-detail.scss',
})
export class DepoBankDetail implements OnInit, OnChanges {
  isLoading: boolean = false;

  bankForm!: FormGroup;
  activeTab: number = 0;
  isEdit: boolean = false;
  storedBanks: any[] = [];
  isSetDefault: boolean = false;
  bankDetailsList: any[] = [];
  memberId: any;
  accountTypes = [
    { value: 'SB', label: 'Saving Bank' },
    { value: 'CB', label: 'Current Bank' },
    { value: 'NRE', label: 'NRE Account' },
    { value: 'NRO', label: 'NRO Account' }
  ];
  dividendPayoutOptions = [
    { key: '01', value: 'Cheque' },
    { key: '02', value: 'Direct Credit' },
    { key: '03', value: 'ECS' },
    { key: '04', value: 'NEFT' },
    { key: '05', value: 'RTGS' }
  ];

  // as on 3-06-2025
  clientTypeOptions = [
    { value: 'P', label: 'Physical' },
    // { value: 'D', label: 'Demat' }
  ];
  // end here

  defaTDPs = [
    //  { key: 'NSDL', value: 'NSDL' },
    // { key: 'CDSL', value: 'CDSL' }
    'NSDL',
    'CDSL'
  ];


  pmsType = [
    { key: 'Y', value: 'Yes' },
    { key: 'N', value: 'No' },
  ];

  bankFormArray: any;
  savedBankEntries: any[] = []; // Store saved bank entries temporarily

  createEmptyRow() {
    return {
      isDefault: false,
      ifsc: '',
      bankName: '',
      accountType: '',
      accountNo: '',
      micr: ''
    };
  }


  bankNames: any = [];
  showBankInputField: boolean = false;
  editMode: boolean = false;


  //for update mode- add option
  isAddNewBank: boolean = false;
  isAddClieCode!: string;
  isAddMembID: any;


  // for update mode- edit option
  isEditBankDetail: boolean = false;
  isEditClieCode!: string;
  isEditMembID: any;
  bank: any;
  // index:any;
  bankKey: any;
  bankIndex: any;


  bankAddList: any[] = [];
  bankAddListInNormalMode: any[] = [];

  // for normal mode edit option
  isEditBankinNormalMode: boolean = false;
  isEditClieCodeinNormalMode: any;
  isEditMembIDinNormalMode: any;
  bankinNormal: any;
  bankKeyinNormalMode: any;
  bankIndexinNormalMode: any

  home: MenuItem = {};
  breadcrumb_items: MenuItem[] = [];
  maxRows = 5;

  // @Output() nextTab =  new EventEmitter<number>();
  @Output() nextTab = new EventEmitter<number | TabNavigationEvent>();

  @Input() tabState: any;
  //BANK LIST
  bankDataList: any[] = [];
  MAX_BANKS = 5;
  selectedIndex: number = -1;
  currentClientBankList = [];
  isHide: boolean = true;
  UpdatedbankList: any = [];
  isUpdate: boolean = false;
  memberIdFromUpdate: any;
  clieCodeFromUpdate: any;

  private destroy$ = new Subject<void>();
  private depositorySubscriptionsAdded = false;
  bankDetailsForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bseUccSer: BseUCCRegister,
    private location: Location,
    private sharedServ: Shared

  ) { }

  //   ngOnChanges(changes: SimpleChanges): void {
  //   // throw new Error('Method not implemented.');
  //    if (changes['tabState'] && changes['tabState'].currentValue) {
  //     console.log(
  //       'Address Details received state:',
  //       changes['tabState'].currentValue
  //     );

  //     const state = changes['tabState'].currentValue;
  //     console.log(state, 'state');


  //     this.isUpdate = state.isUpdateBank === true;
  //     this.memberIdFromUpdate = state.MembID;
  //     this.clieCodeFromUpdate = state.clieCode;
  //     console.log('isUpdate in ngOnChanges:', this.isUpdate);

  //   if (this.isUpdate) {
  //     // this.getEditApiData(this.clieCodeFromUpdate);
  //     this.getBankList(this.clieCodeFromUpdate);
  //   }
  //   }
  // }



  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['tabState']) {
      return;
    }

    const state = changes['tabState'].currentValue;

    if (state) {
      console.log('bank Details received state:', state);

      // ✅ match emitted property name
      this.isUpdate = state.isUpdateBank === true;

      this.memberIdFromUpdate = state.MembID ?? null;
      this.clieCodeFromUpdate = state.clieCode ?? '';

      console.log('isUpdate in ngOnChanges: ISUPDATE, membid,cliecode', this.isUpdate, this.memberIdFromUpdate, this.clieCodeFromUpdate);

      if (this.isUpdate && this.clieCodeFromUpdate) {
        this.navigateToNextTab(this.clieCodeFromUpdate);
      }

      // ✅ Get member ID from localStorage after KYC popup closes
      const storedMembData = localStorage.getItem('uccRegistrationData');
      const parsedMemData = storedMembData ? JSON.parse(storedMembData) : null;
      const membid = parsedMemData?.memberName || parsedMemData?.memberDetails?.id || '';
      console.log(membid, 'membID from address details');

    } else {
      // ✅ RESET for normal mode
      this.isUpdate = false;
      this.memberIdFromUpdate = null;
      this.clieCodeFromUpdate = '';

      console.log('Normal mode → update cleared');
    }
  }
  ngOnInit() {

    this.breadcrumb_items = [
      { label: 'Home', routerLink: '/' },
      { label: 'CRM', routerLink: '/crm' },
      { label: 'Online MF Transactions', routerLink: '/crm' },
      { label: 'BSE Register Investors' },
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };


    // 1️⃣ Initialize the FormArray FIRST
    this.bankFormArray = this.fb.array([]);

    this.bankForm = this.fb.group({

      clientType: ['', Validators.required],
      // depositoryName: [''],
      pms: [''],
      dividendPayout: ['02', Validators.required],
      defaTDP: ['', Validators.required],
      cdsldpid: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]], // as per akshata
      cdslcltid: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      cmbpiD_ID:
        ['',
          [Validators.required,
          Validators.pattern(/^\d{16}$/)]
        ],

      nsdldpid: ['', [Validators.required, Validators.pattern(/^IN\d{6}$/)]],// as per akshata
      nsdlcltid: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],

      // ifsc: ['', [Validators.required, 
      //   Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      // bankName: ['', 
      //   [Validators.required, Validators.minLength(3),
      //                    Validators.maxLength(50),
      //                Validators.pattern(/^[A-Za-z\s.'&()-]+$/)]],
      // accountNumber: ['', [Validators.required,
      // Validators.minLength(9),
      // Validators.maxLength(18),
      // Validators.pattern(/^[0-9]{9,18}$/)
      // ]
      // ],
      // accountType: ['SB', Validators.required],
      // micr:[''],
      // isDefault: [''],

      bankDetails: this.bankFormArray   // ✅ now defined


    });

    console.log('bank detail called');
    // Create 5 rows
    // for (let i = 0; i < 5; i++) {
    //   this.bankFormArray.push(this.createBankForm());
    // }

    this.bankForm.get('clientType')!.valueChanges.subscribe((value) => {
      this.updateBankRows(value);
      this.togglePmsByClientType(value);
    });

    // Default load → create 5 rows
    this.updateBankRows('');
    this.togglePmsByClientType(this.bankForm.get('clientType')?.value);

       
   // this.getDefaultBanksFromCustmerMaster();


    // this.addNewRow();

    const navState = history.state;


    // for normal mode -edit bank - 11-08-2025
    this.isEditBankinNormalMode = navState?.isEditBankinNormalMode === true;
    this.isEditClieCodeinNormalMode = navState?.isEditClieCodeinNormalMode;
    this.isEditMembIDinNormalMode = navState?.isEditMembIDinNormalMode;
    this.bankinNormal = navState?.bankinNormal;
    this.bankKeyinNormalMode = navState?.bankKeyinNormalMode;
    this.bankIndexinNormalMode = navState?.bankIndexinNormalMode;
    console.log(this.isEditBankinNormalMode, this.isEditClieCodeinNormalMode, this.isEditMembIDinNormalMode, this.bankinNormal, this.bankKeyinNormalMode, this.bankIndexinNormalMode, 'isEditBankinNormalMode', 'isEditClieCodeinNormalMode', 'isEditMembIDinNormalMode', 'bankinNormal', 'bankKeyinNormalMode', 'bankIndexinNormalMode');

    if (this.isEditBankinNormalMode) {
      //  this.patchDataForEditinNormal(navState);
    }

    // new change update from bank list- add new bank - 9-08-2025
    //from bank list in update mode - add bank
    console.log('Navigation State:', navState);
    this.isAddNewBank = navState?.isAddNewBank === true;
    this.isAddClieCode = navState?.isAddClieCode;
    this.isAddMembID = navState?.isAddMembID;
    console.log(
      this.isAddClieCode,
      this.isAddMembID,
      'isAddClientCode and isAddMembId'
    );

    // for update mode-  edit bank 
    this.isEditBankDetail = navState?.isEditBankDetail === true;
    this.isEditClieCode = navState?.isEditClieCode;
    this.isEditMembID = navState?.isEditMembID;
    this.bank = navState?.bank;
    // this.index = navState?.index;
    this.bankKey = navState?.bankKey;
    this.bankIndex = navState?.bankIndex;
    console.log(
      this.isEditClieCode,
      this.isEditMembID,
      'isEditClieCode and isEditMembID'
    );
    console.log(this.bank, this.bankKey, this.bankIndex, 'bank edit data from bank list, bankKey, bankIndex');

    if (this.isEditBankDetail) {
      // this.patchDataForEditinEdit(navState);
    }
    console.log('Navigation State: this.isAddNewBank, this.isEditBankDetail ', this.isAddNewBank, this.isEditBankDetail);



    // this.getBankDropdown(this.resolveMembID());

    // asof 14-08-2025
    // if(!this.isEditBankinNormalMode && !this.isEditBankDetail){
    // this.getBankDropdown(this.resolveMembID());
    // }
    // end here
    /** 🔹 Subscribe once with cleanup */
    this.bankForm.get('clientType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedType => {
        if (selectedType === 'P') {
          this.disableDematFields();
        } else {
          this.enableDematFields();
        }
      });

    this.handleDepositoryLogic();

    // Load existing bank list if client code exists
    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const bseClieCode = parsedData?.bseClientCode || '';
console.log(bseClieCode,'bseclie code');

    if (bseClieCode) {
      this.getBankList(bseClieCode);
    }

   

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

  goToNextTab() {
    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    console.log(parsedData ,' parsed data');
    
    const nomineeOpted = parsedData?.nominationOpted === 'Y';

    const hasAnyBank = (this.savedBankEntries?.length || 0) > 0 || (this.UpdatedbankList?.length || 0) > 0;

    if (!hasAnyBank) {
      this.sharedServ.OpenAlert('Please add at least one bank detail before proceeding.');
      return;
    }

    if (!nomineeOpted) {
      // this.sharedServ.OpenAlert('You have not opted for a nominee. Redirecting to Register List.');
      this.router.navigate(['/app/registerdList']);
      return;
    }

    this.nextTab.emit(4);
    
  }


  // updateBankRows(clientType: string) {
  //   this.bankFormArray.clear(); // remove old rows

  //   if (clientType === 'D') {
  //     this.bankFormArray.push(this.createBankForm());   // 1 row
  //   } else {
  //     for (let i = 0; i < 5; i++) {
  //       this.bankFormArray.push(this.createBankForm()); // 5 rows
  //     }
  //   }

  //     this.ensureOneDefault();
  // }

  updateBankRows(clientType: string) {
    this.savedBankEntries = []; // Clear saved entries on client type change
    this.bankFormArray.clear(); // remove old rows

    // Always load only 1 row initially
    this.bankFormArray.push(this.createBankForm());

    // If type = D → lock row count to 1
    if (clientType === 'D') {
      this.maxRows = 1;
    } else {
      this.maxRows = 5;
    }

    this.ensureOneDefault();
  }

  private togglePmsByClientType(clientType: string) {
    const pmsCtrl = this.bankForm.get('pms');
    if (!pmsCtrl) {
      return;
    }

    const isPhysical = clientType === 'P';
    if (isPhysical) {
      pmsCtrl.disable({ emitEvent: false });
      pmsCtrl.setValue('', { emitEvent: false });
    } else {
      pmsCtrl.enable({ emitEvent: false });
    }
  }


  createBankForm() {
    return this.fb.group({
      isDefault: [false],
      ifsc: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      bankName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s.'&()-]+$/)]],
      accountType: ['SB', Validators.required],
      accountNumber: ['', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(18),
        Validators.pattern(/^[0-9]{9,18}$/)
      ]],
      micr: ['', Validators.pattern(/^[0-9]{9}$/)]
    });
  }

  markDefault(index: number) {
    this.bankFormArray.controls.forEach((group: { get: (arg0: string) => { (): any; new(): any; setValue: { (arg0: boolean): void; new(): any; }; }; }, i: number) => {
      group.get('isDefault')?.setValue(i === index);
    });
  }

  onDefaultCheckboxClick(index: number, event: Event) {
    event.stopPropagation();   // prevent auto-toggle first

    const currentRow = this.bankFormArray.at(index);
    const isChecked = currentRow.get('isDefault')?.value;

    // If trying to check this box, uncheck all saved banks
    if (!isChecked) {
      this.savedBankEntries.forEach(bank => bank.isDefault = false);
      currentRow.get('isDefault')?.setValue(true);
    } else {
      // If trying to uncheck and there are saved banks, prevent if no other default
      const hasDefaultInSaved = this.savedBankEntries.some(bank => bank.isDefault);
      if (!hasDefaultInSaved && this.savedBankEntries.length === 0) {
        event.preventDefault(); // Can't uncheck if it's the only one
        return;
      }
      currentRow.get('isDefault')?.setValue(false);
    }
  }


  validateDefaultSelection(): boolean {
    const atLeastOneDefault = this.bankFormArray.value.some((x: any) => x.isDefault);

    if (!atLeastOneDefault) {
      this.sharedServ.OpenAlert("Please select at least one default bank.");
      return false;
    }
    return true;
  }






  // addNewRow() {
  //     if (this.bankFormArray.length >= 5) {
  //     this.sharedServ.OpenAlert("You can add maximum 5 bank details.");
  //     return;
  //   }

  //   this.bankFormArray.push(this.fb.group({
  //     isDefault: [false],
  //     ifsc: [''],
  //     bankName: [''],
  //     accountType: [''],
  //     accountNumber: [''],
  //     micr: ['']
  //   }));

  //    this.ensureOneDefault();
  // }


  addNewRow() {
    // Check if we've reached the maximum limit including saved entries
    if (this.savedBankEntries.length >= this.maxRows) {
      this.sharedServ.OpenAlert("You can add maximum " + this.maxRows + " bank details.");
      return;
    }

    // ✅ FIRST: Validate main bank form (depository details)
    this.bankForm.markAllAsTouched();

    if (this.bankForm.invalid) {
      let mainFormErrors: string[] = [];

      // Check Client Type
      if (this.bankForm.get('clientType')?.hasError('required')) {
        mainFormErrors.push('Client type is required');
      }

      // Check Dividend Payout
      if (this.bankForm.get('dividendPayout')?.hasError('required')) {
        mainFormErrors.push('Dividend payout mode is required');
      }

      // Check Depository Name
      if (this.bankForm.get('defaTDP')?.hasError('required')) {
        mainFormErrors.push('Depository name is required');
      }

      //check pms
      if (this.bankForm.get('pms')?.hasError('required')) {
        mainFormErrors.push('Pms is required');
      }

      // Check demat fields based on client type
      const clientType = this.bankForm.get('clientType')?.value;

      if (clientType === 'D') {
        const depository = this.bankForm.get('defaTDP')?.value;

        if (depository === 'CDSL') {
          if (this.bankForm.get('cdsldpid')?.hasError('required')) {
            mainFormErrors.push('CDSL DP ID is required');
          } else if (this.bankForm.get('cdsldpid')?.hasError('pattern')) {
            mainFormErrors.push('CDSL DP ID must be 8 digits');
          }

          if (this.bankForm.get('cdslcltid')?.hasError('required')) {
            mainFormErrors.push('CDSL Client ID is required');
          } else if (this.bankForm.get('cdslcltid')?.hasError('pattern')) {
            mainFormErrors.push('CDSL Client ID must be 8 digits');
          }
        } else if (depository === 'NSDL') {
          if (this.bankForm.get('nsdldpid')?.hasError('required')) {
            mainFormErrors.push('NSDL DP ID is required');
          } else if (this.bankForm.get('nsdldpid')?.hasError('pattern')) {
            mainFormErrors.push('NSDL DP ID must be in format IN123456');
          }

          if (this.bankForm.get('nsdlcltid')?.hasError('required')) {
            mainFormErrors.push('NSDL Client ID is required');
          } else if (this.bankForm.get('nsdlcltid')?.hasError('pattern')) {
            mainFormErrors.push('NSDL Client ID must be 8 digits');
          }

          if (this.bankForm.get('cmbpiD_ID')?.hasError('required')) {
            mainFormErrors.push('Combined ID is required');
          } else if (this.bankForm.get('cmbpiD_ID')?.hasError('pattern')) {
            mainFormErrors.push('Combined ID must be 16 digits');
          }
        }
      }

      if (mainFormErrors.length > 0) {
        this.sharedServ.OpenAlert('Please fill depository details first:\n\n' + mainFormErrors.join('\n'));
        return;
      }
    }

    // Get the current row (always index 0 since we only have 1 row)
    const currentRow = this.bankFormArray.at(0);

    // Mark all fields as touched to show validation errors
    currentRow.markAllAsTouched();

    const hasData = currentRow.get('ifsc')?.value || currentRow.get('bankName')?.value || currentRow.get('accountNumber')?.value;

    if (!hasData) {
      this.sharedServ.OpenAlert("Please fill the bank details before adding.");
      return;
    }

    // Validate the current row - check all required fields
    const ifscCtrl = currentRow.get('ifsc');
    const bankNameCtrl = currentRow.get('bankName');
    const accountNumberCtrl = currentRow.get('accountNumber');
    const accountTypeCtrl = currentRow.get('accountType');
    const micrCtrl = currentRow.get('micr');

    let errorMessages: string[] = [];

    // Check IFSC
    if (ifscCtrl?.hasError('required')) {
      errorMessages.push('IFSC Code is required');
    } else if (ifscCtrl?.hasError('pattern')) {
      errorMessages.push('Enter a valid 11-character IFSC code (e.g., SBIN0001234)');
    }

    // Check Bank Name
    if (bankNameCtrl?.hasError('required')) {
      errorMessages.push('Bank name is required');
    } else if (bankNameCtrl?.hasError('minlength')) {
      errorMessages.push('Bank name must be at least 3 characters');
    } else if (bankNameCtrl?.hasError('maxlength')) {
      errorMessages.push('Bank name cannot exceed 50 characters');
    } else if (bankNameCtrl?.hasError('pattern')) {
      errorMessages.push('Bank name can only contain letters and basic punctuation');
    }

    // Check Account Type
    if (accountTypeCtrl?.hasError('required')) {
      errorMessages.push('Account type is required');
    }

    // Check Account Number
    if (accountNumberCtrl?.hasError('required')) {
      errorMessages.push('Account number is required');
    } else if (accountNumberCtrl?.hasError('minlength')) {
      errorMessages.push('Account number must be at least 9 digits');
    } else if (accountNumberCtrl?.hasError('maxlength')) {
      errorMessages.push('Account number cannot exceed 18 digits');
    } else if (accountNumberCtrl?.hasError('pattern')) {
      errorMessages.push('Account number must be numeric and between 9 to 18 digits');
    }

    // Check MICR (optional but validate pattern if provided)
    if (micrCtrl?.value && micrCtrl?.hasError('pattern')) {
      errorMessages.push('MICR code must be a 9-digit number');
    }

    // If there are validation errors, show them
    if (errorMessages.length > 0) {
      this.sharedServ.OpenAlert(errorMessages.join('\n'));
      return;
    }

    // Final check - if form is still invalid
    if (currentRow.invalid) {
      this.sharedServ.OpenAlert("Please correct all validation errors before saving.");
      return;
    }

    // Get current row data
    const bankData = { ...currentRow.value };

    // If this bank is set as default, remove default from all other saved banks
    if (bankData.isDefault) {
      this.savedBankEntries.forEach(bank => bank.isDefault = false);
    } else {
      // If no default is set yet and this is the first bank, make it default
      if (this.savedBankEntries.length === 0) {
        bankData.isDefault = true;
      }
    }

    // Save to API
    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const bseClieCode = parsedData?.bseClientCode || '';

    if (!bseClieCode) {
      this.sharedServ.OpenAlert('Client code not found. Please complete previous steps.');
      return;
    }

    // DON'T add to savedBankEntries here - let getBankList() populate it from API
    // Temporarily add to create payload
    const tempBankEntries = [...this.savedBankEntries, bankData];

    // Create payload with all saved banks + current
    const payload = this.mapFormToPayloadWithBanks(tempBankEntries);
    payload.clieCode = bseClieCode;

    console.log('Saving bank to API:', payload);

    this.isLoading = true;

    this.bseUccSer.getUccBankData(payload).subscribe({
      next: (response: { success: boolean; message: string }) => {
        this.isLoading = false;
        console.log('Bank API Response:', response);

        if (response.success) {
          // Refresh bank list from API - this will update savedBankEntries
          this.getBankList(bseClieCode);

          // Clear the current row for next entry
          currentRow.patchValue({
            isDefault: false,
            ifsc: '',
            bankName: '',
            accountType: 'SB',
            accountNumber: '',
            micr: ''
          });
          currentRow.markAsUntouched();
          currentRow.markAsPristine();

          this.sharedServ.successDia(`Bank saved successfully.`);
        } else {
          this.sharedServ.OpenAlert('Failed to save bank details.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Bank API Error:', err);
        this.sharedServ.OpenAlert('Something went wrong while saving bank details.');
      }
    });
  }

  clearCurrentRow(index: number) {
    const row = this.bankFormArray.at(index);
    row.patchValue({
      isDefault: false,
      ifsc: '',
      bankName: '',
      accountType: 'SB',
      accountNumber: '',
      micr: ''
    });
    row.markAsUntouched();
    row.markAsPristine();
    this.ensureOneDefault();
  }

  clearAllSavedBanks() {
    this.savedBankEntries = [];
    this.clearCurrentRow(0);
    this.sharedServ.OpenAlert("All saved banks cleared.");
  }


  deleteBank(bank: any, index: number): void {
    //  this.deleteBankFromDB(bank, index)


    this.sharedServ.openConfirmDialog(
      "Are you sure you want to delete this Bank?",
      (isConfirm) => {
        if (isConfirm) {
          this.deleteBankFromDB(bank, index);
        }
      }
    );


  }


  deleteBankFromDB(bank: { clieCode: any; index: any; }, index: any) {
    let input: deleteBankData = {
      clientCode: bank.clieCode,
      bankIndex: bank.index
    };
    console.log(input, 'delete bank input');

    this.bseUccSer.deleteBseBankDetail(input).subscribe({
      next: (res) => {
        console.log(res, 'res of deleted bank');

        if (res?.success === true) {
          this.sharedServ.successDia(res?.message).subscribe(result => {
            if (result === true) {
              this.getBankList(input.clientCode);
            }
          }
          )
        }

        else {
          this.sharedServ.OpenAlert(res?.message || 'Failed to delete bank');
        }
      },
      error: (err) => {
        console.error("Delete API error:", err);
        this.sharedServ.OpenAlert("Something went wrong while deleting bank.");
      }
    })
  }

  clearRow(index: number) {
    const row = this.bankFormArray.at(index);

    row.patchValue({
      isDefault: false,
      ifsc: '',
      bankName: '',
      accountType: '',
      accountNumber: '',
      micr: ''
    });

    row.markAsPristine();
    row.markAsUntouched();
  }



  removeRow(index: number) {

    //  if (index === 0) {

    //     if (this.bankFormArray.length === 1) {
    //       // Only one row exists → clear values instead of deleting
    //       this.clearRow(0);
    //       return;
    //     }
    //   }



    this.bankFormArray.removeAt(index);
    // Re-apply business rules
    this.ensureOneDefault();

    // Re-trigger validation for whole form
    this.bankFormArray.updateValueAndValidity();
    this.bankDetailsForm.updateValueAndValidity();
  }

  goBack() {
    this.location.back();
  }

  get clientType() {
    return this.bankForm.get('clientType')?.value;
  }


  // validateBankForm(): boolean {

  //   // if (this.bankForm.invalid) {
  //   //   this.bankForm.markAllAsTouched();
  //   //   return false;
  //   // }

  //   const rows = this.bankFormArray.controls;
  //   let rowValid = true;
  //   let atLeastOneRowFilled = false;

  //   rows.forEach((row: any) => {
  //     const bankName = row.get('bankName')?.value?.trim();
  //     const ifsc = row.get('neftCode')?.value?.trim();
  //     const accNo = row.get('accountNumber')?.value?.trim();

  //     // Check if user filled ANY field in the row
  //     const rowHasData = bankName || ifsc || accNo;

  //     if (!rowHasData) return;   // completely empty → IGNORE

  //     atLeastOneRowFilled = true;

  //     // Fields enabled state (ignore disabled)
  //     const bankNameEnabled = !row.get('bankName')?.disabled;
  //     const ifscEnabled = !row.get('neftCode')?.disabled;
  //     const accNoEnabled = !row.get('accountNumber')?.disabled;

  //     // Mark as touched (only enabled ones)
  //     if (bankNameEnabled) row.get('bankName')?.markAsTouched();
  //     if (ifscEnabled) row.get('neftCode')?.markAsTouched();
  //     if (accNoEnabled) row.get('accountNumber')?.markAsTouched();

  //     // -------------------------------
  //     // ❗ RULE: If ANY field filled → ALL THREE required
  //     // -------------------------------
  //     const anyMissing =
  //       (bankNameEnabled && !bankName) ||
  //       (ifscEnabled && !ifsc) ||
  //       (accNoEnabled && !accNo);

  //     if (anyMissing) {
  //       rowValid = false;
  //     }
  //   });

  //   if (!rowValid) {
  //     this.sharedServ.OpenAlert(
  //       "Please fill Bank Name, IFSC, and Account Number in filled rows."
  //     );
  //     return false;
  //   }

  //   // -----------------------------------
  //   // Default bank selection validation
  //   // -----------------------------------
  //   if (atLeastOneRowFilled) {
  //     const hasDefault = rows.some(
  //       (row: any) => row.get('isDefault')?.value === true
  //     );

  //     if (!hasDefault) {
  //       this.sharedServ.OpenAlert("Please select a default bank.");
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // validateBankForm(): boolean {

  //   const rows = this.bankFormArray.controls;
  //   let rowValid = true;
  //   let atLeastOneRowFilled = false;

  //   rows.forEach((row: FormGroup) => {

  //     const bankNameCtrl = row.get('bankName');
  //     const ifscCtrl = row.get('neftCode');
  //     const accNoCtrl = row.get('accountNumber');

  //     // Skip if controls are missing
  //     if (!bankNameCtrl || !ifscCtrl || !accNoCtrl) return;

  //     const bankName = bankNameCtrl.value?.trim();
  //     const ifsc = ifscCtrl.value?.trim();
  //     const accNo = accNoCtrl.value?.trim();

  //     const rowHasData = bankName || ifsc || accNo;
  //     if (!rowHasData) return;

  //     atLeastOneRowFilled = true;

  //     const bankEnabled = bankNameCtrl.enabled;
  //     const ifscEnabled = ifscCtrl.enabled;
  //     const accNoEnabled = accNoCtrl.enabled;

  //     if (bankEnabled) bankNameCtrl.markAsTouched();
  //     if (ifscEnabled) ifscCtrl.markAsTouched();
  //     if (accNoEnabled) accNoCtrl.markAsTouched();

  //     const missing =
  //       (bankEnabled && !bankName) ||
  //       (ifscEnabled && !ifsc) ||
  //       (accNoEnabled && !accNo);

  //     if (missing) rowValid = false;
  //   });

  //   if (!rowValid) {
  //     this.sharedServ.OpenAlert("Please fill Bank Name, IFSC, and Account Number in filled rows.");
  //     return false;
  //   }

  //   if (atLeastOneRowFilled) {
  //     const hasDefault = rows.some(
  //       (      row: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => row.get('isDefault')?.value === true
  //     );

  //     if (!hasDefault) {
  //       this.sharedServ.OpenAlert("Please select a default bank.");
  //       return false;
  //     }
  //   }

  //   return true;
  // }


  validateBankForm(): boolean {
    console.log(this.savedBankEntries.length, 'saved bank entries');
    console.log(this.UpdatedbankList.length, 'updated bank list');

    // If user already has saved banks, skip validation entirely
    if (this.savedBankEntries.length > 0 || this.UpdatedbankList.length > 0) {
      return true;  // ✅ User has at least one saved bank, no validation needed
    }

    const rows = this.bankFormArray.controls;
    let rowValid = true;
    let atLeastOneRowFilled = false;

    rows.forEach((row: FormGroup) => {

      const bankNameCtrl = row.get('bankName');
      const ifscCtrl = row.get('ifsc');
      const accNoCtrl = row.get('accountNumber');
      const defaultCtrl = row.get('isDefault');

      // Exit if row is malformed
      if (!bankNameCtrl || !ifscCtrl || !accNoCtrl) return;

      const bankName = (bankNameCtrl.value || '').toString().trim();
      const ifsc = (ifscCtrl.value || '').toString().trim();
      const accNo = (accNoCtrl.value || '').toString().trim();

      // Check whether user filled ANY field
      const rowHasData = bankName !== '' || ifsc !== '' || accNo !== '';

      if (!rowHasData) return; // empty row → ignore completely

      atLeastOneRowFilled = true;

      // Enabled flags
      const bankEnabled = bankNameCtrl.enabled;
      const ifscEnabled = ifscCtrl.enabled;
      const accNoEnabled = accNoCtrl.enabled;

      // Mark touched only enabled controls
      if (bankEnabled) bankNameCtrl.markAsTouched();
      if (ifscEnabled) ifscCtrl.markAsTouched();
      if (accNoEnabled) accNoCtrl.markAsTouched();

      // If any enabled field is empty → INVALID
      const missing =
        (bankEnabled && bankName === '') ||
        (ifscEnabled && ifsc === '') ||
        (accNoEnabled && accNo === '');

      if (missing) {
        rowValid = false;
      }
    });

    // If ANY row is incomplete
    if (!rowValid) {
      this.sharedServ.OpenAlert("Please fill Bank Name, IFSC, and Account Number in filled rows.");
      return false;
    }

    // Check default bank - including saved entries
    const totalBanks = this.savedBankEntries.length + (atLeastOneRowFilled ? 1 : 0);

    if (totalBanks > 0) {
      const hasDefaultInSaved = this.savedBankEntries.some(bank => bank.isDefault === true);
      const hasDefaultInCurrent = atLeastOneRowFilled && rows.some((row: any) => row.get('isDefault')?.value === true);

      if (!hasDefaultInSaved && !hasDefaultInCurrent) {
        this.sharedServ.OpenAlert("Please select a default bank.");
        return false;
      }
    }

    return true;
  }




  submit() {
    // Mark all form controls as touched to show validation errors
    this.bankForm.markAllAsTouched();
    this.bankFormArray.controls.forEach((control: any) => control.markAllAsTouched());

    console.log(this.savedBankEntries.length, 'saved bank entries');
    console.log(this.UpdatedbankList.length, 'updated bank list');

    // ✅ If user has at least one saved bank, skip all validation and proceed directly
    if (this.savedBankEntries.length > 0 || this.UpdatedbankList.length > 0) {
      console.log('User has saved banks, skipping validation');
      this.goToNextTab();
      return;
    }

    // Validate main form (depository details) - only if no saved banks
    if (this.bankForm.invalid) {
      let errorMessages: string[] = [];

      // Check Client Type
      if (this.bankForm.get('clientType')?.hasError('required')) {
        errorMessages.push('Client type is required');
      }

      // Check Dividend Payout
      if (this.bankForm.get('dividendPayout')?.hasError('required')) {
        errorMessages.push('Dividend payout mode is required');
      }

      // Check Depository Name
      if (this.bankForm.get('defaTDP')?.hasError('required')) {
        errorMessages.push('Depository name is required');
      }

      // Check demat fields based on client type
      const clientType = this.bankForm.get('clientType')?.value;

      if (clientType === 'D') {
        const depository = this.bankForm.get('defaTDP')?.value;

        if (depository === 'CDSL') {
          if (this.bankForm.get('cdsldpid')?.hasError('required')) {
            errorMessages.push('CDSL DP ID is required');
          } else if (this.bankForm.get('cdsldpid')?.hasError('pattern')) {
            errorMessages.push('CDSL DP ID must be 8 digits');
          }

          if (this.bankForm.get('cdslcltid')?.hasError('required')) {
            errorMessages.push('CDSL Client ID is required');
          } else if (this.bankForm.get('cdslcltid')?.hasError('pattern')) {
            errorMessages.push('CDSL Client ID must be 8 digits');
          }
        } else if (depository === 'NSDL') {
          if (this.bankForm.get('nsdldpid')?.hasError('required')) {
            errorMessages.push('NSDL DP ID is required');
          } else if (this.bankForm.get('nsdldpid')?.hasError('pattern')) {
            errorMessages.push('NSDL DP ID must be in format IN123456');
          }

          if (this.bankForm.get('nsdlcltid')?.hasError('required')) {
            errorMessages.push('NSDL Client ID is required');
          } else if (this.bankForm.get('nsdlcltid')?.hasError('pattern')) {
            errorMessages.push('NSDL Client ID must be 8 digits');
          }

          if (this.bankForm.get('cmbpiD_ID')?.hasError('required')) {
            errorMessages.push('Combined ID is required');
          } else if (this.bankForm.get('cmbpiD_ID')?.hasError('pattern')) {
            errorMessages.push('Combined ID must be 16 digits');
          }
        }
      }

      if (errorMessages.length > 0) {
        this.sharedServ.OpenAlert(errorMessages.join('\n'));
        return;
      }

      this.sharedServ.OpenAlert('Please fill all required fields correctly.');
      return;
    }

    // Validate bank form - only if no saved banks
    if (!this.validateBankForm()) {
      return;
    }

    // Check if at least one bank is added - only if no saved banks
    if (this.savedBankEntries.length === 0 && this.UpdatedbankList.length === 0) {
      this.sharedServ.OpenAlert('Please add at least one bank detail before submitting.');
      return;
    }

    // Continue submitting
    console.log("Form is valid", this.bankForm.value);

    //   if (!this.validateDefaultSelection()) {
    //   return;
    // }
    const mainData = { ...this.bankForm.value };
    const bankData = [...this.bankFormArray.value];

    console.log(mainData, bankData);

    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;

    const bseClieCode = parsedData?.bseClientCode || '';
    console.log('BSE Client Code:', bseClieCode);
    console.log('client code', bseClieCode);

    const payload = this.mapFormToPayload();
    payload.clieCode = bseClieCode;
    console.log(payload);

    this.bseUccSer.getUccBankData(payload).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('Bank API Response:', response);

        if (response.success) {
          this.sharedServ.successDia(response.message).subscribe(result => {
            if (result === true) {
              this.getBankList(payload.clieCode);
              // Clear all rows and reset to 1 empty row after successful save
              this.resetBankFormArray();
              //  this.nextTab.emit(3);  
              // this.router.navigate(['/app/nomineeDetails']);
            }
          }
          )
        }

        //      if (response.success) {
        //         this.getBankList(payload.clieCode);

        // } 
        else {
          this.sharedServ.OpenAlert('Failed to save bank details.');
        }
      },
      error: (err) => {
        console.error('Bank API Error:', err);
        this.sharedServ.OpenAlert('Something went wrong while saving bank details.');
      }
    });
  }

  resetBankFormArray() {
    this.savedBankEntries = []; // Clear saved entries
    this.bankFormArray.clear();
    this.bankFormArray.push(this.createBankForm());
    this.ensureOneDefault();
    console.log('Bank form array reset to initial state');
  }






  setDefault(index: number) {
    // Set all banks to non-default first
    this.savedBankEntries.forEach((bank, i) => {
      bank.isDefault = (i === index);
    });
    console.log('Default bank set to index:', index);

    // Update on server
    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const bseClieCode = parsedData?.bseClientCode || '';

    if (bseClieCode) {
      const payload = this.mapFormToPayloadWithBanks(this.savedBankEntries);
      payload.clieCode = bseClieCode;

      this.bseUccSer.getUccBankData(payload).subscribe({
        next: (response: { success: boolean; message: string }) => {
          if (response.success) {
            this.sharedServ.OpenAlert('Default bank updated successfully.');
            this.getBankList(bseClieCode);
          }
        },
        error: (err) => {
          console.error('Error updating default bank:', err);
        }
      });
    }
  }

  removeSavedBank(index: number) {
    this.sharedServ.openConfirmDialog(
      "Are you sure you want to delete this bank?",
      (isConfirm) => {
        if (isConfirm) {
          // Get the bank to delete from savedBankEntries
          const bankToDelete = this.savedBankEntries[index];

          // Find corresponding bank in UpdatedbankList to get the correct index
          const updatedBankIndex = this.UpdatedbankList.findIndex((bank: any) =>
            bank.neftCode === bankToDelete.ifsc &&
            bank.accNo === bankToDelete.accountNumber
          );

          if (updatedBankIndex !== -1) {
            const bankData = this.UpdatedbankList[updatedBankIndex];

            // Call delete API
            this.deleteBankFromDB({
              clieCode: bankData.clieCode,
              index: bankData.index
            }, updatedBankIndex);
          } else {
            // Fallback: if not found in UpdatedbankList, just remove from savedBankEntries
            console.warn('Bank not found in UpdatedbankList, removing from savedBankEntries only');
            this.savedBankEntries.splice(index, 1);
            this.sharedServ.OpenAlert("Bank removed from display.");
          }
        }
      }
    );
  }



  ensureOneDefault() {
    // Check if any saved bank is default
    const hasDefaultInSaved = this.savedBankEntries.some(bank => bank.isDefault);

    if (this.savedBankEntries.length > 0 && !hasDefaultInSaved) {
      // If no default in saved entries, set first as default
      this.savedBankEntries[0].isDefault = true;
    }

    // For the form array (current input row)
    if (this.bankFormArray.length === 1 && this.savedBankEntries.length === 0) {
      this.bankFormArray.at(0).get('isDefault')?.setValue(true);
    }
  }


  // saveAndEditinNormal(){

  //      console.log('call update in normal');

  //     if (this.bankForm.invalid) {
  //       this.bankForm.markAllAsTouched();
  //       return;
  //     }

  //     const formValue = this.bankForm.getRawValue();
  //     console.log(formValue, 'form VAlue of bank');

  // const mainData = { ...this.bankForm.value };
  // const bankData = [...this.bankFormArray.value];

  // console.log(mainData, bankData);


  //   const payload = this.mapFormToPayload();
  //   console.log(payload);
  //     // const clicode = this.resolveClientID();


  //      const storedData = localStorage.getItem('uccRegistrationData');
  //     const parsedData = storedData ? JSON.parse(storedData) : null;

  //     const bseClieCode = parsedData?.bseClientCode || '';
  //     console.log('BSE Client Code:', bseClieCode);
  //     console.log('client code', clicode);

  //     formValue.bseClientCode = bseClieCode;
  //     formValue.membID = this.getMembId;
  //     console.log('form value', formValue.bseClientCode);

  //   // let storedData = JSON.parse(localStorage.getItem('getBankList') || '[]');
  //   // storedData = Array.isArray(storedData) ? storedData : [];

  //     console.log(storedData, 'storedData before update');
  //  let patchedList = storedData.map(bank => this.mapStoredBankToPatched(bank));

  //  console.log(patchedList,'patched list');
  // //  localStorage.setItem('getNomineekList', JSON.stringify(patchedList));

  //   console.log(this.bankIndexinNormalMode, 'bank index from other comp');

  //   // 🔹 Get only this client's nominees
  //   const clientBanks = patchedList.filter(n => n.clieCode === clicode);
  //   console.log(clientBanks, 'client banks');


  //   if (this.bankIndexinNormalMode !== null && this.bankIndexinNormalMode >= 0) {
  //   // Directly update by index
  //   patchedList[this.bankIndexinNormalMode] = { 
  //     ...patchedList[this.bankIndexinNormalMode], 
  //     ...formValue 
  //   };
  //   console.log("✅ Updated BANK:", patchedList[this.bankIndexinNormalMode]);
  // } 
  //   else {
  //     patchedList.push(formValue);
  //     console.log("➕ Added new BANK:", formValue);
  //   }

  //   console.log(patchedList, 'stored data after update');


  // const updatedClientBanks = patchedList.filter(bank => bank.bseClientCode === clicode);

  //    if (updatedClientBanks.length > 5) {
  //       this.sharedService.OpenAlertPopup('You can only add up to 5 bank details!', () => {
  //         this.router.navigate(['/home/MFEntryForms/bankList']);
  //       });
  //       return;
  //     }

  //     // localStorage.setItem('bankAddListInNormalMode', JSON.stringify(storedData));
  //     console.log(updatedClientBanks, 'updated bank list');



  //     let listToMap: any[] = [];

  //     if (patchedList.length === 0) {
  //       listToMap = patchedList; // completely empty
  //     } else {
  //       listToMap = updatedClientBanks; // only this client's banks
  //     }


  //     const bankInput: uccBankDetails = this.mapFormToBankDetails(listToMap, clicode);
  //     console.log(bankInput, 'bank input');


  //     this.bseUccSer.getUccBankData(bankInput).subscribe({
  //       next: (response: { success: boolean; message: string }) => {
  //         console.log('Bank API Response:', response);

  //         if (response.success) {
  //           this.sharedService.OpenAlertPopup(response.message, () => {
  //             // this.getBankDropdown(this.resolveMembID()); 
  //             this.router.navigate(['/home/MFEntryForms/bankList']);
  //           });
  //         } else {
  //           this.sharedService.OpenAlertPopup('Failed to save bank details.');
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Bank API Error:', err);
  //         this.sharedService.OpenAlertPopup('Something went wrong while saving bank details.');
  //       }
  //     });
  // }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  handleDepositoryLogic() {
    const clientType$ = this.bankForm.get('clientType')?.valueChanges.pipe(
      skip(1),                     // 🔹 Skip initial patch value
      distinctUntilChanged(),       // 🔹 Only trigger on actual change
      takeUntil(this.destroy$)
    );

    const defaTDP$ = this.bankForm.get('defaTDP')?.valueChanges.pipe(
      skip(1),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    clientType$?.subscribe(() => this.toggleDepositoryFields());
    defaTDP$?.subscribe(() => this.toggleDepositoryFields());
  }

  toggleDepositoryFields() {
    const clientType = this.bankForm.get('clientType')?.value;
    const rawDepository = this.bankForm.get('defaTDP')?.value;
    const depository = rawDepository ? rawDepository.toLowerCase() : '';

    console.log('client type and depository', clientType, rawDepository);

    // Physical → disable all demat fields and allow up to 5 banks
    if (clientType === 'P') {
      this.disableDematFields();
      this.maxRows = 5; // Allow 5 banks for Physical
      return; // exit early
    }

    // Demat selected → enable all demat fields and allow only 1 bank
    if (clientType === 'D') {
      this.enableDematFields();
      this.maxRows = 1; // Allow only 1 bank for Demat

      // Demat + CDSL → disable NSDL fields
      if (depository === 'cdsl') {
        this.bankForm.get('nsdldpid')?.disable();
        this.bankForm.get('nsdldpid')?.reset();
        this.bankForm.get('nsdlcltid')?.disable();
        this.bankForm.get('nsdlcltid')?.reset();
        this.bankForm.get('cmbpiD_ID')?.disable();
        this.bankForm.get('cmbpiD_ID')?.reset();
      }

      // Demat + NSDL → disable CDSL fields
      if (depository === 'nsdl') {
        this.bankForm.get('cdsldpid')?.disable();
        this.bankForm.get('cdsldpid')?.reset();
        this.bankForm.get('cdslcltid')?.disable();
        this.bankForm.get('cdslcltid')?.reset();
      }
    } else {
      // If no client type selected, reset to default
      this.enableDematFields();
      this.maxRows = 5;
    }
  }

  disableDematFields() {
    const fields = ['defaTDP', 'cdsldpid', 'cdslcltid', 'cmbpiD_ID', 'nsdldpid', 'nsdlcltid'];
    fields.forEach(field => {
      this.bankForm.get(field)?.disable();
      this.bankForm.get(field)?.reset();
    });
  }

  enableDematFields() {
    const fields = ['defaTDP', 'cdsldpid', 'cdslcltid', 'cmbpiD_ID', 'nsdldpid', 'nsdlcltid'];
    fields.forEach(field => {
      this.bankForm.get(field)?.enable();
    });
  }

  // end here



  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.bankForm.get('ifsc')?.setValue(upper, { emitEvent: false });  // avoid triggering extra valueChanges
  }


  // nextTab(): void {
  //   if (
  //     this.activeTab === 0 &&
  //     (this.bankForm.invalid)
  //   ) {
  //     this.bankForm.markAllAsTouched();
  //     return;
  //   }

  //   if (this.activeTab < 2) {
  //     console.log('Bank Form value', this.bankForm.value,);
  //     this.SaveAndContinue();
  //   }
  // }


  prefillForm(bankDetail: any) {
    this.bankForm.patchValue({
      accountNumber: bankDetail?.bankAccoNumb?.trim() || '',
      ifsc: bankDetail?.ifscCode?.trim() || '',
      bankName: bankDetail?.bankName?.trim() || '',
      branchName: bankDetail?.bankBran?.trim() || '',
      accountType: bankDetail?.bankAccoType?.trim() || this.bankForm.value.accountType,
      MICR: bankDetail?.micrNumb?.trim() || '',
      // dividendPayout: bankDetail?. DivPayMode?.trim() || '',
      // clientType: bankDetail?. ClieType?.trim() || ''
    })
  }


  isTabActive(tabIndex: number): boolean {
    return this.activeTab === tabIndex;
  }


  get BseClientCode(): string | null {
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






  onSetAsDefaultChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.bankForm.get('setAsDefault')?.setValue(checked ? 1 : 0);
  }


  mapFormToBankDetails(bankList: any[], clientCode: string): uccBankDetails {
    const details = new uccBankDetails();
    details.clieCode = clientCode;

    // Initialize all demat fields
    details.defaTDP = '';
    details.cdsldpid = '';
    details.cdslcltid = '';
    details.cmbpiD_ID = '';
    details.nsdldpid = '';
    details.nsdlcltid = '';

    const get = (val: any) => (val !== undefined && val !== null ? val : '');
    const set = (key: keyof uccBankDetails, value: any) => (details as any)[key] = value;

    // Helper to map a single bank to details
    const mapBank = (source: any, suffix: string, isDefault: number) => {
      set(`neftCode${suffix}` as any, get(source?.ifsc));
      set(`accNo${suffix}` as any, get((source?.accountNumber ?? '').toString().trim()));
      set(`acctype${suffix}` as any, get(source?.accountType));
      set(`bankName${suffix}` as any, get(source?.bankName));
      set(`bankBranch${suffix}` as any, get(source?.branchName));
      set(`mcirnO${suffix}` as any, get(source?.MICR ? String(source?.MICR) : ''));
      set(`diviPayMode` as any, get(source?.dividendPayout));
      set(`clientType` as any, get(source?.clientType));


      // set(`bank${suffix}Default` as any, source && Object.keys(source).length ? isDefault : 0);

      set(`bank${suffix}Default` as any, source && Object.keys(source).length ? isDefault : 0);
    };

    // Initialize all 5 banks as blank
    const suffixMap = ['', '2', '3', '4', '5'];
    suffixMap.forEach(suffix => mapBank({}, suffix, 0));

    // Separate normal and demat banks
    const normalBanks = bankList.filter(b => b?.clientType !== 'D');
    const cdslBank = bankList.find(b => b?.clientType === 'D' && (b.defaTDP || '').toLowerCase() === 'cdsl');
    const nsdlBank = bankList.find(b => b?.clientType === 'D' && (b.defaTDP || '').toLowerCase() === 'nsdl');

    // ✅ Exclusive priority: NSDL > CDSL > Normal
    if (nsdlBank) {
      mapBank(nsdlBank, '5', 1);
      details.defaTDP = nsdlBank.defaTDP || '';
      details.nsdldpid = nsdlBank.nsdldpid || '';
      details.nsdlcltid = nsdlBank.nsdlcltid || '';
      // details.cmbpiD_ID = nsdlBank.cmbpiD_ID || '';

      return details;
    }

    if (cdslBank) {
      mapBank(cdslBank, '4', 1);
      details.defaTDP = cdslBank.defaTDP || '';
      details.cdsldpid = cdslBank.cdsldpid || '';
      details.cdslcltid = cdslBank.cdslcltid || '';

      return details;
    }

    // ✅ No demat → map normal banks to Bank1–3
    if (normalBanks[0]) mapBank(normalBanks[0], '', 1);
    if (normalBanks[1]) mapBank(normalBanks[1], '2', 0);
    if (normalBanks[2]) mapBank(normalBanks[2], '3', 0);

    if (normalBanks[3]) mapBank(normalBanks[3], '4', 0);
    if (normalBanks[4]) mapBank(normalBanks[4], '5', 0);

    // ✅ No demat → map normal banks to Bank1–5
    // normalBanks.slice(0, 5).forEach((bank, index) => {
    //   const suffix = suffixMap[index]; // '', '2', '3', '4', '5'
    //   mapBank(bank, suffix, index === 0 ? 1 : 0);
    // });

    return details;
  }



  // get getMembId(): string | null {
  //   const data = localStorage.getItem('uccRegistrationData');
  //   if (data) {
  //     try {
  //       const parsed = JSON.parse(data);
  //       return parsed?.memberDetails.id || null;
  //     } catch (e) {
  //       console.error('Invalid JSON in localStorage:', e);
  //     }
  //   }
  //   return null;
  // }


  get getMembId(): string {
    const data = localStorage.getItem('uccRegistrationData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed?.memberDetails?.id ?? '';
      } catch (e) {
        console.error('Invalid JSON in localStorage:', e);
      }
    }
    return '';
  }


  // patchValueFromBankDetails(data: any) {
  //   const rawAccType = (data.bankAccoType || '').trim().toUpperCase();

  //   // Check if it's one of the valid accountTypes
  //   const isValidAccType = this.accountTypes.some(type => type.value === rawAccType);


  //   this.bankForm.patchValue({
  //     ifsc: (data.ifscCode || '').trim(),
  //     MICR: (data.micrNumb || '').trim(),
  //     branchName: data.bankBran ? data.bankBran.trim() : '', // explicitly patch empty string
  //     bankName: data.bankName ? data.bankName.trim() : '',
  //     accountNumber: data.bankAccoNumb ? data.bankAccoNumb.trim() : '',
  //     // accountType: data.bankAccoType ? data.bankAccoType.trim() : this.bankForm.value.accountType,

  //     accountType: isValidAccType ? rawAccType : this.bankForm.value.accountType

  //   });

  //   console.log('Patched values:', {
  //     ifsc: (data.ifscCode || '').trim(),
  //     MICR: (data.micrNumb || '').trim(),
  //     branchName: (data.bankBran || '').trim(),
  //     bankName: (data.bankName || '').trim(),
  //     accountNumber: (data.bankAccoNumb || '').trim(),
  //     // accountType: (data.bankAccoType || '').trim()
  //     accountType: isValidAccType ? rawAccType : this.bankForm.value.accountType
  //   });

  // }

  patchValueFromBankDetails(data: any) {
  const rawAccType = (data.bankAccoType || '').trim().toUpperCase();
  const isValidAccType = this.accountTypes.some(type => type.value === rawAccType);

  const model = new BankDetailsModel({
    ifsc: (data.ifscCode || '').trim(),
    MICR: (data.micrNumb || '').trim(),
    branchName: (data.bankBran || '').trim(),
    bankName: (data.bankName || '').trim(),
    accountNumber: (data.bankAccoNumb || '').trim(),
    accountType: isValidAccType ? rawAccType : this.bankForm.value.accountType
  });

  // this.bankForm.patchValue(model);
  console.log(model, 'model');
  

  console.log('Mapped BankDetailsModel → Form:', model);
}


  // checkIfscLength() {
  //   const ifscValue = this.bankForm.get('ifsc')?.value || '';
  //   if (ifscValue.length === 11) {
  //     this.getbankDetialsByIFSCData();
  //   }
  // }

  addNewBank() {
    this.showBankInputField = true;
    // this.bankForm?.reset();
    // Only reset required fields
    ['ifsc', 'bankName', 'accountNumber', 'accountType', 'branchName', 'MICR']
      .forEach(field => this.bankForm.get(field)?.reset());
  }


  toAlphaNumeric(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z0-9]/g, ''); // Remove non-alphanumeric
    this.bankForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  restrictToDigits(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // Remove non-digits
    this.bankForm.get('cmbpiD_ID')?.setValue(input.value, { emitEvent: false });
  }

  allowOnlyNumbers(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // Remove non-numeric
    this.bankForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  //   toUpperCaseIFSC(event: any, index: number): void {
  //   const input = event.target as HTMLInputElement;
  //   const upper = input.value.toUpperCase();

  //   input.value = upper; // update textbox

  //   const bankArray = this.bankForm.get('bankDetails') as FormArray;
  //   bankArray.at(index).get('ifsc')?.setValue(upper, { emitEvent: false });
  // }

  toUpperCaseIFSC(event: any, index: number): void {
    const input = event.target as HTMLInputElement;

    // Allow only A-Z and 0-9
    let value = input.value.replace(/[^A-Za-z0-9]/g, "");

    // Convert to uppercase
    value = value.toUpperCase();

    // Update textbox
    input.value = value;

    // Update form
    const bankArray = this.bankForm.get('bankDetails') as FormArray;
    bankArray.at(index).get('ifsc')?.setValue(value, { emitEvent: false });
  }


  allowOnlyNumbersAccType(event: any, controlName: string, index: number) {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, '');  // keep only digits

    input.value = numericValue;

    const bankArray = this.bankForm.get('bankDetails') as FormArray;
    bankArray.at(index).get(controlName)?.setValue(numericValue, { emitEvent: false });
  }

  allowBranchName(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;

    // Allow only A-Z, a-z, 0-9, space, and . , ' ( ) & -
    input.value = input.value.replace(/[^A-Za-z0-9\s.,'()&-]/g, '');

    this.bankForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  getDefaultBanksFromCustmerMaster(membID: string | null) {
    this.getBankDropdown(membID);
  }


  getBankDropdown(membID: string | null) {
    if (!membID) {
      console.warn('No member ID available for bank dropdown');
      return;
    }

    const input = { membID: membID, bankName: '' };

    this.bseUccSer.getBankDropdown(input).subscribe({
      next: (res: any) => {
        this.bankNames = Array.isArray(res) ? res : [];
        this.bankNames.push('Add New Bank'); // Always add the option
        console.log('bank names', this.bankNames);
        this.showBankInputField = false;

      },
      error: () => {
        this.bankNames = ['Add New Bank'];
        this.showBankInputField = false;
      }
    });
  }

  getBankDetailsByMenbID(event: any) {
    const selectedBank = event.target ? event.target.value : this.bankForm.get('bankName')?.value;
    // let selectedBank = (this.bankForm.get('bankName')?.value || '').trim();

    // ✅ Case 1: Add New Bank
    if (selectedBank === 'Add New Bank') {
      this.addNewBank(); // Show IFSC + manual fields
      return;
    }

    // If dropdown returns an object (existing bank)
    if (selectedBank) {
      // const input = {
      //   // membID: this.getMembId,
      //   membID: this.resolveMembID(),
      //   bankName: selectedBank || '',
      // };

      const input = {
        membID: this.getMembId ?? '',   // <-- always string
        bankName: selectedBank || '',
      };


      this.bseUccSer.getBanDetails(input).subscribe({
        next: (res: any) => {
          console.log(res, 'res of bank details');
          console.log('Selected bank for API:', input);

          if (Array.isArray(res) && res.length > 0) {
            this.patchValueFromBankDetails(res[0]);
          } else {
            console.log("no bank data found");
          }
        },
        error: (err) => {
          console.log('Error fetching bank details', err);
        }
      });
    }
  }


  // getbankDetialsByIFSCData(ifscValue?: string) {
  //   const ifsc = ifscValue || this.bankForm.get('ifsc')?.value?.trim();
  //   if (!ifsc) return;

  //   let input = { ifscCode: ifsc };
  //   this.bseUccSer.getbankDetialsByIFSC(input).subscribe({
  //     next: (res) => {
  //       console.log('res of bank data by IFSC', res);
  //       const resData = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

  //       if (resData) {
  //         this.bankForm.patchValue({
  //           bankName: (resData.bankNAme || '').trim(),
  //           branchName: (resData.bankBranch || '').trim(),
  //           MICR: (resData.micrCode || '').trim()
  //         });
  //       } else {
  //         this.sharedServ.OpenAlert(res.message || 'Bank not found for this IFSC');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching IFSC details', err);
  //       this.sharedServ.OpenAlert('Something went wrong while fetching IFSC details.');
  //     }
  //   });
  // }

  //   getbankDetialsByIFSCData(index: number, ifscValue?: string) {
  //   const row = this.bankFormArray.at(index);

  //   if (!row) return;

  //   const ifsc = ifscValue || row.get('ifsc')?.value?.trim();
  //   if (!ifsc) return;


  //   const input = { ifscCode: ifsc };

  //   this.bseUccSer.getbankDetialsByIFSC(input).subscribe({
  //     next: (res) => {
  //       const resData = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

  //       if (resData) {
  //         row.patchValue({
  //           bankName: resData.bankNAme?.trim() || '',
  //           branchName: resData.bankBranch?.trim() || '',
  //           micr: resData.micrCode?.trim() || ''
  //         });
  //       } else {
  //         this.sharedServ.OpenAlert(res.message || 'Bank not found for this IFSC');
  //       }
  //     },
  //     error: () => {
  //       this.sharedServ.OpenAlert('Something went wrong while fetching IFSC details.');
  //     }
  //   });

  // }

  getbankDetialsByIFSCData(index: number, ifscValue?: string) {
    const row = this.bankFormArray.at(index);
    if (!row) return;

    const ifsc = (ifscValue || row.get('ifsc')?.value || '').trim();
    if (!ifsc || ifsc.length !== 11) return;  // Call only when valid IFSC entered

    const input = { ifscCode: ifsc };

    this.bseUccSer.getbankDetialsByIFSC(input).subscribe({
      next: (res) => {
        const resData = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;

        if (resData) {
          row.patchValue({
            bankName: resData.bankNAme?.trim() || '',
            branchName: resData.bankBranch?.trim() || '',
            micr: resData.micrCode?.trim() || ''
          });
        } else {
          this.sharedServ.OpenAlert(res.message || 'Bank not found for this IFSC');
        }
      },
      error: () => {
        this.sharedServ.OpenAlert('Something went wrong while fetching IFSC details.');
      }
    });
  }





  // getEditedUccData(clieCode: any) {
  //   // const selectedUcc = this.uccDetailsList[index];
  //   // const bseCode = selectedUcc.bseClientCode;

  //   const input: BseUccEditDetails = {
  //     clieCode: clieCode
  //   };

  //   this.bseUccSer.editUccDetails(input).subscribe({
  //     next: (res: any) => {
  //       console.log(res, 'res of edit details');
  //     },

  //     error: (err) => {
  //       console.log(err);
  //     }
  //   })
  // }

  // for add-edit= normal mode-working
  // SaveAndContinue(){

  //      console.log('call update');

  //     if (this.bankForm.invalid) {
  //       this.bankForm.markAllAsTouched();
  //       return;
  //     }

  //     const formValue = this.bankForm.getRawValue();
  //     console.log(formValue, 'form VAlue of bank');



  //     const clicode = this.resolveClientID();
  //     console.log('client code', clicode);

  //     formValue.bseClientCode = clicode;
  //     console.log('form value', formValue.bseClientCode);

  //   let storedData = JSON.parse(localStorage.getItem('bankAddListInNormalMode') || '[]');
  //   storedData = Array.isArray(storedData) ? storedData : [];

  // console.log(storedData,'storedData');


  //   console.log(this.bankIndexinNormalMode, 'bank index from other comp');

  // const clientBanks = storedData.filter(bank => bank.bseClientCode === clicode);

  // console.log(clientBanks,'client banks');


  // if (this.bankIndexinNormalMode !== null && this.bankIndexinNormalMode >= 0) {
  //   const selectedBank = clientBanks[this.bankIndexinNormalMode];


  // console.log(selectedBank,'selected bank');

  //   if (selectedBank) {
  //     const actualIndex = storedData.findIndex(
  //       bank =>
  //         bank.bseClientCode === selectedBank.bseClientCode &&
  //         String(bank.accountNumber) === String(selectedBank.accountNumber) &&
  //         bank.ifsc === selectedBank.ifsc &&


  //         // ason 14-08-2025
  //           bank.bankName === selectedBank.bankName &&
  // bank.branchName === selectedBank.branchName &&
  // bank.MICR === selectedBank.MICR &&
  // bank.accountType ===  selectedBank.accountType && 
  // bank.clientType ===  selectedBank.clientType &&
  // bank.dividendPayout ===  selectedBank. dividendPayout &&
  // bank?.setAsDefault ===  selectedBank?.setAsDefault
  // // end here
  //     );

  //     if (actualIndex !== -1) {
  //       storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
  //     }
  //   }
  // } else {
  //   storedData.push(formValue);
  // }

  // console.log(storedData,'stored data');
  // const updatedClientBanks = storedData.filter(bank => bank.bseClientCode === clicode);

  //    if (updatedClientBanks.length > 5) {
  //       this.sharedService.OpenAlertPopup('You can only add up to 5 bank details!', () => {
  //         this.router.navigate(['/home/MFEntryForms/bankList']);
  //       });
  //       return;
  //     }

  //     localStorage.setItem('bankAddListInNormalMode', JSON.stringify(storedData));
  //     console.log(updatedClientBanks, 'updated bank list');

  //     // Always decide what list you want to map
  //     // const listToMap = storedData.length === 0 ? storedData : clientBankList;

  //     let listToMap: any[] = [];

  //     if (storedData.length === 0) {
  //       listToMap = storedData; // completely empty
  //     } else {
  //       listToMap = updatedClientBanks; // only this client's banks
  //     }


  //     const bankInput: uccBankDetails = this.mapFormToBankDetails(listToMap, clicode);
  //     console.log(bankInput, 'bank input');


  //     this.bseUccSer.getUccBankData(bankInput).subscribe({
  //       next: (response: { success: boolean; message: string }) => {
  //         console.log('Bank API Response:', response);

  //         if (response.success) {
  //           this.sharedService.OpenAlertPopup(response.message, () => {
  //             // this.getBankDropdown(this.resolveMembID()); 
  //             this.router.navigate(['/home/MFEntryForms/bankList']);
  //           });
  //         } else {
  //           this.sharedService.OpenAlertPopup('Failed to save bank details.');
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Bank API Error:', err);
  //         this.sharedService.OpenAlertPopup('Something went wrong while saving bank details.');
  //       }
  //     });
  // }


  //for edit-add = normal mode
  //   SaveAndExit(){

  //      console.log('call update');

  //     if (this.bankForm.invalid) {
  //       this.bankForm.markAllAsTouched();
  //       return;
  //     }

  //     const formValue = this.bankForm.getRawValue();
  //     console.log(formValue, 'form VAlue of bank');



  //     const clicode = this.resolveClientID();
  //     console.log('client code', clicode);

  //     formValue.bseClientCode = clicode;
  //     console.log('form value', formValue.bseClientCode);

  //   let storedData = JSON.parse(localStorage.getItem('bankAddListInNormalMode') || '[]');
  //   storedData = Array.isArray(storedData) ? storedData : [];

  // console.log(storedData,'storedData');


  //   console.log(this.bankIndexinNormalMode, 'bank index from other comp');

  // const clientBanks = storedData.filter(bank => bank.bseClientCode === clicode);

  // console.log(clientBanks,'client banks');


  // if (this.bankIndexinNormalMode !== null && this.bankIndexinNormalMode >= 0) {
  //   const selectedBank = clientBanks[this.bankIndexinNormalMode];


  // console.log(selectedBank,'selected bank');

  //   if (selectedBank) {
  //     const actualIndex = storedData.findIndex(
  //       bank =>
  //         bank.bseClientCode === selectedBank.bseClientCode &&
  //         String(bank.accountNumber) === String(selectedBank.accountNumber) &&
  //         bank.ifsc === selectedBank.ifsc &&

  //                 // ason 14-08-2025
  //           bank.bankName === selectedBank.bankName &&
  // bank.branchName === selectedBank.branchName &&
  // bank.MICR === selectedBank.MICR &&
  // bank.accountType ===  selectedBank.accountType && 
  // bank.clientType ===  selectedBank.clientType &&
  // bank.dividendPayout ===  selectedBank. dividendPayout &&
  // bank?.setAsDefault ===  selectedBank?.setAsDefault
  // // end here
  //     );

  //     if (actualIndex !== -1) {
  //       storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
  //     }
  //   }
  // } else {
  //   storedData.push(formValue);
  // }

  // console.log(storedData,'stored data');
  // const updatedClientBanks = storedData.filter(bank => bank.bseClientCode === clicode);

  //    if (updatedClientBanks.length > 5) {
  //       this.sharedService.OpenAlertPopup('You can only add up to 5 bank details!', () => {
  //         this.router.navigate(['/home/MFEntryForms/uccList']);
  //       });
  //       return;
  //     }

  //     localStorage.setItem('bankAddListInNormalMode', JSON.stringify(storedData));
  //     console.log(updatedClientBanks, 'updated bank list');

  //     // Always decide what list you want to map
  //     // const listToMap = storedData.length === 0 ? storedData : clientBankList;

  //     let listToMap: any[] = [];

  //     if (storedData.length === 0) {
  //       listToMap = storedData; // completely empty
  //     } else {
  //       listToMap = updatedClientBanks; // only this client's banks
  //     }


  //     const bankInput: uccBankDetails = this.mapFormToBankDetails(listToMap, clicode);
  //     console.log(bankInput, 'bank input');


  //     this.bseUccSer.getUccBankData(bankInput).subscribe({
  //       next: (response: { success: boolean; message: string }) => {
  //         console.log('Bank API Response:', response);

  //         if (response.success) {
  //           this.sharedService.OpenAlertPopup(response.message, () => {
  //             // this.getBankDropdown(this.resolveMembID()); 
  //             this.router.navigate(['/home/MFEntryForms/uccList']);
  //           });
  //         } else {
  //           this.sharedService.OpenAlertPopup('Failed to save bank details.');
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Bank API Error:', err);
  //         this.sharedService.OpenAlertPopup('Something went wrong while saving bank details.');
  //       }
  //     });
  // }



  // isAddOrEditBankData() {
  //   if (this.isAddNewBank) {
  //     // this.getBankDropdown(this.resolveMembID());
  //     this.updateAndContinue();
  //   }
  //   else if (this.isEditBankDetail) {
  //     this.updateAndContinue();
  //   }
  // }

  private resolveMembID(): string | null {
    if (this.isAddNewBank) {
      return this.isAddMembID;
    }
    else if (this.isEditBankDetail) {
      return this.isEditMembID;
    }
    else if (this.isEditBankinNormalMode) {
      return this.getMembId;
    } else {
      return this.getMembId;
    }
  }

  private resolveClientID(): string | null {
    if (this.isAddNewBank) {
      return this.isAddClieCode;
    }
    else if (this.isEditBankDetail) {
      return this.isEditClieCode;
    }
    else if (this.isEditBankinNormalMode) {
      return this.BseClientCode;
    }
    else {
      return this.BseClientCode;
    }
  }

  //// by key exchanging - add-edit normal mode ///////////////

  private mapStoredBankToPatched(stored: any): any {
    return {
      ifsc: stored.neftCode,
      bankName: stored.bankName,
      accountNumber: stored.accNo,
      accountType: stored.acctype,
      branchName: stored.bankBranch,
      MICR: stored.mcirno,
      clientType: stored.clieType,
      dividendPayout: stored.divPayMode,
      setAsDefault: stored.bankDefault === "True" ? '1' : '0', // convert "True"/"False" string → boolean
      defaTDP: stored.defaTDP || null,
      cdsldpid: stored.cdsldpid || null,
      cdslcltid: stored.cdslcltid || null,
      cmbpiD_ID: stored.cmbpiD_ID || null,
      nsdldpid: stored.nsdldpid || null,
      nsdlcltid: stored.nsdlcltid || null,
      bseClientCode: stored.clieCode,
      membID: stored.membID
    };
  }


  // mapFormToPayload() {
  //   const formValue = this.bankForm.value;

  //   const payload: any = {
  //     clientType: formValue.clientType,
  //     clieCode: '',
  //     // pms: formValue.pms,
  //     defaTDP: formValue.defaTDP || "",
  //     cdsldpid: formValue.cdsldpid || "",
  //     cdslcltid: formValue.cdslcltid || "",
  //     cmbpiD_ID: formValue.cmbpiD_ID || "",
  //     nsdldpid: formValue.nsdldpid || "",
  //     nsdlcltid: formValue.nsdlcltid || "",
  //     diviPayMode: "02",     // static if needed
  //   };


  //   // 🔥 Map bankDetails[] → neftCode, neftCode2, neftCode3,... format
  //   formValue.bankDetails.forEach((bank: any, index: number) => {
  //     const idx = index === 0 ? "" : index + 1; // '' -> first bank, '2' -> second, ...

  //       // 🔍 Check if row is fully empty (ignore micr)
  //     const rowEmpty =
  //       !bank.ifsc &&
  //       !bank.bankName &&
  //       !bank.accountNumber

  //     // 🚫 Skip mapping this row completely
  //     if (rowEmpty) return;


  //     // Always map these fields
  //     payload[`neftCode${idx}`]   = bank.ifsc || "";
  //     payload[`accNo${idx}`]      = bank.accountNumber || "";
  //     payload[`acctype${idx}`]    = bank.accountType || "";
  //     payload[`bankName${idx}`]   = bank.bankName || "";
  //     payload[`bankBranch${idx}`] = bank.bankBranch || ""; // if not present, add in your form
  //     payload[`mcirnO${idx}`]     = bank.micr || "";
  //     payload[`bank${idx}Default`] = bank.isDefault ? 1 : 0;


  //   });

  //   return payload;
  // }


  // mapFormToPayload() {
  //   const formValue = this.bankForm.value;

  //   const payload: any = {
  //     clientType: formValue.clientType,
  //     clieCode: formValue.clieCode || "",
  //     defaTDP: formValue.defaTDP || "",
  //     cdsldpid: formValue.cdsldpid || "",
  //     cdslcltid: formValue.cdslcltid || "",
  //     cmbpiD_ID: formValue.cmbpiD_ID || "",
  //     nsdldpid: formValue.nsdldpid || "",
  //     nsdlcltid: formValue.nsdlcltid || "",
  //     diviPayMode: "02",

  //   };

  //   // Ensure full 5 rows mapping
  //   formValue.bankDetails.forEach((bank: any, index: number) => {

  //     const idx = index === 0 ? "" : index + 1;

  //     // Detect if row has actual data
  //     const rowHasData =
  //       bank.ifsc ||
  //       bank.bankName ||
  //       bank.accountNumber

  //     if (!rowHasData) {
  //       // Empty row → send blank fields
  //       payload[`neftCode${idx}`] = "";
  //       payload[`accNo${idx}`] = "";
  //       payload[`acctype${idx}`] = "";
  //       payload[`bankName${idx}`] = "";
  //       payload[`bankBranch${idx}`] = "";
  //       payload[`mcirnO${idx}`] = "";
  //       payload[`bank${idx}Default`] = 0;
  //       return;
  //     }

  //     // Filled row → send actual values
  //     payload[`neftCode${idx}`] = bank.ifsc || "";
  //     payload[`accNo${idx}`] = bank.accountNumber || "";
  //     payload[`acctype${idx}`] = bank.accountType || "";
  //     payload[`bankName${idx}`] = bank.bankName || "";
  //     payload[`bankBranch${idx}`] = bank.bankBranch || "";
  //     payload[`mcirnO${idx}`] = bank.micr || "";
  //     payload[`bank${idx}Default`] = bank.isDefault ? 1 : 0;
  //   });

  //   return payload;
  // }


  mapFormToPayload() {
    const formValue = this.bankForm.getRawValue(); // Use getRawValue to get disabled fields too

    const payload: any = {
      clientType: formValue.clientType,
      clieCode: formValue.clieCode || "",
      defaTDP: formValue.defaTDP || "",
      cdsldpid: formValue.cdsldpid || "",
      cdslcltid: formValue.cdslcltid || "",
      cmbpiD_ID: formValue.cmbpiD_ID || "",
      nsdldpid: formValue.nsdldpid || "",
      nsdlcltid: formValue.nsdlcltid || "",
      diviPayMode: "02",
    };

    // Merge saved entries with current row (if filled)
    const currentRow = formValue.bankDetails[0];
    const currentRowFilled = currentRow.ifsc || currentRow.bankName || currentRow.accountNumber;

    const allBanks = [...this.savedBankEntries];
    if (currentRowFilled) {
      allBanks.push(currentRow);
    }

    const filledRows = allBanks;

    // Initialize all 5 bank slots as empty
    for (let i = 0; i < 5; i++) {
      const idx = i === 0 ? "" : i + 1;
      payload[`neftCode${idx}`] = "";
      payload[`accNo${idx}`] = "";
      payload[`acctype${idx}`] = "";
      payload[`bankName${idx}`] = "";
      payload[`bankBranch${idx}`] = "";
      payload[`mcirnO${idx}`] = "";
      payload[`bank${idx}Default`] = 0;
    }

    // ------------------------------
    // CASE 1: Client Type = "P" (Physical)
    // Map banks to slots 1-5 sequentially
    // ------------------------------
    if (formValue.clientType === "P") {
      filledRows.forEach((bank: any, i: number) => {
        if (i >= 5) return; // Max 5 banks for Physical
        const idx = i === 0 ? "" : i + 1;

        payload[`neftCode${idx}`] = bank.ifsc || "";
        payload[`accNo${idx}`] = bank.accountNumber || "";
        payload[`acctype${idx}`] = bank.accountType || "";
        payload[`bankName${idx}`] = bank.bankName || "";
        payload[`bankBranch${idx}`] = bank.bankBranch || "";
        payload[`mcirnO${idx}`] = bank.micr || "";
        payload[`bank${idx}Default`] = bank.isDefault ? 1 : 0;
      });

      return payload;
    }

    // ----------------------------------------------
    // CASE 2: Client Type = "D" (Demat)
    // Map bank to specific slot based on depository
    // CDSL → Slot 4, NSDL → Slot 5
    // ----------------------------------------------
    if (formValue.clientType === "D") {
      const depository = formValue.defaTDP;
      let slot = "";

      if (depository === "NSDL") {
        slot = "5"; // Map to 5th bank slot
      } else if (depository === "CDSL") {
        slot = "4"; // Map to 4th bank slot
      }

      const bank = filledRows[0] || {};
      const rowFilled = Object.keys(bank).length > 0;

      // Map to the designated slot
      if (rowFilled && slot) {
        payload[`neftCode${slot}`] = bank.ifsc || "";
        payload[`accNo${slot}`] = bank.accountNumber || "";
        payload[`acctype${slot}`] = bank.accountType || "";
        payload[`bankName${slot}`] = bank.bankName || "";
        payload[`bankBranch${slot}`] = bank.bankBranch || "";
        payload[`mcirnO${slot}`] = bank.micr || "";
        payload[`bank${slot}Default`] = 1; // Always default for demat
      }
    }

    return payload;
  }

  mapFormToPayloadWithBanks(banksList: any[]) {
    const formValue = this.bankForm.getRawValue(); // Use getRawValue to get disabled fields too

    const payload: any = {
      clientType: formValue.clientType,
      clieCode: formValue.clieCode || "",
      defaTDP: formValue.defaTDP || "",
      cdsldpid: formValue.cdsldpid || "",
      cdslcltid: formValue.cdslcltid || "",
      cmbpiD_ID: formValue.cmbpiD_ID || "",
      nsdldpid: formValue.nsdldpid || "",
      nsdlcltid: formValue.nsdlcltid || "",
      diviPayMode: "02",
    };

    const filledRows = banksList;

    // Initialize all 5 bank slots as empty
    for (let i = 0; i < 5; i++) {
      const idx = i === 0 ? "" : i + 1;
      payload[`neftCode${idx}`] = "";
      payload[`accNo${idx}`] = "";
      payload[`acctype${idx}`] = "";
      payload[`bankName${idx}`] = "";
      payload[`bankBranch${idx}`] = "";
      payload[`mcirnO${idx}`] = "";
      payload[`bank${idx}Default`] = 0;
    }

    // ------------------------------
    // CASE 1: Client Type = "P" (Physical)
    // Map banks to slots 1-5 sequentially
    // ------------------------------
    if (formValue.clientType === "P") {
      filledRows.forEach((bank: any, i: number) => {
        if (i >= 5) return; // Max 5 banks for Physical
        const idx = i === 0 ? "" : i + 1;

        payload[`neftCode${idx}`] = bank.ifsc || "";
        payload[`accNo${idx}`] = bank.accountNumber || "";
        payload[`acctype${idx}`] = bank.accountType || "";
        payload[`bankName${idx}`] = bank.bankName || "";
        payload[`bankBranch${idx}`] = bank.bankBranch || "";
        payload[`mcirnO${idx}`] = bank.micr || "";
        payload[`bank${idx}Default`] = bank.isDefault ? 1 : 0;
      });

      return payload;
    }

    // ----------------------------------------------
    // CASE 2: Client Type = "D" (Demat)
    // Map bank to specific slot based on depository
    // CDSL → Slot 4, NSDL → Slot 5
    // ----------------------------------------------
    if (formValue.clientType === "D") {
      const depository = formValue.defaTDP;
      let slot = "";

      if (depository === "NSDL") {
        slot = "5"; // Map to 5th bank slot
      } else if (depository === "CDSL") {
        slot = "4"; // Map to 4th bank slot
      }

      const bank = filledRows[0] || {};
      const rowFilled = Object.keys(bank).length > 0;

      // Map to the designated slot
      if (rowFilled && slot) {
        payload[`neftCode${slot}`] = bank.ifsc || "";
        payload[`accNo${slot}`] = bank.accountNumber || "";
        payload[`acctype${slot}`] = bank.accountType || "";
        payload[`bankName${slot}`] = bank.bankName || "";
        payload[`bankBranch${slot}`] = bank.bankBranch || "";
        payload[`mcirnO${slot}`] = bank.micr || "";
        payload[`bank${slot}Default`] = 1; // Always default for demat
      }
    }

    return payload;
  }



  // BANK LIST 

  private mapBankDetailsToArray(response: any): any[] {
    const banks = [];

    const commonFields = {
      clieCode: response.clieCode?.trim() || '',
      cdsldpid: response.cdsldpid?.trim() || '',
      cdslcltid: response.cdslcltid?.trim() || '',
      nsdldpid: response.nsdldpid?.trim() || '',
      nsdlcltid: response.nsdlcltid?.trim() || '',
      cmbpiD_ID: response.cmbpiD_ID?.trim() || '',
      membID: response.membID?.trim() || '',
      clieType: response.clieType?.trim() || '',
      divPayMode: response.divPayMode?.trim() || '',
      defaTDP: response.defaTDP?.trim() || ''
    };

    for (let i = 1; i <= 5; i++) {
      const key = `bank${i}detail`;
      const bank = response[key];

      if (!bank) continue;

      const cleanedBank = {
        bankKey: key,
        index: i,
        neftCode: bank.neftCode?.trim() || null,
        bankDefault: bank.bankDefault?.toString().trim() || null,
        accNo: bank.accNo?.trim() || null,
        acctype: bank.acctype?.trim() || null,
        bankBranch: bank.bankBranch?.trim() || null,
        bankName: bank.bankName?.trim() || null,
        mcirno: bank.mcirno?.trim() || null,
        ...commonFields // add client-level details
      };

      // Only validate the bank-specific fields
      const isBankDataValid = [
        cleanedBank.neftCode,
        cleanedBank.bankDefault,
        cleanedBank.accNo,
        cleanedBank.acctype,
        cleanedBank.bankBranch,
        cleanedBank.bankName,
        cleanedBank.mcirno
      ].some(val => val && val !== 'null' && val !== '');

      if (isBankDataValid) {
        banks.push(cleanedBank);
      }
    }

    // Sort default bank on top
    // return banks.sort((a, b) => (b.bankDefault === 'True' ? 1 : -1));

    return banks.sort((a, b) => {
      if (a.bankDefault === 'True') return -1;
      if (b.bankDefault === 'True') return 1;
      return a.index - b.index;
    });

  }


  convertBankJsonToList(data: any[]) {
    this.bankDetailsList = [];

    data.forEach((item) => {
      // Handle various formats of bankDefault
      const isDefault = item.bankDefault === 'True' ||
        item.bankDefault === '1' ||
        item.bankDefault === 1 ||
        item.bankDefault === true;

      const bank = {
        default: isDefault ? 1 : 0,
        ifsc: item.neftCode?.trim() || '',
        accNo: item.accNo?.trim() || '',
        accType: item.acctype?.trim() || '',
        bankName: item.bankName?.trim() || '',
        bankBranch: item.bankBranch?.trim() || '',
        micr: item.mcirno?.trim() || '',
        clieCode: item.clieCode?.trim() || '',
        index: item.index
      };

      if (bank.ifsc || bank.accNo || bank.bankName) {
        this.bankDetailsList.push(bank);
      }
    });

    console.log("Bank List with defaults →", this.bankDetailsList.map(b => ({ index: b.index, default: b.default })));

  }



  // BANK LIST 
  getBankList(clieCode: string) {

    if (!clieCode) {
      console.warn('Client code is missing. Cannot fetch bank list.');
      return;
    }

    const input: bseBankListApiInput = {
      clientCode: clieCode
    }
    console.log('bank list input', input);

    this.bseUccSer.getBseBankList(input).subscribe({
      next: (res: any) => {
        console.log('res of bank list', res);
        const clieCode = res.clieCode?.trim() || '';
        const membID = res.membID?.trim() || '';
        console.log(clieCode, membID, 'clie code and memb id');

        this.UpdatedbankList = this.mapBankDetailsToArray(res);
        console.log('updated bank list', this.UpdatedbankList);

        localStorage.setItem('getBankList', JSON.stringify(this.UpdatedbankList));

        // Convert to savedBankEntries format for display
        this.savedBankEntries = this.UpdatedbankList.map((bank: any) => {
          // Handle various formats of bankDefault: "True", "1", 1, true
          const isDefault = bank.bankDefault === 'True' ||
            bank.bankDefault === '1' ||
            bank.bankDefault === 1 ||
            bank.bankDefault === true;

          return {
            isDefault: isDefault,
            ifsc: bank.neftCode || '',
            bankName: bank.bankName || '',
            accountType: bank.acctype || '',
            accountNumber: bank.accNo || '',
            micr: bank.mcirno || '',
            bankBranch: bank.bankBranch || ''
          };
        });

        console.log('Converted savedBankEntries with defaults:', this.savedBankEntries.map((b, i) => ({ index: i, isDefault: b.isDefault })));

        // Ensure only one default
        const defaultIndices = this.savedBankEntries
          .map((bank, index) => bank.isDefault ? index : -1)
          .filter(index => index !== -1);

        console.log('Default bank indices found:', defaultIndices);

        if (defaultIndices.length === 0 && this.savedBankEntries.length > 0) {
          // No default found, set first as default
          this.savedBankEntries[0].isDefault = true;
          console.log('No default found, setting first bank as default');

          // Update default on server
          this.updateDefaultBankOnServer(0);
        } else if (defaultIndices.length > 1) {
          // Multiple defaults found, keep only the first one
          console.log('Multiple defaults found, keeping only the first one');
          this.savedBankEntries.forEach((bank, index) => {
            bank.isDefault = (index === defaultIndices[0]);
          });
        }

        console.log('Final saved bank entries from API:', this.savedBankEntries);
        this.convertBankJsonToList(this.UpdatedbankList);
      },

      error: (err: any) => {
        console.error('Error fetching bank list', err);
      }
    })
  }

  // Helper method to update default bank on server
  updateDefaultBankOnServer(index: number) {
    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const bseClieCode = parsedData?.bseClientCode || '';

    if (bseClieCode && this.savedBankEntries.length > 0) {
      // Set the specified index as default
      this.savedBankEntries.forEach((bank, i) => {
        bank.isDefault = (i === index);
      });

      const payload = this.mapFormToPayloadWithBanks(this.savedBankEntries);
      payload.clieCode = bseClieCode;

      console.log('Updating default bank on server, index:', index);

      this.bseUccSer.getUccBankData(payload).subscribe({
        next: (response: { success: boolean; message: string }) => {
          if (response.success) {
            console.log('Default bank updated on server successfully');
          } else {
            console.warn('Failed to update default bank on server');
          }
        },
        error: (err) => {
          console.error('Error updating default bank on server:', err);
        }
      });
    }
  }

  getBankListEdit(clieCode: string) {

    if (!clieCode) {
      console.warn('Client code is missing. Cannot fetch bank list.');
      return;
    }

    const input: bseBankListApiInput = {
      clientCode: clieCode
    }
    console.log('bank list input', input);

    this.bseUccSer.getBseBankList(input).subscribe({
      next: (res: any) => {
        console.log('res of bank list', res);
        const clieCode = res.clieCode?.trim() || '';
        const membID = res.membID?.trim() || '';
        console.log(clieCode, membID, 'clie code and memb id');

        this.UpdatedbankList = this.mapBankDetailsToArray(res);
        console.log('updated bank list', this.UpdatedbankList);

        localStorage.setItem('getBankList', JSON.stringify(this.UpdatedbankList));

        // Convert to savedBankEntries format for display
        this.savedBankEntries = this.UpdatedbankList.map((bank: any) => {
          // Handle various formats of bankDefault: "True", "1", 1, true
          const isDefault = bank.bankDefault === 'True' ||
            bank.bankDefault === '1' ||
            bank.bankDefault === 1 ||
            bank.bankDefault === true;

          return {
            isDefault: isDefault,
            ifsc: bank.neftCode || '',
            bankName: bank.bankName || '',
            accountType: bank.acctype || '',
            accountNumber: bank.accNo || '',
            micr: bank.mcirno || '',
            bankBranch: bank.bankBranch || ''
          };
        });

        console.log('Converted savedBankEntries with defaults:', this.savedBankEntries.map((b, i) => ({ index: i, isDefault: b.isDefault })));

        // Ensure only one default
        const defaultIndices = this.savedBankEntries
          .map((bank, index) => bank.isDefault ? index : -1)
          .filter(index => index !== -1);

        console.log('Default bank indices found:', defaultIndices);

        if (defaultIndices.length === 0 && this.savedBankEntries.length > 0) {
          // No default found, set first as default
          this.savedBankEntries[0].isDefault = true;
          console.log('No default found, setting first bank as default');

          // Update default on server
          this.updateDefaultBankOnServer(0);
        } else if (defaultIndices.length > 1) {
          // Multiple defaults found, keep only the first one
          console.log('Multiple defaults found, keeping only the first one');
          this.savedBankEntries.forEach((bank, index) => {
            bank.isDefault = (index === defaultIndices[0]);
          });
        }

        console.log('Final saved bank entries from API:', this.savedBankEntries);
        this.convertBankJsonToList(this.UpdatedbankList);
      },

      error: (err: any) => {
        console.error('Error fetching bank list', err);
      }
    })
  }

  navToUpdateNom() {
    console.log(this.clieCodeFromUpdate, 'clie code from update');
    
    this.navigateToNextTab(this.clieCodeFromUpdate);
  }

  navigateToNextTab(clieCodeFromUpdate: string) {
      this.getBankList(clieCodeFromUpdate);
    if (this.isUpdate) {
      this.nextTab.emit({
        index: 2,
        state: {
          isUpdateNominee: true,
          // MembID: input.MembID || null,
          // clieCode:   editedBseClientCode || input.clieCode || ''
          MembID: this.getMembId,
          clieCode: this.clieCodeFromUpdate || clieCodeFromUpdate || ''
        }
      });

    }
  }
}


