export class UccMemberInfo {
  clieCode!: string;
  membID!: number;
  occupation!: string;
  mobileNumber!: string;
  mobileDeclaration!: string;
  emailID!: string;
  emailDeclaration!: string;
  birthDate!: string; // Format: yyyy-mm-dd
  panNumber!: string;
  taxStatus!: string;
  holdingPattern!: string;
  nominationOpt!: string;
  nominationAuth!: string;
  fH_KYC_Type!: string;
}

export interface UccRegisterMember {
  clieCode: string;
  holdingPattern: 'SI' | 'JO' | 'AS'; // Single / Joint / Anyone or Survivor
  taxStatus: string;
  fH_KYC_Type: string;
  nominationOpt: string;
  nominationAuth: string;
  Applicants: Applicant[];
}

export interface Applicant {
  membID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  occupation: string;
  mobileNumber: string;
  mobileDeclaration: string;
  emailID: string;
  emailDeclaration: string;
  birthDate: string; // ISO string (can convert to Date if needed)
  panNumber: string;
  gender: 'M' | 'F' | 'O';
}


export class UccAddressDetails {
  clieCode!: string;
  AddressLine1!: string;
  AddressLine2!: string;
  AddressLine3!: string;
  Pincode!: string;
  City!: string;
  State!: string;
  Country!: string;
}

//   export class uccNomineeDetails {
//     clieCode: string = '';
//     nominee: string = '';
//     nomineeRela: string = '';
//     nomineePerc1: string = '';
//     nomineeMinorFlag1: string = '';
//     nomineedoB1: string = '';
//     nomineeGuardian1: string = '';

//     nomineE2: string = '';
//     nomineerelatioN2: string = '';
//     nomineePerc2: string = '';
//     nomineeMinorFlag2: string = '';
//     nomineedoB2: string = '';
//     nomineeGuardian2: string = '';

//     nomineE3: string = '';
//     nomineerelatioN3: string = '';
//     nomineePerc3: string = '';
//     nomineeMinorFlag3: string = '';
//     nomineedoB3: string = '';
//     nomineeGuardian3: string = '';
//   }

export class uccNomineeDetails {

   [key: string]: any;
  clieCode!: string;

  nomi1PAN!: string;
  nomi1Name!: string;
  nomi1Relation!: string;
  nomi1Perc!: string;
  nomiIsMinor!: string;
  nomi1DOB!: string;
  nomi1Guardian!: string;
  nomi1GuardPAN!: string;
  nomi1IDType!: string;
  nomi1IDNumb!: string;
  nomi1Email!: string;
  nomi1MobileNumb!: string;
  nomi1Add1!: string;
  nomi1Add2!: string;
  nomi1Add3!: string;
  nomi1City!: string;
  nomi1Pin!: string;
  nomi1Country!: string;
  nomi1_country_code!: string;
  // nomi1ContactNumber!: string;
  nomi1_whose_contact_number!: string;
  nomi1_contact_type!: string;
  nomi1_extension!: string;
  nomi1_fax_no!: string;
  // nomi1EmailAddress!: string;
  nomi1_whose_email_address!: string;

  nomi2PAN!: string;
  nomi2Name!: string;
  nomi2Relation!: string;
  nomi2Perc!: string;
  nomi2sMinor!: string;
  nomi2DOB!: string;
  nomi2Guardian!: string;
  nomi2GuardPAN!: string;
  nomi2IDType!: string;
  nomi2IDNumb!: string;
  nomi2Email!: string;
  nomi2MobileNumb!: string;
  nomi2Add1!: string;
  nomi2Add2!: string;
  nomi2Add3!: string;
  nomi2City!: string;
  nomi2Pin!: string;
  nomi2Country!: string;
  nomi2_country_code!: string;
  // nomi2ContactNumber!: string;
  nomi2_whose_contact_number!: string;
  nomi2_contact_type!: string;
  nomi2_extension!: string;
  nomi2_fax_no!: string;
  // nomi2EmailAddress!: string;
  nomi2_whose_email_address!: string;

  nomi3PAN!: string;
  nomi3Name!: string;
  nomi3Relation!: string;
  nomi3Perc!: string;
  nomi3sMinor!: string;
  nomi3DOB!: string;
  nomi3Guardian!: string;
  nomi3GuardPAN!: string;
  nomi3IDType!: string;
  nomi3IDNumb!: string;
  nomi3Email!: string;
  nomi3MobileNumb!: string;
  nomi3Add1!: string;
  nomi3Add2!: string;
  nomi3Add3!: string;
  nomi3City!: string;
  nomi3Pin!: string;
  nomi3Country!: string;
  nomi3_country_code!: string;
  // nomi3ContactNumber!: string;
  nomi3_whose_contact_number!: string;
  nomi3_contact_type!: string;
  nomi3_extension!: string;
  nomi3_fax_no!: string;
  // nomi3EmailAddress!: string;
  nomi3_whose_email_address!: string;
}



export class uccBankDetails {
  clieCode!: string;

  // First Bank
  neftCode!: string;
  accNo!: string;
  acctype!: string;
  bankName!: string;
  bankBranch!: string;
  mcirno!: string;
  bankDefault!: number;
  clientType!: string;
  diviPayMode!: string;

  // Second Bank
  neftCode2!: string;
  accNo2!: string;
  acctype2!: string;
  bankName2!: string;
  bankBranch2!: string;
  mcirnO2!: string;
  bank2Default!: number;
  // clientType2: string;
  // diviPayMode2: string

  // Third Bank
  neftCode3!: string;
  accNo3!: string;
  acctype3!: string;
  bankName3!: string;
  bankBranch3!: string;
  mcirnO3!: string;
  bank3Default!: number;
  //  clientType3: string;
  // diviPayMode3: string;

  // Fourth Bank
  neftCode4!: string;
  accNo4!: string;
  acctype4!: string;
  bankName4!: string;
  bankBranch4!: string;
  mcirnO4!: string;
  bank4Default!: number;
  // clientType4: string;
  // diviPayMode4: string;

  //Fifth Bank
  neftCode5!: string;
  accNo5!: string;
  acctype5!: string;
  bankName5!: string;
  bankBranch5!: string;
  mcirnO5!: string;
  bank5Default!: number;
  // clientType5: string;
  // diviPayMode5: string;

  // Start Demat For bank details nd cdsl and nsdl fields
  defaTDP!: string;
  cdsldpid!: string;
  cdslcltid!: string;
  cmbpiD_ID!: string;
  nsdldpid!: string;
  nsdlcltid!: string;




}

export class LoopbackResponse {
  membID!: number;
  clieCode!: string;
  holdID!: string;
  documentType!: string;
  intRefNo!: string;
  isAllowLoobackUrl!: number;
  loopbackurlmessage!: string;
  status!: string;
  elgStatus!: string;
  creaOn!: string; // or Date if you parse it
  modiOn!: string;
}

export class UccDetails {
  memberDetails!: string;
  bseClientCode!: string;
  taxStatusDetails!: { label: string; };
  holdingPatternDetails!: { label: string; };
  nominationopt!: boolean;
  elogLink!: string;
  bseStatus!: string;
  docStatus!: string;
  createDate!: string;
  memberId!: string;
  clieapplname1!: string;
  clieapplname2!: string;
  clieapplname3!: string;
  isCardActive!: boolean;
  saved!: boolean;
  isSubmitted!: boolean;
  uccRegistration!: string;
  fatcaStatus!: string;
  bseMemberID!: string;
  panNo!: string;
  mobileNO!: string;
  emailID!: string;
  elogStatus!: string;
  uccStatus!: string | null;
  isUccStatusLoading!: boolean;
  holdingNature!: string;
  bseSubmissionStatus!: string; // Track BSE submission status

}


export class UccApiResponse {
  clieCode!: string;
  holdID?: string; // Optional field, can be empty
  clieapplname1!: string;
  clieapplname2?: string;
  clieapplname3?: string;
  bseStaus!: string;
  docStaus!: string;
  membid!: string;
  createDate?: string | null; // Nullable
  taxStatus!: string;
  fullName!: string;
  nominationopt?: string; // May be empty
  elogLink!: string;
  isCardActive?: boolean;
  uccRegistration!: string;
  fatcaStatus!: string;
  bseMemberID!: string;
   panNo!: string;
  mobileNO!: string;
  emailID!: string;
  elogStatus!: string;
  uccStatus!: string | null;
  isUccStatusLoading!: boolean;
  holdingNature!: string;

}


export class BseElogDetails {
  clientcode!: string;
  holder!: string;
  memberid!: string;
  bseUserName!: string;
  bsEmemberid!: string;
  bsEpassword!: string;
}

export class BseUccEditDetails {
  clieCode!: string;
}

export class BseGetSaveDetails {
  clieCode!: string;
}

export class bseSubmitToBse {
  clieCode!: string;
  RegnType!: string;
}

export class EditPayload {
  clieMandCode!: string;
}


export interface UserValidateAPiInput {
  clieCode: string;
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  birthDate: string;
  cliegender: string;
  bankName: string;
  bankBranch: string;
  accNo: string;
  nomi1Name: string;
  nomi1Relation: string;
  nomi1Pan: string;
  taxStatus: string;
  occupation: string;
  holdingPattern: string;
  mobileDeclaration: string;
  emailDeclaration: string;
  kycType: string;
  nominationOpted: string;
  nominationAuthentication: string;
  state: string;
  city: string;
  pincode: string;
  country: string;
  defaultFlag1: string;
  bank1ifsc: string;
  accountType: string;
  dividendPayout: string;
  nomi1applicablePercentage: string;
  nomi1identityType: string;
  nomi1IDNumber: string;
  nomi1Email: string;
  nomi1Mobile: string;
  nomi1Add1: string;
  nomi1Pin: string;
  nomi1Country: string;
  applicantname1: string;
  clienttype: string;
  micr: string;
  address1: string;
}

export interface checkMandatoryFieldsResponse {
    clieCode: string;
}

export interface BseBankNameDropdown {
  membID: string;
  bankName: string;
}


export interface bseBankDetailIfsc {
  ifscCode: string;
}

export interface bseBankListApiInput {
  clientCode: string;
}


export interface deleteBankData {
  clientCode: string;
  bankIndex: number
}

export interface bseNomineeListApiInput {
  clientCode: string;
}


 export interface PanVerificationRequest {
  panNo: string;
  mobile: string;
  dob: string;
  reqNo: string;
}

export interface KYCRequest{
  clientCode: string;
  kycType1Holder: string;
  kycType2Holder: string;
  kycType3Holder: string;
  kycTypeGuardian: string;
  ckycNo1Holder: string;
  ckycNo2Holder: string;
  ckycNo3Holder: string;
  ckycNoGuardian: string;
}

export interface DeleteClientRequest {
  clieCodes: string[];
}

export interface groupByLogin{
     loginId: string;
}

export interface getUccList{
  topCount: number
}

// export interface getMemeberDetails{
//   GrouID: string;
//   GroupID: string;
//   IFAID: string;
//   IsWMPRO: string;
//   IFAKey: string;
// }

export interface fatcaRegInput {
  membId: number;
  inV_NAME: string;
  fR_NAME: string;
  sP_NAME: string;
  taxStatID: string;
  placOfBirt: string;
  counOfBirt: string;
  counOfTaxResi: string;
  taxRefID: string;
  taxRefIDType: string;
  netWort: string;
  netWortAson: null | Date | string;
  isPoliExpo: string;
  incsou: number;
  incSlab: number;
  taxRefID2: string;
  taxRefIDType2: string;
  counTaxResi2: string;
  taxRefID3: string;
  taxRefIDType3: string;
  counTaxResi3: string;
  datA_SRC: string;
  addR_TYPE: string;
  corP_SERVS: string;
  nW_DATE: null | Date | string;
  occuCode: string;
  occuType: string;
  exemP_CODE: string;
  ffI_DRNFE: string;
  giiN_NO: string;
  spR_ENTITY: string;
  giiN_NA: string;
  giiN_EXEMC: string;
  nffE_CATG: string;
  acT_NFE_SC: string;
  naturE_BUS: string;
  reL_LISTED: string;
  excH_NAME: string;
  ubO_APPL: string;
  ubO_COUNT: string;
  ubO_NAME: string;
  ubO_PAN: string;
  ubO_NATION: string;
  ubO_ADD1: string;
  ubO_ADD2: string;
  ubO_ADD3: string;
  ubO_CITY: string;
  ubO_PIN: string;
  ubO_STATE: string;
  ubO_CNTRY: string;
  ubO_ADD_TY: string;
  ubO_CTR: string;
  ubO_TIN: string;
  ubO_ID_TY: string;
  ubO_COB: string;
  ubO_DOB:   null | Date | string;
  ubO_GENDER: string;
  ubO_FR_NAM: string;
  ubO_OCC: string;
  ubO_OCC_TY: string;
  ubO_TEL: string;
  ubO_MOBILE: string;
  ubO_CODE: string;
  ubO_HOL_PC: string;
  sdF_FLAG: string;
  ubO_DF: string;
  aadhaaR_RP: string;
  neW_CHANGE: string;
  loG_NAME: string;
  counTaxResi4: string;
  taxRefIDType4: string;
  taxRefID4: string;
  indiType: string;
  respMess: string;
  statusFlag: number;
  srcE_WEALT: string;
  investor_type: string;

}

export interface fatcaSavedDetails {
  membID: string;
}

export interface fatcaSubtobBseInput {
  // grouID: string;
  membID: string
}

export interface fatcaValidate {
  taxStatus: string;
  panNumber: string;
}


// models/bank-details.model.ts
export class BankDetailsModel {
  ifsc: string = '';
  MICR: string = '';
  branchName: string = '';
  bankName: string = '';
  accountNumber: string = '';
  accountType: string = ''; // e.g. 'SAVINGS', 'CURRENT'

  constructor(init?: Partial<BankDetailsModel>) {
    Object.assign(this, init);
  }
}
