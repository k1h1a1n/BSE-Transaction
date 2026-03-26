import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { tap, filter, switchMap, catchError, of } from 'rxjs';
import { fatcaRegInput, fatcaSavedDetails, fatcaSubtobBseInput } from '../../models/bseUCCModel';
import { BseUCCRegister } from '../../../shared/services/bse-uccregister';
import { Shared } from '../../../shared/services/shared';
import { COUNTRY_LIST, COUNTRY_TaxRes_LIST } from '../../components/address-details/country-list';

@Component({
  selector: 'app-fatca',
    imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule,
       InputTextModule,MatDividerModule, MatListModule, MatTableModule,  MatRadioModule, MatTabsModule, MatCheckboxModule, MatFormFieldModule, MatSelectModule,
           MatOptionModule, ProgressBarModule],
  templateUrl: './fatca.html',
  styleUrl: './fatca.scss',
})
export class Fatca {

  activeTab: number = 0;
  fatcaForm!: FormGroup;
  requiresLogName: boolean = false;
  isLoading: boolean = false; // ✅ Progress bar flag

  taxStatusList = [
    { code: "01", label: "Individual" },
    // { code: "02", label: "On Behalf Of Minor" },
    // { code: "03", label: "HUF" },
    // { code: "04", label: "Company" },
    // { code: "05", label: "AOP/BOI" },
    // { code: "06", label: "Partnership Firm" },
    // { code: "07", label: "Body Corporate" },
    // { code: "08", label: "Trust" },
    // { code: "09", label: "Society" },
    // { code: "10", label: "Others" },
    // { code: "11", label: "NRI-Others" },
    // { code: "12", label: "Banks / Financial Institutions" },
    // { code: "13", label: "Sole Proprietorship" },
    // { code: "14", label: "Banks" },
    // { code: "15", label: "Association of Persons" },
    // { code: "21", label: "NRI - NRE (Repatriation)" },
    // { code: "22", label: "Overseas Corporate Body" },
    // { code: "23", label: "Foreign Institutional Investor" },
    // { code: "24", label: "NRI - NRO [Non Repatriation]" },
    // { code: "25", label: "Overseas Corporate Body-Others" },
    // { code: "26", label: "NRI - Minor (NRE)" },
    // { code: "27", label: "NRI-HUF(NRO)" },
    // { code: "28", label: "NRI - Minor (NRO)" },
    // { code: "29", label: "NRI-HUF(NRE)" },
    // { code: "31", label: "Provident Fund / EPF / PF Trust" },
    // { code: "32", label: "Superannuation" },
    // { code: "33", label: "Gratuity Fund" },
    // { code: "34", label: "Pension and Retirement Fund" },
    // { code: "36", label: "Mutual Funds FOF Schemes" },
    // { code: "37", label: "NPS Trust" },
    // { code: "38", label: "Global Development Network" },
    // { code: "39", label: "FCRA" },
    // { code: "41", label: "Qualified Foreign Investor-Individual" },
    // { code: "42", label: "Qualified Foreign Investor-Minors" },
    // { code: "43", label: "Qualified Foreign Investor-Corporate" },
    // { code: "44", label: "Qualified Foreign Investor-Pension Fund" },
    // { code: "45", label: "Qualified Foreign Investor-Hedge Funds" },
    // { code: "46", label: "Qualified Foreign Investor-Mutual Funds" },
    // { code: "47", label: "Limited Liability Partnership" },
    // { code: "48", label: "Non-Profit organization [NPQ]" },
    // { code: "51", label: "Public Limited Company" },
    // { code: "52", label: "Private Limited Company" },
    // { code: "53", label: "Unlisted Company" },
    // { code: "54", label: "Mutual Funds" },
    // { code: "55", label: "FPI - Category I" },
    // { code: "56", label: "FPI - Category II" },
    // { code: "57", label: "FPI - Category III" },
    // { code: "58", label: "Financial Institutions" },
    // { code: "59", label: "Body of Individuals" },
    // { code: "60", label: "Insurance Company" },
    // { code: "61", label: "OCI - Repatriation" },
    // { code: "62", label: "OCI - Non Repatriation" },
    // { code: "70", label: "Person of Indian Origin [PIO]" },
    // { code: "72", label: "Government Body" },
    // { code: "73", label: "Defence Establishment" },
    // { code: "74", label: "Non-Government Organisation [NGO]" },
    // { code: "75", label: "Artificial Juridical Person" },
    // { code: "76", label: "Trust - Liquidator" }
  ];

  dataSourceList: any[] = [
    { code: "P", label: "Physical" },
    { code: "E", label: "Electronically" }

  ];

InvestorTypeList: any[] = [
  { code: "Individual", label: "Individual" },
  // { code: "Non Individual", label: "Non Individual" }
];

  // countryBirthNationalityList: any[] = [

  //   { code: "AD", label: "Andorra" },
  //   { code: "AE", label: "United Arab Emirates" },
  //   { code: "AF", label: "Afghanistan" },
  //   { code: "AG", label: "Antigua And Barbuda" },
  //   { code: "AI", label: "Anguilla" },
  //   { code: "AL", label: "Albania" },
  //   { code: "AM", label: "Armenia" },
  //   { code: "AN", label: "Netherlands Antilles" },
  //   { code: "AO", label: "Angola" },
  //   { code: "AQ", label: "Antarctica" },
  //   { code: "AR", label: "Argentina" },
  //   { code: "AS", label: "American Samoa" },
  //   { code: "AT", label: "Austria" },
  //   { code: "AU", label: "Australia" },
  //   { code: "AW", label: "Aruba" },
  //   { code: "AX", label: "Aland Islands" },
  //   { code: "AZ", label: "Azerbaijan" },
  //   { code: "BA", label: "Bosnia And Herzegovina" },
  //   { code: "BB", label: "Barbados" },
  //   { code: "BD", label: "Bangladesh" },
  //   { code: "BE", label: "Belgium" },
  //   { code: "BF", label: "Burkina Faso" },
  //   { code: "BG", label: "Bulgaria" },
  //   { code: "BH", label: "Bahrain" },
  //   { code: "BI", label: "Burundi" },
  //   { code: "BJ", label: "Benin" },
  //   { code: "BL", label: "Saint Barthelemy" },
  //   { code: "BM", label: "Bermuda" },
  //   { code: "BN", label: "Brunei Darussalam" },
  //   { code: "BO", label: "Bolivia" },
  //   { code: "BQ", label: "Bonaire, Sint Eustatius And Saba" },
  //   { code: "BR", label: "Brazil" },
  //   { code: "BS", label: "Bahamas" },
  //   { code: "BT", label: "Bhutan" },
  //   { code: "BV", label: "Bouvet Island" },
  //   { code: "BW", label: "Botswana" },
  //   { code: "BY", label: "Belarus" },
  //   { code: "BZ", label: "Belize" },
  //   { code: "CA", label: "Canada" },
  //   { code: "CC", label: "Cocos (Keeling) Islands" },
  //   { code: "CD", label: "Congo, The Democratic Republic Of The" },
  //   { code: "CF", label: "Central African Republic" },
  //   { code: "CG", label: "Congo" },
  //   { code: "CH", label: "Switzerland" },
  //   { code: "CI", label: "Côte D'Ivoire" },
  //   { code: "CK", label: "Cook Islands" },
  //   { code: "CL", label: "Chile" },
  //   { code: "CM", label: "Cameroon" },
  //   { code: "CN", label: "China" },
  //   { code: "CO", label: "Colombia" },
  //   { code: "CR", label: "Costa Rica" },
  //   { code: "CU", label: "Cuba" },
  //   { code: "CV", label: "Cape Verde" },
  //   { code: "CW", label: "Curacao" },
  //   { code: "CX", label: "Christmas Island" },
  //   { code: "CY", label: "Cyprus" },
  //   { code: "CZ", label: "Czech Republic" },
  //   { code: "DE", label: "Germany" },
  //   { code: "DJ", label: "Djibouti" },
  //   { code: "DK", label: "Denmark" },
  //   { code: "DM", label: "Dominica" },
  //   { code: "DO", label: "Dominican Republic" },
  //   { code: "DZ", label: "Algeria" },
  //   { code: "EC", label: "Ecuador" },
  //   { code: "EE", label: "Estonia" },
  //   { code: "EG", label: "Egypt" },
  //   { code: "EH", label: "Western Sahara" },
  //   { code: "ER", label: "Eritrea" },
  //   { code: "ES", label: "Spain" },
  //   { code: "ET", label: "Ethiopia" },
  //   { code: "FI", label: "Finland" },
  //   { code: "FJ", label: "Fiji" },
  //   { code: "FK", label: "Falkland Islands (Malvinas)" },
  //   { code: "FM", label: "Micronesia, Federated States Of" },
  //   { code: "FO", label: "Faroe Islands" },
  //   { code: "FR", label: "France" },
  //   { code: "GA", label: "Gabon" },
  //   { code: "GB", label: "United Kingdom" },
  //   { code: "GD", label: "Grenada" },
  //   { code: "GE", label: "Georgia" },
  //   { code: "GF", label: "French Guiana" },
  //   { code: "GG", label: "Guernsey" },
  //   { code: "GH", label: "Ghana" },
  //   { code: "GI", label: "Gibraltar" },
  //   { code: "GL", label: "Greenland" },
  //   { code: "GM", label: "Gambia" },
  //   { code: "GN", label: "Guinea" },
  //   { code: "GP", label: "Guadeloupe" },
  //   { code: "GQ", label: "Equatorial Guinea" },
  //   { code: "GR", label: "Greece" },
  //   { code: "GS", label: "South Georgia And The South Sandwich Islands" },
  //   { code: "GT", label: "Guatemala" },
  //   { code: "GU", label: "Guam" },
  //   { code: "GW", label: "Guinea-Bissau" },
  //   { code: "GY", label: "Guyana" },
  //   { code: "HK", label: "Hong Kong" },
  //   { code: "HM", label: "Heard Island And McDonald Islands" },
  //   { code: "HN", label: "Honduras" },
  //   { code: "HR", label: "Croatia" },
  //   { code: "HT", label: "Haiti" },
  //   { code: "HU", label: "Hungary" },
  //   { code: "ID", label: "Indonesia" },
  //   { code: "IE", label: "Ireland" },
  //   { code: "IL", label: "Israel" },
  //   { code: "IM", label: "Isle Of Man" },
  //   { code: "IN", label: "India" },
  //   { code: "IO", label: "British Indian Ocean Territory" },
  //   { code: "IQ", label: "Iraq" },
  //   { code: "IR", label: "Iran, Islamic Republic Of" },
  //   { code: "IS", label: "Iceland" },
  //   { code: "IT", label: "Italy" },
  //   { code: "JE", label: "Jersey" },
  //   { code: "JM", label: "Jamaica" },
  //   { code: "JO", label: "Jordan" },
  //   { code: "JP", label: "Japan" },
  //   { code: "KE", label: "Kenya" },
  //   { code: "KG", label: "Kyrgyzstan" },
  //   { code: "KH", label: "Cambodia" },
  //   { code: "KI", label: "Kiribati" },
  //   { code: "KM", label: "Comoros" },
  //   { code: "KN", label: "Saint Kitts And Nevis" },
  //   { code: "KP", label: "Korea, Democratic People's Republic Of" },
  //   { code: "KR", label: "Korea, Republic Of" },
  //   { code: "KW", label: "Kuwait" },
  //   { code: "KY", label: "Cayman Islands" },
  //   { code: "KZ", label: "Kazakhstan" },
  //   { code: "LA", label: "Lao People's Democratic Republic" },
  //   { code: "LB", label: "Lebanon" },
  //   { code: "LC", label: "Saint Lucia" },
  //   { code: "LI", label: "Liechtenstein" },
  //   { code: "LK", label: "Sri Lanka" },
  //   { code: "LR", label: "Liberia" },
  //   { code: "LS", label: "Lesotho" },
  //   { code: "LT", label: "Lithuania" },
  //   { code: "LU", label: "Luxembourg" },
  //   { code: "LV", label: "Latvia" },
  //   { code: "LY", label: "Libyan Arab Jamahiriya" },
  //   { code: "MA", label: "Morocco" },
  //   { code: "MC", label: "Monaco" },
  //   { code: "MD", label: "Moldova, Republic Of" },
  //   { code: "ME", label: "Montenegro" },
  //   { code: "MF", label: "Saint Martin" },
  //   { code: "MG", label: "Madagascar" },
  //   { code: "MH", label: "Marshall Islands" },
  //   { code: "MK", label: "Macedonia, The Former Yugoslav Republic Of" },
  //   { code: "ML", label: "Mali" },
  //   { code: "MM", label: "Myanmar" },
  //   { code: "MN", label: "Mongolia" },
  //   { code: "MO", label: "Macao" },
  //   { code: "MP", label: "Northern Mariana Islands" },
  //   { code: "MQ", label: "Martinique" },
  //   { code: "MR", label: "Mauritania" },
  //   { code: "MS", label: "Montserrat" },
  //   { code: "MT", label: "Malta" },
  //   { code: "MU", label: "Mauritius" },
  //   { code: "MV", label: "Maldives" },
  //   { code: "MW", label: "Malawi" },
  //   { code: "MX", label: "Mexico" },
  //   { code: "MY", label: "Malaysia" },
  //   { code: "MZ", label: "Mozambique" },
  //   { code: "NA", label: "Namibia" },
  //   { code: "NC", label: "New Caledonia" },
  //   { code: "NE", label: "Niger" },
  //   { code: "NF", label: "Norfolk Island" },
  //   { code: "NG", label: "Nigeria" },
  //   { code: "NI", label: "Nicaragua" },
  //   { code: "NL", label: "Netherlands" },
  //   { code: "NO", label: "Norway" },
  //   { code: "NP", label: "Nepal" },
  //   { code: "NR", label: "Nauru" },
  //   { code: "NU", label: "Niue" },
  //   { code: "NZ", label: "New Zealand" },
  //   { code: "OM", label: "Oman" },
  //   { code: "PA", label: "Panama" },
  //   { code: "PE", label: "Peru" },
  //   { code: "PF", label: "French Polynesia" },
  //   { code: "PG", label: "Papua New Guinea" },
  //   { code: "PH", label: "Philippines" },
  //   { code: "PK", label: "Pakistan" },
  //   { code: "PL", label: "Poland" },
  //   { code: "PM", label: "Saint Pierre And Miquelon" },
  //   { code: "PN", label: "Pitcairn" },
  //   { code: "PR", label: "Puerto Rico" },
  //   { code: "PS", label: "Palestinian Territory, Occupied" },
  //   { code: "PT", label: "Portugal" },
  //   { code: "PW", label: "Palau" },
  //   { code: "PY", label: "Paraguay" },
  //   { code: "QA", label: "Qatar" },
  //   { code: "RE", label: "Reunion Island" },
  //   { code: "RO", label: "Romania" },
  //   { code: "RS", label: "Serbia" },
  //   { code: "RU", label: "Russian Federation" },
  //   { code: "RW", label: "Rwanda" },
  //   { code: "SA", label: "Saudi Arabia" },
  //   { code: "SB", label: "Solomon Islands" },
  //   { code: "SC", label: "Seychelles" },
  //   { code: "SD", label: "Sudan" },
  //   { code: "SE", label: "Sweden" },
  //   { code: "SG", label: "Singapore" },
  //   { code: "SH", label: "Saint Helena, Ascension And Tristan da Cunha" },
  //   { code: "SI", label: "Slovenia" },
  //   { code: "SJ", label: "Svalbard And Jan Mayen Islands" },
  //   { code: "SK", label: "Slovakia" },
  //   { code: "SL", label: "Sierra Leone" },
  //   { code: "SM", label: "San Marino" },
  //   { code: "SN", label: "Senegal" },
  //   { code: "SO", label: "Somalia" },
  //   { code: "SR", label: "Suriname" },
  //   { code: "SS", label: "South Sudan" },
  //   { code: "ST", label: "Sao Tome And Principe" },
  //   { code: "SV", label: "El Salvador" },
  //   { code: "SX", label: "Sint Maarten (Dutch Part)" },
  //   { code: "SY", label: "Syrian Arab Republic" },
  //   { code: "SZ", label: "Swaziland" },
  //   { code: "TC", label: "Turks And Caicos Islands" },
  //   { code: "TD", label: "Chad" },
  //   { code: "TF", label: "French Southern Territories" },
  //   { code: "TG", label: "Togo" },
  //   { code: "TH", label: "Thailand" },
  //   { code: "TJ", label: "Tajikistan" },
  //   { code: "TK", label: "Tokelau" },
  //   { code: "TL", label: "Timor-Leste" },
  //   { code: "TM", label: "Turkmenistan" },
  //   { code: "TN", label: "Tunisia" },
  //   { code: "TO", label: "Tonga" },
  //   { code: "TR", label: "Turkey" },
  //   { code: "TT", label: "Trinidad And Tobago" },
  //   { code: "TV", label: "Tuvalu" },
  //   { code: "TW", label: "Taiwan, Province Of China" },
  //   { code: "TZ", label: "Tanzania, United Republic Of" },
  //   { code: "UA", label: "Ukraine" },
  //   { code: "UG", label: "Uganda" },
  //   { code: "UM", label: "United States Minor Outlying Islands" },
  //   { code: "US", label: "United States" },
  //   { code: "UY", label: "Uruguay" },
  //   { code: "UZ", label: "Uzbekistan" },
  //   { code: "VA", label: "Vatican City State" },
  //   { code: "VC", label: "Saint Vincent And The Grenadines" },
  //   { code: "VE", label: "Venezuela, Bolivarian Republic Of" },
  //   { code: "VG", label: "Virgin Islands, British" },
  //   { code: "VI", label: "Virgin Islands, U.S." },
  //   { code: "VN", label: "Viet Nam" },
  //   { code: "VU", label: "Vanuatu" },
  //   { code: "WF", label: "Wallis And Futuna" },
  //   { code: "WS", label: "Samoa" },
  //   { code: "XX", label: "Not categorised" },
  //   { code: "YE", label: "Yemen" },
  //   { code: "YT", label: "Mayotte" },
  //   { code: "ZA", label: "South Africa" },
  //   { code: "ZM", label: "Zambia" },
  //   { code: "ZW", label: "Zimbabwe" },
  //   { code: "ZZ", label: "Others" }

  // ];

 countryBirthNationalityList = COUNTRY_LIST
taxResList = COUNTRY_TaxRes_LIST

  // taxResList: any[] = [

  //   { code: "AD", label: "Andorra" },
  //   { code: "AE", label: "United Arab Emirates" },
  //   { code: "AF", label: "Afghanistan" },
  //   { code: "AG", label: "Antigua And Barbuda" },
  //   { code: "AI", label: "Anguilla" },
  //   { code: "AL", label: "Albania" },
  //   { code: "AM", label: "Armenia" },
  //   { code: "AN", label: "Netherlands Antilles" },
  //   { code: "AO", label: "Angola" },
  //   { code: "AQ", label: "Antarctica" },
  //   { code: "AR", label: "Argentina" },
  //   { code: "AS", label: "American Samoa" },
  //   { code: "AT", label: "Austria" },
  //   { code: "AU", label: "Australia" },
  //   { code: "AW", label: "Aruba" },
  //   { code: "AX", label: "Aland Islands" },
  //   { code: "AZ", label: "Azerbaijan" },
  //   { code: "BA", label: "Bosnia And Herzegovina" },
  //   { code: "BB", label: "Barbados" },
  //   { code: "BD", label: "Bangladesh" },
  //   { code: "BE", label: "Belgium" },
  //   { code: "BF", label: "Burkina Faso" },
  //   { code: "BG", label: "Bulgaria" },
  //   { code: "BH", label: "Bahrain" },
  //   { code: "BI", label: "Burundi" },
  //   { code: "BJ", label: "Benin" },
  //   { code: "BL", label: "Saint Barthelemy" },
  //   { code: "BM", label: "Bermuda" },
  //   { code: "BN", label: "Brunei Darussalam" },
  //   { code: "BO", label: "Bolivia" },
  //   { code: "BQ", label: "Bonaire, Sint Eustatius And Saba" },
  //   { code: "BR", label: "Brazil" },
  //   { code: "BS", label: "Bahamas" },
  //   { code: "BT", label: "Bhutan" },
  //   { code: "BV", label: "Bouvet Island" },
  //   { code: "BW", label: "Botswana" },
  //   { code: "BY", label: "Belarus" },
  //   { code: "BZ", label: "Belize" },
  //   { code: "CA", label: "Canada" },
  //   { code: "CC", label: "Cocos (Keeling) Islands" },
  //   { code: "CD", label: "Congo, The Democratic Republic Of The" },
  //   { code: "CF", label: "Central African Republic" },
  //   { code: "CG", label: "Congo" },
  //   { code: "CH", label: "Switzerland" },
  //   { code: "CI", label: "Côte D'Ivoire" },
  //   { code: "CK", label: "Cook Islands" },
  //   { code: "CL", label: "Chile" },
  //   { code: "CM", label: "Cameroon" },
  //   { code: "CN", label: "China" },
  //   { code: "CO", label: "Colombia" },
  //   { code: "CR", label: "Costa Rica" },
  //   { code: "CU", label: "Cuba" },
  //   { code: "CV", label: "Cape Verde" },
  //   { code: "CW", label: "Curacao" },
  //   { code: "CX", label: "Christmas Island" },
  //   { code: "CY", label: "Cyprus" },
  //   { code: "CZ", label: "Czech Republic" },
  //   { code: "DE", label: "Germany" },
  //   { code: "DJ", label: "Djibouti" },
  //   { code: "DK", label: "Denmark" },
  //   { code: "DM", label: "Dominica" },
  //   { code: "DO", label: "Dominican Republic" },
  //   { code: "DZ", label: "Algeria" },
  //   { code: "EC", label: "Ecuador" },
  //   { code: "EE", label: "Estonia" },
  //   { code: "EG", label: "Egypt" },
  //   { code: "EH", label: "Western Sahara" },
  //   { code: "ER", label: "Eritrea" },
  //   { code: "ES", label: "Spain" },
  //   { code: "ET", label: "Ethiopia" },
  //   { code: "FI", label: "Finland" },
  //   { code: "FJ", label: "Fiji" },
  //   { code: "FK", label: "Falkland Islands (Malvinas)" },
  //   { code: "FM", label: "Micronesia, Federated States Of" },
  //   { code: "FO", label: "Faroe Islands" },
  //   { code: "FR", label: "France" },
  //   { code: "GA", label: "Gabon" },
  //   { code: "GB", label: "United Kingdom" },
  //   { code: "GD", label: "Grenada" },
  //   { code: "GE", label: "Georgia" },
  //   { code: "GF", label: "French Guiana" },
  //   { code: "GG", label: "Guernsey" },
  //   { code: "GH", label: "Ghana" },
  //   { code: "GI", label: "Gibraltar" },
  //   { code: "GL", label: "Greenland" },
  //   { code: "GM", label: "Gambia" },
  //   { code: "GN", label: "Guinea" },
  //   { code: "GP", label: "Guadeloupe" },
  //   { code: "GQ", label: "Equatorial Guinea" },
  //   { code: "GR", label: "Greece" },
  //   { code: "GS", label: "South Georgia And The South Sandwich Islands" },
  //   { code: "GT", label: "Guatemala" },
  //   { code: "GU", label: "Guam" },
  //   { code: "GW", label: "Guinea-Bissau" },
  //   { code: "GY", label: "Guyana" },
  //   { code: "HK", label: "Hong Kong" },
  //   { code: "HM", label: "Heard Island And McDonald Islands" },
  //   { code: "HN", label: "Honduras" },
  //   { code: "HR", label: "Croatia" },
  //   { code: "HT", label: "Haiti" },
  //   { code: "HU", label: "Hungary" },
  //   { code: "ID", label: "Indonesia" },
  //   { code: "IE", label: "Ireland" },
  //   { code: "IL", label: "Israel" },
  //   { code: "IM", label: "Isle Of Man" },
  //   { code: "IN", label: "India" },
  //   { code: "IO", label: "British Indian Ocean Territory" },
  //   { code: "IQ", label: "Iraq" },
  //   { code: "IR", label: "Iran, Islamic Republic Of" },
  //   { code: "IS", label: "Iceland" },
  //   { code: "IT", label: "Italy" },
  //   { code: "JE", label: "Jersey" },
  //   { code: "JM", label: "Jamaica" },
  //   { code: "JO", label: "Jordan" },
  //   { code: "JP", label: "Japan" },
  //   { code: "KE", label: "Kenya" },
  //   { code: "KG", label: "Kyrgyzstan" },
  //   { code: "KH", label: "Cambodia" },
  //   { code: "KI", label: "Kiribati" },
  //   { code: "KM", label: "Comoros" },
  //   { code: "KN", label: "Saint Kitts And Nevis" },
  //   { code: "KP", label: "Korea, Democratic People's Republic Of" },
  //   { code: "KR", label: "Korea, Republic Of" },
  //   { code: "KW", label: "Kuwait" },
  //   { code: "KY", label: "Cayman Islands" },
  //   { code: "KZ", label: "Kazakhstan" },
  //   { code: "LA", label: "Lao People's Democratic Republic" },
  //   { code: "LB", label: "Lebanon" },
  //   { code: "LC", label: "Saint Lucia" },
  //   { code: "LI", label: "Liechtenstein" },
  //   { code: "LK", label: "Sri Lanka" },
  //   { code: "LR", label: "Liberia" },
  //   { code: "LS", label: "Lesotho" },
  //   { code: "LT", label: "Lithuania" },
  //   { code: "LU", label: "Luxembourg" },
  //   { code: "LV", label: "Latvia" },
  //   { code: "LY", label: "Libyan Arab Jamahiriya" },
  //   { code: "MA", label: "Morocco" },
  //   { code: "MC", label: "Monaco" },
  //   { code: "MD", label: "Moldova, Republic Of" },
  //   { code: "ME", label: "Montenegro" },
  //   { code: "MF", label: "Saint Martin" },
  //   { code: "MG", label: "Madagascar" },
  //   { code: "MH", label: "Marshall Islands" },
  //   { code: "MK", label: "Macedonia, The Former Yugoslav Republic Of" },
  //   { code: "ML", label: "Mali" },
  //   { code: "MM", label: "Myanmar" },
  //   { code: "MN", label: "Mongolia" },
  //   { code: "MO", label: "Macao" },
  //   { code: "MP", label: "Northern Mariana Islands" },
  //   { code: "MQ", label: "Martinique" },
  //   { code: "MR", label: "Mauritania" },
  //   { code: "MS", label: "Montserrat" },
  //   { code: "MT", label: "Malta" },
  //   { code: "MU", label: "Mauritius" },
  //   { code: "MV", label: "Maldives" },
  //   { code: "MW", label: "Malawi" },
  //   { code: "MX", label: "Mexico" },
  //   { code: "MY", label: "Malaysia" },
  //   { code: "MZ", label: "Mozambique" },
  //   { code: "NA", label: "Namibia" },
  //   { code: "NC", label: "New Caledonia" },
  //   { code: "NE", label: "Niger" },
  //   { code: "NF", label: "Norfolk Island" },
  //   { code: "NG", label: "Nigeria" },
  //   { code: "NI", label: "Nicaragua" },
  //   { code: "NL", label: "Netherlands" },
  //   { code: "NO", label: "Norway" },
  //   { code: "NP", label: "Nepal" },
  //   { code: "NR", label: "Nauru" },
  //   { code: "NU", label: "Niue" },
  //   { code: "NZ", label: "New Zealand" },
  //   { code: "OM", label: "Oman" },
  //   { code: "PA", label: "Panama" },
  //   { code: "PE", label: "Peru" },
  //   { code: "PF", label: "French Polynesia" },
  //   { code: "PG", label: "Papua New Guinea" },
  //   { code: "PH", label: "Philippines" },
  //   { code: "PK", label: "Pakistan" },
  //   { code: "PL", label: "Poland" },
  //   { code: "PM", label: "Saint Pierre And Miquelon" },
  //   { code: "PN", label: "Pitcairn" },
  //   { code: "PR", label: "Puerto Rico" },
  //   { code: "PS", label: "Palestinian Territory, Occupied" },
  //   { code: "PT", label: "Portugal" },
  //   { code: "PW", label: "Palau" },
  //   { code: "PY", label: "Paraguay" },
  //   { code: "QA", label: "Qatar" },
  //   { code: "RE", label: "Reunion Island" },
  //   { code: "RO", label: "Romania" },
  //   { code: "RS", label: "Serbia" },
  //   { code: "RU", label: "Russian Federation" },
  //   { code: "RW", label: "Rwanda" },
  //   { code: "SA", label: "Saudi Arabia" },
  //   { code: "SB", label: "Solomon Islands" },
  //   { code: "SC", label: "Seychelles" },
  //   { code: "SD", label: "Sudan" },
  //   { code: "SE", label: "Sweden" },
  //   { code: "SG", label: "Singapore" },
  //   { code: "SH", label: "Saint Helena, Ascension And Tristan da Cunha" },
  //   { code: "SI", label: "Slovenia" },
  //   { code: "SJ", label: "Svalbard And Jan Mayen Islands" },
  //   { code: "SK", label: "Slovakia" },
  //   { code: "SL", label: "Sierra Leone" },
  //   { code: "SM", label: "San Marino" },
  //   { code: "SN", label: "Senegal" },
  //   { code: "SO", label: "Somalia" },
  //   { code: "SR", label: "Suriname" },
  //   { code: "SS", label: "South Sudan" },
  //   { code: "ST", label: "Sao Tome And Principe" },
  //   { code: "SV", label: "El Salvador" },
  //   { code: "SX", label: "Sint Maarten (Dutch Part)" },
  //   { code: "SY", label: "Syrian Arab Republic" },
  //   { code: "SZ", label: "Swaziland" },
  //   { code: "TC", label: "Turks And Caicos Islands" },
  //   { code: "TD", label: "Chad" },
  //   { code: "TF", label: "French Southern Territories" },
  //   { code: "TG", label: "Togo" },
  //   { code: "TH", label: "Thailand" },
  //   { code: "TJ", label: "Tajikistan" },
  //   { code: "TK", label: "Tokelau" },
  //   { code: "TL", label: "Timor-Leste" },
  //   { code: "TM", label: "Turkmenistan" },
  //   { code: "TN", label: "Tunisia" },
  //   { code: "TO", label: "Tonga" },
  //   { code: "TR", label: "Turkey" },
  //   { code: "TT", label: "Trinidad And Tobago" },
  //   { code: "TV", label: "Tuvalu" },
  //   { code: "TW", label: "Taiwan, Province Of China" },
  //   { code: "TZ", label: "Tanzania, United Republic Of" },
  //   { code: "UA", label: "Ukraine" },
  //   { code: "UG", label: "Uganda" },
  //   { code: "UM", label: "United States Minor Outlying Islands" },
  //   { code: "US", label: "United States" },
  //   { code: "UY", label: "Uruguay" },
  //   { code: "UZ", label: "Uzbekistan" },
  //   { code: "VA", label: "Vatican City State" },
  //   { code: "VC", label: "Saint Vincent And The Grenadines" },
  //   { code: "VE", label: "Venezuela, Bolivarian Republic Of" },
  //   { code: "VG", label: "Virgin Islands, British" },
  //   { code: "VI", label: "Virgin Islands, U.S." },
  //   { code: "VN", label: "Viet Nam" },
  //   { code: "VU", label: "Vanuatu" },
  //   { code: "WF", label: "Wallis And Futuna" },
  //   { code: "WS", label: "Samoa" },
  //   { code: "XX", label: "Not categorised" },
  //   { code: "YE", label: "Yemen" },
  //   { code: "YT", label: "Mayotte" },
  //   { code: "ZA", label: "South Africa" },
  //   { code: "ZM", label: "Zambia" },
  //   { code: "ZW", label: "Zimbabwe" },
  //   { code: "ZZ", label: "Others" }

  // ];


  addressTypeOptions: any[] = [

    { code: "1", label: "Residential Or Business" },
    { code: "2", label: "Residential" },
    { code: "3", label: "Business" },
    { code: "4", label: "Registered Office" },
    { code: "5", label: "Unspecified" }
  ];


  idTypeList: any[] = [
    { code: "A", label: "Passport" },
    { code: "B", label: "Election ID Card" },
    { code: "C", label: "PAN Card" },
    { code: "D", label: "ID Card" },
    { code: "E", label: "Driving License" },
    { code: "G", label: "UIDIA / Aadhar letter" },
    { code: "H", label: "NREGA Job Card" },
    { code: "O", label: "Others" },
    { code: "X", label: "Not categorized" },
    { code: "T", label: "TIN [Tax Payer Identification Number]" },
    { code: "C1", label: "Company Identification Number" },
    { code: "G1", label: "US GIIN" },
    { code: "E1", label: "Global Entity Identification Number" }
  ];

  sourceOfWealthList: any[] = [
    { code: "1", label: "Salary" },
    { code: "2", label: "Business Income" },
    { code: "3", label: "Gift" },
    { code: "4", label: "Ancestral Property" },
    { code: "5", label: "Rental Income" },
    { code: "6", label: "Prize Money" },
    { code: "7", label: "Royalty" },
    { code: "8", label: "Others" }
  ];

  incomeList: any[] = [
    { code: "31", label: "Below 1 Lakh" },
    { code: "32", label: "> 1 <=5 Lacs" },
    { code: "33", label: ">5 <=10 Lacs" },
    { code: "34", label: ">10 <= 25 Lacs" },
    { code: "35", label: "> 25 Lacs <= 1 Crore" },
    { code: "36", label: "Above 1 Crore" }
  ];

  pepOptions = [
    { code: 'Y', label: 'Investor is politically exposed' },
    { code: 'N', label: 'Investor is not politically exposed' },
    { code: 'R', label: 'Investor is a relative of the politically exposed person' }
  ];

  occupationCodesList: any[] = [
    { code: "01", label: "Business" },
    { code: "02", label: "Service" },
    { code: "03", label: "Professional" },
    { code: "04", label: "Agriculturist" },
    { code: "05", label: "Retired" },
    { code: "06", label: "Housewife" },
    { code: "07", label: "Student" },
    { code: "08", label: "Others" },
    { code: "09", label: "Doctor" },
    { code: "41", label: "Private Sector Service" },
    { code: "42", label: "Public Sector Service" },
    { code: "43", label: "Forex Dealer" },
    { code: "44", label: "Government Service" },
    { code: "99", label: "Unknown / Not Applicable" }
  ];

  occupationTypeList: any[] = [
    { code: "B", label: "B-Business" },
    { code: "S", label: "S-Service" },
    { code: "O", label: "O-Others" },
    { code: "X", label: "X-Not Categorized" },
  ];


  exchangeNameList: any[] = [
    { code: "B", label: "B-BSE" },
    { code: "N", label: "N-NSE" },
    { code: "O", label: "O-Other" },
  ];

  UBOApplList: any[] = [
    // { code: 'Y', label: 'Yes' },
    { code: 'N', label: 'No' },
  ];

  SDFList: any[] = [
    { code: 'Y', label: 'Yes' },
    { code: 'N', label: 'No' },
  ];


  UBOdfList: any[] = [
    // { code: 'Y', label: 'Yes' },
    { code: 'N', label: 'No' },
  ];

  NewOrUpdateIndicatorList: any[] = [
    { code: 'N', label: 'New' },
    { code: 'C', label: 'Change' },
  ]

  isEdit: boolean = false;
  fatcaDetails: any;

  constructor(private fb: FormBuilder, private bseUccSer: BseUCCRegister, private sharedService: Shared, private router: Router) { }


  ngOnInit(): void {

    const navState = history.state;
    this.isEdit = navState?.isEdit === true;
    this.fatcaDetails = navState.fatcaDetails;

    console.log(navState, 'nav state from fatca');
    console.log(this.isEdit, this.fatcaDetails[0], 'isEdit', 'fatca Details');


    this.createFtcaForm();

     }


  createFtcaForm() {
    this.fatcaForm = this.fb.group({
      PAN_RP: ['',
        [Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],

      INV_NAME: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(70),
        Validators.pattern(/^[a-zA-Z .'-]+$/)
      ]],

      TAX_STATUS: ['01', Validators.required],
      DATA_SRC: ['', Validators.required],
      ADDR_TYPE: ['', Validators.required],
      PO_BIR_INC: ['', Validators.required],
      CO_BIR_INC: ['IND', Validators.required],
      TAX_RES1: ['IND', Validators.required],
      // Validators.minLength(20), Validators.maxLength(20)
      TPIN1: ['', [Validators.required]],
      ID1_TYPE: ['C', Validators.required],
      SRCE_WEALT: ['', Validators.required],
      INC_SLAB: ['', Validators.required],
      PEP_FLAG: ['', Validators.required],
      OCC_CODE: ['', Validators.required],
      OCC_TYPE: ['', Validators.required],
      EXCH_NAME: ['', Validators.required],
      UBO_APPL: ['N', Validators.required],
      SDF_FLAG: ['', Validators.required],
      UBO_DF: ['N', Validators.required],
      NewOrUpdateIndicator: ['', Validators.required],
      InvestorType: ['Individual', Validators.required],
      Log_Name: [''],

      // Conditionally required if PAN is missing
      DOB: [''],
      FR_NAME: [''],
      SP_NAME: ['']
    });



    // After you get this.fatcaDetails data from API or input
    if (this.fatcaDetails && this.fatcaDetails.length > 0) {
      const patchObject: any = {
        INV_NAME: this.fatcaDetails[0].fullname || '',
        PAN_RP: this.fatcaDetails[0].CliePAN || ''
      };

      // Set TPIN1 if ID1_TYPE is empty OR if user selected 'C' (PAN Card)
      const id1TypeValue = this.fatcaForm.get('ID1_TYPE')?.value;
      if (!id1TypeValue || id1TypeValue === 'C') {
        patchObject.TPIN1 = this.fatcaDetails[0].CliePAN || '';
        patchObject.PAN_RP = this.fatcaDetails[0].CliePAN || '';
      }

      this.fatcaForm.patchValue(patchObject);
      
      console.log(this.fatcaDetails[0].fullname, this.fatcaDetails[0].CliePAN, 'INV_NAME and TPIN1 from fatcaDetails');
    }



    // Watch DATA_SRC changes
    this.fatcaForm.get('DATA_SRC')?.valueChanges.subscribe(value => {
      const logNameControl = this.fatcaForm.get('Log_Name');
      this.requiresLogName = value === 'E';

      if (this.requiresLogName) {
        logNameControl?.setValidators([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30)
        ]);
      } else {
        logNameControl?.clearValidators();
        logNameControl?.setValue('', { emitEvent: false });
      }

      logNameControl?.updateValueAndValidity();
    });


    this.fatcaForm.get('PAN_RP')?.valueChanges.subscribe((pan) => {
      const hasPAN = !!pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
      this.setPanDependentValidators(!hasPAN);
    });

  }


  setPanDependentValidators(isPanMissing: boolean): void {
    const controls = ['DOB', 'FR_NAME', 'SP_NAME'];
    controls.forEach(control => {
      if (isPanMissing) {
        this.fatcaForm.get(control)?.setValidators([Validators.required]);
      } else {
        this.fatcaForm.get(control)?.clearValidators();
      }
      this.fatcaForm.get(control)?.updateValueAndValidity();
    });
  }


  FtcaReguiDet() {

    // Validate form before submission
    if (this.fatcaForm.invalid) {
      this.markFormGroupTouched(this.fatcaForm);
      console.error('Form is invalid');
      return;
    }

    const fatcaData = this.mapFormToFatca();
    console.log('Submitting FATCA data:', fatcaData);

    this.isLoading = true; // ✅ Show progress bar

    this.bseUccSer.ftcaRegi(fatcaData).subscribe({
      next: (res) => {
        this.isLoading = false; // ✅ Hide progress bar
        console.log('FATCA registration successful:', res);

        console.log(res.status, 'res status');
        console.log(res.message, 'res message');

        if (res.status === 'success') {
          this.sharedService.successDia(res?.message).subscribe(result => {
            if (result === true) {
              try {
                // Store FATCA data with member ID and status
                const fatcaStorageData = {
                  membId: fatcaData.membId,
                  status: 'Success'
                };
                localStorage.setItem('fatcaData', JSON.stringify(fatcaStorageData));
                localStorage.setItem('fatcaSuccessMessage', 'true'); // Keep for backward compatibility
                
                console.log('FATCA success data stored for member:', fatcaData.membId);
              } catch (error) {
                console.error('Failed to store FATCA success data:', error);
              }
              
              this.router.navigate(['/app/registerdList'],{
                state: { isFatcaSaved: true }
              });
              
            }
          });
        }
        else {
          this.sharedService.OpenAlert(res.message);
        }
      },
      error: (err) => {
        this.isLoading = false; // ✅ Hide progress bar on error
        console.error('FATCA registration failed:', err);
        this.sharedService.OpenAlert('Failed to save FATCA details. Please try again.');
      }
    });
  }

  // for editing data
  getFatcaSavedData(input: fatcaSavedDetails) {
    input = {
      membID: this.fatcaDetails[0].MembID,
    }
    this.bseUccSer.getFatcaSaveDetails(input).subscribe({
      next: (res) => {
        console.log(res, 'res of get ftaca saved details');
        this.fatcaValidateApi();
      },
      error: (err) => {
        console.log(err);

      }
    })
  }



 

  // fatcaValidateApi() {
  //   let input = {
  //     // taxStatus: this.fatcaForm.value.TAX_STATUS,
  //     // taxStatus: '01',
  //     taxStatus: this.fatcaForm.value.TAX_STATUS.toString().padStart(2, '0'), // "01" (string)
  //     panNumber: this.fatcaForm.value.PAN_RP
  //   }

  //   this.bseUccSer.fatcaValidateBeforeBSE(input).pipe(
  //     tap(res => console.log(res, 'res of mandatory fields check')),
  //     filter(res => res?.message === "All mandatory fields are present."),
  //     switchMap(() => {
  //       const savedInput = { membID: this.fatcaDetails[0].MembID };
  //       return this.bseUccSer.fatcaSaveToBse(savedInput);
  //     }),
  //     tap(res => this.sharedService.OpenAlert(res.remark, () => {
  //       this.router.navigate(['home/MFEntryForms/uccList']);
  //     }),
  //     ), // log save response

  //     catchError(err => {
  //       console.error(err);
  //       return of(null); // prevents observable from breaking
  //     })
  //   ).subscribe();

  // }


fatcaValidateApi() {
  const input = {
    taxStatus: this.fatcaForm.value.TAX_STATUS.toString().padStart(2, '0'),
    panNumber: this.fatcaForm.value.PAN_RP
  };

  this.bseUccSer.fatcaValidateBeforeBSE(input).pipe(

    tap(res => console.log('Validation Response:', res)),

    // ✔ Proceed only if mandatory fields are OK
    filter(res => res?.message === 'All mandatory fields are present.'),

    // ✔ Then call Save API
    switchMap(() => {
      const savedInput = { membID: this.fatcaDetails[0]?.MembID };
      return this.bseUccSer.fatcaSaveToBse(savedInput);
    }),

    // ✔ Handle Save Response
    tap(res => {
      console.log('SaveToBSE Response:', res);

      if (!res) {
        this.sharedService.openDialog('No response received from BSE.');
        return;
      }

      if (res.status === 1) {
        // ✅ Success
        this.sharedService.OpenAlert(
          res.responseMsg || 'FATCA details saved to BSE successfully.',
          () => this.router.navigate(['/app/registerdList'])
        );
      } else {
        // ❌ Failure
         this.sharedService.OpenAlert(
          res.responseMsg || 'Failed to save FATCA details to BSE. Please try again.',
          () => this.router.navigate(['/app/registerdList'])
        );
      }
    }),

    // ✔ Catch API / network errors
    catchError(err => {
      console.error('FATCA API Error:', err);
      this.sharedService.openDialog(
        'Server error while saving FATCA. Please try again later.'
      );
      return of(null);
    })

  ).subscribe();
}

  // fatcaSaveToBse(input: fatcaSubtobBseInput) {
  //   input = {
  //     membID: this.fatcaDetails[0].MembID,
  //   }
  //   this.bseUccSer.fatcaSaveToBse(input).subscribe({
  //     next: (res) => {
  //       console.log(res, 'res');
  //       const message = res?.remark || 'Something went wrong. Please try again later.';
  //       this.sharedService.OpenAlert(message);
  //       //bind bse res later

  //     },
  //     error: (err) => {
  //       console.log(err);

  //     }
  //   })
  // }

  fatcaSaveToBse() {
  const input = {
    membID: this.fatcaDetails[0]?.MembID
  };

  this.bseUccSer.fatcaSaveToBse(input).subscribe({
    next: (res: any) => {
      console.log(res, 'FATCA BSE Response');

      if (!res) {
        this.sharedService.openDialog('No response received from BSE.');
        return;
      }

      if (res.status === 1) {
        // ✅ Success
        this.sharedService.OpenAlert(
          res.responseMsg || 'FATCA details saved to BSE successfully.',
          () => this.router.navigate(['/app/registerdList'])
        );
      } else {
        // ❌ Failure from API
        this.sharedService.openDialog(
          res.responseMsg || 'Failed to save FATCA details to BSE. Please try again.'
        );
      }
    },

    error: (err) => {
      console.error('FATCA Save Error:', err);
      this.sharedService.openDialog(
        'Something went wrong while saving FATCA details to BSE. Please try again later.'
      );
    }
  });
}





  mapFormToFatca(): fatcaRegInput {
    const formValue = this.fatcaForm.getRawValue(); // Use getRawValue() to get disabled control values too
    const now = new Date().toISOString();
    console.log(formValue, 'fatca form value');


    return {
      membId: Number(this.fatcaDetails[0].MembID), // Default or get from somewhere
      srcE_WEALT: formValue.SRCE_WEALT,
      inV_NAME: String(formValue.INV_NAME),
      fR_NAME: formValue.FR_NAME,
      sP_NAME: formValue.SP_NAME,
      // taxStatID: Number(formValue.TAX_STATUS),
      taxStatID: formValue.TAX_STATUS.toString().padStart(2, '0'), // "01" (string)
      placOfBirt: formValue.PO_BIR_INC,
      counOfBirt: formValue.CO_BIR_INC,
      counOfTaxResi: formValue.TAX_RES1,
      taxRefID: formValue.TPIN1,
      taxRefIDType: formValue.ID1_TYPE,
      netWort: '',
      netWortAson: now,
      isPoliExpo: formValue.PEP_FLAG,
      incsou: 0, // Default or calculate
      incSlab: Number(formValue.INC_SLAB),
      taxRefID2: '', // Additional fields if needed
      taxRefIDType2: '',
      counTaxResi2: '',
      taxRefID3: '',
      taxRefIDType3: '',
      counTaxResi3: '',
      datA_SRC: formValue.DATA_SRC,
      addR_TYPE: formValue.ADDR_TYPE,
      corP_SERVS: '', // Default
      nW_DATE: now,
      occuCode: formValue.OCC_CODE,
      occuType: formValue.OCC_TYPE,
      exemP_CODE: '', // Default
      ffI_DRNFE: '', // Default
      giiN_NO: '', // Default
      spR_ENTITY: '',///// check it
      giiN_NA: '', // Default
      giiN_EXEMC: '', // Default
      nffE_CATG: '', // Default
      acT_NFE_SC: '', // Default
      naturE_BUS: '', // Default
      reL_LISTED: '', // Default
      excH_NAME: formValue.EXCH_NAME,
      ubO_APPL: formValue.UBO_APPL,
      ubO_COUNT: '', // Default
      ubO_NAME: '',
      // ubO_PAN: formValue.PAN_RP,
      ubO_PAN: '',
      ubO_NATION: '', // Default
      ubO_ADD1: '', // Default
      ubO_ADD2: '', // Default
      ubO_ADD3: '', // Default
      ubO_CITY: '', // Default
      ubO_PIN: '', // Default
      ubO_STATE: '', // Default
      ubO_CNTRY: '', // Default
      ubO_ADD_TY: '', // Default
      ubO_CTR: '', // Default
      ubO_TIN: '', // Default
      ubO_ID_TY: '', // Default
      ubO_COB: '', // Default
      ubO_DOB: null,
      ubO_GENDER: '', // Default
      ubO_FR_NAM: '', /// check it
      ubO_OCC: '', // Default
      ubO_OCC_TY: '', // Default
      ubO_TEL: '', // Default
      ubO_MOBILE: '', // Default
      ubO_CODE: '', // Default
      ubO_HOL_PC: '', // Default
      sdF_FLAG: formValue.SDF_FLAG,
      ubO_DF: formValue.UBO_DF,
      aadhaaR_RP: '', // Default
      neW_CHANGE: formValue.NewOrUpdateIndicator, // Default
      loG_NAME: formValue.Log_Name,
      counTaxResi4: '', // Default
      taxRefIDType4: '', // Default
      taxRefID4: '', // Default
      indiType: '', // Default
      respMess: '', // Default
      statusFlag: 0 ,// Default
      investor_type: formValue.InvestorType,
    };


  }

  private formatDateForAPI(dateString: string): string {
    // Format date as YYYY-MM-DD
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }


  //   saveAndExit(): void {
  //     if (this.fatcaForm.valid) {
  // this.FtcaReguiDet();
  //     } else {
  //       this.markFormGroupTouched(this.fatcaForm);
  //       console.log('fatca form is invalid');

  //     }
  //   }

  saveAndExit(): void {
    if (this.fatcaForm.invalid) {
      this.fatcaForm.markAllAsTouched(); // highlight errors
      console.log('Fatca form is invalid');
      return; // stop execution
    }

    // ✅ Only runs if form is valid
    console.log('Fatca Form Value', this.fatcaForm.value);
    this.FtcaReguiDet();
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  isTabActive(tabIndex: number): boolean {
    return this.activeTab === tabIndex;
  }


cancelClick(){
  this.router.navigate(['/app/registerdList']);
}


}
