import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { HttpClient } from '@angular/common/http';
import { UccMemberInfo } from '../../models/bseUCCModel';
import { DepoBankDetail } from '../depo-bank-detail/depo-bank-detail';
import { NomineeDetail } from '../nominee-detail/nominee-detail';
import { Shared } from '../../../shared/services/shared';
import { KycDetailsComponent } from '../kyc-details/kyc-details.component';
import { UccTabs } from '../ucc-tabs/ucc-tabs';
import { Location } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, map, of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { AddressDetails } from '../address-details/address-details';
import { SharedEnv } from '../../../shared/environments/environment';
import { Sso } from '../../../shared/components/sso/sso';



@Component({
  selector: 'app-bse-registerinvestors',
  standalone: true,
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
    SelectButton, InputTextModule, MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, ProgressBarModule, AutoCompleteModule],
  templateUrl: './bse-registerinvestors.html',
  styleUrls: ['./bse-registerinvestors.scss'],
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
export class BseRegisterinvestors {
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private location: Location, private sharedService: Shared, private router: Router, private bseUCCService: BseUCCRegister) {
    console.log('✅ BseRegisterinvestorsComponent loaded');
  }


  taxStatusList = [
    { value: '01', label: 'Individual' },
    // { value: '02', label: 'On behalf of minor' },
    // { value: '03', label: 'HUF' },
    // { value: '04', label: 'Company' },
    // { value: '13', label: 'Sole Proprietorship' },
    // { value: '21', label: 'NRE' },
    // { value: '24', label: 'NRO' },
    // { value: '26', label: 'NRI - MINOR' },
    // { value: '27', label: 'NRI - HUF' }
  ];

  //   taxStatusList = [
  //   // { value: '0', label: 'Select' },
  //   { value: 'Individual', label: 'Individual' },
  //   { value: 'On behalf of minor', label: 'On behalf of minor' },
  //   { value: 'HUF', label: 'HUF' },
  //   { value: 'Company', label: 'Company' },
  //   { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  //   { value: 'NRE', label: 'NRE' },
  //   { value: 'NRO', label: 'NRO' },
  //   { value: 'NRI - MINOR', label: 'NRI - MINOR' },
  //   { value: 'NRI - HUF', label: 'NRI - HUF' }
  // ];

  holdingPatternList = [
    // { value: '0', label: 'Select' },
    { value: 'SI', label: 'Single' },
    { value: 'JO', label: 'Joint' },
    { value: 'AS', label: 'Anyone or Survivor' }
  ];

  kycTypeOptions = [
    { key: 'B', value: 'BIOMETRIC KYC' },
    // { key: 'C', value: 'CKYC Compliant' },
    { key: 'E', value: 'Aadhhaar EKYC PAN' },
    { key: 'K', value: 'KRA Compliant' }
  ];

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

  countryList = [
    // { key: '', value: '-- Select --' },
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

  emailDeclarationOptions = [
    // { key: '0', value: 'Select Declaration' },
    { key: 'SE', value: 'SE - Self' },
    { key: 'SP', value: 'SP - Spouse' },
    { key: 'DC', value: 'DC - Dependent Children' },
    { key: 'DS', value: 'DS - Dependent Siblings' },
    { key: 'DP', value: 'DP - Dependent Parents' },
    { key: 'GD', value: 'GD - Guardian' },
    { key: 'PM', value: 'PM - PMS' },
    { key: 'CD', value: 'CD - Custodian' },
    { key: 'PO', value: 'PO – POA' }
  ];

  mobileDeclarationOptions = [
    // { key: '0', value: 'Select' },
    { key: 'SE', value: 'SE - Self' },
    { key: 'SP', value: 'SP - Spouse' },
    { key: 'DC', value: 'DC - Dependent Children' },
    { key: 'DS', value: 'DS - Dependent Siblings' },
    { key: 'DP', value: 'DP - Dependent Parents' },
    { key: 'GD', value: 'GD - Guardian' },
    { key: 'PM', value: 'PM - PMS' },
    { key: 'CD', value: 'CD - Custodian' },
    { key: 'PO', value: 'PO – POA' }
  ];

  // Applicant count mapping for holding patterns
  applicantCountByHoldingPattern: { [key: string]: number } = {
    'SI': 1,  // Single - 1 applicant
    'JO': 2,  // Joint - 2 applicants
    'AS': 3   // Anyone or Survivor - 3 applicants
  };

  occupationList = [
    // { key: '0', value: 'Select' },
    { key: '04', value: 'Agriculture' },
    { key: '01', value: 'Business' },
    { key: '06', value: 'Housewife' },
    { key: '03', value: 'Professional' },
    { key: '05', value: 'Retired' },
    { key: '02', value: 'Services' },
    { key: '07', value: 'Student' },
    { key: '41', value: 'Private Sector Service' },
    { key: '42', value: 'Public Sector/Government Service' },
    { key: '43', value: 'Forex Dealer' },
    { key: '09', value: 'Not Specified' },
    { key: '08', value: 'Others' }
  ];

  registrationTypeOptions = [
    { label: 'New', value: 'New', disabled: false },
    { label: 'Mod', value: 'Mod', disabled: false },
    // { label: 'Nom', value: 'Nom', disabled: false },
  ];


  today!: string;
  isEditMode = false;
  isEdit: boolean = false;
  editMode: boolean = false;
  memberID!: string;
  selectedTabIndex = 1;   // default tab
  selectedMemberId = '';
  selectedGrp: string = '';
  filteredMembers: any[] = [];
  registrationForm!: FormGroup;
  memberList: any[] = [];
  fullMemberData: any[] = [];
  groupList: any[] = [];
  filteredGroups: any[] = [];
  isSelectingGroup = false;
  groupLookupError: string | null = null;
  isGroupLookupLoading = false;
  applicants: any[] = [];  // Array to hold applicant data
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
      holdingPattern: ['SI', Validators.required],
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
      gender: ['', Validators.required],
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


      // 2nt Applicant Section
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

      // 2nt Applicant Section
      firstName_3: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        Validators.minLength(2),
        Validators.maxLength(25)]],
      middleName_3: ['',
        [
          Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
          Validators.minLength(1),
          Validators.maxLength(25)]],
      lastName_3: ['',
        [Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/), // ✅ only letters + spaces
        Validators.minLength(2),
        Validators.maxLength(25)]],
      pan_3: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      gender_3: ['', Validators.required],
      dob_3: ['', [Validators.required, this.minimumAgeValidator(18)]],

      occupation_3: ['', Validators.required],
      mobile_3: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ])],
      mobileDeclaration_3: ['', Validators.required],
      email_3: ['', Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ])],

      emailDeclaration_3: ['', Validators.required],
      kycType_3: ['K', Validators.required],
    });
    this.getGroupByLogin();

    // Listen to holding pattern changes and update applicants
    this.registrationForm.get('holdingPattern')?.valueChanges.subscribe(() => {
      this.updateApplicantsForHoldingPattern();
    });

    // Initialize applicants array on form creation
    this.updateApplicantsForHoldingPattern();

    // when back btn clicked then only show this
    // const saved = localStorage.getItem('uccRegistrationData');
    // if (saved) {
    //   this.registrationForm.patchValue(JSON.parse(saved));
    // }

    // Member details will be fetched when a group is selected
    //  let groupmemb=JSON.parse(localStorage.getItem('GetGroupMembers_TTL')).httpResponse.body.GroupMembers;
    //   this.memberList = groupmemb;
    //   console.log(this.memberList, 'memberList');

    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0]; // yyyy-mm-dd

    const randomTenDigitNumber = this.generateTenDigitCode();
    this.registrationForm.get('bseClientCode')?.setValue(randomTenDigitNumber.toString());
    console.log(randomTenDigitNumber, 'randomTenDigitNumber');

    //      const savedData = localStorage.getItem('selectedMemberData');
    // if (savedData) {
    //   const parsedData = JSON.parse(savedData);
    //   this.registrationForm.patchValue(parsedData);
    // }


    const navState = history.state;
    this.isEdit = navState?.isEdit === true;

    console.log(this.isEdit, 'isEdit');

    if (this.isEdit) {
      this.isEditData();
    }
    // this.isEditData();
    this.updateFormControlsBasedOnEditMode();
    // set edit-mode flag and update registration type options accordingly
    this.isEditMode = this.isEdit;
    this.updateRegistrationTypeOptions();
    this.registrationForm.get('memberName')?.valueChanges.subscribe(() => {
      this.updateBSEClientCode();
    });

  }


  // tabRoutes: { [key: number]: string } = {
  //   0: 'BseRegisterinvestors',
  //   1: 'addressDetails',
  //   2: 'kycDetails',
  //   3: 'depoBankDetails',
  //   4: 'nomineeDetails'
  // };

  // navigate(index: number) {
  //   console.log('Selected Tab:', index);
  //   const route = this.tabRoutes[index];

  //   if (route) {
  //     this.router.navigate([route]);
  //   } else {
  //     console.warn("No route found for index", index);
  //   }
  // }



  goToNextTab() {
    console.log(this.registrationForm.value, 'registration form');
    console.log('method called');


    // if (this.registrationForm.invalid) {
    //   this.registrationForm.markAllAsTouched();
    //   return;
    // }
    // this.nextTab.emit(1);  // navigate to tab index 1
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
        //  let groupmemb=JSON.parse(localStorage.getItem('GetGroupMembers_TTL')).httpResponse.body.GroupMembers;
        // this.memberList = groupmemb;
        // console.log(this.memberList, 'memberList');
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
    this.isEdit = history.state?.isEdit === true;
    console.log(this.isEdit, 'isEdit');

    if (history.state?.uccDetails) {
      this.editMode = true;
      const navState = history.state;
      console.log(navState, 'nav state');

      const ucc = navState.uccDetails[0];
      this.memberID = ucc.MembID;
      console.log(ucc, this.memberID, 'nav state and memberId');
      console.log(ucc.cliecode, 'edited clie code');
      localStorage.setItem('editedBseClientCode', ucc.cliecode);

      const matchedMember = this.memberList.find(x => x.memberName === ucc.memberDetails);

      const nameParts = this.splitFullName(ucc.fullname);


      this.registrationForm.patchValue({
        bseClientCode: ucc.cliecode?.trim() || '',
        // memberName: ucc.fullname?.trim() || '',
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
      console.log(this.registrationForm.value, 'patched value');
    }

    else if (localStorage.getItem('uccRegistrationData')) {

      // const uccList = JSON.parse(localStorage.getItem('uccRegistrationData'));
      const uccList = JSON.parse(localStorage.getItem('uccRegistrationData') || '[]');

      const ucc = uccList[0]; // 
      console.log(ucc, 'parsedData from localStorage');

      this.registrationForm.patchValue({
        bseClientCode: ucc?.cliecode?.trim() || '',
        memberName: ucc.memberName?.trim() || ucc.fullname?.trim() || '',
        dob: this.formatDateForInput(ucc.ClieDOB) || '',
        pan: ucc.pan?.trim() || ucc.CliePAN?.trim() || '',
        occupation: ucc.OccuCode?.trim() || '',
        mobile: ucc.Mobil?.trim() || '',
        mobileDeclaration: ucc.Filler1 || '',
        email: ucc.Email?.trim() || '',
        emailDeclaration: ucc.Filler2 || '',
        taxStatus: ucc.taxStatus || ucc.TaxStatus || '',
        holdingPattern: ucc.holdingPattern || ucc.HoldID || '',
        kycType: ucc.PH_KYCType || '',
        nominationOpted: ucc.NomiOpt || '',
        nominationAuthentication: ucc.NomiAuthMode || '',
      });

    }
    else {
      const randomTenDigitNumber = this.generateTenDigitCode();
      this.registrationForm.get('bseClientCode')?.setValue(randomTenDigitNumber.toString());
      console.log(randomTenDigitNumber, 'randomTenDigitNumber');
    }
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
      console.log(newCode, 'randomTenDigitNumber');
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
      registrationType: this.isEditMode ? 'Mod' : 'New',
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

  private ensureDisabledControls(): void {
    ['taxStatus', 'holdingPattern'].forEach(controlName => {
      const control = this.registrationForm.get(controlName);
      if (control) {
        control.disable({ emitEvent: false });
      }
    });
  }

  private resetFormToDefaults(preserve: Partial<Record<string, any>> = {}): void {
    if (!this.registrationForm) {
      return;
    }

    const defaults = this.buildFormDefaults(preserve);
    this.registrationForm.reset({}, { emitEvent: false });
    this.registrationForm.patchValue(defaults, { emitEvent: false });

    // Re-disable nominationOpted after patching values
    // this.registrationForm.get('nominationOpted')?.disable({ emitEvent: false });

    // this.ensureDisabledControls();
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

  onMemberDropdownClick(): void {
    if (!this.registrationForm.get('groupId')?.value) {
      this.filteredMembers = [];
      return;
    }

    this.filteredMembers = this.sortMembers(this.memberList);
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
    if (!this.isEditMode) {
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

    // const input = {
    //   lookUpID: this.selectedGrp,
    //   lookUpDescription: this.getSelectedGroupDescription()
    // };
    // let resSelectedGroupID = localStorage.getItem('resSelectedGroupID');

    // const input = {
    //   GroupID: resSelectedGroupID
    // };

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

  setupSearch() {
    this.registrationForm.get('memberSearch')?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        const hadSelection = !!this.registrationForm.get('memberName')?.value;

        if (hadSelection) {
          this.selectedMemberId = '';
          this.resetFormToDefaults({
            groupId: this.selectedGrp,
            groupSearch: this.getSelectedGroupDescription(),
            memberSearch: value
          });
          localStorage.removeItem('selectedMemberData');
        }

        if (!trimmed) {
          this.filteredMembers = [];
        }
      }
    });
  }

  private sortMembers(list: any[]) {
    return [...(list || [])].sort((a, b) =>
      (a?.LookUpDescription || '').localeCompare(b?.LookUpDescription || '', undefined, { sensitivity: 'base' })
    );
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
      localStorage.setItem('selectedMemberData', JSON.stringify(selectedMember));
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

    // // Mark all controls as touched + dirty
    // Object.keys(this.registrationForm.controls).forEach(field => {
    //   const control = this.registrationForm.get(field);
    //   control?.markAsTouched();
    //   control?.markAsDirty();
    //   control?.updateValueAndValidity(); // 🔁 Trigger validation
    // });


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

  submitDataandContinue() {
    console.log('method called');
    console.log(this.registrationForm.value, 'registration form');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    console.log('method called');

    const rawFormValue = this.registrationForm.getRawValue();
    // rawFormValue.dob = this.formatDateToDDMMYYYY(rawFormValue.dob);
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


    const input: UccMemberInfo = this.mapFormToUccMemberInfo(rawFormValue);
    console.log(input, 'input of registration');

    if (this.isEdit && this.memberID) {
      input.membID = Number(this.memberID);
    }
    console.log(this.memberID, 'memb id');
    console.log(input, 'edited input');

    const storedData = localStorage.getItem('uccRegistrationData');
    const parsedData = storedData ? JSON.parse(storedData) : null;

    const bseClieCode = parsedData?.bseClientCode || '';
    console.log('BSE Client Code:', bseClieCode);

    this.isLoading = true;

    this.bseUCCService.getUccRegisterData(input).subscribe({
      next: (response: { success: boolean; message: string }) => {
        console.log('API Response:', response);
        this.isLoading = false;
        if (response.success) {
          this.sharedService.successDia(response.message).subscribe(result => {
            if (result) {   // result === true when OK clicked
              // Pass state with tab navigation
              this.nextTab.emit({
                index: 1,
                state: {
                  isUpdate: false,
                  MembID: input.membID || null,
                  clieCode: bseClieCode || ''
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

  updateDataandContinue() {
    console.log('method called');
    console.log(this.registrationForm.value, 'registration form');

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    console.log('method called');

    const rawFormValue = this.registrationForm.getRawValue();
    // rawFormValue.dob = this.formatDateToDDMMYYYY(rawFormValue.dob);
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
            if (result) {   // result === true when OK clicked
              // Pass state with tab navigation for update mode
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

  navigateToList() {
    this.router.navigate(['/app/registerdList']);
  }

  goBack() {
    this.location.back();
    const saved = localStorage.getItem('uccRegistrationData');
    if (saved) {
      this.registrationForm.patchValue(JSON.parse(saved));
    }
  }

  get getIfaEmailIdFromLocalStorage() {
    const ifaDetails = SharedEnv.IFAEmailId;
    console.log(ifaDetails, 'ifa details');
    console.log(SharedEnv.IFAEmailId, 'IFA Email ID from local storage');
    return ifaDetails;
  }

  getGroupByLogin() {
    const ifaEmailId = this.getIfaEmailIdFromLocalStorage;

    const input = {
      loginId: ifaEmailId,
    };

    this.groupLookupError = null;
    this.isGroupLookupLoading = true;

    this.bseUCCService.getGroupByLogin(input).subscribe({
      next: (res: any) => {
        this.isGroupLookupLoading = false;
        console.log(res, 'group by login response');

        // Handle both array and single object responses
        let groupsArray: any[] = [];

        if (Array.isArray(res)) {
          groupsArray = res;
        } else if (res && typeof res === 'object' && res.lookUpID && res.lookUpDescription) {
          // Single group object - wrap in array
          groupsArray = [res];
        } else if (res?.data && Array.isArray(res.data)) {
          groupsArray = res.data;
        }

        const hasData = groupsArray.length > 0;

        if (hasData) {
          localStorage.setItem('GroupByLogin_TTL', JSON.stringify(groupsArray));

          // Transform groups array - use lookUpDescription directly
          this.groupList = groupsArray.map((group: any) => ({
            GroupID: group.lookUpID,
            GroupDescription: group.lookUpDescription || ''
          }));

          this.filteredGroups = [...this.groupList];
          this.groupLookupError = null;
          console.log(this.groupList, '✅ Group list loaded');
        } else {
          console.warn('⚠️ Unexpected response format:', res);
          this.groupList = [];
          this.filteredGroups = [];
          const message = res?.message || 'Unable to fetch group codes. Please try again in a moment.';
          this.groupLookupError = message;
          this.sharedService.OpenAlert(message);
        }
      },
      error: (err) => {
        this.isGroupLookupLoading = false;
        console.error('❌ API Error:', err);
        this.groupList = [];
        this.filteredGroups = [];
        const message = err?.error?.message || err?.message || 'Unable to fetch group codes. Please try again in a moment.';
        this.groupLookupError = message;
        this.sharedService.OpenAlert(message);
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

  // Create form group for individual applicant
  createApplicantFormGroup(): FormGroup {
    return this.fb.group({
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
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      gender: ['', Validators.required],
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
      emailDeclaration: ['', Validators.required]
    });
  }

  // Get applicant label (1st Applicant, 2nd Applicant, etc.)
  getApplicantLabel(index: number): string {
    const labels = ['1st Applicant', '2nd Applicant', '3rd Applicant'];
    return labels[index] || `${index + 1}th Applicant`;
  }

  // Update applicants based on holding pattern
  updateApplicantsForHoldingPattern(): void {
    const holdingPattern = this.registrationForm.get('holdingPattern')?.value;
    const applicantCount = this.applicantCountByHoldingPattern[holdingPattern] || 1;

    // Update the applicants array
    this.applicants = Array.from({ length: applicantCount }, (_, i) => ({
      index: i,
      label: this.getApplicantLabel(i),
      formGroup: this.createApplicantFormGroup()
    }));

    console.log(`Holding Pattern: ${holdingPattern}, Applicant Count: ${applicantCount}`, this.applicants);
  }

}

