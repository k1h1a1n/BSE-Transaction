// // src/app/shared/environments/environment.ts
// export class SharedEnv {
//   private static get configFileData() {
//     return (window as any)['APP_CONFIG'] || {};
//   }

//   private static get configData() {
//       console.log(this.configFileData.configData);
//     return this.configFileData.ConfigData || {};
//   }

  
//   private static get appSettings() {
//     return this.configData.personalizeSetting || {
//       autoAdvisorAuth: "",
//       skipPatternLock: false,
//       skipLogout: false,
//       externalLogoutUrl: "",
//       IsCreateNewUser: false,
//       IsInvestNow: false,
//       IsCreateNewUcc: false
//     };
//   }

//   static get baseUrl() { return this.configData.baseUrl || ''; }
//   static get baseUrlMF() { return this.configData.baseUrlMF || ''; }
//   static get baseVMPROUrl() { return this.configData.baseVMPROUrl || ''; }
//   static get ecasurl() { return this.configData.ecasurl || ''; }
//   static get onboarding() { return this.configData.onboarding || ''; }
//   static get uccUrl() { return this.configData.uccUrl || ''; }

//   static get IFAID() { return 'UaxOhI77stL7vN5hj3S4xg=='; }
//   static get IFAEmailId() { return 'shashikant.kale@saraswatbank.com'; }

//   static get GrouID() { return '0'; }

//   static get IsCreateNewUser() { return this.appSettings.IsCreateNewUser; }
//   static get IsInvestNow() { return this.appSettings.IsInvestNow; }
//   static get IsCreateNewUcc() { return this.appSettings.IsCreateNewUcc; }

//   static get ASSETS_CDN_URL() { return this.configData.assetsCdnUrl || ''; }
//   static get TermsandConditions() { return this.configData.termsAndCondUrl || ''; }

  

//   static logEnv() {
//     console.log('🌍 SharedEnv Snapshot:', {
//       baseUrl: this.baseUrl,
//       baseUrlMF: this.baseUrlMF,
//       baseVMPROUrl: this.baseVMPROUrl
//     });
//   }
// }




// const ConfigFileData = window['APP_CONFIG'];
const ConfigFileData = (window as any)['APP_CONFIG'];
const ConfigData = ConfigFileData?.['ConfigData'] || {};
const appSettings = ConfigData.personalizeSetting || {
  autoAdvisorAuth: "",
  skipPatternLock: false,
  skipLogout: false,
  externalLogoutUrl : "",
    IsCreateNewUser: false,
  IsInvestNow:  false,
  IsCreateNewUcc: false
};

// console.log('ConfigFileData : ', ConfigFileData);
export const SharedEnv = {

  baseUrl: ConfigData.baseUrl,
  sideMenuUrl: ConfigData.sideMenuUrl,
  baseUrlMF: ConfigData.baseUrlMF,
  baseVMPROUrl: ConfigData.baseVMPROUrl,
  ecasurl: ConfigData.ecasurl,
  onboarding: ConfigData.onboarding,  // for internal use : https://entifaonbrd.wm-enterprise.com & for client JhaveriTrade : http://wmentcustonbuat.jhaveritrade.com
  ASSETS_CDN_URL: ConfigData.assetsCdnUrl || '',
  TermsandConditions : ConfigData.termsAndCondUrl || '',
  ssoUrl : ConfigData.ssoUrl || '',
   uccUrl : ConfigData.uccUrl || '',
   elogUccUrl : ConfigData.elogUccUrl || '',
  isMobileOTP : ConfigData.isMobileOTP,
  ShareApp : ConfigFileData?.['ShareApp'],
  UPIHandles : ConfigFileData?.['UPIHandles'] || [],
  WhatsAppMsg : ConfigFileData?.['WhatsAppMsg'] || [],

  PersonalizeSetting : appSettings.autoAdvisorAuth,
  SkipLogout : appSettings.skipLogout,
  externalLogoutUrl : appSettings.externalLogoutUrl,
    IsCreateNewUser : appSettings.IsCreateNewUser,
  IsInvestNow : appSettings.IsInvestNow,
  IsCreateNewUcc : appSettings.IsCreateNewUcc,
  // IFADBNameDBKey : ConfigData.IFADBNameDBKey || '',
  
  // GrouID:'58',//'7275',//'0',
  GrouID:'7275',//'0',
  //  IFAID: "RJYvPoURzxtufN4kwyb9dg==",
 IFAID: '7BaxTwKLbS2mDfX6s3ls7g==',//'UaxOhI77stL7vN5hj3S4xg==',//'Ujdi5+kC5M7KmV6tgB2j3Q==',
  //  IFAID:  'UaxOhI77stL7vN5hj3S4xg==', //SB IFAID
  // IFAID: '27bgc7eiR5RoCV5xXvTcTQ==', // SB Prod IFAID
  IsWMPRO: true,
  GroupName:'',
  // IFAEmailId: 'tejas.gawde@datacomp.in',
  IFAEmailId: 'jyoti.pasi@datacomp.in',// jyoti pasi login ifadb 23

  // IFAEmailId: 'shashikant.kale@saraswatbank.com', // SB MailID
  // IFAEmailId: 'Admin', // SB Prod IFAEmialId
  ValidDocuTypes: ".xls,.xlsx,.doc,.docx,.pdf,.jpg,.png,.jpeg,.txt",
  timeOutErrorMsg:"",
  noInternetConnMsg:"",
  OrderCount:0,
  serverno:'0',
  //  IFAKey: "ocevM71Mb+iJMng/1p8iEwH8HKmPczdGiVjcaCxTpGc=",
  //  IFAKey: "MAvh9CEWMwNZ5JEbThW5Isl1/Gq8RbHygOUFgg9dnyk=",
   IFAKey: "ocevM71Mb+iJMng/1p8iEwH8HKmPczdGiVjcaCxTpGc=", // jyoti pasi login ifadb 23
userID:'1',


  // by pooja asOn 10/01/2025
  // MobileNo:'9769037605',
  // Email:'jureeze@gmail.com',
  // password:'070978',

  googleSheetsApiKey: 'AIzaSyBuqO-c0U6qlE11tBm6JPrUEt_wVCAC-vk',
  characters: {
    spreadsheetId: '16FQPS4WHP9bHCopgyBgyS8NEbuOWR18gfDB8GNmO9PA',
    worksheetName: 'Indices',
  }
};
console.log(SharedEnv,'sharedEnv');
