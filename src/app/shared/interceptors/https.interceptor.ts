import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';

import { Observable, of, timer, throwError } from 'rxjs';
import { SharedEnv } from '../environments/environment';
import { timeout, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()

export class HttpsInterceptor implements HttpInterceptor {
    constructor(private router: Router) {}
    
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {


        const restrictedApis = [
            `/User/VerifyUser`, // Replace with the actual endpoint
            `/CreateUser/CreateNewUser`,
            `/Login/LoginData`
        ];
        const restrictedReqBodyApis = [
            `/SBUccOnboardingApp/LookupGroupsOrMembers`
        ];

        const restrictedGroupIDByMemberApis =[
            `/SBUccOnboardingApp/GetGroupIdByMembId`
        ];

        const restrictedGroupIDapis = [
            `/SBUccOnboardingApp/MemberDetails`,
            `/SBUccOnboardingApp/NomineeDetails`,
            `/SBUccOnboardingApp/RegisterDetails`,
            `/SBUccOnboardingApp/ContactDetails`,
            `/SBUccOnboardingApp/BankDetails`,
            `/SBUccOnboardingApp/FatcaDetails`,
            `/SBUccOnboardingApp/SubmitToBse`,
            `/SBUccOnboardingApp/EditUCCDetails`,
            `/SBUccOnboardingApp/DeleteBankDetails`,
            `/SBUccOnboardingApp/DeleteClientRequest`,
            `/SBUccOnboardingApp/GetSavedDetails`,
            `/SBUccOnboardingApp/BankListByIFSC`,
            `/SBUccOnboardingApp/PanVerification`,
            `/SBUccOnboardingApp/KYCVerification`,
            `/SBUccOnboardingApp/MemberDetails`,
            `/SBUccOnboardingApp/saveMandateDetailstoBSE`,
            `/SBUccOnboardingApp/MandateListing`,
            `/SBUccOnboardingApp/EditMandateDetails`,
            `/SBUccOnboardingApp/DeleteMandateDetails`,
            `/SBUccOnboardingApp/ValidateFatcaDetails`,
            `/SBUccOnboardingApp/SubmitFatcaToBse`,
            `/SBUccOnboardingApp/CheckMandatoryFields`,
            `/SBUccOnboardingApp/GetBankDropdown`,
            `/SBUccOnboardingApp/ElogDetails`,
            `/SBUccOnboardingApp/GetBankDetailByMembIDAndBankName`,
            `/SBUccOnboardingApp/GetBanksOnIFSCcodes`,

            `/SBUccOnboardingApp/SubmitMandateToBSE`,
            `/SBUccOnboardingApp/DownloadMandatePDF`,
            `/SBUccOnboardingApp/UploadSignedMandate`,
          
            
        ];

        const restrictedSideMenuUrl = [
         `/menu/side-menu`
        ];

        const restrictedUcclistingApis = [
            `/SBUccOnboardingApp/UCCListing`
        ];

        // Try to get IFAID from router state first (from SSO navigation), then localStorage, then SharedEnv
        const routerState = this.router.getCurrentNavigation()?.extras?.state;
        const ifaidFromState = routerState?.['IFAID'];
        const ifaEmailFromState = routerState?.['IFAEmailId'];
        
        var IFADBNameDBKey = localStorage.getItem("IFADBNameDBKey") || `${SharedEnv.IFAKey}`;
        // var GrouID = localStorage.getItem("GrouID") || `${SharedEnv.GrouID}`;
       
        var IFAID = ifaidFromState || localStorage.getItem("IFAID") || `${SharedEnv.IFAID}`;
        var IFAEmailId = ifaEmailFromState || localStorage.getItem("IFAEmailId") || `${SharedEnv.IFAEmailId}`;
        // console.warn('HttpsInterceptor');
        var membID = localStorage.getItem("selectedGroupID") || `${SharedEnv.GrouID}`;
        var GrouID = localStorage.getItem("resSelectedGroupID") || `${SharedEnv.GrouID}`;
      console.log(IFADBNameDBKey, membID,GrouID, IFAID, IFAEmailId, 'ifadbnamedbkey', 'membID','GrouID','IFAID', 'IFAEmailId');
      console.log('Router state IFAID:', ifaidFromState, 'localStorage IFAID:', localStorage.getItem("IFAID"), 'Final IFAID:', IFAID);

        if (req.body) {
            // Append addition property
            var addParam;

            // Check if current API is in the restricted list
            //   const isRestrictedApi = restrictedApis.some(api => req.url.includes(api));
            if (req.body instanceof FormData) {
                // if (!isRestrictedApi) {
                req.body.append("IFAID", IFAID || `${SharedEnv.IFAID}`);
                req.body.append("IFAKey", IFADBNameDBKey || `${SharedEnv.IFAKey}`);
                req.body.append("GrouID", GrouID || `${SharedEnv.GrouID}`);
                req.body.append("IsWMPRO", `${SharedEnv.IsWMPRO}`);
                console.log('FormData appended with IFAID:', IFAID, req.body);

                // }

                addParam = req.clone({
                    //params: req.params.set('sessionid', `${SharedEnv.IFAID}`),
                    url: req.url.replace('http://', 'http://'),
                    body: req.body
                });


            } else {
                console.log('Request body before adding params:', req.body);

                addParam = req.clone({
                    // params: req.params.set('sessionid', `${SharedEnv.IFAID}`),
                    url: req.url.replace('http://', 'http://'),
                    body: { ...req.body, IFAID: IFAID || `${SharedEnv.IFAID}`, GroupID: GrouID || `${SharedEnv.GrouID}`, GrouID: GrouID || `${SharedEnv.GrouID}`, IsWMPRO: `${SharedEnv.IsWMPRO}`, IFAKey: IFADBNameDBKey },
                });
                
                console.log('Final request body with IFAID:', addParam.body);

                const isRestrictedIFAEmailID = restrictedApis.some(api => req.url.includes(api));
                const isrestrictedReqBodyApis = restrictedReqBodyApis.some(api => req.url.includes(api));
                const isrestrictedGroupIDapis = restrictedGroupIDapis.some(api => req.url.includes(api));
                 const isrestrictedGroupIDByMemberApis = restrictedGroupIDByMemberApis.some(api => req.url.includes(api));
                 const isrestrictedSideMenuUrl = restrictedSideMenuUrl.some(api => req.url.includes(api));
                    const isrestrictedUcclistingApis = restrictedUcclistingApis.some(api => req.url.includes(api));
                if (isRestrictedIFAEmailID) {
                    // Append additional fields to the body
                    addParam = addParam.clone({
                        body: {
                            ...addParam.body,
                            // IFAEmailId: IFAEmailId,
                            UserId: IFAEmailId
                        }
                    });
                    console.warn(SharedEnv.IFAEmailId);
                }

                console.log(req.url, 'urls');
                console.log(restrictedApis);

                if (isrestrictedReqBodyApis) {
                    addParam = addParam.clone({
                        body: {
                            // loginId: IFAEmailId
                            isGroup: 0,
                            searchStr: "",
                            groupId: 0,
                            isGroupCode: 0,
                            isFolio: 0,
                            IFAKey: IFADBNameDBKey
                        }
                    });
                    console.warn('Restricted req body API - clearing body:', SharedEnv.IFAEmailId);
                }

               if(isrestrictedGroupIDByMemberApis){
                         addParam = addParam.clone({
                         body: {
                          membID : membID
                          }
                    });

               }

              if(isrestrictedSideMenuUrl){
                     addParam = addParam.clone({
                        body: {
                        
                            roleId: 1,
                            userId: 1,
                             userName: IFAEmailId

                        }
                    });
                    console.log('Restricted SideMenu Url:' , isrestrictedSideMenuUrl);
              }

            if(isrestrictedUcclistingApis){ 
                addParam = addParam.clone({
                    body:{
                        GrouID : '',
                        GroupID :'',
                        IFAKey:  IFADBNameDBKey
                    }
                });
            }

                // if (isrestrictedGroupIDapis) {
                //     addParam = addParam.clone({
                //         body: {
                //             IFAID: `${SharedEnv.IFAID}`,
                //             IsWMPRO: `${SharedEnv.IsWMPRO}`,
                //             IFAKey: `${SharedEnv.IFAKey}`,
                //             GrouID: GrouID,
                //             GroupID: GrouID
                //         }
                //     });
                //     console.warn('Restricted GroupID API - setting GroupID:');
                // }

                

            }
            // params: sessionid is dummy currently not in use
            console.log(addParam);
            return next.handle(addParam).pipe(
                timeout(1200000),
                map(res => {
                    return res;
                }),
                catchError(err => {
                    console.log(err);
                    if (err.name === 'TimeoutError') {
                        alert("Looks like the server is taking to long to respond, please try again in sometime.");
                    }
                    // return Observable.throw(err)
                    return throwError(err)
                }
                ))
        } else {

            addParam = req.clone({
                //params: req.params.set('sessionid', `${SharedEnv.IFAID}`),
                url: req.url.replace('http://', 'http://'),
                body: { IFAID: `${SharedEnv.IFAID}`, GrouID: `${SharedEnv.GrouID}`, IsWMPRO: `${SharedEnv.IsWMPRO}` }
            });
            return next.handle(addParam).pipe(
                map(res => {
                    return res;
                })
            );
        }
    }


}

// import { Injectable } from '@angular/core';
// import {
//     HttpEvent,
//     HttpInterceptor,
//     HttpHandler,
//     HttpRequest
// } from '@angular/common/http';

// import { Observable, throwError } from 'rxjs';
// import { SharedEnv } from '../environments/environment';
// import { timeout, catchError } from 'rxjs/operators';

// @Injectable()
// export class HttpsInterceptor implements HttpInterceptor {
//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const restrictedApis = [
//             `/User/VerifyUser`,
//             `/CreateUser/CreateNewUser`,
//             `/Login/LoginData`
//         ];

//         const IFADBNameDBKey = localStorage.getItem("IFADBNameDBKey") || "";
//         const GrouID = localStorage.getItem("GrouID") || `${SharedEnv.GrouID}`;
//         const IFAID = localStorage.getItem("IFAID") || `${SharedEnv.IFAID}`;
//         const IFAEmailId = localStorage.getItem("IFAEmailId") || `${SharedEnv.IFAEmailId}`;

//         console.log({ IFADBNameDBKey, GrouID, IFAID, IFAEmailId });

//         let modifiedRequest: HttpRequest<any>;

//         if (req.body) {
//             debugger;
//             if (req.body instanceof FormData) {
//                 const formData = req.body as FormData;
//                 formData.append("IFAID", IFAID);
//                 formData.append("IFAKey", IFADBNameDBKey);
//                 formData.append("GrouID", GrouID);
//                 formData.append("IsWMPRO", `${SharedEnv.IsWMPRO}`);

//                 modifiedRequest = req.clone({ body: formData });
//             } else {
//                 const newBody = {
//                     ...req.body,
//                     IFAID: IFAID,
//                     GroupID: GrouID,
//                     GrouID: GrouID,
//                     IsWMPRO: `${SharedEnv.IsWMPRO}`,
//                     IFAKey: IFADBNameDBKey
//                 };

//                 if (restrictedApis.some(api => req.url.includes(api))) {
//                     newBody["UserId"] = IFAEmailId;
//                 }

//                 modifiedRequest = req.clone({ body: newBody });
//             }
//         } else {
//             modifiedRequest = req.clone({
//                 body: {
//                     IFAID: `${SharedEnv.IFAID}`,
//                     GrouID: `${SharedEnv.GrouID}`,
//                     IsWMPRO: `${SharedEnv.IsWMPRO}`
//                 }
//             });
//         }

//         console.log("Modified Request:", modifiedRequest);

//         return next.handle(modifiedRequest).pipe(
//             timeout(1200000), // Timeout after 20 minutes
//             catchError(err => {
//                 console.error(err);
//                 if (err.name === 'TimeoutError') {
//                     alert("Server is taking too long to respond. Please try again later.");
//                 }
//                 return throwError(err);
//             })
//         );
//     }
// }
