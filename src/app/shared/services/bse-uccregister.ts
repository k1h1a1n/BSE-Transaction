import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { SharedEnv } from '../environments/environment';
import { bseBankDetailIfsc, bseBankListApiInput, BseBankNameDropdown, BseElogDetails, BseGetSaveDetails, bseNomineeListApiInput, bseSubmitToBse, BseUccEditDetails, checkMandatoryFieldsResponse, deleteBankData, DeleteClientRequest, EditPayload, fatcaRegInput, fatcaSavedDetails, fatcaSubtobBseInput, fatcaValidate, getUccList, groupByLogin, KYCRequest, PanVerificationRequest, UccAddressDetails, uccBankDetails, UccMemberInfo, uccNomineeDetails, UserValidateAPiInput } from '../../modules/models/bseUCCModel';
import { BseSubmissionPayload, BSESubmissionRequest, getParticularUcc, UccElogRequest, UccNominationLinkRequest, validDatawithNomineeopt } from '../../modules/models/bseSubmissionModel';
import { HandleError, HttpErrorHandler } from '../error-handlers/http-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class BseUCCRegister {
  

  private mandateDetails: any = null;
  private isEdit: boolean = false;
  private selectedMember: any = null;
   private handleError!: HandleError;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient, private httpErrorHandler: HttpErrorHandler) {
       this.handleError = httpErrorHandler.createHandleError('BseUCCRegister');
  }

  getUccMemberDetails(): Observable<any> {
    return this.http.post<any>(
      `${SharedEnv.uccUrl}/SBUccOnboardingApp/MemberDetails`,
      this.httpOptions
    ).pipe(catchError(this.handleError('getUccMemberDetails', [])));
  }
  
  getUccNomineeData(input: uccNomineeDetails): Observable<any> {

    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/NomineeDetails`, input, this.httpOptions)
    .pipe( catchError(this.handleError('getUccNomineeData', [])
     )
  );
   
  }

  getUccRegisterData(input: UccMemberInfo): Observable<any> {

    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/RegisterDetails`, input, this.httpOptions)
       .pipe( catchError(this.handleError('getUccRegisterData', [])
     )
  );
  }


   getUccAddressContData(input: UccAddressDetails): Observable<any> {

    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/ContactDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getUccAddressContData', []))
      );
  }


  getUccBankData(input: uccBankDetails): Observable<any> {

    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/BankDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getUccBankData', []))
      );
  }

  getUccListData(input: getUccList): Observable<any> {
    // http://wmentucccoreapi.imagicuat.in/api/SBUccOnboardingApp/UCCListing
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/UCCListing`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getUccListData', []))
      );
  }

  editUccDetails(input: BseUccEditDetails): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/EditUccDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('editUccDetails', []))
      );
  }

  saveDataToBSE(input: BseSubmissionPayload): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/SubmitFinalDataToBSE`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('saveDataToBSE', []))
      );
  }

    getPartUcc(input: getParticularUcc): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetParticularUcc`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getPartUcc', []))
      );
  }

  getFatcaBseStatus(): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/UCCFatcastatus`, this.httpOptions)
      .pipe(
        catchError(this.handleError('getFatcaBseStatus', []))
      );
  }

  saveMandateDetailstoBSE(input: EditPayload): Observable<any> {

    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/SubmitMandateDetailsToBSE`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('saveMandateDetailstoBSE', []))
      );
  }


  getMandateListingData(): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/MandateListing`, this.httpOptions)
      .pipe(
        catchError(this.handleError('getMandateListingData', []))
      );
  }

  editMandateDetails(input: EditPayload): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/EditMandateDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('editMandateDetails', []))
      );

  }


  setIsEdit(value: boolean) {
    this.isEdit = value;
  }
  getIsEdit() {
    return this.isEdit;
  }
  
  setMandateDetails(details: any) {
    this.mandateDetails = details;
  }
  getMandateDetails() {
    return this.mandateDetails;
  }

  setSelectedMember(value: boolean) {
    this.selectedMember = value;
  }

  getSelectedMember() {
    return this.selectedMember;
  }

  checkMandatoryFields(input: checkMandatoryFieldsResponse): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/CheckMandatoryFields`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('checkMandatoryFields', []))
      );
  }

  getSavedDetails(input: BseGetSaveDetails): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetSavedDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getSavedDetails', []))
      );
  }
  
    getFullValidatedResponse(input: BseGetSaveDetails): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetFullValidatedResponse`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getFullValidatedResponse', []))
      );
  }

  getBankDropdown(input: BseBankNameDropdown) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetBankDropdown`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getBankDropdown', []))
      );
  }

  getBanDetails(input: BseBankNameDropdown) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetBankDetailByMembIDAndBankName`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getBanDetails', []))
      );
  }

  getbankDetialsByIFSC(input: bseBankDetailIfsc) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetBanksOnIFSCcodes`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getbankDetialsByIFSC', []))
      );
  }


  getBseBankList(input: bseBankListApiInput) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetClientBankDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getBseBankList', []))
      );
  }



  deleteBseBankDetail(input: deleteBankData) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/DeleteClientBankDetail`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('deleteBseBankDetail', []))
      );
  }


  getBseNomineeList(input: bseNomineeListApiInput) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetClientNomineeDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getBseNomineeList', []))
      );
  }


  ftcaRegi(input: fatcaRegInput) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/FatcaDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('ftcaRegi', []))
      );
  }

  getFatcaSaveDetails(input: fatcaSavedDetails) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetFatcaSavedDetails`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getFatcaSaveDetails', []))
      );
  }


  fatcaValidateBeforeBSE(input: fatcaValidate) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/CheckFatcaMandatoryFields`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('fatcaSaveToBse', []))
      );
  }


  fatcaSaveToBse(input: fatcaSubtobBseInput) {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/SubmitFatcaDetailsToBSE`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('fatcaSaveToBse', []))
      );
  }


  getPanVerificationRequest(input: PanVerificationRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetKYCPasscode`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getPanVerificationRequest', []))
      )
  }
  // http://wmentucccoreapi.imagicuat.in/api/SBUccOnboardingApp/KYCRequest
  // {  "clientCode": "string",  "kycType1Holder": "string",  "kycType2Holder": "string",  "kycType3Holder": "string",  "kycTypeGuardian": "string",  "ckycNo1Holder": "string",  "ckycNo2Holder": "string",  "ckycNo3Holder": "string",  "ckycNoGuardian": "string"}


  getKycVerification(input: KYCRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/KYCRequest`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getKycVerification', []))
      )
  }

  checkOrderPlacedBulk(input: DeleteClientRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/IsOrderPlacedBulk`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('checkOrderPlacedBulk', []))
      );
  }
  
  getDeleteClient(input: DeleteClientRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/DeleteClients`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getDeleteClient', []))
      )
  }

  getGroupByLogin(input: groupByLogin): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/LookupGroupsOrMembers`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getGroupByLogin', []))
      )
  }


    getGroupIdByMembId(): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetGroupIdByMembId`, this.httpOptions)
      .pipe(
        catchError(this.handleError('getGroupIdByMembId', []))
      )
  }


      getElogLink(input: UccElogRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/ElogAuthentication`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getElogLink', []))
      )
  }


        getNomineeLink(input: UccNominationLinkRequest): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/NomineeAuthentication`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getNomineeLink', []))
      )
  }


   getFullValidresWithNomination(input: validDatawithNomineeopt): Observable<any> {
    return this.http.post<any>(`${SharedEnv.uccUrl}/SBUccOnboardingApp/GetFullValidatedResponseWithNomination`, input, this.httpOptions)
      .pipe(
        catchError(this.handleError('getFullValidresWithNomination', []))
      );
  }

  private bankList: any[] = [];

  getBanks(): any[] {
    return this.bankList;
  }

  addBank(bank: any) {
    this.bankList.push(bank);
  }

  clearBanks() {
    this.bankList = [];
  }


}
