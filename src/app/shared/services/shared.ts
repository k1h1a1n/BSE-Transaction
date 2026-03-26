import { Injectable } from '@angular/core';
import { DialogBoxComponent } from '../components/dialog-box/dialog-box.component';
import { ConfirmDialogBoxComponent } from '../components/dialog-box/confirm-dialog-box/confirm-dialog-box.component';
import { SuccessDialogWithButtonComponent } from '../components/dialog-box/success-dialog-with-button/success-dialog-with-button.component';
import { Observable } from 'rxjs';
import { ComingSoonDialogBoxComponent } from '../components/dialog-box/coming-soon-dialog-box/coming-soon-dialog-box.component';
import { SuccessDialogBoxComponent } from '../components/dialog-box/success-dialog-box/success-dialog-box.component';
import { DialogBoxOkCancelComponent } from '../components/dialog-box/dialog-box-ok-cancel.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedEnv } from '../environments/environment';

declare const OpenAlertPopUpCallback: any;
declare const OpenConfirmPopUp: any;

@Injectable({
  providedIn: 'root',
})
export class Shared {
 constructor(private dialog: MatDialog) {}

  UpdateEnv(){
    // const ConfigFileData = window['APP_CONFIG'];
    const ConfigFileData = (window as any)['APP_CONFIG'];
    const ConfigData = ConfigFileData?.['ConfigData'] || {};
    console.log('SharedService ConfigFileData :', ConfigFileData);
    const appSettings = ConfigData.personalizeSetting || {
      autoAdvisorAuth: "",
      skipPatternLock: false,
      skipLogout: false,
      externalLogoutUrl: "",
        IsCreateNewUser: false,
      IsInvestNow: false,
      IsCreateNewUcc: false

    };

    SharedEnv.baseUrl = ConfigData.baseUrl;
    SharedEnv.sideMenuUrl = ConfigData.sideMenuUrl;
    SharedEnv.baseUrlMF = ConfigData.baseUrlMF;
    SharedEnv.baseVMPROUrl = ConfigData.baseVMPROUrl;
    SharedEnv.ecasurl = ConfigData.ecasurl;
    SharedEnv.ssoUrl = ConfigData.ssoUrl;
    SharedEnv.uccUrl = ConfigData.uccUrl;
    SharedEnv.elogUccUrl = ConfigData.elogUccUrl;
    SharedEnv.onboarding = ConfigData.onboarding;
    SharedEnv.ASSETS_CDN_URL = ConfigData.assetsCdnUrl || '';
    SharedEnv.TermsandConditions = ConfigData.termsAndCondUrl || '';
    SharedEnv.PersonalizeSetting = appSettings.autoAdvisorAuth;
    SharedEnv.SkipLogout = appSettings.skipLogout;
    SharedEnv.externalLogoutUrl = appSettings.externalLogoutUrl;
    SharedEnv.IsCreateNewUcc = appSettings.IsCreateNewUcc,
    SharedEnv.IsCreateNewUser = appSettings.IsCreateNewUser,
    SharedEnv.IsInvestNow = appSettings.IsInvestNow,

    // ason 23-01-2025 by pooja to set IFAID , GrouID , IFAEmailId , UserName from qury param sso localstorage
  //   SharedEnv.IFAID = localStorage.getItem('IFAID') || SharedEnv.IFAID || '';
  //   SharedEnv.IFAEmailId = localStorage.getItem('IFAEmailId') || SharedEnv.IFAEmailId || '';
  // SharedEnv.userID = localStorage.getItem('UserID') || SharedEnv.userID || '';
      SharedEnv.IFAID = localStorage.getItem('IFAID')  || '';
    SharedEnv.IFAEmailId = localStorage.getItem('IFAEmailId') || '';
  SharedEnv.userID = localStorage.getItem('UserID')  || '';
    // end here
  
    if(appSettings.skipPatternLock){
      localStorage.setItem("patternsel", "skip");
    }

    // SharedEnv.IFADBNameDBKey = ConfigData.IFADBNameDBKey || '';
    
    SharedEnv.isMobileOTP = ConfigData.isMobileOTP;
    SharedEnv.ShareApp = ConfigFileData?.['ShareApp'];
    SharedEnv.UPIHandles = ConfigFileData?.['UPIHandles'] || [];
    SharedEnv.WhatsAppMsg = ConfigFileData?.['WhatsAppMsg'] || [];

   
    console.log('UpdateEnv:', SharedEnv);
  }









  openDialog(message: string, title: string = 'Alert') {
    this.dialog.open(DialogBoxComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px'
    });
  }

    openSuccessDialog(message: string, title: string = 'Success') {
    this.dialog.open(SuccessDialogBoxComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px'
    });
  }

  openDialogBox(message: string, title: string = 'Alert'): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px',
    });
  
    return dialogRef.afterClosed(); // <-- Important!
  }

  openOkCloseDialog(message: string, title: string = 'Alert'): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogBoxOkCancelComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px'
    });

    return dialogRef.afterClosed();
    
  }

  successDialog(message: string, title: string = 'Success') {
    const dialogRef = this.dialog.open(SuccessDialogBoxComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px'
    });
   return dialogRef;
  }



successDia(message: string) {
  const dialogRef = this.dialog.open(SuccessDialogBoxComponent, {
    data: { message, title: 'Success' },
    disableClose: true,
    width: '350px'
  });

  return dialogRef.afterClosed();   // ⬅ IMPORTANT
}


  openComingSoonDialog(title: string, message: string) {
    return this.dialog.open(ComingSoonDialogBoxComponent, {
      width: '400px',
      data: { title, message },
      disableClose: true
    });
  }

  // openConfirmDialog(title: string, message: string) {
  //   return this.dialog.open(ConfirmDialogBoxComponent, {
  //     width: '350px',
  //     data: { title, message },
  //     disableClose: true
  //   });
  // }

  openConfirmDialog(message: string, callback: (result: boolean) => void) {
  const dialogRef = this.dialog.open(ConfirmDialogBoxComponent, {
    width: '350px',
    data: { title: "Confirm", message },
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((result) => {
    callback(result === true);  // Ensures proper boolean
  });
}


  openSuccessDialogBox(message: string, title: string = 'Successful.....!'): Observable<boolean> {
    const dialogRef = this.dialog.open(SuccessDialogWithButtonComponent, {
      data: { message, title },
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      width: '350px',
    });
  
    return dialogRef.afterClosed(); // <-- Important!
  }

// added by pooja as on 12-sep-2025
  openAlertPopup(
  message: string,
  callback: () => void,
  title: string = 'Successful.....!'
): void {
  const dialogRef = this.dialog.open(SuccessDialogWithButtonComponent, {
    data: { message, title },
    disableClose: true,
    backdropClass: 'dialog-backdrop',
    width: '350px',
  });

  // When dialog closes, call the callback
  dialogRef.afterClosed().subscribe(() => {
    if (callback) {
      callback();
    }
  });
}

openConfirmDialogPopup(
  title: string,
  message: string,
  callback: (result: boolean) => void
): void {
  const dialogRef = this.dialog.open(ConfirmDialogBoxComponent, {
    width: '350px',
    data: { title, message },
    disableClose: true
  });

  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (callback) {
      callback(result);
    }
  });
}





OpenAlert(message: string, callback?: (isOk: boolean) => void): void {
  const dialogRef = this.dialog.open(DialogBoxComponent, {
    data: { message, title: 'Alert' },
    disableClose: true,
    backdropClass: 'dialog-backdrop',
    width: '350px'
  });

  dialogRef.afterClosed().subscribe((result: boolean) => {
    if (callback) {
      callback(result); // result will be true/false based on user action
    }
  });
}

  
}


