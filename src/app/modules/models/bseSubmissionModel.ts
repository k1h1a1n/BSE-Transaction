
export interface BseSubmissionPayload {
  data: BseSubmissionData;
}

export interface BseSubmissionData {
  member_code: MemberCode;
  investor: Investor;
  holding_nature: string;
  tax_code: string;
  rdmp_idcw_pay_mode: string;
  is_client_physical: boolean;
  is_client_demat: boolean;
  is_nomination_opted: boolean;
  nomination_auth_mode: string;
  nominee_soa?: string;
  comm_mode: string;
  onboarding: string;
  comm_addr: CommunicationAddress;
  bank_account: BankAccount[];
  fatca: Fatca[];
  holder: Holder[];
  pan_verified?: boolean;
  identifiers: Identifier[];
}

export interface MemberCode {
  member_id: string;
}

export interface Investor {
  client_code: string;
}

export interface CommunicationAddress {
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
}

export interface BankAccount {
  ifsc_code: string;
  bank_acc_num: string;
  bank_acc_type: string;
  bank_name?: string;
  account_owner: string;
}

export interface Fatca {
  holder_rank: string;
  place_of_birth: string;
  country_of_birth: string;
  client_name: string;
  investor_type: string;
  dob: string;
  father_name: string;
  spouse_name: string;
  address_type: string;
  occ_code: string;
  occ_type: string;
  tax_status: string;
  identifier: FatcaIdentifier;
  corporate_service_sector: string;
  wealth_source: string;
  income_slab: string;
  net_worth: number;
  date_of_net_worth: string;
  politically_exposed: string;
  is_self_declared: boolean;
  data_source: string;
  log_name: string;
  tax_residency: TaxResidency[];
  ucc_id: number;
  fatca_id: number;
}

export interface FatcaIdentifier {
  identifier_type: string;
  identifier_number: string;
}

export interface TaxResidency {
  country: string;
  tax_id_no: string;
  tax_id_type: string;
}

export interface Holder {
  holder_rank: string;
  occ_code: string;
  auth_mode: string;
  is_pan_exempt: boolean;
  identifier: HolderIdentifier[];
  kyc_type: string;
  person: Person;
  contact: Contact[];
  nomination: any[];
  holder_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
}

export interface HolderIdentifier {
  identifier_type: string;
  identifier_number: string;
}

export interface Person {
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  gender: string;
}

export interface Contact {
  contact_number: string;
  country_code: string;
  whose_contact_number: string;
  email_address: string;
  whose_email_address: string;
  contact_type: string;
  is_foreign: boolean;
}

export interface Identifier {
  identifier_type: string;
  identifier_number: string;
  issue_date: string;
  expiry_date: string;
  file_name: string;
  file_size: number;
  file_blob: string;
  additional_info: string;
  is_active: boolean;
}

export interface getParticularUcc {
  data: {
    member_code: {
      member_id: string;
    };
    investor: {
      client_code: string;
    };
  };
}



export interface UccElogRequest {
  data: UccElogData[];
}

export interface UccElogData {
  event: 'ucc_elog';
  investor: UccElogInvestor;
  parentClientCode: string;
  memberCode: string;
}

export interface UccElogInvestor {
  clientCode: string;
  panHolder: string[];
  holdingNature: 'SI' | 'JO' | 'AS'; // extend if backend adds more
}

export interface UccNominationLinkRequest {
  data: UccNominationData[];
}

export interface UccNominationData {
  event: 'ucc_nom';
  investor: UccNominationInvestor;
  parent_Client_Code: string;
  member_Code: string;
}

export interface UccNominationInvestor {
  client_Code: string;
  pan_holder: string[];
  holding_Nature: string;
}

// API Response Interfaces for Nomination Link
export interface UccNominationLinkResponse {
  status: number;
  data: UccNominationLinkResponseData;
  dataList: any;
  errorMsg: string | null;
  successMsg: string;
  httpStatus: number;
}

export interface UccNominationLinkResponseData {
  status: string;
  data: UccNominationLinkResponseItem[];
  messages: any;
}

export interface UccNominationLinkResponseItem {
  member: string;
  investor: UccNominationLinkResponseInvestor;
  parentClientCode: string | null;
  action: UccNominationLinkAction;
}

export interface UccNominationLinkResponseInvestor {
  clientCode: string | null;
  panHolder: string | null;
  holdingNature: string | null;
}

export interface UccNominationLinkAction {
  msgCode: string;
  at: string;
  event: string;
  event_object: UccNominationEventObject[];
}

export interface UccNominationEventObject {
  holder_rank: string;
  pan: string;
  '2fa_url': string;
}

// ==================== NEW COMPLETE SUBMISSION INTERFACES ====================

export interface BSESubmissionRequest {
  data: BSESubmissionDataNew;
  identifiers: SubmissionIdentifier[];
}

export interface BSESubmissionDataNew {
  member_code: MemberCodeNew;
  investor: InvestorNew;
  holding_nature: string;
  tax_code: string;
  rdmp_idcw_pay_mode: string;
  is_client_physical: boolean;
  is_client_demat: boolean;
  is_nomination_opted: boolean;
  nomination_auth_mode: string;
  nominee_soa: string;
  comm_mode: string;
  onboarding: string;
  comm_addr: CommAddrNew;
  holder: HolderNew[];
  bank_account: BankAccountNew[];
  fatca: FatcaNew[];
  pan_verified: boolean;
}

export interface MemberCodeNew {
  member_id: string;
}

export interface InvestorNew {
  client_code: string;
}

export interface CommAddrNew {
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
}

export interface HolderNew {
  holder_rank: string;
  occ_code: string;
  auth_mode: string;
  is_pan_exempt: boolean;
  pan_exempt_category: string;
  identifier: IdentifierNew[];
  kyc_type: string;
  ckyc_number: string;
  person: PersonNew;
  contact: ContactNew[];
  nomination: NominationNew[];
  holder_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
}

export interface IdentifierNew {
  identifier_type: string;
  identifier_number: string;
}

export interface PersonNew {
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  gender: string;
}

export interface ContactNew {
  contact_number: string;
  country_code: string;
  whose_contact_number: string;
  email_address: string;
  whose_email_address: string;
  contact_type: string;
  is_foreign: null | boolean;
}

export interface NominationNew {
  person: NomineePersonNew;
  contact: NomineeContactNew;
  comm_addr: NomineeCommAddrNew;
  nomination_percent: string;
  nomination_relation: string;
  is_pan_exempt: boolean;
  pan_exempt_category: string;
  is_minor: boolean;
  identifier: NomineeIdentifierNew[];
  guardian: GuardianNew;
}

export interface NomineePersonNew {
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
}

export interface NomineeContactNew {
  contact_number: string;
  country_code: string;
  whose_contact_number: string;
  email_address: string;
  whose_email_address: string;
  contact_type: string;
}

export interface NomineeCommAddrNew {
  address_line_1: string;
  address_line_2: string;
  address_line_3: string;
  comm_mode: string;
  postalcode: string;
  address_id: number;
}

export interface NomineeIdentifierNew {
  identifier_type: string;
  identifier_number: string;
}

export interface GuardianNew {
  first_name: null | string;
  middle_name: null | string;
  last_name: null | string;
  dob: null | string;
  is_pan_exempt: null | boolean;
  identifier: GuardianIdentifierNew[];
}

export interface GuardianIdentifierNew {
  identifier_type?: string;
  identifier_number?: string;
}

export interface BankAccountNew {
  ifsc_code: string;
  bank_acc_num: string;
  bank_acc_type: string;
  bank_name: string;
  account_owner: string;
}

export interface FatcaNew {
  holder_rank: string;
  place_of_birth: string;
  country_of_birth: string;
  client_name: string;
  investor_type: string;
  dob: string;
  father_name: string;
  spouse_name: string;
  address_type: string;
  occ_code: string;
  occ_type: string;
  tax_status: string;
  identifier: FatcaIdentifierNew;
  corporate_service_sector: string;
  wealth_source: string;
  income_slab: string;
  net_worth: number;
  date_of_net_worth: string;
  politically_exposed: string;
  is_self_declared: boolean;
  data_source: string;
  log_name: string;
  tax_residency: TaxResidencyNew[];
  ucc_id: number;
  fatca_id: number;
}

export interface FatcaIdentifierNew {
  identifier_type: string;
  identifier_number: string;
}

export interface TaxResidencyNew {
  country: string;
  tax_id_no: string;
  tax_id_type: string;
}

export interface SubmissionIdentifier {
  identifier_type: string;
  identifier_number: string;
  issue_date: string;
  expiry_date: string;
  file_name: string;
  file_size: number;
  file_blob: string;
  additional_info: string;
  is_active: boolean;
}

export interface validDatawithNomineeopt {
clieCode: string;
}