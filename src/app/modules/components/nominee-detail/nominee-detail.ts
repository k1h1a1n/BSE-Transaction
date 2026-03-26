import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Router } from '@angular/router';
import { bseNomineeListApiInput, uccNomineeDetails } from '../../models/bseUCCModel';
import { Shared } from '../../../shared/services/shared';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Location } from '@angular/common';
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { COUNTRY_CODE_LIST } from '../address-details/country-list';

@Component({
  selector: 'app-nominee-detail',
imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,MatSelectModule,
     InputTextModule,   MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule,MatOptionModule, ProgressBarModule],
  templateUrl: './nominee-detail.html',
  styleUrl: './nominee-detail.scss',
})


export class NomineeDetail {
isLoading: boolean = false;
requiresContactDetails: boolean = false;

nomineeForm!: FormGroup;
activeTab: number = 0;
  today!: string;
selectedIdentityType: string = '';
  private identityPlaceholderMap: Record<string, string> = {
    '1': 'Enter PAN (e.g., ABCDE1234F)',
    '2': 'Enter last 4 digits of Aadhaar',
    '3': 'Enter driving license number (max 20 characters)',
    '4': 'Enter passport number (max 9 characters)'
  };

  get identityPlaceholder(): string {
    return this.identityPlaceholderMap[this.selectedIdentityType] || 'Enter ID Number';
  }

  identityTypes: any[] = [
    { key: '1', label: 'PAN' },
    { key: '2', label: 'Aadhaar' },
    { key: '3', label: 'Driving License' },
    { key: '4', label: 'Passport Number' }
  ];

  nomineeRelations = [
    // { label: 'Select', value: '0' },
    { label: 'AUNT', value: '1' },
    { label: 'BROTHER-IN-LAW', value: '2' },
    { label: 'BROTHER', value: '3' },
    { label: 'DAUGHTER', value: '4' },
    { label: 'DAUGHTER-IN-LAW', value: '5' },
    { label: 'FATHER', value: '6' },
    { label: 'FATHER-IN-LAW', value: '7' },
    { label: 'GRAND DAUGHTER', value: '8' },
    { label: 'GRAND FATHER', value: '9' },
    { label: 'GRAND MOTHER', value: '10' },
    { label: 'GRAND SON', value: '11' },
    { label: 'MOTHER-IN-LAW', value: '12' },
    { label: 'MOTHER', value: '13' },
    { label: 'NEPHEW', value: '14' },
    { label: 'NIECE', value: '15' },
    { label: 'SISTER', value: '16' },
    { label: 'SISTER-IN-LAW', value: '17' },
    { label: 'SON', value: '18' },
    { label: 'SON-IN-LAW', value: '19' },
    { label: 'SPOUSE', value: '20' },
    { label: 'UNCLE', value: '21' },
    { label: 'OTHERS', value: '22' },
    { label: 'COURT APPOINTED LEGAL GUARDIAN', value: '23' }
  ];

country_code_list = COUNTRY_CODE_LIST;

  countryList = [
    { key: '', value: '-- Select --' },
    { key: 'Afghanistan', value: 'Afghanistan' },
    { key: 'Aland Islands', value: 'Aland Islands' },
    { key: 'Albania', value: 'Albania' },
    { key: 'Algeria', value: 'Algeria' },
    { key: 'American Samoa', value: 'American Samoa' },
    { key: 'Andorra', value: 'Andorra' },
    { key: 'Angola', value: 'Angola' },
    { key: 'Anguilla', value: 'Anguilla' },
    { key: 'Antarctica', value: 'Antarctica' },
    { key: 'Antigua and Barbuda', value: 'Antigua and Barbuda' },
    { key: 'Argentina', value: 'Argentina' },
    { key: 'Armenia', value: 'Armenia' },
    { key: 'Aruba', value: 'Aruba' },
    { key: 'Australia', value: 'Australia' },
    { key: 'Austria', value: 'Austria' },
    { key: 'Azerbaijan', value: 'Azerbaijan' },
    { key: 'Bahamas', value: 'Bahamas' },
    { key: 'Bahrain', value: 'Bahrain' },
    { key: 'Bangladesh', value: 'Bangladesh' },
    { key: 'Barbados', value: 'Barbados' },
    { key: 'Belarus', value: 'Belarus' },
    { key: 'Belgium', value: 'Belgium' },
    { key: 'Belize', value: 'Belize' },
    { key: 'Benin', value: 'Benin' },
    { key: 'Bermuda', value: 'Bermuda' },
    { key: 'Bhutan', value: 'Bhutan' },
    { key: 'Bolivia', value: 'Bolivia' },
    { key: 'Bosnia and Herzegovina', value: 'Bosnia and Herzegovina' },
    { key: 'Botswana', value: 'Botswana' },
    { key: 'Bouvet Island', value: 'Bouvet Island' },
    { key: 'Brazil', value: 'Brazil' },
    { key: 'British Indian Ocean Territory', value: 'British Indian Ocean Territory' },
    { key: 'Brunei Darussalam', value: 'Brunei Darussalam' },
    { key: 'Bulgaria', value: 'Bulgaria' },
    { key: 'Burkina Faso', value: 'Burkina Faso' },
    { key: 'Burundi', value: 'Burundi' },
    { key: 'Cambodia', value: 'Cambodia' },
    { key: 'Cameroon', value: 'Cameroon' },
    { key: 'Canada', value: 'Canada' },
    { key: 'Cape Verde', value: 'Cape Verde' },
    { key: 'Cayman Islands', value: 'Cayman Islands' },
    { key: 'Central African Republic', value: 'Central African Republic' },
    { key: 'Chad', value: 'Chad' },
    { key: 'Chile', value: 'Chile' },
    { key: 'China', value: 'China' },
    { key: 'Christmas Island', value: 'Christmas Island' },
    { key: 'Cocos (Keeling) Islands', value: 'Cocos (Keeling) Islands' },
    { key: 'Colombia', value: 'Colombia' },
    { key: 'Comoros', value: 'Comoros' },
    { key: 'Congo', value: 'Congo' },
    { key: 'Congo, The Democratic Republic of The', value: 'Congo, The Democratic Republic of The' },
    { key: 'Cook Islands', value: 'Cook Islands' },
    { key: 'Costa Rica', value: 'Costa Rica' },
    { key: "Cote D'ivoire", value: "Cote D'ivoire" },
    { key: 'Croatia', value: 'Croatia' },
    { key: 'Cuba', value: 'Cuba' },
    { key: 'Cyprus', value: 'Cyprus' },
    { key: 'Czech Republic', value: 'Czech Republic' },
    { key: 'Denmark', value: 'Denmark' },
    { key: 'Djibouti', value: 'Djibouti' },
    { key: 'Dominica', value: 'Dominica' },
    { key: 'Dominican Republic', value: 'Dominican Republic' },
    { key: 'Ecuador', value: 'Ecuador' },
    { key: 'Egypt', value: 'Egypt' },
    { key: 'El Salvador', value: 'El Salvador' },
    { key: 'Equatorial Guinea', value: 'Equatorial Guinea' },
    { key: 'Eritrea', value: 'Eritrea' },
    { key: 'Estonia', value: 'Estonia' },
    { key: 'Ethiopia', value: 'Ethiopia' },
    { key: 'Falkland Islands (Malvinas)', value: 'Falkland Islands (Malvinas)' },
    { key: 'Faroe Islands', value: 'Faroe Islands' },
    { key: 'Fiji', value: 'Fiji' },
    { key: 'Finland', value: 'Finland' },
    { key: 'France', value: 'France' },
    { key: 'French Guiana', value: 'French Guiana' },
    { key: 'French Polynesia', value: 'French Polynesia' },
    { key: 'French Southern Territories', value: 'French Southern Territories' },
    { key: 'Gabon', value: 'Gabon' },
    { key: 'Gambia', value: 'Gambia' },
    { key: 'Georgia', value: 'Georgia' },
    { key: 'Germany', value: 'Germany' },
    { key: 'Ghana', value: 'Ghana' },
    { key: 'Gibraltar', value: 'Gibraltar' },
    { key: 'Greece', value: 'Greece' },
    { key: 'Greenland', value: 'Greenland' },
    { key: 'Grenada', value: 'Grenada' },
    { key: 'Guadeloupe', value: 'Guadeloupe' },
    { key: 'Guam', value: 'Guam' },
    { key: 'Guatemala', value: 'Guatemala' },
    { key: 'Guernsey', value: 'Guernsey' },
    { key: 'Guinea', value: 'Guinea' },
    { key: 'Guinea-bissau', value: 'Guinea-bissau' },
    { key: 'Guyana', value: 'Guyana' },
    { key: 'Haiti', value: 'Haiti' },
    { key: 'Heard Island and Mcdonald Islands', value: 'Heard Island and Mcdonald Islands' },
    { key: 'Holy See (Vatican City State)', value: 'Holy See (Vatican City State)' },
    { key: 'Honduras', value: 'Honduras' },
    { key: 'Hong Kong', value: 'Hong Kong' },
    { key: 'Hungary', value: 'Hungary' },
    { key: 'Iceland', value: 'Iceland' },
    { key: 'India', value: 'India' },
    { key: 'Indonesia', value: 'Indonesia' },
    { key: 'Iran, Islamic Republic of', value: 'Iran, Islamic Republic of' },
    { key: 'Iraq', value: 'Iraq' },
    { key: 'Ireland', value: 'Ireland' },
    { key: 'Isle of Man', value: 'Isle of Man' },
    { key: 'Israel', value: 'Israel' },
    { key: 'Italy', value: 'Italy' },
    { key: 'Jamaica', value: 'Jamaica' },
    { key: 'Japan', value: 'Japan' },
    { key: 'Jersey', value: 'Jersey' },
    { key: 'Jordan', value: 'Jordan' },
    { key: 'Kazakhstan', value: 'Kazakhstan' },
    { key: 'Kenya', value: 'Kenya' },
    { key: 'Kiribati', value: 'Kiribati' },
    { key: "Korea, Democratic People's Republic of", value: "Korea, Democratic People's Republic of" },
    { key: 'Korea, Republic of', value: 'Korea, Republic of' },
    { key: 'Kuwait', value: 'Kuwait' },
    { key: 'Kyrgyzstan', value: 'Kyrgyzstan' },
    { key: "Lao People's Democratic Republic", value: "Lao People's Democratic Republic" },
    { key: 'Latvia', value: 'Latvia' },
    { key: 'Lebanon', value: 'Lebanon' },
    { key: 'Lesotho', value: 'Lesotho' },
    { key: 'Liberia', value: 'Liberia' },
    { key: 'Libyan Arab Jamahiriya', value: 'Libyan Arab Jamahiriya' },
    { key: 'Liechtenstein', value: 'Liechtenstein' },
    { key: 'Lithuania', value: 'Lithuania' },
    { key: 'Luxembourg', value: 'Luxembourg' },
    { key: 'Macao', value: 'Macao' },
    { key: 'Macedonia, The Former Yugoslav Republic of', value: 'Macedonia, The Former Yugoslav Republic of' },
    { key: 'Madagascar', value: 'Madagascar' },
    { key: 'Malawi', value: 'Malawi' },
    { key: 'Malaysia', value: 'Malaysia' },
    { key: 'Maldives', value: 'Maldives' },
    { key: 'Mali', value: 'Mali' },
    { key: 'Malta', value: 'Malta' },
    { key: 'Marshall Islands', value: 'Marshall Islands' },
    { key: 'Martinique', value: 'Martinique' },
    { key: 'Mauritania', value: 'Mauritania' },
    { key: 'Mauritius', value: 'Mauritius' },
    { key: 'Mayotte', value: 'Mayotte' },
    { key: 'Mexico', value: 'Mexico' },
    { key: 'Micronesia, Federated States of', value: 'Micronesia, Federated States of' },
    { key: 'Moldova, Republic of', value: 'Moldova, Republic of' },
    { key: 'Monaco', value: 'Monaco' },
    { key: 'Mongolia', value: 'Mongolia' },
    { key: 'Montenegro', value: 'Montenegro' },
    { key: 'Montserrat', value: 'Montserrat' },
    { key: 'Morocco', value: 'Morocco' },
    { key: 'Mozambique', value: 'Mozambique' },
    { key: 'Myanmar', value: 'Myanmar' },
    { key: 'Namibia', value: 'Namibia' },
    { key: 'Nauru', value: 'Nauru' },
    { key: 'Nepal', value: 'Nepal' },
    { key: 'Netherlands', value: 'Netherlands' },
    { key: 'Netherlands Antilles', value: 'Netherlands Antilles' },
    { key: 'New Caledonia', value: 'New Caledonia' },
    { key: 'New Zealand', value: 'New Zealand' },
    { key: 'Nicaragua', value: 'Nicaragua' },
    { key: 'Niger', value: 'Niger' },
    { key: 'Nigeria', value: 'Nigeria' },
    { key: 'Niue', value: 'Niue' },
    { key: 'Norfolk Island', value: 'Norfolk Island' },
    { key: 'Northern Mariana Islands', value: 'Northern Mariana Islands' },
    { key: 'Norway', value: 'Norway' },
    { key: 'Oman', value: 'Oman' },
    { key: 'Pakistan', value: 'Pakistan' },
    { key: 'Palau', value: 'Palau' },
    { key: 'Palestinian Territory, Occupied', value: 'Palestinian Territory, Occupied' },
    { key: 'Panama', value: 'Panama' },
    { key: 'Papua New Guinea', value: 'Papua New Guinea' },
    { key: 'Paraguay', value: 'Paraguay' },
    { key: 'Peru', value: 'Peru' },
    { key: 'Philippines', value: 'Philippines' },
    { key: 'Pitcairn', value: 'Pitcairn' },
    { key: 'Poland', value: 'Poland' },
    { key: 'Portugal', value: 'Portugal' },
    { key: 'Puerto Rico', value: 'Puerto Rico' },
    { key: 'Qatar', value: 'Qatar' },
    { key: 'Reunion', value: 'Reunion' },
    { key: 'Romania', value: 'Romania' },
    { key: 'Russian Federation', value: 'Russian Federation' },
    { key: 'Rwanda', value: 'Rwanda' },
    { key: 'Saint Helena', value: 'Saint Helena' },
    { key: 'Saint Kitts and Nevis', value: 'Saint Kitts and Nevis' },
    { key: 'Saint Lucia', value: 'Saint Lucia' },
    { key: 'Saint Pierre and Miquelon', value: 'Saint Pierre and Miquelon' },
    { key: 'Saint Vincent and The Grenadines', value: 'Saint Vincent and The Grenadines' },
    { key: 'Samoa', value: 'Samoa' },
    { key: 'San Marino', value: 'San Marino' },
    { key: 'Sao Tome and Principe', value: 'Sao Tome and Principe' },
    { key: 'Saudi Arabia', value: 'Saudi Arabia' },
    { key: 'Senegal', value: 'Senegal' },
    { key: 'Serbia', value: 'Serbia' },
    { key: 'Seychelles', value: 'Seychelles' },
    { key: 'Sierra Leone', value: 'Sierra Leone' },
    { key: 'Singapore', value: 'Singapore' },
    { key: 'Slovakia', value: 'Slovakia' },
    { key: 'Slovenia', value: 'Slovenia' },
    { key: 'Solomon Islands', value: 'Solomon Islands' },
    { key: 'Somalia', value: 'Somalia' },
    { key: 'South Africa', value: 'South Africa' },
    { key: 'South Georgia and The South Sandwich Islands', value: 'South Georgia and The South Sandwich Islands' },
    { key: 'Spain', value: 'Spain' },
    { key: 'Sri Lanka', value: 'Sri Lanka' },
    { key: 'Sudan', value: 'Sudan' },
    { key: 'Suriname', value: 'Suriname' },
    { key: 'Svalbard and Jan Mayen', value: 'Svalbard and Jan Mayen' },
    { key: 'Swaziland', value: 'Swaziland' },
    { key: 'Sweden', value: 'Sweden' },
    { key: 'Switzerland', value: 'Switzerland' },
    { key: 'Syrian Arab Republic', value: 'Syrian Arab Republic' },
    { key: 'Taiwan', value: 'Taiwan' },
    { key: 'Tajikistan', value: 'Tajikistan' },
    { key: 'Tanzania, United Republic of', value: 'Tanzania, United Republic of' },
    { key: 'Thailand', value: 'Thailand' },
    { key: 'Timor-leste', value: 'Timor-leste' },
    { key: 'Togo', value: 'Togo' },
    { key: 'Tokelau', value: 'Tokelau' },
    { key: 'Tonga', value: 'Tonga' },
    { key: 'Trinidad and Tobago', value: 'Trinidad and Tobago' },
    { key: 'Tunisia', value: 'Tunisia' },
    { key: 'Turkey', value: 'Turkey' },
    { key: 'Turkmenistan', value: 'Turkmenistan' },
    { key: 'Turks and Caicos Islands', value: 'Turks and Caicos Islands' },
    { key: 'Tuvalu', value: 'Tuvalu' },
    { key: 'Uganda', value: 'Uganda' },
    { key: 'Ukraine', value: 'Ukraine' },
    { key: 'United Arab Emirates', value: 'United Arab Emirates' },
    { key: 'United Kingdom', value: 'United Kingdom' },
    { key: 'United States', value: 'United States' },
    { key: 'United States Minor Outlying Islands', value: 'United States Minor Outlying Islands' },
    { key: 'Uruguay', value: 'Uruguay' },
    { key: 'Uzbekistan', value: 'Uzbekistan' },
    { key: 'Vanuatu', value: 'Vanuatu' },
    { key: 'Venezuela', value: 'Venezuela' },
    { key: 'Viet Nam', value: 'Viet Nam' },
    { key: 'Virgin Islands, British', value: 'Virgin Islands, British' },
    { key: 'Virgin Islands, U.S.', value: 'Virgin Islands, U.S.' },
    { key: 'Wallis and Futuna', value: 'Wallis and Futuna' },
    { key: 'Western Sahara', value: 'Western Sahara' },
    { key: 'Yemen', value: 'Yemen' },
    { key: 'Zambia', value: 'Zambia' },
    { key: 'Zimbabwe', value: 'Zimbabwe' }

  ];

  contactOwnershipOptions = [
    { value: 'SE', label: 'Self' },
    { value: 'SP', label: 'Spouse' },
    { value: 'DC', label: 'Dependent Children' },
    { value: 'DS', label: 'Dependent Siblings' },
    { value: 'DP', label: 'Dependent Parents' },
    { value: 'GD', label: 'Guardian' },
    { value: 'PM', label: 'PMS' },
    { value: 'CD', label: 'Custodian' },
    { value: 'PO', label: 'POA' },
    { value: 'NA', label: 'Not Applicable (Non-individuals or nominee contact details)' }
  ];

  contactTypeOptions = [
    { value: 'RE', label: 'Residential' },
    { value: 'OF', label: 'Office' },
    { value: 'PR', label: 'Primary' },
    { value: 'OT', label: 'Other' }
  ];


emailOwnershipOptions = [
    { value: 'SE', label: 'Self' },
    { value: 'SP', label: 'Spouse' },
    { value: 'DC', label: 'Dependent Children' },
    { value: 'DS', label: 'Dependent Siblings' },
    { value: 'DP', label: 'Dependent Parents' },
    { value: 'GD', label: 'Guardian' },
    { value: 'PM', label: 'PMS' },
    { value: 'CD', label: 'Custodian' },
    { value: 'PO', label: 'POA' },
    // { value: 'NA', label: 'Not Applicable (Non-individuals or nominee contact details)' }
  ];

  UpdatedNomineeList: any[] = [];

  relationValidator(control: AbstractControl) {
    return control.value === '0' ? { required: true } : null;
  }

  // asnew journey on 15-08-2025
  storedData = [];
  nomiDataFromPatch = [];
  
  // Multi-nominee management
  savedNominees: any[] = []; // Array to store up to 3 nominees
  currentNomineeIndex: number = 0; // Track which nominee form user is filling
  maxNominees: number = 3; // Maximum 3 nominees allowed

  // normla mode-edit
  isEditNomiNormalMode: boolean = false;
  isEditClieCodeinNormalMode: any;
  isEditMembIDinNormalMode: any;
  nomiInNormal: any;
  nomiKeyinNormalMode: any;
  nomiIndexinNormalMode: any;

  // update-edit mode = add
  isAddNewNomi: boolean = false;
  isAddNomiClieCode: any;
isAddNomiMembID: any; 

//update-edit mode = edit
isEditNomiDetail: boolean = false;
isEditNomiClieCode: any;
isEditNomiMembID: any;
nomiInEdit: any;
nomiKeyInEdit: any;
nomiIndexInEdit: any;
@Output() nextTab =  new EventEmitter<number>();

constructor(private fb: FormBuilder, private location: Location, private router: Router, private bseUccSer: BseUCCRegister, private sharedService: Shared) { }

  ngOnInit(): void {

    this.createNomineeForm(0);
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];

    // Load existing nominees from localStorage
    this.loadExistingNominees();

    const navState = history.state;
    console.log(navState, 'nav state');

    // ason 15-08-2025 new journey
    // normal mode-edit
    this.isEditNomiNormalMode = navState?.isEditNomiNormalMode === true;
    this.isEditClieCodeinNormalMode = navState?.isEditClieCodeinNormalMode;
    this.isEditMembIDinNormalMode = navState?.isEditMembIDinNormalMode;
    this.nomiInNormal = navState?.nomiInNormal;
    this.nomiKeyinNormalMode = navState?.nomiKeyinNormalMode;
    this.nomiIndexinNormalMode = navState?.nomiIndexinNormalMode;
    console.log(this.isEditNomiNormalMode, this.isEditClieCodeinNormalMode, this.isEditMembIDinNormalMode, this.nomiInNormal, this.nomiKeyinNormalMode, this.nomiIndexinNormalMode, 'isEditNomiNormalMode', 'isEditClieCodeinNormalMode', 'isEditMembIDinNormalMode', 'nomiInNormal', 'nomiKeyinNormalMode', 'nomiIndexinNormalMode');

    // this.createNomineeForm(navState?.index ?? 0);
    if (this.isEditNomiNormalMode) {
      // this.patchDataForEditinNormalMode(navState);
      this.patchDataForEditinNormal(navState);  // by key exchanging
    }


    // FRO UPDATE-EDIT mode = ADD 
    this.isAddNewNomi = navState?.isAddNewNomi === true;
    this.isAddNomiClieCode = navState?.isAddNomiClieCode;
    this.isAddNomiMembID = navState?.isAddNomiMembID;

    console.log('isAddNewNomi, isAddNomiClieCode, isAddNomiMembID', this.isAddNewNomi, this.isAddNomiClieCode, this.isAddNomiMembID  );
    


    // FRO UPDATE-EDIT mode = EDIT
    this.isEditNomiDetail = navState?.isEditNomiDetail === true;
    this.isEditNomiClieCode = navState?.isEditNomiClieCode;
    this.isEditNomiMembID = navState?.isEditNomiMembID;
    this.nomiInEdit = navState?.nomiInEdit;
    this.nomiKeyInEdit =  navState?.nomiKeyInEdit;
    this.nomiIndexInEdit =  navState?.nomiIndexInEdit;

    console.log('isEditNomiDetail, isEditNomiClieCode, isEditNomiMembID, nomiInEdit, nomiKeyInEdit, nomiIndexInEdit', this.isEditNomiDetail, this.isEditNomiClieCode, this.isEditNomiMembID,  this.nomiInEdit,  this.nomiKeyInEdit,  this.nomiIndexInEdit  );
   
        if (this.isEditNomiDetail) {
      // this.patchDataForEdit(navState);
      this.patchDataForEditinEdit(navState);  // by key exchanging
    }
   
    // end here

  }



//       navigate(index: number) {
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
  this.nextTab.emit(5);  // navigate to tab index 1
}
  
  createNomineeForm(index: number) {
    const isRequired = index === 0;

    this.nomineeForm = this.fb.group({
      nomineeName: ['', isRequired ? [Validators.required, Validators.pattern(/^[a-zA-Z ]{2,25}$/)] : []],

      relation: ['', isRequired ? [Validators.required, this.relationValidator] : []],


      // isMinor: [null],

      isMinor: [''],

      applicablePercentage: ['', isRequired ? [
        Validators.required,
        Validators.pattern(/^(100(\.00?)?|[1-9]?\d(\.\d{1,2})?)$/)
      ] : []],

      identityType: ['', isRequired ? Validators.required : []],



      nomineePan: ['', isRequired ? [] : []],

      IDNumber: ['', isRequired ? [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{6,20}$/),
        // Validators.maxLength(20)
      ] : []],

      // email: ['', isRequired ? [
      //   Validators.required,
      //   Validators.email
      // ] : []],

      // mobile: ['', isRequired ? [
      //   Validators.required,
      //   Validators.pattern(/^[6-9]\d{9}$/)
      // ] : []],

      country_code: ['+91', [Validators.required, Validators.maxLength(5), Validators.pattern(/^\+\d{1,4}$/)]],

      // contact_number: [''],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/) ]],

      whose_contact_number: ['', [Validators.required, Validators.maxLength(100)]],
      contact_type: ['', [Validators.required, Validators.maxLength(50)]],
      extension: ['', [ Validators.maxLength(10), Validators.pattern(/^\d+$/)]],
      fax_no: ['', [Validators.maxLength(20)]],

      // email_address: ['', [Validators.email, Validators.minLength(10), Validators.maxLength(200)]],
       email: ['', [Validators.required, Validators.email, Validators.minLength(10), Validators.maxLength(200)]],
     
       whose_email_address: ['', [Validators.required, Validators.maxLength(100)]],
      address1: ['', isRequired ? [Validators.required, Validators.maxLength(50)] : []],
      address2: ['', Validators.maxLength(50)],
      address3: ['', Validators.maxLength(50)],

      city: ['', isRequired ? [
        Validators.required,
        Validators.pattern(/^[a-zA-Z .'-]+$/),
            Validators.minLength(2),
        Validators.maxLength(20)
      ] : []],

      pin: ['', isRequired ? [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ] : []],

      country: ['India', isRequired ? Validators.required : []],
      nomineeDob: [''],
      guardianName: [''],
      pan: [''],

      // added by backoffice
      dob: [''],
      

    });

    this.nomineeForm.get('identityType')?.valueChanges.subscribe((type) => {
      this.selectedIdentityType = type; // track selected type
      const control = this.nomineeForm.get('IDNumber');
      control?.clearValidators();

      switch (type) {
        case '1': // PAN
          control?.setValidators([
            Validators.required,
            Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/) // 10-character alphanumeric
          ]);
          break;
        case '2': // Aadhaar
          control?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{4}$/) // Exactly 4 digits
          ]);
          break;
        case '3': // Driving License
          control?.setValidators([
            Validators.required,
            Validators.maxLength(20),
            Validators.pattern(/^[A-Z]{2}[0-9]{13}$/)
          ]);
          break;
        case '4': // Passport
          control?.setValidators([
            Validators.required,
            Validators.maxLength(9),
            Validators.pattern(/^[A-Z][0-9]{7}$/)
          ]);
          break;
        default:
          control?.setValidators(Validators.required);
      }

      control?.updateValueAndValidity();
    });

    this.nomineeForm.get('isMinor')?.valueChanges.subscribe((isMinor: string) => {
      const guardianName = this.nomineeForm.get('guardianName');
      const nomineeDob = this.nomineeForm.get('nomineeDob');
      const nomineePan = this.nomineeForm.get('pan');

      if (isMinor === 'Y') {
        guardianName?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z ]{2,50}$/)]);
        nomineeDob?.setValidators([Validators.required]);
        nomineePan?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]);

      } else {
        guardianName?.clearValidators();
        nomineeDob?.clearValidators();
        nomineePan?.clearValidators();
        guardianName?.setValue('');
        nomineeDob?.setValue('');
        nomineePan?.setValue('');

      }

      guardianName?.updateValueAndValidity();
      nomineeDob?.updateValueAndValidity();
      nomineePan?.updateValueAndValidity();
    });

    const contactTypeControl = this.nomineeForm.get('contact_type');
    this.applyContactTypeValidators(contactTypeControl?.value || null);
    contactTypeControl?.valueChanges.subscribe((type: string) => {
      this.applyContactTypeValidators(type);
    });

    this.nomineeForm.get('identityType')?.valueChanges.subscribe(() => {
      this.nomineeForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.nomineeForm.get('IDNumber')?.valueChanges.subscribe(() => {
      this.nomineeForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.nomineeForm.get('pan')?.valueChanges.subscribe(() => {
      this.nomineeForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.nomineeForm.setValidators(this.validateIDPANNotSame('pan', 'IDNumber', 'identityType'));
  }


  nextTabMove() {
    if (
      this.activeTab === 0 &&
      (this.nomineeForm.invalid)
    ) {
      this.nomineeForm.markAllAsTouched();
      return;
    }
    if (this.activeTab < 2) {
      console.log('nominee form value', this.nomineeForm.value);
      this.SaveAndContinue();
    }
  }


  isTabActive(tabIndex: number): boolean {
    return this.activeTab === tabIndex;
  }




  mapFormToNomineeDetails(nomineeList: any[], clientCode: any): uccNomineeDetails {
    const nominee = new uccNomineeDetails();
    nominee.clieCode = clientCode;

    const [n1, n2, n3] = nomineeList;

    // Helper to map nominee # to nominee object, else empty strings
    function applyNominee(source: any | undefined, prefix: string) {
      // Support both API field names (name, mobileNumber, percentage) and form field names (nomineeName, mobile, applicablePercentage)
      nominee[`${prefix}Name`] = source?.nomineeName || source?.name || '';
      nominee[`${prefix}Relation`] = source?.relation?.value || source?.relation || '';
      nominee[`${prefix}Perc`] = source?.applicablePercentage || source?.percentage || '';
      nominee[prefix === 'nomi1' ? 'nomiIsMinor' : `${prefix}sMinor`] = source?.isMinor || '';
      nominee[`${prefix}DOB`] = source?.nomineeDob || source?.dob || '';
      nominee[`${prefix}Guardian`] = source?.guardianName || source?.guardian || '';
      nominee[`${prefix}PAN`] = source?.nomineePan || '';
      nominee[`${prefix}GuardPAN`] = source?.pan || source?.guardPAN || '';
      nominee[`${prefix}IDType`] = source?.identityType || source?.idType || '';
      nominee[`${prefix}IDNumb`] = source?.IDNumber || source?.idNumber || '';
      nominee[`${prefix}MobileNumb`] = source?.mobile || source?.mobileNumber || '';
      nominee[`${prefix}Add1`] = source?.address1 || '';
      nominee[`${prefix}Add2`] = source?.address2 || '';
      nominee[`${prefix}Add3`] = source?.address3 || '';
      nominee[`${prefix}Email`] = source?.email || '';
      nominee[`${prefix}City`] = source?.city || '';
      nominee[`${prefix}Pin`] = source?.pin || '';
      nominee[`${prefix}Country`] = source?.country || '';
      nominee[`${prefix}_country_code`] = source?.country_code || source?.countryCode || '';
      // nominee[`${prefix}ContactNumber`] = source?.contact_number || source?.contactNumber || '';
      nominee[`${prefix}_whose_contact_number`] = source?.whose_contact_number || source?.whoseContactNumber || '';
      nominee[`${prefix}_contact_type`] = source?.contact_type || source?.contactType || '';
      nominee[`${prefix}_extension`] = source?.extension || '';
      nominee[`${prefix}_fax_no`] = source?.fax_no || source?.faxNo || '';
      // nominee[`${prefix}EmailAddress`] = source?.email_address || source?.emailAddress || '';
      nominee[`${prefix}_whose_email_address`] = source?.whose_email_address || source?.whoseEmailAddress || '';
    }

    // Always apply for 1, and also apply for 2 and 3 (which will default to empty)
    applyNominee(n1, 'nomi1');
    applyNominee(n2, 'nomi2');
    applyNominee(n3, 'nomi3');

    return nominee;
  }


  onMinorSelection(value: string) {
    if (value === 'N') {
      this.nomineeForm.get('isMinor')?.setValue(null);
    }
  }


  validateIDPANNotSame(panKey: string, idKey: string, typeKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;

      const pan = formGroup.get(panKey)?.value;
      const idNumber = formGroup.get(idKey)?.value;
      const type = formGroup.get(typeKey)?.value;

      if (type === '1' && pan && idNumber && pan === idNumber) {
        formGroup.get(idKey)?.setErrors({
          ...(formGroup.get(idKey)?.errors || {}),
          sameAsGuardianPAN: true
        });
        return { sameAsGuardianPAN: true };
      } else {
        const errors = formGroup.get(idKey)?.errors;
        if (errors?.['sameAsGuardianPAN']) {
          delete errors['sameAsGuardianPAN'];
          formGroup.get(idKey)?.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
        return null;
      }
    };
  }

  private applyContactTypeValidators(contactType: string | null) {
    const requiresDetails = contactType === 'RE' || contactType === 'OF';
    this.requiresContactDetails = requiresDetails;
    const extensionControl = this.nomineeForm.get('extension');
    const faxControl = this.nomineeForm.get('fax_no');

    const numericExtensionPattern = Validators.pattern(/^\d+$/);
    const extensionValidators = requiresDetails
      ? [Validators.required, Validators.maxLength(10), numericExtensionPattern]
      : [Validators.maxLength(10), numericExtensionPattern];

    const faxValidators = requiresDetails
      ? [Validators.required, Validators.maxLength(20)]
      : [Validators.maxLength(20)];

    extensionControl?.setValidators(extensionValidators);
    faxControl?.setValidators(faxValidators);

    extensionControl?.updateValueAndValidity({ emitEvent: false });
    faxControl?.updateValueAndValidity({ emitEvent: false });
  }


  formatDateToDDMMYYYY(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

   ///// new journey ason 15-08-2025
  // normla mode add

    private resolveMembID(): string | null {
    if (this.isAddNewNomi) {
      return this.isAddNomiMembID;
    }
    else if (this.isEditNomiDetail) {
      return this.isEditNomiMembID;
    }
    else if (this.isEditNomiNormalMode) {
      return this.MemberDetailID; 
    } else {
      return this.MemberDetailID;
    }
  }

  private resolveClientID(): string | null {
    if (this.isAddNewNomi) {
      return this.isAddNomiClieCode;
    }
    else if (this.isEditNomiDetail) { 
      return this.isEditNomiClieCode;
    }
    else if (this.isEditNomiNormalMode) {
      return this.BseClientCode;  
    }
    else {
      return this.BseClientCode;
    }
  }

  SaveAndContinue() {
  console.log('call normal');
  console.log(this.savedNominees.length, 'saved nominees');
  console.log(this.UpdatedNomineeList.length, 'updated nominee list');

  // ✅ If user has at least one saved nominee, skip validation and proceed
  if (this.savedNominees.length > 0 || this.UpdatedNomineeList.length > 0) {
    console.log('User has saved nominees, skipping validation');
    this.router.navigate(['/app/nomineeList']);
    return;
  }

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.BseClientCode;
  formValue.clieCode = clientCode;
  formValue.membID = this.MemberDetailID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('nomineeAddListInNormalMode') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

  console.log(storedData, 'storedData before update');
  console.log(this.nomiIndexinNormalMode, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');

  if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
    const selectedNominee = clientNominees[this.nomiIndexinNormalMode];
    console.log(selectedNominee, 'selected nominee for edit');

    if (selectedNominee) {
      const actualIndex = storedData.findIndex(
        (        nomi: { clieCode: any; membID: any; IDNumber: any; identityType: any; }) =>
          nomi.clieCode === selectedNominee.clieCode &&
          nomi.membID === selectedNominee.membID &&
          String(nomi.IDNumber) === String(selectedNominee.IDNumber) &&  // ✅ unique per nominee
          nomi.identityType === selectedNominee.identityType
      );

      if (actualIndex !== -1) {
        storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
        console.log("✅ Updated nominee:", storedData[actualIndex]);
      }
    }
  } else {
    storedData.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(storedData, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/nomineeList']);
    });
    return;
  }

  // 🔹 Save back
  localStorage.setItem('nomineeAddListInNormalMode', JSON.stringify(storedData));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
   const listToMap = storedData.length === 0 ? storedData : updatedClientNominees;
  // const listToMap = updatedClientNominees;
  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/nomineeList']);
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}


  SaveAndExit() {
  console.log('call normal exit');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.BseClientCode;
  formValue.clieCode = clientCode;
  formValue.membID = this.MemberDetailID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('nomineeAddListInNormalMode') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

  console.log(storedData, 'storedData before update');
  console.log(this.nomiIndexinNormalMode, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = storedData.filter((n: { clieCode: string; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');

  if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
    const selectedNominee = clientNominees[this.nomiIndexinNormalMode];
    console.log(selectedNominee, 'selected nominee for edit');

    if (selectedNominee) {
      const actualIndex = storedData.findIndex(
        (        nomi: { clieCode: any; membID: any; IDNumber: any; identityType: any; }) =>
          nomi.clieCode === selectedNominee.clieCode &&
          nomi.membID === selectedNominee.membID &&
          String(nomi.IDNumber) === String(selectedNominee.IDNumber) &&  // ✅ unique per nominee
          nomi.identityType === selectedNominee.identityType
      );

      if (actualIndex !== -1) {
        storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
        console.log("✅ Updated nominee:", storedData[actualIndex]);
      }
    }
  } else {
    storedData.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(storedData, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = storedData.filter((n: { clieCode: string; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/uccList']);
    });
    return;
  }

  // 🔹 Save back
  localStorage.setItem('nomineeAddListInNormalMode', JSON.stringify(storedData));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
  const listToMap = storedData.length === 0 ? storedData : updatedClientNominees;
  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/uccList']);
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}

///as of now remain
  patchDataForEditinNormalMode(nav: { isEditNomiNormalMode: any; nomiInNormal: { name: any; relation: any; isMinor: any; percentage: any; idType: any; idNumber: any; email: any; mobileNumber: any; address1: any; address2: any; address3: any; city: any; pin: any; country: any; dob: any; guardian: any; guardPAN: any; }; nomiKeyinNormalMode: any; nomiIndexinNormalMode: any; }) {
    console.log(nav.isEditNomiNormalMode, 'isEditNomiNormalMode');

    if (nav.isEditNomiNormalMode && nav.nomiInNormal) {
      this.nomineeForm.patchValue({
        nomineeName: nav?.nomiInNormal?.name,
        relation: nav?.nomiInNormal?.relation,
        isMinor: nav?.nomiInNormal?.isMinor,
        applicablePercentage: nav?.nomiInNormal?.percentage,
        identityType: nav?.nomiInNormal?.idType,
        // nomineePan: nav?.nomiInNormal?.Nomi1PAN,
        IDNumber: nav?.nomiInNormal?.idNumber,
        email: nav?.nomiInNormal?.email,
        mobile: nav?.nomiInNormal?.mobileNumber,
        // country_code: nav?.nomiInNormal?.country_code ?? nav?.nomiInNormal?.countryCode ?? '',
        // contact_number: nav?.nomiInNormal?.contact_number ?? nav?.nomiInNormal?.contactNumber ?? '',
        // whose_contact_number: nav?.nomiInNormal?.whose_contact_number ?? nav?.nomiInNormal?.whoseContactNumber ?? '',
        // contact_type: nav?.nomiInNormal?.contact_type ?? nav?.nomiInNormal?.contactType ?? '',
        // extension: nav?.nomiInNormal?.extension ?? '',
        // fax_no: nav?.nomiInNormal?.fax_no ?? nav?.nomiInNormal?.faxNo ?? '',
        // email_address: nav?.nomiInNormal?.email_address ?? nav?.nomiInNormal?.emailAddress ?? '',
        // whose_email_address: nav?.nomiInNormal?.whose_email_address ?? nav?.nomiInNormal?.whoseEmailAddress ?? '',
        address1: nav?.nomiInNormal?.address1,
        address2: nav?.nomiInNormal?.address2,
        address3: nav?.nomiInNormal?.address3,
        city: nav?.nomiInNormal?.city,
        pin: nav?.nomiInNormal?.pin,
        country: nav?.nomiInNormal?.country,
        nomineeDob: nav?.nomiInNormal?.dob,
        guardianName: nav?.nomiInNormal?.guardian,
        pan: nav?.nomiInNormal?.guardPAN
      });
      console.log(this.nomineeForm.value, 'nominee from value in normal edit');


      this.nomiKeyinNormalMode = nav.nomiKeyinNormalMode;
      this.nomiIndexinNormalMode = nav.nomiIndexinNormalMode;

      this.nomiDataFromPatch = this.nomineeForm.value;

    }
  }



// by key exchanging
  // Add Nominee - Save current form and add new
  addNominee() {
    // Validate current form
    if (this.nomineeForm.invalid) {
      this.nomineeForm.markAllAsTouched();
      this.sharedService.OpenAlert('Please fill all required fields before adding a new nominee.');
      return;
    }

    // Check if already at max limit
    if (this.savedNominees.length >= this.maxNominees) {
      this.sharedService.OpenAlert(`You can only add up to ${this.maxNominees} nominees.`);
      return;
    }

    // Get form value
    const formValue = this.nomineeForm.getRawValue();
    const clientCode = this.resolveClientID();
    const membID = this.resolveMembID();
    formValue.clieCode = clientCode;
    formValue.membID = membID;

    // Format DOB if exists
    if (formValue.nomineeDob) {
      formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
    } else {
      formValue.nomineeDob = '';
    }

    console.log('Adding nominee:', formValue);

    // IMPORTANT: Don't push to savedNominees yet - let API response update it
    // Just call the API with merged list (existing + new)
    const mergedNominees = [...this.savedNominees, { ...formValue }];
    console.log('Merged nominees for API:', mergedNominees);

    // Call API to save the nominees
    this.saveNomineesToAPI(mergedNominees);
  }

  // Save nominees to API
  saveNomineesToAPI(nomineesToSave: any[]) {
    const clientCode = this.resolveClientID();
    const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(nomineesToSave, clientCode);

    console.log('Sending to API:', nomineeInput);

    this.isLoading = true;

    this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('Nominee API Response:', response);
         this.isLoading = false;
        if (response.success) {
              this.sharedService.successDia(response.message).subscribe(result => {
          this.nomineeForm.reset();
            this.nomineeForm.patchValue({
              relation: '0',
              isMinor: '',
              identityType: '',
              country: ''
            });
            
            this.currentNomineeIndex++;
            console.log(`Nominee ${this.currentNomineeIndex} of ${this.maxNominees} added successfully`);
            
            // Refresh from API to get updated list
            this.getNomineeList(clientCode!);
            // this.isLoading = false;
            
      }
      )
    }
        
        
        else {
          this.isLoading = false;
          this.sharedService.OpenAlert('Failed to save nominee details.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Nominee API Error:', err);
        this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
      }
    });
  }


   addNomineeandExit() {
    console.log(this.savedNominees.length, 'saved nominees');
    console.log(this.UpdatedNomineeList.length, 'updated nominee list');

    // ✅ If user has at least one saved nominee, skip validation and navigate directly
    if (this.savedNominees.length > 0 || this.UpdatedNomineeList.length > 0) {
      console.log('User has saved nominees, skipping validation and navigating');
      // Wait 2 seconds before navigating to allow user to see the list
      // setTimeout(() => {
      //   this.nextTab.emit(5);
      //   this.router.navigate(['/registerdList']);
      // }, 2000);
      this.router.navigate(['/app/registerdList']);
      return;
    }

    // Validate current form - only if no saved nominees
    if (this.nomineeForm.invalid) {
      this.nomineeForm.markAllAsTouched();
      this.sharedService.OpenAlert('Please fill all required fields before adding a new nominee.');
      return;
    }

    // Check if already at max limit
    if (this.savedNominees.length >= this.maxNominees) {
      this.sharedService.OpenAlert(`You can only add up to ${this.maxNominees} nominees.`);
      return;
    }

    // Get form value
    const formValue = this.nomineeForm.getRawValue();
    const clientCode = this.resolveClientID();
    const membID = this.resolveMembID();
    formValue.clieCode = clientCode;
    formValue.membID = membID;

    // Format DOB if exists
    if (formValue.nomineeDob) {
      formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
    } else {
      formValue.nomineeDob = '';
    }

    console.log('Adding nominee:', formValue);

    // IMPORTANT: Don't push to savedNominees yet - let API response update it
    // Just call the API with merged list (existing + new)
    const mergedNominees = [...this.savedNominees, { ...formValue }];
    console.log('Merged nominees for API:', mergedNominees);

    // Call API to save the nominees
    this.saveNomineesToAPIandExit(mergedNominees);
  }


  saveNomineesToAPIandExit(nomineesToSave: any[]) {
    const clientCode = this.resolveClientID();
    const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(nomineesToSave, clientCode);

    console.log('Sending to API:', nomineeInput);

    this.isLoading = true;

    this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('Nominee API Response:', response);
    
        if (response.success) {
              this.sharedService.successDia(response.message).subscribe(result => {
          this.nomineeForm.reset();
            this.nomineeForm.patchValue({
              relation: '0',
              isMinor: '',
              identityType: '',
              country: ''
            });
            
            this.currentNomineeIndex++;
            console.log(`Nominee ${this.currentNomineeIndex} of ${this.maxNominees} added successfully`);
            
            // Refresh from API to get updated list
            this.getNomineeListandExit(clientCode!);
            this.isLoading = false;
            
      }
      )
    }
        
        
        else {
          this.isLoading = false;
          this.sharedService.OpenAlert('Failed to save nominee details.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Nominee API Error:', err);
        this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
      }
    });
  }



  // Get nominee list from API after save
  getNomineeListFromAPI() {
    const clientCode = this.resolveClientID();
    // Load from localStorage or API
    let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
    storedData = Array.isArray(storedData) ? storedData : [];
    
    const clientNominees = storedData.filter((n: any) => n.clieCode === clientCode);
    this.savedNominees = clientNominees;
    console.log('Nominees from API:', this.savedNominees);
  }

  deleteNominee(nominee: any, index: number): void {
    this.sharedService.openConfirmDialog(
      "Are you sure you want to delete this Nominee?",
      (isConfirm) => {
        if (isConfirm) {
          this.deleteNomineeFromDB(nominee, index);
        }
      }
    );
  }

  deleteNomineeFromDB(nominee: any, index: number) {
    const clientCode = this.resolveClientID();
    
    // Remove nominee from savedNominees array
    const updatedNominees = this.savedNominees.filter((_, i) => i !== index);
    
    // Call API to update the nominee list (send remaining nominees)
    const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(updatedNominees, clientCode);
    
    console.log('Deleting nominee, sending updated list:', nomineeInput);

    this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
      next: (res) => {
        console.log(res, 'res of deleted nominee');

        if (res?.success === true) {
          this.sharedService.successDia(res?.message).subscribe(result => {
            if (result === true) {
              this.getNomineeList(clientCode!);
            }
          });
        } else {
          this.sharedService.OpenAlert(res?.message || 'Failed to delete nominee');
        }
      },
      error: (err) => {
        console.error("Delete nominee API error:", err);
        this.sharedService.OpenAlert("Something went wrong while deleting nominee.");
      }
    });
  }

  getNomineeList(clieCode: string){
      if (!clieCode) {
        console.warn('Client code is missing. Cannot fetch nominee list.');
        return;
      }
  
      const input: bseNomineeListApiInput = {
        clientCode: clieCode
      }
      console.log('nominee list input', input);
  
      this.bseUccSer.getBseNomineeList(input).subscribe({
        next: (res: any) => {
          console.log('res of nominee list', res);
          const clieCode = res.clieCode?.trim() || '';
          const membID = res.membID?.trim() || '';
          console.log(clieCode, membID, 'clie code and memb id');
  
          this.isAddNomiClieCode = clieCode;
          this.isAddNomiMembID = membID;
  
          this.isEditNomiClieCode = clieCode;
          this.isEditNomiMembID = membID;
  
           this.isEditClieCodeinNormalMode = clieCode;
        this.isEditMembIDinNormalMode = membID;

  
          this.UpdatedNomineeList = this.mapNomineeDetailsToArray(res);
          console.log('updaed nominee list', this.UpdatedNomineeList);
  
          localStorage.setItem('getNomineekList', JSON.stringify(this.UpdatedNomineeList));
          
          // Update savedNominees for table display
          this.savedNominees = this.UpdatedNomineeList;
          this.currentNomineeIndex = this.UpdatedNomineeList.length;
          console.log('Saved nominees updated from API:', this.savedNominees);
       
       
        },
  
        error: (err: any) => {
          console.error('Error fetching nominee list', err);
        }
      })
}

  getNomineeListandExit(clieCode: string){
      if (!clieCode) {
        console.warn('Client code is missing. Cannot fetch nominee list.');
        return;
      }
  
      const input: bseNomineeListApiInput = {
        clientCode: clieCode
      }
      console.log('nominee list input', input);
  
      this.bseUccSer.getBseNomineeList(input).subscribe({
        next: (res: any) => {
          console.log('res of nominee list', res);
          const clieCode = res.clieCode?.trim() || '';
          const membID = res.membID?.trim() || '';
          console.log(clieCode, membID, 'clie code and memb id');
  
          this.isAddNomiClieCode = clieCode;
          this.isAddNomiMembID = membID;
  
          this.isEditNomiClieCode = clieCode;
          this.isEditNomiMembID = membID;
  
           this.isEditClieCodeinNormalMode = clieCode;
        this.isEditMembIDinNormalMode = membID;

  
          this.UpdatedNomineeList = this.mapNomineeDetailsToArray(res);
          console.log('updaed nominee list', this.UpdatedNomineeList);
  
          localStorage.setItem('getNomineekList', JSON.stringify(this.UpdatedNomineeList));
          
          // Update savedNominees for table display
          this.savedNominees = this.UpdatedNomineeList;
          this.currentNomineeIndex = this.UpdatedNomineeList.length;
          console.log('Saved nominees updated from API:', this.savedNominees);
       
          // Wait 2 seconds before navigating to allow user to see the updated list
          // setTimeout(() => {
          //   this.nextTab.emit(5);
          //   this.router.navigate(['/app/registerdList']);
          // }, 2000);
            
       
        },
  
        error: (err: any) => {
          console.error('Error fetching nominee list', err);
        }
      })
}

  private mapNomineeDetailsToArray(response: any): any[] {
  const nominees = [];

  const commonFields = {
    clieCode: response.clieCode?.trim() || '',
    membID: response.membID?.trim() || ''
  };

  for (let i = 1; i <= 3; i++) {
    const key = `nominee${i}detail`;
    const nominee = response[key];

    if (!nominee) continue;

    const cleanedNominee = {
      nomineeKey: key,
      index: i,
      name: nominee.name?.trim() || null,
      relation: nominee.relation?.trim() || null,
      percentage: nominee.percentage?.trim() || null,
      isMinor: nominee.isMinor?.trim() || null,
      dob: nominee.dob?.trim() || null,
      guardian: nominee.guardian?.trim() || null,
      guardPAN: nominee.guardPAN?.trim() || null,
      idType: nominee.idType?.trim() || null,
      idNumber: nominee.idNumber?.trim() || null,
      email: nominee.email?.trim() || null,
      mobileNumber: nominee.mobileNumber?.trim() || null,
      country_code: nominee.country_code?.trim() || nominee.countryCode?.trim() || null,
      // contact_number: nominee.contact_number?.trim() || nominee.contactNumber?.trim() || null,
      whose_contact_number: nominee.whose_contact_number?.trim() || nominee.whoseContactNumber?.trim() || null,
      contact_type: nominee.contact_type?.trim() || nominee.contactType?.trim() || null,
      extension: nominee.extension?.trim() || null,
      fax_no: nominee.fax_no?.trim() || nominee.faxNo?.trim() || null,
      // email_address: nominee.email_address?.trim() || nominee.emailAddress?.trim() || null,
      whose_email_address: nominee.whose_email_address?.trim() || nominee.whoseEmailAddress?.trim() || null,
      address1: nominee.address1?.trim() || null,
      address2: nominee.address2?.trim() || null,
      address3: nominee.address3?.trim() || null,
      city: nominee.city?.trim() || null,
      pin: nominee.pin?.trim() || null,
      country: nominee.country?.trim() || null,
      ...commonFields
    };

    // Only validate key nominee-specific fields (not just commonFields)
    const isNomineeDataValid = [
      cleanedNominee.name,
      cleanedNominee.relation,
      cleanedNominee.percentage,
      cleanedNominee.idType,
      cleanedNominee.idNumber,
      cleanedNominee.mobileNumber
    ].some(val => val && val !== 'null' && val !== '');

    if (isNomineeDataValid) {
      nominees.push(cleanedNominee);
    }
  }

  return nominees;
}

  // Get relation label from value
  getRelationLabel(value: string): string {
    const relation = this.nomineeRelations.find(r => r.value === value);
    return relation ? relation.label : value;
  }

  // Load existing nominees for current client
  loadExistingNominees() {
    const clientCode = this.resolveClientID();
    if (clientCode) {
      // Fetch from API
      this.getNomineeList(clientCode);
    } else {
      // Fallback to localStorage if no client code
      let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
      storedData = Array.isArray(storedData) ? storedData : [];
      
      const clientNominees = storedData.filter((n: any) => n.clieCode === clientCode);
      this.savedNominees = clientNominees;
      this.currentNomineeIndex = clientNominees.length;
      console.log('Loaded existing nominees from localStorage:', this.savedNominees);
    }
  }

  // saveAndEditinNormalMode() {
  //   console.log(this.storedData, 'stored data post patch value');

  //   const clientCode = this.BseClientCode;

  //   const clientNominee = this.storedData.filter(nomi => nomi.clieCode === clientCode);

  //   console.log(clientNominee, 'client nominees');


  //   if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
  //     const selectedNominee = clientNominee[this.nomiIndexinNormalMode];


  //     console.log(selectedNominee, 'selected nominee');
  //     console.log(this.nomiDataFromPatch, 'nomiDataFromPatch');

  //     let nomiDatFromPatch: any = this.nomiDataFromPatch;
  //     nomiDatFromPatch.clieCode = clientCode;
  //     nomiDatFromPatch.membID = this.MemberDetailID;
  //     console.log(nomiDatFromPatch, 'nomiDatFromPatch');



  //     if (selectedNominee) {
     
  //       const actualIndex = this.storedData.findIndex(
  //         nomi =>
  //           nomi.clieCode === nomiDatFromPatch?.clieCode &&
  //          nomi?.membID === nomiDatFromPatch?.membID &&
  //               nomi?.name === nomiDatFromPatch?.nomineeName &&
  //             nomi?.percentage === nomiDatFromPatch?.applicablePercentage &&
  //             nomi?.isMinor === nomiDatFromPatch?.isMinor &&
  //           nomi?.mobileNumber === nomiDatFromPatch?.mobile &&
  //            nomi?.relation === nomiDatFromPatch?.relation &&
  //            nomi.guardPAN === nomiDatFromPatch?.pan &&

  //           nomi.address1 === nomiDatFromPatch?.address1 &&
  //           nomi.address2 === nomiDatFromPatch?.address2 &&
  //           nomi.address3 === nomiDatFromPatch?.address3 &&
  //           nomi.city === nomiDatFromPatch?.city &&
  //           nomi.country === nomiDatFromPatch?.country &&
  //           nomi.email === nomiDatFromPatch?.email &&
  //           nomi.dob === nomiDatFromPatch?.nomineeDob && 
  //           nomi?.guardian === nomiDatFromPatch?.guardianName &&
  //           nomi?.idNumber === nomiDatFromPatch?.IDNumber &&
  //           nomi?.idType === nomiDatFromPatch?.identityType &&
  //           nomi?.pin === nomiDatFromPatch?.pin 
            
  //       );

  //       if (actualIndex !== -1) {
  //         this.storedData[actualIndex] = { ...this.storedData[actualIndex], ...nomiDatFromPatch };
  //        localStorage.setItem('getNomineekList', JSON.stringify(this.storedData));
  //         console.log("Updated nominee:", this.storedData[actualIndex]);
  //        } else {
  //       console.warn("Nominee not found for update");
  //     }

       
  //       console.log(actualIndex,'actual index');
  //       console.log(this.storedData[actualIndex],' stored data post editing');
        
        
  //     }
  //   }

  //   // end here


  // }
  // end here

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

/// fro update-edit mode- add-edit
patchDataForEdit(nav: { isEditNomiDetail: any; nomiInEdit: { name: any; relation: any; isMinor: any; percentage: any; idType: any; idNumber: any; email: any; mobileNumber: any; address1: any; address2: any; address3: any; city: any; pin: any; country: any; dob: any; guardian: any; guardPAN: any; }; nomiKeyInEdit: any; nomiIndexInEdit: any; }){
      console.log(nav.isEditNomiDetail, 'isEditNomiDetail');

    if (nav.isEditNomiDetail && nav.nomiInEdit) {
      this.nomineeForm.patchValue({
        nomineeName: nav?.nomiInEdit?.name,
        relation: nav?.nomiInEdit?.relation,
        isMinor: nav?.nomiInEdit?.isMinor,
        applicablePercentage: nav?.nomiInEdit?.percentage,
        identityType: nav?.nomiInEdit?.idType,
        // nomineePan: nav?.nomiInEdit?.Nomi1PAN,
        IDNumber: nav?.nomiInEdit?.idNumber,
        email: nav?.nomiInEdit?.email,
        mobile: nav?.nomiInEdit?.mobileNumber,
        // country_code: nav?.nomiInEdit?.country_code ?? nav?.nomiInEdit?.countryCode ?? '',
        // contact_number: nav?.nomiInEdit?.contact_number ?? nav?.nomiInEdit?.contactNumber ?? '',
        // whose_contact_number: nav?.nomiInEdit?.whose_contact_number ?? nav?.nomiInEdit?.whoseContactNumber ?? '',
        // contact_type: nav?.nomiInEdit?.contact_type ?? nav?.nomiInEdit?.contactType ?? '',
        // extension: nav?.nomiInEdit?.extension ?? '',
        // fax_no: nav?.nomiInEdit?.fax_no ?? nav?.nomiInEdit?.faxNo ?? '',
        // email_address: nav?.nomiInEdit?.email_address ?? nav?.nomiInEdit?.emailAddress ?? '',
        // whose_email_address: nav?.nomiInEdit?.whose_email_address ?? nav?.nomiInEdit?.whoseEmailAddress ?? '',
        address1: nav?.nomiInEdit?.address1,
        address2: nav?.nomiInEdit?.address2,
        address3: nav?.nomiInEdit?.address3,
        city: nav?.nomiInEdit?.city,
        pin: nav?.nomiInEdit?.pin,
        country: nav?.nomiInEdit?.country,
        nomineeDob: nav?.nomiInEdit?.dob,
        guardianName: nav?.nomiInEdit?.guardian,
        pan: nav?.nomiInEdit?.guardPAN
      });
      console.log(this.nomineeForm.value, 'nominee from value in edit mode');


      this.nomiKeyInEdit = nav.nomiKeyInEdit;
      this.nomiIndexInEdit = nav.nomiIndexInEdit;

      this.nomiDataFromPatch = this.nomineeForm.value;

    }
}


  UpdateAndContinue() {
  console.log('call update');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.resolveClientID();
  const membID = this.resolveMembID();
  formValue.clieCode = clientCode;
  formValue.membID = membID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('nomineeAddListInNormalMode') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

  console.log(storedData, 'storedData before update');
  console.log(this.nomiIndexInEdit, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');

  if (this.nomiIndexInEdit !== null && this.nomiIndexInEdit >= 0) {
    const selectedNominee = clientNominees[this.nomiIndexInEdit];
    console.log(selectedNominee, 'selected nominee for edit');

    if (selectedNominee) {
      const actualIndex = storedData.findIndex(
        (        nomi: { clieCode: any; membID: any; IDNumber: any; identityType: any; }) =>
          nomi.clieCode === selectedNominee.clieCode &&
          nomi.membID === selectedNominee.membID &&
          String(nomi.IDNumber) === String(selectedNominee.IDNumber) &&  // ✅ unique per nominee
          nomi.identityType === selectedNominee.identityType
      );

      if (actualIndex !== -1) {
        storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
        console.log("✅ Updated nominee:", storedData[actualIndex]);
      }
    }
  } else {
    storedData.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(storedData, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/nomineeList']
        , {
        state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
      }
      );
    });
    return;
  }

  // 🔹 Save back
  localStorage.setItem('nomineeAddListInNormalMode', JSON.stringify(storedData));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
  const listToMap = storedData.length === 0 ? storedData : updatedClientNominees;
  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/nomineeList']
              , {
        state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
      }
          );
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}

  UpdateAndExit() {
  console.log('call update exit');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.resolveClientID();
  const membID = this.resolveMembID();
  formValue.clieCode = clientCode;
  formValue.membID = membID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('nomineeAddListInNormalMode') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

  console.log(storedData, 'storedData before update');
  console.log(this.nomiIndexInEdit, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');

  if (this.nomiIndexInEdit !== null && this.nomiIndexInEdit >= 0) {
    const selectedNominee = clientNominees[this.nomiIndexInEdit];
    console.log(selectedNominee, 'selected nominee for edit');

    if (selectedNominee) {
      const actualIndex = storedData.findIndex(
        (        nomi: { clieCode: any; membID: any; IDNumber: any; identityType: any; }) =>
          nomi.clieCode === selectedNominee.clieCode &&
          nomi.membID === selectedNominee.membID &&
          String(nomi.IDNumber) === String(selectedNominee.IDNumber) &&  // ✅ unique per nominee
          nomi.identityType === selectedNominee.identityType
      );

      if (actualIndex !== -1) {
        storedData[actualIndex] = { ...storedData[actualIndex], ...formValue };
        console.log("✅ Updated nominee:", storedData[actualIndex]);
      }
    }
  } else {
    storedData.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(storedData, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = storedData.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/uccList']
      //   , {
      //   state: {
      //     isAddNewNomiInNomiList: true,
      //     clieCodeFromAddNomi: clientCode
      //   }
      // }
      );
    });
    return;
  }

  // 🔹 Save back
  localStorage.setItem('nomineeAddListInNormalMode', JSON.stringify(storedData));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
  const listToMap = storedData.length === 0 ? storedData : updatedClientNominees;
  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/uccList']
      //         , {
      //   state: {
      //     isAddNewNomiInNomiList: true,
      //     clieCodeFromAddNomi: clientCode
      //   }
      // }
          );
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}





// from key replacing- for normal mode
  patchDataForEditinNormal(nav: { isEditNomiNormalMode: any; nomiInNormal: any; nomiKeyinNormalMode: any; nomiIndexinNormalMode: any; }) {
  console.log(nav.isEditNomiNormalMode, 'isEditNomiNormalMode');

  if (nav.isEditNomiNormalMode && nav.nomiInNormal) {
    // 🔹 Use mapStoredToPatched here so the form always has NEW keys
    const patchedNomi = this.mapStoredToPatched(nav.nomiInNormal);

    this.nomineeForm.patchValue(patchedNomi);
    console.log(this.nomineeForm.value, 'nominee form value in normal edit');

    this.nomiKeyinNormalMode = nav.nomiKeyinNormalMode;
    this.nomiIndexinNormalMode = nav.nomiIndexinNormalMode;

    // ✅ form value already in patched structure
    this.nomiDataFromPatch = this.nomineeForm.value;

    // 🔹 Load stored data from localStorage
    // this.storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
    // this.storedData = Array.isArray(this.storedData) ? this.storedData : [];
    // console.log(this.storedData, 'stored data post editing in normal mode');
  }
}
// imp for converting stored-> patched format( formvalue)
private mapStoredToPatched(stored: any): any {
  return {
    nomineeName: stored.name,
    relation: stored.relation,
    isMinor: stored.isMinor,
    applicablePercentage: stored.percentage,
    identityType: stored.idType,
    nomineePan: stored.nomineePan || "",
    IDNumber: stored.idNumber,
    email: stored.email,
    mobile: stored.mobileNumber,
    country_code: stored.country_code ?? stored.countryCode ?? '',
    // contact_number: stored.contact_number ?? stored.contactNumber ?? '',
    whose_contact_number: stored.whose_contact_number ?? stored.whoseContactNumber ?? '',
    contact_type: stored.contact_type ?? stored.contactType ?? '',
    extension: stored.extension ?? '',
    fax_no: stored.fax_no ?? stored.faxNo ?? '',
    // email_address: stored.email_address ?? stored.emailAddress ?? '',
    whose_email_address: stored.whose_email_address ?? stored.whoseEmailAddress ?? '',
    address1: stored.address1,
    address2: stored.address2,
    address3: stored.address3,
    city: stored.city,
    pin: stored.pin,
    country: stored.country,
    nomineeDob: stored.dob,
    guardianName: stored.guardian,
    pan: stored.guardPAN,
    clieCode: stored.clieCode,
    membID: stored.membID
  };
}

  saveAndEditinNormal() {
  console.log('call normal');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.BseClientCode;
  formValue.clieCode = clientCode;
  formValue.membID = this.MemberDetailID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

    console.log(storedData, 'storedData before update');
 let patchedList = storedData.map((nomi: any) => this.mapStoredToPatched(nomi));

 console.log(patchedList,'patched list');
//  localStorage.setItem('getNomineekList', JSON.stringify(patchedList));

  console.log(this.nomiIndexinNormalMode, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = patchedList.filter((n: { clieCode: string; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');

  // if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
  //   const selectedNominee = clientNominees[this.nomiIndexinNormalMode];
  //   console.log(selectedNominee, 'selected nominee for edit');

  //   if (selectedNominee) {
  //     const actualIndex = patchedList.findIndex(
  //       nomi =>
  //         nomi.clieCode === selectedNominee.clieCode &&
  //         nomi.membID === selectedNominee.membID &&
  //         String(nomi.IDNumber) === String(selectedNominee.IDNumber) &&  // ✅ unique per nominee
  //         nomi.identityType === selectedNominee.identityType
  //     );

  //     if (actualIndex !== -1) {
  //       patchedList[actualIndex] = { ...patchedList[actualIndex], ...formValue };
  //       console.log("✅ Updated nominee:", patchedList[actualIndex]);
  //     }
  //   }
  // } 


  if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
  // Directly update by index
  patchedList[this.nomiIndexinNormalMode] = { 
    ...patchedList[this.nomiIndexinNormalMode], 
    ...formValue 
  };
  console.log("✅ Updated nominee:", patchedList[this.nomiIndexinNormalMode]);
} 
  else {
    patchedList.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(patchedList, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = patchedList.filter((n: { clieCode: string; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/nomineeList']);
    });
    return;
  }

  // 🔹 Save back
  // localStorage.setItem('getNomineekList', JSON.stringify(patchedList));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
  const listToMap = patchedList.length === 0 ? patchedList : updatedClientNominees;

  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/nomineeList']);
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}

  saveAndExitinNormal() {
  console.log('call normal');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  const clientCode = this.BseClientCode;
  formValue.clieCode = clientCode;
  formValue.membID = this.MemberDetailID;

  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

    console.log(storedData, 'storedData before update');
 let patchedList = storedData.map((nomi: any) => this.mapStoredToPatched(nomi));

 console.log(patchedList,'patched list');
//  localStorage.setItem('getNomineekList', JSON.stringify(patchedList));

  console.log(this.nomiIndexinNormalMode, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = patchedList.filter((n: { clieCode: string; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');




  if (this.nomiIndexinNormalMode !== null && this.nomiIndexinNormalMode >= 0) {
  // Directly update by index
  patchedList[this.nomiIndexinNormalMode] = { 
    ...patchedList[this.nomiIndexinNormalMode], 
    ...formValue 
  };
  console.log("✅ Updated nominee:", patchedList[this.nomiIndexinNormalMode]);
} 
  else {
    patchedList.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(patchedList, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = patchedList.filter((n: { clieCode: string; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/uccList']);
    });
    return;
  }

  // 🔹 Save back
  // localStorage.setItem('getNomineekList', JSON.stringify(patchedList));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
  const listToMap = patchedList.length === 0 ? patchedList : updatedClientNominees;

  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/uccList']);
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}

//from key replacing- for update-edit mode
  patchDataForEditinEdit(nav: { isEditNomiDetail: any; nomiInEdit: any; nomiKeyInEdit: any; nomiIndexInEdit: any; }) {
  console.log(nav.isEditNomiDetail, 'isEditNomiDetail');

  if (nav.isEditNomiDetail && nav.nomiInEdit) {
    // 🔹 Use mapStoredToPatched here so the form always has NEW keys
    const patchedNomi = this.mapStoredToPatched(nav.nomiInEdit);

    this.nomineeForm.patchValue(patchedNomi);
    console.log(this.nomineeForm.value, 'nominee form value in update edit');

    this.nomiKeyInEdit = nav.nomiKeyInEdit;
    this.nomiIndexInEdit = nav.nomiIndexInEdit;

    // ✅ form value already in patched structure
    this.nomiDataFromPatch = this.nomineeForm.value;

  }
}

  saveAndEditinUpdate() {
  console.log('call normal');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  // const clientCode: string = this.BseClientCode;
  // formValue.clieCode = clientCode;
  // formValue.membID = this.MemberDetailID;
    const clientCode = this.resolveClientID();
  const membID = this.resolveMembID();
  formValue.clieCode = clientCode;
  formValue.membID = membID;


  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

    console.log(storedData, 'storedData before update');
 let patchedList = storedData.map((nomi: any) => this.mapStoredToPatched(nomi));

 console.log(patchedList,'patched list');
//  localStorage.setItem('getNomineekList', JSON.stringify(patchedList));

  console.log(this.nomiIndexInEdit, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = patchedList.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');


  if (this.nomiIndexInEdit !== null && this.nomiIndexInEdit >= 0) {
  // Directly update by index
  patchedList[this.nomiIndexInEdit] = { 
    ...patchedList[this.nomiIndexInEdit], 
    ...formValue 
  };
  console.log("✅ Updated nominee:", patchedList[this.nomiIndexInEdit]);
} 
  else {
    patchedList.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(patchedList, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = patchedList.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/nomineeList']
        ,{
           state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
        }
      );
    });
    return;
  }

  // 🔹 Save back
  // localStorage.setItem('getNomineekList', JSON.stringify(patchedList));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
    const listToMap = patchedList.length === 0 ? patchedList : updatedClientNominees;

  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/nomineeList']
            ,{
               state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
            }
          );
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}

  saveAndExitinUpdate() {
  console.log('call normal');

  if (this.nomineeForm.invalid) {
    this.nomineeForm.markAllAsTouched();
    return;
  }

  const formValue = this.nomineeForm.getRawValue();
  console.log(formValue, 'Nominee formValue');

  // const clientCode: string = this.BseClientCode;
  // formValue.clieCode = clientCode;
  // formValue.membID = this.MemberDetailID;
    const clientCode = this.resolveClientID();
  const membID = this.resolveMembID();
  formValue.clieCode = clientCode;
  formValue.membID = membID;


  if (formValue.nomineeDob) {
    formValue.nomineeDob = this.formatDateToDDMMYYYY(formValue.nomineeDob);
  } else {
    formValue.nomineeDob = '';
  }

  console.log('Form value of Nominee', formValue);

  // 🔹 Load from localStorage
  let storedData = JSON.parse(localStorage.getItem('getNomineekList') || '[]');
  storedData = Array.isArray(storedData) ? storedData : [];

    console.log(storedData, 'storedData before update');
 let patchedList = storedData.map((nomi: any) => this.mapStoredToPatched(nomi));

 console.log(patchedList,'patched list');
//  localStorage.setItem('getNomineekList', JSON.stringify(patchedList));

  console.log(this.nomiIndexInEdit, 'nominee index from other comp');

  // 🔹 Get only this client's nominees
  const clientNominees = patchedList.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);
  console.log(clientNominees, 'client nominees');


  if (this.nomiIndexInEdit !== null && this.nomiIndexInEdit >= 0) {
  // Directly update by index
  patchedList[this.nomiIndexInEdit] = { 
    ...patchedList[this.nomiIndexInEdit], 
    ...formValue 
  };
  console.log("✅ Updated nominee:", patchedList[this.nomiIndexInEdit]);
} 
  else {
    patchedList.push(formValue);
    console.log("➕ Added new nominee:", formValue);
  }

  console.log(patchedList, 'stored data after update');

  // 🔹 Only keep nominees of this client
  const updatedClientNominees = patchedList.filter((n: { clieCode: string | null; }) => n.clieCode === clientCode);

  if (updatedClientNominees.length > 3) {
    this.sharedService.OpenAlert('You can only add up to 3 nominee details!', () => {
      this.router.navigate(['/app/uccList']
        ,{
           state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
        }
      );
    });
    return;
  }

  // 🔹 Save back
  // localStorage.setItem('getNomineekList', JSON.stringify(patchedList));
  console.log(updatedClientNominees, 'updated nominee list');

  // 🔹 Map for API
  // const listToMap = updatedClientNominees;
    const listToMap = patchedList.length === 0 ? patchedList : updatedClientNominees;

  const nomineeInput: uccNomineeDetails = this.mapFormToNomineeDetails(listToMap, clientCode);

  this.bseUccSer.getUccNomineeData(nomineeInput).subscribe({
    next: (response: { success: boolean; message: string }) => {
      console.log('Nominee API Response:', response);
      if (response.success) {
        this.sharedService.OpenAlert(response.message, () => {
          this.router.navigate(['/app/uccList']
            ,{
               state: {
          isAddNewNomiInNomiList: true,
          clieCodeFromAddNomi: clientCode
        }
            }
          );
        });
      } else {
        this.sharedService.OpenAlert('Failed to save nominee details.');
      }
    },
    error: (err: any) => {
      console.error('Nominee API Error:', err);
      this.sharedService.OpenAlert('Something went wrong while saving nominee details.');
    }
  });
}


  allowOnlyChars(event: any, controlName: string) {
  const input = event.target as HTMLInputElement;

  // Allow only alphabets and spaces
  input.value = input.value.replace(/[^A-Za-z ]/g, '');

  this.nomineeForm.get(controlName)?.setValue(input.value, { emitEvent: false });
}

  allowOnlyNumbers(event: any, controlName: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // Remove non-numeric
    this.nomineeForm.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  allowAlphaNumeric(event: any, controlName: string) {
  const input = event.target as HTMLInputElement;

  // Allow only alphabets and numbers
  input.value = input.value.replace(/[^A-Za-z0-9]/g, '');

  this.nomineeForm.get(controlName)?.setValue(input.value, { emitEvent: false });
}

goBack(){
  this.location.back();
}



}
