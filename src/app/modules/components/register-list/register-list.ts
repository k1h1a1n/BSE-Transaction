import { ChangeDetectionStrategy, Component, ViewChild, AfterViewInit, TemplateRef, inject, ChangeDetectorRef } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { Shared } from '../../../shared/services/shared';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, Subject, forkJoin, of, EMPTY } from 'rxjs';
import { map, catchError, switchMap, tap, finalize } from 'rxjs/operators';
import { BseUccEditDetails, checkMandatoryFieldsResponse, DeleteClientRequest, getUccList, PanVerificationRequest, UccApiResponse, UccDetails } from '../../models/bseUCCModel';
import { BseSubmissionPayload, BSESubmissionRequest, UccElogRequest, UccNominationLinkRequest, UccNominationLinkResponse, validDatawithNomineeopt } from '../../models/bseSubmissionModel';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { BseRegisterinvestors } from '../bse-registerinvestors/bse-registerinvestors';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IndexedDBService } from '../../../shared';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sso } from '../../../shared/components/sso/sso';
import { appConfig } from '../../../app.config';
import { SharedEnv } from '../../../shared/environments/environment';
//for Table 
export interface PeriodicElement {
  clientId: number;
  holdingPattern: string;
  firstApplication: string;
  secondApplication: string;
  thirdApplication: string;
  bseStatus: boolean;
  docStatus: boolean;
  memberId: number;
  eLog: boolean;
  createdOn: string;
}

@Component({
  selector: 'app-register-list',
  imports: [BreadcrumbModule, MatFormFieldModule, MatDatepickerModule, MatCheckboxModule,
    MatTableModule,
    InputTextModule,
    ProgressBarModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ButtonModule, MatCheckboxModule, MatPaginatorModule, CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule, MatProgressSpinnerModule,],
  templateUrl: './register-list.html',
  styleUrl: './register-list.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const intl = new MatPaginatorIntl();
        intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return '0 of many';
          }

          const startIndex = page * pageSize;
          const endIndex = Math.min(startIndex + pageSize, length);

          return `${startIndex + 1} - ${endIndex} of many`;
        };
        return intl;
      }
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterList {
  isEditingRegistration: boolean = false;
  isUccStatusLoading: boolean = false;
  uccStatusTooltip: string = '';
  private idbsvc = inject(IndexedDBService);
  uccDetails: any = {};
  uccAddressDetails: any = {};
  uccBankDetails: any = {};
  uccNomineeDetails: any = {};
  dialogRef: MatDialogRef<any> | null = null;
  isCardActive: boolean = false;
  isLoadingUccData: boolean = false;
  isBseSubmitting: boolean = false; // ✅ Dedicated loader for BSE submission
  isElogLoading: boolean = false; // ✅ Dedicated loader for ELOG link generation
  uccFlags = {
    nomineeOpt: false,
    uccStatus: false,
    elogStatus: false,
    fatcaStatus: false
  };
  isAuth: boolean = false; // default value
  clientCode: string = '';
  showEditMenu = false;
  uccDetailsList: UccDetails[] = [];
  uccElogDetailsList = null;
  isEdit: boolean = false;
  bottomPopUp: boolean = false;
  missingFields = [];
  // for btn click filter
  filterClientCode: string = '';
  showFilterInput = false;
  originalUccDetailsList: any[] = [];

  // without btn filter ason 2-09-2025
  filteredList: any[] = [];
  originalList: any[] = [];
  private filterInput$ = new Subject<string>();
  noResultsFound: boolean = false;
  private noResultTimeout: any;

  fatcaSaved: string = 'Pending'; // 'Success' or 'Pending'
  isFatcaSummitSuccess: boolean = false;

  regnType: string = '';
  dateForm!: FormGroup;

  @ViewChild('panVerificationDialog') panVerificationDialog!: TemplateRef<any>;

  pan: string = '';
  mobile: string = '';
  DOB: string = '';

  resArrGetData = [];
  succed: boolean = false;
  pending: boolean = false;


  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  breadcrumb_items: MenuItem[] = [];
  home: MenuItem = {};

  //for table with checkbox
  displayedColumns: string[] = ['select', 'clientId', 'UCCStatus', 'taxStatus', 'holdingPattern', 'fatcaStatus', 'firstApplication', 'secondApplication', 'thirdApplication', 'docStatus', 'nomAuthLink', 'bseStatus', 'createdOn', 'actions',];
  // 'memberId', 'eLog',

  dataSource = new MatTableDataSource<UccDetails>();
  selection = new SelectionModel<UccDetails>(true, []);

  showFilter = false;
  noDataFound = false;
  filterOptions = [
    { label: '(None)', value: '' },
    { label: 'BSE Client ID', value: 'bseClientCode' },
    { label: 'Holding Pattern', value: 'holdingPatternDetails.label' },
    { label: '1st Applicant', value: 'memberDetails' },
    { label: '2nd Applicant', value: 'secondApplication' },
    { label: '3rd Applicant', value: 'thirdApplication' },
    { label: 'BSE Status', value: 'bseStatus' },
    { label: 'Doc Status', value: 'docStatus' },
    { label: 'PAN', value: 'panNo' },
    { label: 'Email', value: 'emailID' },
    { label: 'Mobile', value: 'mobileNO' },
    { label: 'Member ID', value: 'memberId' },
    { label: 'Elog Status', value: 'elogStatus' },
    { label: 'Created On', value: 'createDate' },
    { label: 'Tax Status', value: 'taxStatusDetails.label' },
    // {label: 'BSEMemberID', value: 'bseMemberID' },
    // {label: 'Fatca Status', value: 'fatcaStatus' },
  ];

  selectedFilter: any = '';
  filterValue: string = '';
  searchText: string = '';
  isUccFetching = false;
  hasUccErrorAlertShown = false;
  finalUccStatus: any;
  fatcaMembId: any;
  savedDataToBSE: boolean = false;
  isNomineeLoading: boolean = false;
  selectedEditRow: any = null;
  isShowEditModal: boolean = false;
  activeEditTab: string = 'registration';
  editTabs = [
    { id: 'registration', label: 'Registration Info', icon: 'pi pi-file' },
    { id: 'kyc', label: 'KYC Details', icon: 'pi pi-id-card' },
    { id: 'address', label: 'Contact & Address', icon: 'pi pi-map-marker' },
    { id: 'bank', label: 'Bank Account Details', icon: 'pi pi-wallet' },
    { id: 'nominee', label: 'Nominee Details', icon: 'pi pi-user' }
  ];

  constructor(
    private router: Router,
    private sharedSer: Shared,
    private bscUccSer: BseUCCRegister,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) { }



  ngOnInit() {
    // Retrieve data passed from SSO via router state
    // do for sso
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      let { IFAID, IFAEmailId, UserID, IFAKey } = navigation.extras.state;
      console.log('Received from SSO:', { IFAID, IFAEmailId, UserID, IFAKey });

    }
    console.log('Before UpdateEnv - localStorage IFAID:', localStorage.getItem('IFAID'));
    this.sharedSer.UpdateEnv();
    console.log('After UpdateEnv - localStorage IFAID:', localStorage.getItem('IFAID'));
    // end here

    this.breadcrumb_items = [
      { label: 'Home', routerLink: '/' },
      { label: 'CRM', routerLink: '/crm' },
      { label: 'Online MF Transactions', routerLink: '/crm' },
      { label: 'BSE Register Investors' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/' };

    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });


    const state = history.state;
    if (state && state?.isFatcaSaved) {
      console.log(state, 'state from fatca');

      history.replaceState({}, ''); // Clear state to prevent repeated actions
    }
    // Load FATCA data from localStorage (includes membId and status)
    const fatcaDataFromStorage = JSON.parse(localStorage.getItem('fatcaData') || '{}');
    this.fatcaMembId = fatcaDataFromStorage?.membId;
    let fatcaSaved = fatcaDataFromStorage?.status === 'Success' ? 'Success' : 'Pending';
    // memberId
    console.log(this.fatcaMembId, fatcaSaved, 'FATCA Member ID and Status');
    this.refreshUccList();
    //  this.getFatcaBseStatus();


    // let savedData = localStorage.getItem('savedUccCard');
    // console.log(savedData);
    // if (savedData) {
    //   try {
    //     savedData = JSON.parse(savedData); 
    //   } catch (e) {
    //     console.error('Invalid JSON in savedUccCard', e);
    //   }
    // }
    // console.log(savedData);


    // const saved = JSON.parse(localStorage.getItem('savedUccCard') || '{}');
    // this.uccDetailsList.forEach((ucc: any) => {
    //   ucc.isSubmitted = saved[ucc.bseClientCode] || false;
    // });

    //  ason 2-09-2025 for filter
    // Subscribe with debounce
    this.originalList = [...this.uccDetailsList];
    this.filterInput$
      .pipe(
        debounceTime(300),          // wait 300ms after typing stops
        distinctUntilChanged()      // only emit if value actually changes
      )
      .subscribe((value: string) => {
        this.applyFilter(value);
      });
    //  end here

    this.isAuth = history?.state?.isAuthenticated === true;
    // if (!this.isAuth) {
    //   this.isAuth = localStorage.getItem('isAuthenticatedElog') === 'true';
    // }

    // console.log(this.uccDetailsList, 'ucc details list');
    this.clientCode = String(localStorage.getItem('uccClientCode'));
    // Load FATCA success status from localStorage
    this.fatcaSaved = localStorage.getItem('fatcaSuccessMessage') === 'true' ? 'Success' : 'Pending';
    console.log(this.fatcaSaved, 'fatcaSaved status');
    // this.dataSource.data = this.uccDetailsList;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;

    // When filter is closed, reset and show full list
    if (!this.showFilter) {
      this.resetFilter();
    }
  }

  applyHeaderFilter() {
    if (!this.selectedFilter) {
      this.sharedSer.OpenAlert('Please select a filter field.');
      return;
    }

    if (!this.searchText.trim()) {
      this.sharedSer.OpenAlert('Please enter search text.');
      return;
    }

    const filterField = this.selectedFilter;
    const searchValue = this.searchText.trim().toLowerCase();

    const filteredData = this.uccDetailsList.filter((item: any) => {
      const value = this.getNestedValue(item, filterField);
      return value?.toString().toLowerCase().includes(searchValue);
    });

    this.dataSource.data = filteredData;
    this.noDataFound = filteredData.length === 0;
    console.log(this.dataSource.data, 'data source filtered');

  }

  resetFilter() {
    this.selectedFilter = '';
    this.searchText = '';
    this.noDataFound = false;
    this.dataSource.data = this.uccDetailsList;
  }



  getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((o, i) => (o ? o[i] : ''), obj);
  }


  dateRangeValidator(form: FormGroup) {
    const start = form.get('startDate')?.value;
    const end = form.get('endDate')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // ❌ Same date
    // if (startDate.getTime() === endDate.getTime()) {
    //   return { sameDate: true };
    // }

    // ❌ End date is before Start date
    if (endDate < startDate) {
      return { invalidRange: true };
    }

    // ❌ Date range exceeds 90 days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      return { exceedsMaxRange: true };
    }

    return null;
  }

  applyDateRange() {
    if (this.dateForm.invalid) {
      if (this.dateForm.hasError('invalidRange')) {
        this.sharedSer.OpenAlert('End date cannot be before start date');
      } else if (this.dateForm.hasError('exceedsMaxRange')) {
        this.sharedSer.OpenAlert('Date range cannot exceed 90 days');
      }
      return;
    }

    const startDate = this.startOfDay(new Date(this.dateForm.value.startDate));
    const endDate = this.endOfDay(new Date(this.dateForm.value.endDate));

    console.log("Start:", startDate);
    console.log("End:", endDate);

    // Filter full list (not selected rows)
    const filteredList = this.uccDetailsList.filter(row => {
      const rowDate = this.parseToDate(row.createDate);
      if (!rowDate) {
        return false;
      }
      return rowDate >= startDate && rowDate <= endDate;
    });

    console.log("Filtered Records:", filteredList);

    // Update table with filtered records
    this.dataSource.data = filteredList;

    // Optional: clear checkbox selection
    this.selection.clear();
  }


  resetDateRange() {
    this.dateForm.reset();               // Clear form
    this.dataSource.data = [...this.uccDetailsList]; // Restore full list
    // console.log(this.dataSource.data, 'data source');

    this.selection.clear();              // Clear checkbox selection
  }

  private startOfDay(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private endOfDay(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized;
  }

  private parseToDate(value: string | Date | undefined | null): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);

    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Handle strings like "09/12/2025 14:32" by inserting a 'T'
    if (typeof value === 'string') {
      const normalizedString = value.replace(' ', 'T');
      const retried = new Date(normalizedString);
      return isNaN(retried.getTime()) ? null : retried;
    }

    return null;
  }





  // deleteSelectedUcc() {
  //   const selectedRows = this.selection.selected;
  // console.log(selectedRows,'selected rows');

  //   if (selectedRows.length === 0) {
  //     alert("No rows selected!");
  //     return;
  //   }

  //   // Remove selected rows from list
  //   this.uccDetailsList = this.uccDetailsList.filter(
  //     item => !selectedRows.includes(item)
  //   );

  //   // Reset table datasource
  //   this.dataSource.data = [...this.uccDetailsList];

  //   // Clear selection
  //   this.selection.clear();

  //   console.log("Deleted selected rows");
  // }
  toggleRowSelection(row: any, index: number) {
    row._rowIndex = index;
    this.selection.toggle(row);
  }


  deleteSelectedUcc() {
    const selectedRows = this.selection.selected;

    console.log(selectedRows, 'selected rows');

    if (selectedRows.length === 0) {
      this.sharedSer.OpenAlert("No rows selected!");
      return;
    }

    // Extract client codes from selected rows
    const clientCodesToDelete = selectedRows
      .map(row => row.bseClientCode)
      .filter(code => code); // Remove any null/undefined

    if (clientCodesToDelete.length === 0) {
      this.sharedSer.OpenAlert('No valid client codes selected.');
      return;
    }

    const performDelete = () => {
      const deleteRequest: DeleteClientRequest = { clieCodes: clientCodesToDelete };

      this.bscUccSer.getDeleteClient(deleteRequest).subscribe({
        next: (resp: any) => {
          const messageText = (resp?.message || '').toLowerCase();
          const success = messageText.includes('deleted');

          if (success) {
            this.uccDetailsList = this.uccDetailsList.filter(
              item => !clientCodesToDelete.includes(item.bseClientCode)
            );
            this.dataSource.data = [...this.uccDetailsList];
          }

          this.selection.clear();

          if (success) {
            this.sharedSer.OpenAlert(resp?.message || `${clientCodesToDelete.length} registration(s) deleted successfully.`);
          } else {
            this.sharedSer.OpenAlert(resp?.message || 'Failed to delete selected registrations.');
          }
        },
        error: (err) => {
          console.error('Batch delete error:', err);
          this.sharedSer.OpenAlert('An error occurred while deleting registrations.');
          this.selection.clear();
        }
      });
    };

    // Pre-check for placed orders before allowing delete
    this.bscUccSer.checkOrderPlacedBulk({ clieCodes: clientCodesToDelete }).subscribe({
      next: (res: any) => {
        const placedOrders = res?.placedOrders || {};
        const blockedCodes = Object.entries(placedOrders)
          .filter(([, v]) => Number(v) === 1)
          .map(([code]) => code);

        if (blockedCodes.length > 0) {
          const warningMsg = `Orders are already placed for ${blockedCodes.join(', ')}. Do you still want to delete?`;
          this.sharedSer.openOkCloseDialog(warningMsg, 'Confirm')
            .subscribe((confirmed: boolean) => {
              if (confirmed) {
                performDelete();
              } else {
                this.selection.clear();
              }
            });
        } else {
          const message = clientCodesToDelete.length === 1
            ? 'Are you sure you want to delete this registration?'
            : `Are you sure you want to delete ${clientCodesToDelete.length} registrations?`;

          this.sharedSer.openOkCloseDialog(message, 'Confirm')
            .subscribe((confirmed: boolean) => {
              if (confirmed) {
                performDelete();
              } else {
                this.selection.clear();
              }
            });
        }
      },
      error: (err) => {
        console.error('checkOrderPlacedBulk error:', err);
        this.sharedSer.OpenAlert('Unable to verify placed orders. Please try again later.');
        this.selection.clear();
      }
    });
  }


  // ason 23-02-2026


  editSelectedUcc() {
    const selectedRows = this.selection.selected;

    console.log(selectedRows, 'selected rows');

    if (selectedRows.length === 0) {
      this.sharedSer.OpenAlert("No rows selected!");
      return;
    }

    // ✅ Ensure only one row is selected
    if (selectedRows.length > 1) {
      this.sharedSer.OpenAlert("Please select only one row to edit.");
      return;
    }

    // Extract client code and row data
    const clientCodeToEdit = selectedRows[0]?.bseClientCode;

    if (!clientCodeToEdit) {
      this.sharedSer.OpenAlert('No valid client code found.');
      return;
    }

    // Store selected row and open modal
    this.selectedEditRow = selectedRows[0];
    this.isShowEditModal = true;
    this.activeEditTab = 'registration';

    console.log(clientCodeToEdit, 'edited client code');
  }

  // ✅ NEW METHOD: Edit from table row action button
  editRow(row: any) {
    this.selectedEditRow = row;
    this.isShowEditModal = true;
    this.activeEditTab = 'registration';
    console.log(this.selectedEditRow, 'selected edit row');

    console.log('Editing row:', row.bseClientCode);
  }

  closeEditModal() {
    this.isShowEditModal = false;
    this.selectedEditRow = null;
    this.activeEditTab = 'registration';
  }

  saveEditedDetails() {
    // TODO: Add save logic here
    console.log('Saving edited details for:', this.selectedEditRow?.bseClientCode);
    this.sharedSer.OpenAlert('Changes saved successfully!');
    this.closeEditModal();
  }


  // ✅ NEW METHOD: Navigate to different routes based on tab
  navigateToTab(tab: any) {
    this.activeEditTab = tab.id;

    // Define route mapping for each tab
    const routeMap: { [key: string]: string } = {
      'registration': `/registeredList/registration/${this.selectedEditRow?.bseClientCode}`,
      'kyc': `/registeredList/kyc/${this.selectedEditRow?.bseClientCode}`,
      'address': `/registeredList/address/${this.selectedEditRow?.bseClientCode}`,
      'bank': `/registeredList/bank/${this.selectedEditRow?.bseClientCode}`,
      'nominee': `/registeredList/nominee/${this.selectedEditRow?.bseClientCode}`
    };

    const route = routeMap[tab.id];

    if (route) {
      console.log('Navigating to:', route);
      this.router.navigate([route], { relativeTo: this.route });
      // Optionally close modal after navigation
      // this.closeEditModal();
    }
  }

  // end here






  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.clientId + 1}`;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  transactMF() {
    this.router.navigate(['home/MFReports/FundCateWiseList', 1]);

  }


  get hasUccDetails(): boolean {
    return !!this.uccDetails;
  }


  toggleCard(card: UccDetails) {
    this.uccDetailsList.forEach(c => {
      if (c !== card) {
        c.isCardActive = false;
      }
    });
    card.isCardActive = !card.isCardActive;
  }


  goToFataca() {
    this.router.navigate(['home/MFEntryForms/fatacaRegistr'])
  }


  openElog(elogLink: string): void {
    if (elogLink && !this.isAuth) {
      window.open(elogLink, '_blank');
      // localStorage.setItem('isAuth', 'true');
    } else {
      console.log('ELOG link not available');
    }
  }

  refreshUccList() {
    this.isLoadingUccData = true;
    const input: getUccList = { topCount: 100 };

    this.idbsvc.getData('UCCLIST', 'data')
      .pipe(
        switchMap((c_d) => {
          if (c_d) {
            return of(c_d);
          }

          return this.bscUccSer.getUccListData(input).pipe(
            switchMap((uccListResponse: UccApiResponse[]) => {
              return this.bscUccSer.getFatcaBseStatus().pipe(
                map((fatcaBseResponse: any) => {

                  const fatcaBseArray = fatcaBseResponse?.data || [];

                  const fatcaBseMap = new Map();
                  fatcaBseArray.forEach((item: any) => {
                    fatcaBseMap.set(item.clieCode, {
                      fatcaStatus: item.fatcaStatus,
                      uccRegistration: item.uccRegistration
                    });
                  });

                  return uccListResponse.map(data => {
                    const fatcaBseData = fatcaBseMap.get(data.clieCode);

                    return {
                      memberDetails: data.fullName?.trim(),
                      bseClientCode: data.clieCode,
                      taxStatusDetails: { label: data.taxStatus?.trim() },
                      holdingPatternDetails: { label: data.holdID?.trim() || 'NA' },
                      nominationopt: !!data.nominationopt,
                      elogLink: data.elogLink,
                      bseStatus: data.bseStaus,
                      docStatus: data.docStaus,
                      createDate: data.createDate,
                      memberId: data.membid?.trim(),
                      clieapplname1: data.fullName,
                      clieapplname2: data.clieapplname2,
                      clieapplname3: data.clieapplname3,
                      uccRegistration: fatcaBseData?.uccRegistration || data.uccRegistration,
                      fatcaStatus: fatcaBseData?.fatcaStatus || data.fatcaStatus,
                      bseMemberID: data.bseMemberID,
                      panNo: data.panNo,
                      mobileNO: data.mobileNO,
                      emailID: data.emailID,
                      elogStatus: data.elogStatus,
                      holdingNature: data.holdingNature,
                      isCardActive: false,
                      isSubmitted: false,
                      bseSubmissionStatus: 'Pending',
                      uccStatus: null,
                      isUccStatusLoading: false
                    } as UccDetails;
                  });

                })
              );
            }),
            // ✅ Cache result properly (NO subscribe here)
            tap((res: UccDetails[]) => {
              this.idbsvc.setNewCollectionData('UCCLIST', 'data', res, 'MM:15')
                .subscribe({
                  error: (err) => console.error('Failed to cache UCC list', err)
                });
            })
          );
        })
      )
      // ✅ Single subscribe (correct)
      .subscribe({
        next: (res: UccDetails[]) => {
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.uccDetailsList = res;

          console.log(this.uccDetailsList, 'UCC merged data');

          localStorage.setItem('uccDetailsList', JSON.stringify(this.uccDetailsList));
        },
        error: (err) => {
          console.error('Error fetching UCC data:', err);

          let errorMessage = 'Failed to refresh list. Please try again.';

          if (err?.error?.message?.toLowerCase().includes('no records found')) {
            errorMessage = 'No UCC records found.';
          } else if (err?.status) {
            switch (err.status) {
              case 404: errorMessage = 'No data found.'; break;
              case 401: errorMessage = 'Unauthorized.'; break;
              case 403: errorMessage = 'Forbidden.'; break;
              case 500: errorMessage = 'Server error.'; break;
              case 0: errorMessage = 'Network error.'; break;
              default: errorMessage = `Error (${err.status})`;
            }
          }

          this.sharedSer.OpenAlert(errorMessage);
        },
        complete: () => {
          this.isLoadingUccData = false;
        }
      });
  }

  toggleEditMenu() {
    this.showEditMenu = !this.showEditMenu;
  }

  createUccRegistration() {
    this.router.navigate(['home/MFEntryForms/CreateUcc']);
  }

  getEditedUccData(index: number): Observable<any> {
    const selectedUcc = this.uccDetailsList[index];
    const bseCode = selectedUcc.bseClientCode;
    console.log(selectedUcc, bseCode, 'selectedUcc', 'bse code');

    const input: BseUccEditDetails = {
      clieCode: bseCode
    };

    return this.bscUccSer.editUccDetails(input);
  }

  editRegistrationData(index: number) {
    this.isEditingRegistration = true;
    this.getEditedUccData(index).subscribe({
      next: (res) => {
        // ✅ Mark as unsaved if editing
        if (this.uccDetailsList[index]) {
          this.uccDetailsList[index].saved = false;
        }
        console.log('res of edited reg data', res);
        console.log('res of edited clie code', res[0].cliecode);
        localStorage.setItem('uccRegistrationData', JSON.stringify(res));
        this.router.navigate(['/app/uccTabs'], {
          state: {
            uccDetails: res,
            isEdit: true
          }
        });
        this.dialogRef?.close();
        console.log(this.isEdit, 'is edit');
        this.isEditingRegistration = false;
      },
      error: (err) => {
        console.error('Registration Edit Error:', err);
        (window as any).OpenAlert('No records found.');
        this.isEditingRegistration = false;
      }
    });
  }

  editAddressData(index: number) {
    this.getEditedUccData(index).subscribe({
      next: (res) => {

        // ✅ Mark as unsaved if editing
        if (this.uccDetailsList[index]) {
          this.uccDetailsList[index].saved = false;
        }

        localStorage.setItem('ClieCodeEdit', res[0].cliecode);
        localStorage.setItem('MembIDEdit', res[0].MembID);
        console.log('res of edited reg data', res);
        console.log('res of edited clie code', res[0].cliecode);

        localStorage.setItem('EditedUccAddressDetails', JSON.stringify(res));
        localStorage.setItem('uccAddressData', JSON.stringify(res));

        this.router.navigate(['/app/addressDetl'], {
          state: {
            uccAddressDetails: res,
            isEdit: true
          }
        });
        this.dialogRef?.close();
      },
      error: (err) => {
        console.error('Registration Edit Error:', err);

        (window as any).OpenAlert('No records found.');
      }
    });
  }

  editBankAccountData(index: number) {
    this.getEditedUccData(index).subscribe({
      next: (res) => {
        console.log(res, 'resofEdit data');


        // ✅ Mark as unsaved if editing
        if (this.uccDetailsList[index]) {
          this.uccDetailsList[index].saved = false;
        }


        localStorage.setItem('ClieCodeEdit', res[0].cliecode);
        localStorage.setItem('MembIDEdit', res[0].MembID);
        console.log('res of edited reg data', res);
        console.log('res of edited clie code', res[0].cliecode);

        localStorage.setItem('uccBankData', JSON.stringify(res));
        localStorage.setItem('EditedUccAddressDetails', JSON.stringify(res))
        this.router.navigate(['/app/bankList'], {
          state: {
            // uccBankDetails: res,
            // index: index,
            isEdit: true,
            editClieCode: res[0].cliecode,
            editMembID: res[0].MembID

          }
        });
        this.dialogRef?.close();


      },
      error: (err) => {
        console.error('Registration Edit Error:', err);

        this.sharedSer.OpenAlert('No records found.');
      }
    });


  }

  editNomineeData(index: number) {
    this.getEditedUccData(index).subscribe({
      next: (res) => {
        console.log(res, 'resofEdit data');

        console.log(this.uccDetailsList[index].saved);

        // ✅ Mark as unsaved if editing
        if (this.uccDetailsList[index]) {
          this.uccDetailsList[index].saved = false;
        }


        localStorage.setItem('ClieCodeEdit', res[0].cliecode);
        localStorage.setItem('MembIDEdit', res[0].MembID);
        console.log('res of edited reg data', res);
        console.log('res of edited clie code', res[0].cliecode);

        console.log(this.uccDetailsList[index].saved);

        localStorage.setItem('uccNomineeData', JSON.stringify(res));

        if (res[0].NomiOpt == 'Y') {
          this.router.navigate(['/app/nomineeList'], {
            state: {
              isEditNomi: true,
              editClieCode: res[0].cliecode,
              editMembID: res[0].MembID
            }
          });
          this.dialogRef?.close();
        }
        else {
          this.sharedSer.OpenAlert('You have not opted for Nominee');
        }
      },
      error: (err) => {
        console.error('Registration Edit Error:', err);

        this.sharedSer.OpenAlert('No records found.');
      }
    });
  }

  editElogStatus(index: number) {
    this.getEditedUccData(index).subscribe({
      next: (res) => {
        this.router.navigate(['/app/elog-callback'], {
          state: {
            elogDetails: res,
            isEdit: true
          }
        });
        this.dialogRef?.close();
      },
      error: (err) => {
        console.error('Registration Edit Error:', err);

        this.sharedSer.OpenAlert('No records found.');
      }
    });
  }

  editFatcaStatus(index: number) {
    this.getEditedUccData(index).subscribe({
      next: (res) => {
        this.router.navigate(['/app/fataca']
          , {
            state: {
              fatcaDetails: res,
              isEdit: true
            }
          }
        );
        this.dialogRef?.close();
      },
      error: (err) => console.error('FATCA Edit Error:', err)
    });
  }





  mapToUserValidateApiInput(data: any) {
    // Extract nested data from new API response structure
    const holder = data?.holder?.[0] || {};
    const person = holder?.person || {};
    const contacts = holder?.contact || [];
    const mobileContact = contacts.find((c: any) => c.contact_type === 'mobile') || {};
    const emailContact = contacts.find((c: any) => c.contact_type === 'email') || {};
    const commAddr = data?.comm_addr || {};
    const bankAccount = data?.bank_account?.[0] || {};
    const identifiers = data?.identifiers || [];
    const panIdentifier = identifiers.find((i: any) => i.identifier_type === 'PAN') || {};
    const nomination = holder?.nomination?.[0] || {};
    const fatca = data?.fatca?.[0] || {};

    // Determine client type based on physical/demat flags
    let clientType = '';
    if (data?.is_client_physical === 'Y' || data?.is_client_physical === true) {
      clientType = 'P';
    } else if (data?.is_client_demat === 'Y' || data?.is_client_demat === true) {
      clientType = 'D';
    }

    return {
      clieCode: data?.investor?.client_code || '',
      emailID: emailContact?.email_address || '',
      mobileNumber: mobileContact?.contact_number || '',
      birthDate: person?.dob || '',
      panNumber: panIdentifier?.identifier_number || '',
      taxStatus: data?.tax_code || '',
      occupation: holder?.occ_code || '',
      holdingPattern: data?.holding_nature || '',
      mobileDeclaration: '', // Not present in new structure
      emailDeclaration: '', // Not present in new structure
      kycType: holder?.kyc_type || '',
      nominationOpted: data?.is_nomination_opted ? 'Y' : 'N',
      nominationAuthentication: data?.nomination_auth_mode || '',

      cliegender: person?.gender || '',
      state: '', // Not directly present in comm_addr
      city: '', // Not directly present in comm_addr
      pincode: commAddr?.postalcode || '',
      country: '', // Not present in new structure

      address1: commAddr?.address_line1?.trim() || '',
      applicantname1: person?.first_name || '',
      // address2: commAddr?.address_line2?.trim() || '',
      // address3: commAddr?.address_line3?.trim() || '',

      bankName: '', // Not present in bank_account
      bankBranch: '', // Not present in bank_account
      accNo: String(bankAccount?.bank_acc_num || ''),
      bank1ifsc: bankAccount?.ifsc_code || '',
      accountType: bankAccount?.bank_acc_type || '',
      dividendPayout: data?.rdmp_idcw_pay_mode || '',

      micr: '', // Not present in bank_account
      defaultFlag1: '', // Not present in bank_account
      clienttype: clientType,

      nomi1Name: nomination?.person?.first_name || '',
      nomi1Relation: nomination?.nomination_relation || '',
      nomi1Pan: nomination?.identifier?.find((i: any) => i.identifier_type === 'PAN')?.identifier_number || '',
      nomi1applicablePercentage: nomination?.nomination_percent || '',
      nomi1identityType: nomination?.identifier?.[0]?.identifier_type || '',
      nomi1IDNumber: nomination?.identifier?.[0]?.identifier_number || '',

      nomi1Email: '', // Not present in nomination
      nomi1Mobile: '', // Not present in nomination
      nomi1Add1: '', // Not present in nomination
      nomi1Pin: '', // Not present in nomination
      nomi1Country: '' // Not present in nomination
    };
  }

  /**
   * Maps BSESubmissionRequest to UserValidateApiInput format
   * Converts the new BSESubmissionRequest interface structure to the existing UserValidateApiInput format
   */
  mapBSESubmissionRequestToUserValidateInput(payload: BSESubmissionRequest): any {
    const data = payload?.data || {};
    const holder = data?.holder?.[0] || {};
    const person = holder?.person || {};
    const contacts = holder?.contact || [];
    const mobileContact = (contacts.find((c: any) => c.contact_type === 'PR') || {}) as any;
    const emailContact = (contacts.find((c: any) => c.contact_type === 'PR') || {}) as any;
    const commAddr = data?.comm_addr || {};
    const bankAccount = data?.bank_account?.[0] || {};
    const identifiers = payload?.identifiers || [];
    const panIdentifier = (identifiers.find((i: any) => i.identifier_type?.toUpperCase() === 'PAN') || {}) as any;
    const nomination = holder?.nomination?.[0] || {};
    const fatca = data?.fatca?.[0] || {};

    // Determine client type based on physical/demat flags
    let clientType = '';
    if (data?.is_client_physical === true) {
      clientType = 'P';
    } else if (data?.is_client_demat === true) {
      clientType = 'D';
    }

    return {
      clieCode: data?.investor?.client_code || '',
      emailID: emailContact?.email_address || '',
      mobileNumber: mobileContact?.contact_number || '',
      birthDate: person?.dob || '',
      panNumber: panIdentifier?.identifier_number || '',
      taxStatus: data?.tax_code || '',
      occupation: holder?.occ_code || '',
      holdingPattern: data?.holding_nature || '',
      mobileDeclaration: '', // Not present in new structure
      emailDeclaration: '', // Not present in new structure
      kycType: holder?.kyc_type || '',
      nominationOpted: data?.is_nomination_opted ? 'Y' : 'N',
      nominationAuthentication: data?.nomination_auth_mode || '',

      cliegender: person?.gender || '',
      state: commAddr?.state || '', // From comm_addr
      city: commAddr?.city || '', // From comm_addr
      pincode: commAddr?.postalcode || '',
      country: commAddr?.country || '', // From comm_addr

      address1: commAddr?.address_line_1?.trim() || '',
      applicantname1: person?.first_name || '',
      // address2: commAddr?.address_line_2?.trim() || '',
      // address3: commAddr?.address_line_3?.trim() || '',

      bankName: bankAccount?.bank_name || '',
      bankBranch: '', // Not present in bank_account
      accNo: String(bankAccount?.bank_acc_num || ''),
      bank1ifsc: bankAccount?.ifsc_code || '',
      accountType: bankAccount?.bank_acc_type || '',
      dividendPayout: data?.rdmp_idcw_pay_mode || '',

      micr: '', // Not present in bank_account
      defaultFlag1: '', // Not present in bank_account
      clienttype: clientType,

      nomi1Name: nomination?.person?.first_name || '',
      nomi1Relation: nomination?.nomination_relation || '',
      nomi1Pan: (nomination?.identifier as any)?.find((i: any) => i.identifier_type?.toUpperCase() === 'PAN')?.identifier_number || '',
      nomi1applicablePercentage: nomination?.nomination_percent || '',
      nomi1identityType: nomination?.identifier?.[0]?.identifier_type || '',
      nomi1IDNumber: nomination?.identifier?.[0]?.identifier_number || '',

      nomi1Email: (nomination?.contact as any)?.email_address || '', // From nomination.contact
      nomi1Mobile: (nomination?.contact as any)?.contact_number || '', // From nomination.contact
      nomi1Add1: (nomination?.comm_addr as any)?.address_line_1 || '', // From nomination.comm_addr
      nomi1Pin: (nomination?.comm_addr as any)?.postalcode || '', // From nomination.comm_addr
      nomi1Country: '' // Not present in nomination
    };
  }


  saveDataToBSE(clientCode: string) {
    this.validateDataBeforeSubmit(clientCode);
  }

  private mapValidatedResponseToBsePayload(apiResponse: any): BseSubmissionPayload {
    const data = apiResponse.data;

    return {
      data: {
        member_code: {
          member_id: (data.member_code?.member_id || '').trim()
        },
        investor: {
          client_code: data.investor?.client_code || ''
        },
        holding_nature: data.holding_nature || '',
        tax_code: data.tax_code || '',
        rdmp_idcw_pay_mode: data.rdmp_idcw_pay_mode || '',
        is_client_physical: data.is_client_physical,
        is_client_demat: data.is_client_demat,
        is_nomination_opted: data.is_nomination_opted,
        nomination_auth_mode: data.nomination_auth_mode || '',
        nominee_soa: data.nominee_soa === 'false' ? 'false' : 'true',
        comm_mode: data.comm_mode || '',
        onboarding: data.onboarding,

        comm_addr: {
          address_line_1: data.comm_addr?.address_line_1?.trim() || '',
          address_line_2: data.comm_addr?.address_line_2?.trim() || '',
          address_line_3: data.comm_addr?.address_line_3?.trim() || '',
          postalcode: data.comm_addr?.postalcode || '',
          city: (data.comm_addr?.city || '').trim(),
          state: data.comm_addr?.state || '',
          country: data.comm_addr?.country || ''
        },
        bank_account: (data.bank_account || []).map((b: any) => ({
          ifsc_code: b.ifsc_code || '',
          bank_acc_num: b.bank_acc_num || '',
          bank_acc_type: b.bank_acc_type || '',
          bank_name: b.bank_name || '',
          account_owner: b.account_owner || ''
        })),
        fatca: (data.fatca || []).map((f: any) => {
          const netWorth = f.net_worth || 0;
          return {
            holder_rank: f.holder_rank || '',
            place_of_birth: f.place_of_birth || '',
            country_of_birth: f.country_of_birth || '',
            client_name: f.client_name || '',
            investor_type: f.investor_type || '',
            dob: f.dob || '',
            father_name: f.father_name || '',
            spouse_name: f.spouse_name || '',
            address_type: f.address_type || '',
            occ_code: f.occ_code || '',
            occ_type: f.occ_type || '',
            tax_status: f.tax_status || '',
            identifier: {
              identifier_type: f.identifier?.identifier_type || '',
              identifier_number: f.identifier?.identifier_number || ''
            },
            corporate_service_sector: f.corporate_service_sector || '',
            wealth_source: f.wealth_source || '',
            income_slab: f.income_slab || '',
            net_worth: netWorth,
            date_of_net_worth: netWorth === 0 ? '' : (f.date_of_net_worth || ''),
            politically_exposed: f.politically_exposed || '',
            is_self_declared: f.is_self_declared || false,
            data_source: f.data_source || '',
            log_name: f.log_name || '',
            tax_residency: (f.tax_residency || []).map((tr: any) => ({
              country: tr.country || '',
              tax_id_no: tr.tax_id_no || '',
              tax_id_type: tr.tax_id_type || ''
            })),
            ucc_id: f.ucc_id || 0,
            fatca_id: f.fatca_id || 0
          };
        }),
        holder: (data.holder || []).map((h: any) => ({
          holder_rank: h.holder_rank || '',
          occ_code: h.occ_code || '',
          auth_mode: h.auth_mode || '',
          is_pan_exempt: h.is_pan_exempt || false,
          identifier: (h.identifier || []).map((id: any) => ({
            identifier_type: id.identifier_type || '',
            identifier_number: id.identifier_number || ''
          })),
          kyc_type: h.kyc_type || '',
          person: {
            first_name: h.person?.first_name || '',
            middle_name: h.person?.middle_name || '',
            last_name: h.person?.last_name || '',
            dob: h.person?.dob || '',
            gender: h.person?.gender || ''
          },
          contact: (h.contact || []).map((c: any) => ({
            contact_number: c.contact_number || '',
            country_code: c.country_code || '',
            whose_contact_number: c.whose_contact_number || '',
            email_address: c.email_address || '',
            whose_email_address: c.whose_email_address || '',
            contact_type: c.contact_type || '',
            is_foreign: c.is_foreign || false
          })),
          nomination: (h.nomination || []),
          holder_name: h.holder_name || '',
          first_name: h.first_name || '',
          middle_name: h.middle_name || '',
          last_name: h.last_name || '',
          dob: h.dob || ''
        })),
        pan_verified: data.pan_verified || false,
        identifiers: (apiResponse.identifiers || []).map((i: any) => ({
          identifier_type: i.identifier_type || '',
          identifier_number: i.identifier_number || '',
          issue_date: i.issue_date || '',
          expiry_date: i.expiry_date || '',
          file_name: i.file_name || '',
          file_size: i.file_size || 0,
          file_blob: i.file_blob || '',
          additional_info: i.additional_info || '',
          is_active: i.is_active || false
        }))
      }
    };
  }



  checkMandatoryFieldsBeforeSubmit(clieCode: string) {
    const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
    console.log(card, 'card');
    let input: checkMandatoryFieldsResponse = {
      clieCode: clieCode
    }
    this.bscUccSer.checkMandatoryFields(input).subscribe({
      next: (validationRes) => {
        console.log(validationRes, 'res from validate api');

        if (validationRes?.missingFields?.length > 0) {
          let message = `
    <div style="text-align:left;">
      <p style="color:black;"><strong>${validationRes.message}</strong></p>
      <ul style="list-style:none; padding:0; margin:0;">
        ${validationRes.missingFields.map((field: string) => `
          <li style="margin-bottom:6px; display:flex; align-items:center;">
            <img src="../../../../assets/images/alert-circle.png" 
                 style="width:16px; height:16px; margin-right:6px;" />
            <span style="color:#C8102E;">${field}</span>
          </li>
        `).join('')}
      </ul>
    </div>`;

          this.sharedSer.OpenAlert(message);
        }

        else if (validationRes.message == "All mandatory fields are present.") {

          // const bsePayload = this.mapValidatedResponseToBsePayload(card);
          // console.log(bsePayload, 'mapped BSE payload');

          const cardToSubmit = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
          console.log(cardToSubmit, 'card to submit');
          cardToSubmit?.fatcaStatus == '1' ? this.isFatcaSummitSuccess = true : this.isFatcaSummitSuccess = false;
          console.log(this.isFatcaSummitSuccess, 'fatca status');

          if (!this.isFatcaSummitSuccess) {
            this.sharedSer.OpenAlert(
              "Your FATCA verification is still pending. Kindly complete it from the FATCA Status section before submitting.",
              () => { }
            );
            this.isLoadingUccData = false;
            return;
          }
        }
      },

      error: (err) => {
        console.log(err);
      }
    });

  }

  // as on7-01-2025
  private isFatcaValid(clieCode: string): boolean {
    const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
    // const card = this.uccDetailsList.find(x => x.memberId === this.fatcaMembId);
    console.log(card, 'card index');
    // Check if FATCA is valid via card status OR localStorage
    // Treat both 'True' and empty string as success
    // card?.fatcaStatus === ''
    const isFatcaTrue = card?.fatcaStatus === '1';
    // const isFatcaSaved = localStorage.getItem('fatcaSuccessMessage') === 'true';

    console.log(isFatcaTrue, 'fatcaValid check');

    return isFatcaTrue;
  }

  // ason 28-01-2026
  // validateDataBeforeSubmit(clieCode: string) {

  //   const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
  //   if (!card) return;

  //   this.regnType = card.uccRegistration === '1' ? 'MOD' : 'NEW';
  //   this.isBseSubmitting = true; // ✅ Show loader

  //   const inputSaveToDB = { clieCode };
  //   const mandatoryInput: checkMandatoryFieldsResponse = { clieCode };

  //   this.bscUccSer.getFullValidatedResponse(inputSaveToDB).pipe(

  //     /* STEP 1: Full validation */
  //     tap(fullValidatedResponse => {
  //       console.log(fullValidatedResponse, 'full validation response');
  //     }),

  //     /* STEP 2: Map payload */
  //     map(fullValidatedResponse =>
  //       this.mapValidatedResponseToBsePayload(fullValidatedResponse)
  //     ),

  //     /* STEP 3: FATCA check */
  //     switchMap((bsePayload) => {

  //       // Check FATCA status for the specific member being submitted

  //       // const cardBeingSubmitted = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
  //       // if (!cardBeingSubmitted) {
  //       //   this.isBseSubmitting = false; // ✅ Hide loader immediately
  //       //   this.sharedSer.OpenAlert('Card not found for the selected client code.');
  //       //   return EMPTY;
  //       // }

  //       // const fatcaStatus = this.getFatcaStatusForMember(cardBeingSubmitted.memberId);

  //       // console.log(`FATCA check for client ${clieCode}, member ${cardBeingSubmitted.memberId}:`, fatcaStatus);

  //       // if (!fatcaStatus.isCompleted) {
  //       //   this.isBseSubmitting = false; // ✅ Hide loader immediately
  //       //   this.sharedSer.OpenAlert(
  //       //     'Your FATCA verification is still pending. Kindly complete it before submitting.'
  //       //   );
  //       //   return EMPTY;
  //       // }


  //       if(this.isFatcaValid(clieCode) === false) {
  //          this.isBseSubmitting = false;

  //          // Get the card index for FATCA navigation
  //          const cardIndex = this.uccDetailsList.findIndex(x => x.bseClientCode === clieCode);

  //          this.sharedSer.openDialogBox(
  //           'Your FATCA verification is still pending. Kindly complete it before submitting.'
  //         ).subscribe(result => {
  //             console.log('Navigating to FATCA component for card index:', cardIndex);
  //           // if (result && cardIndex !== -1) {

  //               this.createFatcaStatus(cardIndex);
  //             console.log('Navigating to FATCA component for card index:', cardIndex);
  //           // }
  //         });
  //         return EMPTY;
  //       }

  //       return this.bscUccSer.checkMandatoryFields(mandatoryInput).pipe(
  //         map(validationRes => ({ validationRes, bsePayload }))
  //       );
  //     }),

  //     /* STEP 4: Mandatory field validation */
  //     switchMap(({ validationRes, bsePayload }) => {

  //       if (validationRes?.missingFields?.length > 0) {

  // const message = `
  // <div class="validation-message">
  //   <p class="validation-message-header">
  //     ${validationRes.message}
  //   </p>
  //   <ul class="validation-message-list">
  //     ${validationRes.missingFields.map((field: string) => `
  //       <li class="validation-message-item">
  //         <img src="assets/images/alert-circle.png" class="validation-message-icon" />
  //         <span class="validation-message-text">
  //           ${field}
  //         </span>
  //       </li>
  //     `).join('')}
  //   </ul>
  // </div>`;

  //         this.isBseSubmitting = false; // ✅ Hide loader immediately
  //         this.sharedSer.OpenAlert(message);
  //         return EMPTY; // ❌ STOP FLOW
  //       }

  //       if (validationRes.message !== 'All mandatory fields are present.') {
  //         this.isBseSubmitting = false; // ✅ Hide loader immediately
  //         return EMPTY;
  //       }


  //       /* STEP 5: FINAL SUBMIT TO BSE */
  //       return this.bscUccSer.saveDataToBSE(bsePayload);

  //     }),

  //     finalize(() => {
  //       // ✅ Only hide loader if there was an error (success handler already handles it)
  //       // this.isBseSubmitting = false; // Removed to prevent double setting
  //     })

  //   ).subscribe({

  //     next: (res) => {
  //       this.isBseSubmitting = false; // ✅ Hide loader immediately on success
  //       console.log(res, 'BSE submit response');

  //       // Update BSE submission status for the specific card
  //       // const submittedCard = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
  //       // if (submittedCard && res?.successMsg) {
  //       //   submittedCard.bseSubmissionStatus = 'Success';
  //       //   this.dataSource.data = [...this.uccDetailsList];
  //       // }

  //       if (res?.successMsg) {
  //         // ✅ Using custom successDia method
  //         const combinedMessage = `${res.successMsg}\n\nYour Elog is generated. Do you want to authenticate it?`;

  //         this.sharedSer.successDia(combinedMessage).subscribe(result => {
  //           if (result === true) {
  //             // User confirmed - authenticate ELOG
  //             const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
  //             console.log(card, 'card object');
  //             this.getElogLink(card);
  //             console.log('User wants to authenticate ELOG');
  //           }
  //         });
  //       }
  //       else {
  //         this.isBseSubmitting = false;
  //         this.sharedSer.OpenAlert(res?.errors?.request || res?.title || 'Something went wrong, Please try again later!');
  //       }
  //     },

  //     error: (error) => {
  //       this.isBseSubmitting = false; // ✅ Hide loader immediately on error
  //       console.log('error while saving data to BSE', error);

  //       let errorMsg = 'Failed to submit data. Please try again later.';

  //       // ✅ Handle 400 Bad Request with validation errors
  //       if (error?.status === 400) {
  //         const apiError = error?.error || error;

  //         errorMsg = `<div style='text-align:left;'>`;

  //         // Display title
  //         if (apiError?.title) {
  //           errorMsg += `<p style='color:black; font-weight:bold; margin-bottom:12px;'>${apiError.title}</p>`;
  //         }

  //         // Display request field errors
  //         if (apiError?.errors?.request && Array.isArray(apiError.errors.request)) {
  //           errorMsg += `<ul style='list-style:none; padding:0; margin:8px 0;'>`;
  //           apiError.errors.request.forEach((err: string) => {
  //             errorMsg += `
  //               <li style='margin-bottom:8px; display:flex; align-items:flex-start;'>
  //                 <img src='assets/images/alert-circle.png' 
  //                      style='width:16px; height:16px; margin-right:8px; margin-top:2px; flex-shrink:0;' />
  //                 <span style='color:#C8102E;'>${err}</span>
  //               </li>
  //             `;
  //           });
  //           errorMsg += `</ul>`;
  //         }

  //         // Display all other field errors
  //         if (apiError?.errors && typeof apiError.errors === 'object') {
  //           errorMsg += `<ul style='list-style:none; padding:0; margin:0;'>`;

  //           Object.keys(apiError.errors).forEach((field: string) => {
  //             // Skip request field as we already displayed it
  //             if (field === 'request') return;

  //             const fieldErrors = apiError.errors[field];
  //             if (Array.isArray(fieldErrors)) {
  //               fieldErrors.forEach((err: string) => {
  //                 errorMsg += `
  //                   <li style='margin-bottom:8px; display:flex; align-items:flex-start;'>
  //                     <img src='assets/images/alert-circle.png' 
  //                          style='width:16px; height:16px; margin-right:8px; margin-top:2px; flex-shrink:0;' />
  //                     <span style='color:#C8102E;'>
  //                       <strong>${field}:</strong> ${err}
  //                     </span>
  //                   </li>
  //                 `;
  //               });
  //             }
  //           });

  //           errorMsg += `</ul>`;
  //         }

  //         errorMsg += `</div>`;
  //       }
  //       // ✅ Handle 422 Unprocessable Entity
  //       else if (error?.status === 422) {
  //         const apiError = error?.error || error;
  //         errorMsg = `<div style='text-align:left;'>`;
  //         if (apiError?.errorMsg) {
  //           errorMsg += `<strong>${apiError.errorMsg}</strong><br/>`;
  //         }
  //         if (apiError?.data?.messages?.length) {
  //           errorMsg += '<ul style="padding-left:16px;">';
  //           apiError.data.messages.forEach((msg: any) => {
  //             errorMsg += `<li><span style='color:#C8102E;'>${msg.errcode} - ${msg.field}</span></li>`;
  //           });
  //           errorMsg += '</ul>';
  //         }
  //         errorMsg += '</div>';
  //       }

  //       this.sharedSer.OpenAlert(errorMsg);
  //     }
  //   });
  // }



  validateDataBeforeSubmit(clieCode: string) {

    const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
    if (!card) return;

    this.regnType = card.uccRegistration === '1' ? 'MOD' : 'NEW';
    this.isBseSubmitting = true;

    // STEP 1 → Full validation
    //   let nominoptflag= this.getnomineeOptValue();
    //  if(nominoptflag=='Y'){
    //   this.getvalidatrespforNomineeopt(clieCode);
    //  }
    //  else{}


    this.bscUccSer.getFullValidatedResponse({ clieCode }).subscribe({
      next: (fullRes) => {
        const bsePayload = this.mapValidatedResponseToBsePayload(fullRes);

        // STEP 2 → FATCA Check
        if (this.isFatcaValid(clieCode) === false) {
          this.isBseSubmitting = false;

          const cardIndex = this.uccDetailsList.findIndex(x => x.bseClientCode === clieCode);
          this.sharedSer.openDialogBox(
            'Your FATCA verification is still pending. Kindly complete it before submitting.'
          ).subscribe(() => {
            this.createFatcaStatus(cardIndex);
          });

          return;
        }

        // STEP 3 → Mandatory Field Check
        this.bscUccSer.checkMandatoryFields({ clieCode }).subscribe({
          next: (validationRes) => {

            if (validationRes?.missingFields?.length > 0) {
              this.isBseSubmitting = false;

              const message = `
              <div class="validation-message">
                <p class="validation-message-header">${validationRes.message}</p>
                <ul class="validation-message-list">
                  ${validationRes.missingFields.map((field: string) => `
                    <li class="validation-message-item">
                      <img src="assets/images/alert-circle.png" class="validation-message-icon" />
                      <span class="validation-message-text">${field}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>`;

              // this.sharedSer.OpenAlert(message);
              this.stopLoaderAndOpenAlert(message);
              return;
            }

            if (validationRes.message !== 'All mandatory fields are present.') {
              this.isBseSubmitting = false;
              return;
            }

            // STEP 4 → Final Submit to BSE
            this.bscUccSer.saveDataToBSE(bsePayload).subscribe({
              next: (res) => {
                this.isBseSubmitting = false;

                // Handle cases where API returns HTTP 200 but the body indicates a 422-style validation error
                if (res?.httpStatus === 422 || res?.status === 422 || res?.data?.status === 'error' || res?.data?.status === 'ERROR') {
                  const apiError = res || {};
                  const messages = apiError?.data?.data?.messages || apiError?.data?.messages || apiError?.messages || [];

                  let errorMsg = `<div style='text-align:left;'>`;

                  if (!Array.isArray(messages) || messages.length === 0) {
                    if (apiError?.errorMsg) {
                      errorMsg += `<p>${apiError.errorMsg}</p>`;
                    } else if (apiError?.message) {
                      errorMsg += `<p>${apiError.message}</p>`;
                    } else {
                      errorMsg += `<p>One or more validation errors occurred.</p>`;
                    }
                  } else {
                    errorMsg += `<ul style='list-style:none; padding:0; margin:0;'>`;
                    messages.forEach((m: any) => {
                      const field = m?.field || m?.field_name || 'field';
                      const errcode = m?.errcode || m?.error || 'error';
                      const vals = Array.isArray(m?.vals) ? m.vals.filter((v: any) => v !== '').join(', ') : (m?.vals ?? '');

                      errorMsg += `
                      <li style='margin-bottom:8px; display:flex; align-items:flex-start;'>
                        <img src='assets/images/alert-circle.png' 
                             style='width:16px; height:16px; margin-right:8px; margin-top:2px; flex-shrink:0;' />
                        <div>
                          <div style='color:#000; font-weight:600;'>${field}</div>
                          <div style='color:#C8102E;'>${errcode}${vals ? ' - ' + vals : ''}</div>
                        </div>
                      </li>`;
                    });
                    errorMsg += `</ul>`;
                  }

                  errorMsg += `</div>`;

                  this.stopLoaderAndOpenAlert(errorMsg);
                  return;
                }

                if (res?.data?.status === 'error' || res?.data?.status === 'ERROR') {

                  const errorMessages = res.data.messages.map((msg: any) => {
                    return `${msg.field} - ${msg.errcode}`;
                  });

                  console.log(errorMessages);
                  this.stopLoaderAndOpenAlert(errorMessages.join('<br/>') || 'One or more validation errors occurred, Please try again later.');
                  return;
                }

                if (res?.successMsg) {
                  const combinedMessage =
                    `${res.successMsg}\n\nYour Elog is generated. Do you want to authenticate it?`;

                  this.sharedSer.successDia(combinedMessage).subscribe(result => {
                    if (result === true) {
                      const card = this.uccDetailsList.find(x => x.bseClientCode === clieCode);
                      this.getElogLink(card);
                    }
                  });
                }
                else {
                  this.stopLoaderAndOpenAlert(
                    res?.errors?.request || res?.title || 'One or more validation errors occurred, Please try again later.'
                  );
                }
              },

              error: (err) => {
                this.isBseSubmitting = false;
                this.handleBseError(err);
              }
            });
          },

          error: () => {
            this.isBseSubmitting = false;

            this.stopLoaderAndOpenAlert(
              'Mandatory field validation failed.'
            );
            // this.sharedSer.OpenAlert('Mandatory field validation failed.');
          }
        });
      },

      error: () => {
        this.isBseSubmitting = false;
        this.stopLoaderAndOpenAlert(
          'Validation failed. Please try again later.'
        );
        //
        // this.sharedSer.OpenAlert('Validation failed. Please try again.');
      }
    });
  }


  private handleBseError(error: any) {
    this.isBseSubmitting = false;
    let errorMsg = 'Failed to submit data. Please try again later.';

    if (error?.status === 400) {
      this.isBseSubmitting = false;
      const apiError = error?.error || error;
      errorMsg = `<div style='text-align:left;'>`;

      if (apiError?.title) {
        errorMsg += `<p style='font-weight:bold;'>${apiError.title}</p>`;
      }

      if (apiError?.errors?.request) {
        errorMsg += `<ul>`;
        apiError.errors.request.forEach((e: string) => {
          errorMsg += `<li style="color:#C8102E">${e}</li>`;
        });
        errorMsg += `</ul>`;
      }

      errorMsg += `</div>`;
    }

    // Handle 422 Unprocessable Entity with structured messages
    else if (error?.status === 422) {
      const apiError = error?.error || {};
      const messages = apiError?.data?.messages || apiError?.messages || [];

      errorMsg = `<div style='text-align:left;'>`;

      if (!Array.isArray(messages) || messages.length === 0) {
        // fallback to generic error message if structure is different
        if (apiError?.errorMsg) {
          errorMsg += `<p>${apiError.errorMsg}</p>`;
        } else if (apiError?.message) {
          errorMsg += `<p>${apiError.message}</p>`;
        } else {
          errorMsg += `<p>One or more validation errors occurred.</p>`;
        }
      } else {
        errorMsg += `<ul style='list-style:none; padding:0; margin:0;'>`;
        messages.forEach((m: any) => {
          const field = m?.field || m?.field_name || 'field';
          const errcode = m?.errcode || m?.error || 'error';
          const vals = Array.isArray(m?.vals) ? m.vals.join(', ') : (m?.vals ?? '');

          // Format: field - errcode - vals
          errorMsg += `
          <li style='margin-bottom:8px; display:flex; align-items:flex-start;'>
            <img src='assets/images/alert-circle.png' 
                 style='width:16px; height:16px; margin-right:8px; margin-top:2px; flex-shrink:0;' />
            <div>
              <div style='color:#000; font-weight:600;'>${field}</div>
              <div style='color:#C8102E;'>${errcode}${vals ? ' - ' + vals : ''}</div>
            </div>
          </li>`;
        });
        errorMsg += `</ul>`;
      }

      errorMsg += `</div>`;
    }
    this.stopLoaderAndOpenAlert(errorMsg);
  }


  private stopLoaderAndOpenAlert(message: string) {
    this.isBseSubmitting = false;

    // 🔥 Force UI to update immediately
    this.cdr.detectChanges();

    // Open dialog after UI repaint
    setTimeout(() => {
      this.sharedSer.OpenAlert(message);
    }, 0);
  }


  // end here









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

  getnomineeOptValue() {
    // nominationOpted
    const data = localStorage.getItem('uccRegistrationData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed?.nominationOpted || null;
      } catch (e) {
        console.error('Invalid JSON in localStorage:', e);
      }
    }
    return null;
  }




  onFilterInputChange() {
    const filter = this.filterClientCode?.trim().toLowerCase();
    if (!filter) {
      this.uccDetailsList = [...this.originalUccDetailsList];
    }
  }



  get checknomiOpted() {
    const rawData = localStorage.getItem('uccRegistrationData'); // get string
    if (!rawData) return 'N';

    const data = JSON.parse(rawData); // convert to object

    // Only check if nominationOpted is 'Y'
    if (data?.nominationOpted === 'Y') {
      const matchFound = this.uccDetailsList.some(
        (item: any) => item.bseClientCode === data.bseClientCode
      );

      if (matchFound) {
        console.log('Nomination is opted');
        return 'Y';
      }
    }

    console.log('Nomination not opted');
    return 'N';
  }





  // without btn for filter ason 2-09-2025
  toggleFilterInput() {
    this.originalList = this.uccDetailsList
    this.showFilterInput = !this.showFilterInput;
    if (!this.showFilterInput) {
      // this.filteredList = [...this.originalList];
      this.filterClientCode = '';
      this.uccDetailsList = [...this.originalList]; // reset list
    }
  }

  onFilterChange(value: string) {
    this.filterInput$.next(value); // push value into Subject
  }

  applyFilter(value: string) {
    const search = value.trim().toLowerCase();





    if (search.length >= 2) {
      const filtered = this.originalList.filter(item =>
        item.bseClientCode?.toLowerCase().startsWith(search)
      );

      if (filtered.length > 0) {
        this.uccDetailsList = filtered;
        this.noResultsFound = false;
      } else {
        this.noResultsFound = true;
        this.uccDetailsList = []; // empty for now


      }
    }

    else {
      this.uccDetailsList = [...this.originalList]; // reset if <2 chars
      this.noResultsFound = false;

    }
    // end here

  }

  clearFilter() {
    this.filterClientCode = '';
    this.uccDetailsList = [...this.originalList]; // reset list
  }

  // Check FATCA status for specific member from localStorage
  getFatcaStatusForMember(memberId: string | number): { isCompleted: boolean; status: string } {
    try {
      // Check general FATCA success flag (backward compatibility)
      const generalFatcaSuccess = localStorage.getItem('fatcaSuccessMessage') === 'true';

      // Check member-specific FATCA data
      const fatcaData = JSON.parse(localStorage.getItem('fatcaData') || '{}');
      const memberSpecificSuccess = fatcaData?.membId == memberId && fatcaData?.status === 'Success';

      // Return success if either general flag is true OR member-specific data shows success
      const isCompleted = generalFatcaSuccess || memberSpecificSuccess;
      const status = isCompleted ? 'Success' : 'Pending';

      console.log(`FATCA check for member ${memberId}: ${status}`, { generalFatcaSuccess, memberSpecificSuccess, fatcaData });

      return { isCompleted, status };
    } catch (error) {
      console.error('Error checking FATCA status:', error);
      return { isCompleted: false, status: 'Pending' };
    }
  }

  createFatcaStatus(index: number) {
    console.log(index, 'index');

    this.getEditedUccData(index).subscribe({
      next: (res) => {
        this.router.navigate(['/app/fatca']
          , {
            state: {
              fatcaDetails: res,
              isEdit: true
            }
          }
        );
        this.dialogRef?.close();
      },
      error: (err) => console.error('FATCA Edit Error:', err)
    });
  }

  onAuthorizedFatcaClick(index: number) {

    const card = this.uccDetailsList[index]; // Get specific card by index, not all cards
    console.log(card.fatcaStatus); // "True" or "False"

    if (card?.fatcaStatus !== "0" || card?.fatcaStatus === undefined || card?.fatcaStatus === null) {
      this.sharedSer.OpenAlert('You do not have completed your FATCA, Do you want to complete this?', () => {
        this.createFatcaStatus(index); // Call createFatcaStatus to navigate properly
      });
    }
    else {
      this.getEditedUccData(index).subscribe({
        next: (res) => {
          this.router.navigate(['/app/fataca']
            , {
              state: {
                fatcaDetails: res,
                isEdit: true
              }
            }
          );
          this.dialogRef?.close();
        },
        error: (err) => console.error('FATCA Edit Error:', err)
      });
    }
  }



  openDialog() {
    this.dialog.open(this.panVerificationDialog, {
      width: '400px'
    });
  }

  onVerify() {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!panRegex.test(this.pan)) {
      this.sharedSer.OpenAlert("Invalid PAN format (e.g. ABCDE1234F)");
      return;
    }

    if (!mobileRegex.test(this.mobile)) {
      this.sharedSer.OpenAlert("Invalid Mobile Number (must be 10 digits)");
      return;
    }

    console.log("Verified Inputs -> PAN:", this.pan, "Mobile:", this.mobile);

    const inputPanReqVerify: PanVerificationRequest = {
      panNo: this.pan,
      mobile: this.mobile,
      dob: "01011900",
      reqNo: this.generateReqNo()

    }
    // 👉 Call your verify API here
    this.bscUccSer.getPanVerificationRequest(inputPanReqVerify).subscribe({
      next: (resp) => {
        console.log('resp of pan verify request', resp);
        // this.sharedSer.OpenAlertPopup(resp.error || resp.apP_STATUS);
        if (resp.error) {
          this.sharedSer.OpenAlert(resp.error);
          this.pending = true;
        } else if (resp.apP_STATUS) {
          this.sharedSer.OpenAlert(resp.apP_STATUS);
          // this.onClientChange();
          if (resp.apP_STATUS === 'KYC Registd at NDML')
            this.succed = true;

        } else if (resp.apP_STATUS !== 'KYC Registd at NDML') {
          this.pending = true;
        }
        else {
          this.sharedSer.OpenAlert("We’re unable to process your request with NDML at the moment. Please try again later.");
        }
      },
      error: (err) => {
        console.log(err);

      }
    })

    this.dialog.closeAll();
  }



  private generateReqNo(): string {
    const now = new Date();

    // Format: yyMMddHH
    const yy = now.getFullYear().toString().slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');

    const base = yy + MM + dd + HH; // 8 digits

    // Add 2 random digits
    const random = Math.floor(10 + Math.random() * 90).toString();

    return base + random; // final 10-digit reqNo
  }

  getSavedDetls(clieCode: any) {
    let inputSaveToDB = {
      clieCode: clieCode
    }
    return this.bscUccSer.getSavedDetails(inputSaveToDB)
      .subscribe({
        next: (res) => {
          console.log(res, 'res of saved data');
          this.resArrGetData = res;
          console.log(this.resArrGetData, 'res of saved data');
          this.pan = res[0].cliePAN,
            this.mobile = res[0].mobileNo,
            this.DOB = res[0].clieDOB

          console.log(this.pan, this.mobile, this.DOB, 'pan, mobile, dob');
        }
      })
  }

  checkKycStatus(clieCode: any) {
    let inputSaveToDB = {
      clieCode: clieCode
    }
    return this.bscUccSer.getSavedDetails(inputSaveToDB)
      .subscribe({
        next: (res) => {
          console.log(res, 'res of saved data');
          this.resArrGetData = res;
          console.log(this.resArrGetData, 'res of saved data');
          this.pan = res[0].cliePAN,
            this.mobile = res[0].mobileNo,
            this.DOB = res[0].clieDOB

          console.log(this.pan, this.mobile, this.DOB, 'pan, mobile, dob');
          // if(res.kyC_ord_status === '0'){
          //  this.openDialog();
          // }
          // else if(res.kyC_ord_status != '0'){
          //   this.getSavedDetls(clieCode);
          // }
          this.openDialog();
        }
      })

  }


  navigateToNewRegigster() {
    localStorage.removeItem('uccRegistrationData');
    // this.router.navigate(['/BseRegisterinvestors']);
    this.router.navigate(['/app/uccTabs']);
  }


  navToUccTabs(i: any) {
    // this.router.navigate(['/app/uccTabs']);
    // this.getEditedUccData(i);
    this.editRegistrationData(i);
  }

  cleanStatus(status: string): string {
    return status.replace(/<br\/?>/g, ' ');
  }

  checkOrderPlacedBulk(clientCode: string) {
    if (!clientCode) return;
    this.bscUccSer.checkOrderPlacedBulk({ clieCodes: [clientCode] }).subscribe({
      next: (res) => {
        console.log('res of deleted reg data', res);
        const messageText = (res?.message || '').toLowerCase();
        const success = messageText.includes('deleted');
        if (success) {
          this.uccDetailsList = this.uccDetailsList.filter(item => item.bseClientCode !== clientCode);
          this.dataSource.data = [...this.uccDetailsList];
          this.selection.clear();
        }
        this.sharedSer.OpenAlert(res?.message || (success ? 'Client Code deleted successfully.' : 'Deletion failed.'));
      },
      error: (err) => {
        console.error('Registration Delete Error:', err);
        this.sharedSer.OpenAlert('No records found.');
      }
    });

  }





  deleteClientCode(clientCode: string) {
    if (!clientCode) return;
    this.bscUccSer.getDeleteClient({ clieCodes: [clientCode] }).subscribe({
      next: (res) => {
        console.log('res of deleted reg data', res);
        const messageText = (res?.message || '').toLowerCase();
        const success = messageText.includes('deleted');
        if (success) {
          this.uccDetailsList = this.uccDetailsList.filter(item => item.bseClientCode !== clientCode);
          this.dataSource.data = [...this.uccDetailsList];
          this.selection.clear();
        }
        this.sharedSer.OpenAlert(res?.message || (success ? 'Client Code deleted successfully.' : 'Deletion failed.'));
      },
      error: (err) => {
        console.error('Registration Delete Error:', err);
        this.sharedSer.OpenAlert('No records found.');
      }
    });
  }

  // getParticularUccData(memberid: string, clientCode: string) {

  //   let input = {
  //     data: {
  //       member_code: {
  //         member_id: memberid
  //       },
  //       investor: {
  //         client_code: clientCode
  //       }
  //     }
  //   }

  //   this.isUccStatusLoading = true;
  //   return this.bscUccSer.getPartUcc(input).subscribe({
  //     next: (res) => {
  //       console.log(res, 'res of particular ucc data');
  //       // Handle success and error status
  //       if (res?.status === 'success' && res?.data?.ucc_status) {
  //         this.uccStatusTooltip = res.data.ucc_status;
  //         console.log(this.uccStatusTooltip,'ucc status tooltip');

  //       } 
  //       else {
  //         // this.uccStatusTooltip = 'Unable to fetch UCC status.';
  //         this.sharedSer.OpenAlert('Unable to fetch UCC status.');
  //       }
  //       this.isUccStatusLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching particular UCC data:', err);
  //       this.uccStatusTooltip = 'Error fetching UCC status.';
  //       this.isUccStatusLoading = false;
  //     }
  //   })


  // }

  //   refreshSelectedUccStatus() {
  //   const selectedRows = this.selection.selected;

  //   console.log(selectedRows, 'selected rows');

  //   if (!selectedRows.length) {
  //     this.sharedSer.OpenAlert('No rows selected!');
  //     return;
  //   }

  //   selectedRows.forEach(row => {
  //     if (row?.memberId && row?.bseClientCode) {
  //       this.getParticularUccData(
  //         row.memberId,
  //         row.bseClientCode,
  //         row
  //       );
  //     }
  //   });
  // }


  // if bulk api calling is there
  // refreshSelectedUccStatus() {
  //   this.isUccFetching = true;
  //   let pending = this.selection.selected.length;

  //   this.selection.selected.forEach(row => {
  //     this.getParticularUccData(row.memberId, row.bseClientCode, row, () => {
  //       pending--;
  //       if (pending === 0) {
  //         this.isUccFetching = false;
  //       }
  //     });
  //   });
  // }

  getParticularUccData(memberId: string, clientCode: string, element: any) {

    if (element.isUccStatusLoading) {
      return;
    }

    element.isUccStatusLoading = true;
    element.uccStatus = null;

    const input = {
      data: {
        member_code: { member_id: memberId },
        investor: { client_code: clientCode }
      }
    };

    this.bscUccSer.getPartUcc(input).subscribe({
      next: (res) => {
        const rawStatus = res?.data?.data?.ucc_status;

        element.uccStatus = rawStatus ? rawStatus.toUpperCase() : 'unknown';
        console.log(element.uccStatus, 'ucc status');

        if (!rawStatus) {
          this.sharedSer.OpenAlert('Unable to fetch UCC status.');
        }
        element.isUccStatusLoading = false;
        // this.cdr.detectChanges(); // 🔥 THIS FIXES IT
        // or use below
        this.dataSource.data = [...this.dataSource.data];

      },

      error: () => {
        element.uccStatus = 'ERROR';
        element.isUccStatusLoading = false;
      }
    });
  }





  // refreshSelectedUccStatus() {
  //   const selectedRows = this.selection.selected;

  //   if (!selectedRows.length) {
  //     this.sharedSer.OpenAlert('No rows selected!');
  //     return;
  //   }

  //   // 🔹 Turn ON modal loader once
  //   this.isUccFetching = true;

  //   let pendingCount = 0;

  //   selectedRows.forEach(row => {
  //     if (row?.memberId && row?.bseClientCode) {
  //       pendingCount++;

  //       this.getParticularUccData(
  //         row.memberId,
  //         row.bseClientCode,
  //         row,
  //         () => {
  //           pendingCount--;

  //           // 🔹 Close modal ONLY when all calls finish
  //           if (pendingCount === 0) {
  //             this.isUccFetching = false;
  //           }
  //         }
  //       );
  //     }
  //   });

  //   // Edge case
  //   if (pendingCount === 0) {
  //     this.isUccFetching = false;
  //   }
  // }

  // getParticularUccData(
  //   memberId: string,
  //   clientCode: string,
  //   element: any,
  //   onComplete?: () => void
  // ) {

  //   if (element.isUccStatusLoading) {
  //     onComplete?.();
  //     return;
  //   }

  //   element.isUccStatusLoading = true;
  //   element.uccStatus = null;

  //   const input = {
  //     data: {
  //       member_code: { member_id: memberId },
  //       investor: { client_code: clientCode }
  //     }
  //   };

  //   this.bscUccSer.getPartUcc(input).subscribe({
  //     next: (res) => {
  //       if(res?.data?.data?.ucc_status) {
  //       element.uccStatus = res?.data?.data?.ucc_status || 'UNKNOWN';
  //       // element.isUccStatusLoading = false;
  //       // onComplete?.(); 
  //     }
  //       else {
  //           // this.uccStatusTooltip = 'Unable to fetch UCC status.';
  //           this.sharedSer.OpenAlert('Unable to fetch UCC status.');
  //             element.isUccStatusLoading = false;
  //       onComplete?.(); // ✅ notify completion
  //         }
  //   },

  //     error: () => {
  //       element.uccStatus = 'ERROR';
  //         this.sharedSer.OpenAlert('Unable to fetch UCC status.');
  //             element.isUccStatusLoading = false;
  //       onComplete?.(); // ✅ notify completion
  //       element.isUccStatusLoading = false;
  //       onComplete?.(); // ✅ notify completion
  //     }
  //   });
  // }


  // private updateRowUccStatus(clientCode: string, status: string) {
  //   const data = this.dataSource.data;

  //   const row = data.find(r => r.bseClientCode === clientCode);
  // console.log(row,'row');

  //   if (row) {
  //     // row.uccStatus = status;

  //     // 🔑 FORCE material table refresh
  //     this.dataSource._updateChangeSubscription();
  //   }
  // }


  // private showUccErrorOnce() {
  //   if (!this.hasUccErrorAlertShown) {
  //     this.hasUccErrorAlertShown = true;
  //     this.sharedSer.OpenAlert('Unable to fetch UCC status.');
  //   }
  // }


  // refreshSelectedUccStatus() {
  //   const selectedRows = this.selection.selected;

  //   if (!selectedRows.length) {
  //     this.sharedSer.OpenAlert('No rows selected!');
  //     return;
  //   }

  //   this.hasUccErrorAlertShown = false;

  //   selectedRows.forEach(row => {
  //     if (row?.memberId && row?.bseClientCode) {
  //       this.getParticularUccData(
  //         row.memberId,
  //         row.bseClientCode,
  //         // row
  //       );
  //     }
  //   });
  // }

  // getParticularUccData(
  //   memberId: string,
  //   clientCode: string,
  //   // element: any // element is no longer trusted
  // ) {

  //   const input = {
  //     data: {
  //       member_code: { member_id: memberId },
  //       investor: { client_code: clientCode }
  //     }
  //   };

  //   this.bscUccSer.getPartUcc(input).subscribe({
  //     next: (res) => {
  //       const status = res?.data?.data?.ucc_status;

  //       if (status) {
  //         this.updateRowUccStatus(clientCode, status);
  //         this.finalUccStatus = status;
  //       } else {
  //         this.updateRowUccStatus(clientCode, 'UNKNOWN');
  //         this.showUccErrorOnce();
  //       }
  //     },
  //     error: () => {
  //       this.updateRowUccStatus(clientCode, 'ERROR');
  //       this.showUccErrorOnce();
  //     }
  //   });
  // }



  // private showUccErrorOnce() {
  //   if (!this.hasUccErrorAlertShown) {
  //     this.hasUccErrorAlertShown = true;
  //     this.sharedSer.OpenAlert('Unable to fetch UCC status.');
  //   }
  // }


  // refreshSelectedUccStatus() {
  //   const selectedRows = this.selection.selected;

  //   if (!selectedRows.length) {
  //     this.sharedSer.OpenAlert('No rows selected!');
  //     return;
  //   }

  //   this.isUccFetching = true;
  //   this.hasUccErrorAlertShown = false;

  //   selectedRows.forEach(row => {
  //     if (row?.memberId && row?.bseClientCode) {
  //       this.getParticularUccData(
  //         row.memberId,
  //         row.bseClientCode,
  //         row
  //       );
  //     }
  //   });
  // }


  // getParticularUccData(
  //   memberId: string,
  //   clientCode: string,
  //   element: any
  // ) {

  //   if (element.isUccStatusLoading) {
  //     return;
  //   }

  //   element.isUccStatusLoading = true;
  //   element.uccStatus = null;

  //   const input = {
  //     data: {
  //       member_code: { member_id: memberId },
  //       investor: { client_code: clientCode }
  //     }
  //   };

  //   this.bscUccSer.getPartUcc(input)
  //     .pipe(
  //       finalize(() => {
  //         // 🔑 ALWAYS close loader (success OR error)
  //         this.isUccFetching = false;
  //         element.isUccStatusLoading = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         const status = res?.data?.data?.ucc_status;

  //         if (status) {
  //           element.uccStatus = status;
  //         } else {
  //           element.uccStatus = 'UNKNOWN';
  //           this.showUccErrorOnce();
  //         }
  //       },
  //       error: () => {
  //         element.uccStatus = 'ERROR';
  //         this.showUccErrorOnce();
  //       }
  //     });
  // }







  getElogLink(card: any) {
    // Use the passed card/element directly from the clicked row
    if (!card) {
      this.sharedSer.OpenAlert('No data available!');
      return;
    }
    console.log(card, 'card');

    // Show loader
    this.isElogLoading = true;

    const input: UccElogRequest = {
      data: [
        {
          event: 'ucc_elog',
          memberCode: card.memberId, // "90064"
          parentClientCode: card.parentClientCode || '',
          investor: {
            clientCode: card.bseClientCode, // "4231663410"
            panHolder: [card.panNo || ''],
            holdingNature: card.holdingNature || ''
          }
        }
      ]
    };

    this.bscUccSer.getElogLink(input).subscribe({
      next: (res) => {
        console.log('ELOG link response:', res);

        // Check if API response is successful
        if (res.successMsg === 'Success' && res.data?.data?.length > 0) {
          // Extract 2FA URL from nested response structure
          const twoFaUrl = res.data.data[0]?.action?.event_object?.[0]?.['2fa_url'];
          console.log('Extracted 2FA URL:', twoFaUrl);
          console.log('Full response data:', res.data.data[0]);

          if (twoFaUrl) {
            // Validate and clean the URL
            const cleanUrl = twoFaUrl.trim();
            console.log('Cleaned URL:', cleanUrl);

            // Check if URL is valid
            try {
              const url = new URL(cleanUrl);
              console.log('Valid URL detected:', url.href);

              // Try to open in new tab with better error handling
              const newWindow = window.open(cleanUrl, '_blank', 'noopener,noreferrer');

              if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // Pop-up was blocked
                console.warn('Pop-up blocked, trying alternative method');

                // Fallback: Create a temporary link and click it
                const link = document.createElement('a');
                link.href = cleanUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // ✅ Hide loader immediately for fallback and trigger change detection
                this.isElogLoading = false;
                this.cdr.markForCheck();
              } else {
                // ✅ Show dialog and hide loader after short delay with change detection
                this.sharedSer.openDialog('ELOG authentication link opened successfully. Please complete the 2FA verification.');
                setTimeout(() => {
                  this.isElogLoading = false;
                  this.cdr.markForCheck();
                }, 500);
              }
            } catch (urlError) {
              console.error('Invalid URL format:', urlError);
              // ✅ Show dialog and hide loader after short delay with change detection
              this.sharedSer.openDialog('Invalid ELOG authentication URL format. Please contact support.');
              setTimeout(() => {
                this.isElogLoading = false;
                this.cdr.markForCheck();
              }, 500);
            }
          } else {
            console.error('2FA URL not found in response:', res.data.data[0]);
            // ✅ Show dialog and hide loader after short delay with change detection
            this.sharedSer.openDialog('Unable to retrieve ELOG authentication link.');
            setTimeout(() => {
              this.isElogLoading = false;
              this.cdr.markForCheck();
            }, 500);
          }
        } else {
          console.error('API response error:', res);
          // ✅ Show dialog and hide loader after short delay with change detection
          this.sharedSer.openDialog(res.successMsg || 'Failed to generate ELOG link. Please try again.');
          setTimeout(() => {
            this.isElogLoading = false;
            this.cdr.markForCheck();
          }, 500);
        }
      },
      error: (err) => {
        console.error('ELOG link error:', err);
        // ✅ Show dialog and hide loader after short delay with change detection
        this.sharedSer.openDialog('Unable to fetch ELOG link.');
        setTimeout(() => {
          this.isElogLoading = false;
          this.cdr.markForCheck();
        }, 500);
      }
    });
  }



  getNomineeLinkReq(card: any) {
    // Use the passed card/element directly from the clicked row
    if (!card) {
      this.sharedSer.OpenAlert('No data available!');
      return;
    }
    console.log(card, 'card');

    // Show loader
    this.isNomineeLoading = true;

    const input: UccNominationLinkRequest = {
      data: [
        {
          event: 'ucc_nom',
          member_Code: card.memberId, // "90064"
          parent_Client_Code: card.parentClientCode || '',
          investor: {
            client_Code: card.bseClientCode, // "4231663410"
            pan_holder: [card.panNo || ''],
            holding_Nature: card.holdingNature || ''
          }
        }
      ]
    };

    this.bscUccSer.getNomineeLink(input).subscribe({
      next: (res: any) => {
        console.log('Nomination link response:', res);

        // Check if API response is successful
        if (res.successMsg === 'Success' && res.data?.data?.length > 0) {
          // Extract 2FA URL from nested response structure
          const nominationItem = res.data.data[0];
          const twoFaUrl = nominationItem?.action?.event_object?.[0]?.['2fa_url'];
          console.log('Extracted 2FA URL:', twoFaUrl);
          console.log('Full response data:', nominationItem);

          if (twoFaUrl) {
            // Validate and clean the URL
            const cleanUrl = twoFaUrl.trim();
            console.log('Cleaned URL:', cleanUrl);

            // Check if URL is valid
            try {
              const url = new URL(cleanUrl);
              console.log('Valid URL detected:', url.href);

              // Try to open in new tab with better error handling
              const newWindow = window.open(cleanUrl, '_blank', 'noopener,noreferrer');

              if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // Pop-up was blocked
                console.warn('Pop-up blocked, trying alternative method');

                // Fallback: Create a temporary link and click it
                const link = document.createElement('a');
                link.href = cleanUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // ✅ Hide loader immediately for fallback and trigger change detection
                this.isNomineeLoading = false;
                this.cdr.markForCheck();
              } else {
                // ✅ Show dialog and hide loader after short delay with change detection
                this.sharedSer.openDialog('Nominee authentication link opened successfully. Please complete the 2FA verification.');
                setTimeout(() => {
                  this.isNomineeLoading = false;
                  this.cdr.markForCheck();
                }, 500);
              }
            } catch (urlError) {
              console.error('Invalid URL format:', urlError);
              // ✅ Show dialog and hide loader after short delay with change detection
              this.sharedSer.openDialog('Invalid Nominee authentication URL format. Please contact support.');
              setTimeout(() => {
                this.isNomineeLoading = false;
                this.cdr.markForCheck();
              }, 500);
            }
          } else {
            console.error('2FA URL not found in response:', res.data.data[0]);
            // ✅ Show dialog and hide loader after short delay with change detection
            this.sharedSer.openDialog('Unable to retrieve Nominee authentication link.');
            setTimeout(() => {
              this.isNomineeLoading = false;
              this.cdr.markForCheck();
            }, 500);
          }
        } else {
          console.error('API response error:', res);
          // ✅ Show dialog and hide loader after short delay with change detection
          this.sharedSer.openDialog(res.successMsg || 'Failed to generate Nominee link. Please try again.');
          setTimeout(() => {
            this.isNomineeLoading = false;
            this.cdr.markForCheck();
          }, 500);
        }
      },
      error: (err) => {
        console.error('Nominee link error:', err);
        // ✅ Show dialog and hide loader after short delay with change detection
        this.sharedSer.openDialog('Unable to fetch Nominee link.');
        setTimeout(() => {
          this.isNomineeLoading = false;
          this.cdr.markForCheck();
        }, 500);
      }
    });
  }


  getFatcaBseStatus() {
    this.bscUccSer.getFatcaBseStatus().subscribe({
      next: (res) => {
        console.log(res, 'res of fatca bse status');
        console.log(res, 'res from fatcaBseStatus');

      },
      error: (err) => {
        console.log(err, 'error while fetching fatca bse status');

      }

    })
  }






  // as on 6-02-2026 start here for valid nominee

  getvalidatrespforNomineeopt(clieCode: string) {
    let input: validDatawithNomineeopt = {
      clieCode: clieCode
    }
    // Step 1: Get full validated response from API
    this.bscUccSer.getFullValidresWithNomination(input).subscribe({
      next: (res) => {
        console.log(res, 'res of valid resp with nomination');
        console.log(res, 'res from valid resp with nomination');

        const mappedRes = this.mapBSESubmissionRequestToUserValidateInput(res);

        console.log(mappedRes, 'mapped input for nominee validation');
        // Handle the nomination validation response here
        if (res?.successMsg) {
          this.sharedSer.OpenAlert('Nominee validation successful');
        }
      },
      error: (err) => {
        console.log(err, 'error during nominee validation');
        this.sharedSer.OpenAlert('Error validating nominee details');
      }
    });
  }



  // end here
}

