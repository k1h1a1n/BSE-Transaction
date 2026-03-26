import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedEnv } from '../../environments/environment';
import { Shared } from '../../services/shared';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { ProcessedMenuItem } from '../../services/menu-handler.service';

@Component({
  selector: 'app-sso',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './sso.html',
  styleUrl: './sso.scss',
})
export class Sso implements OnDestroy {
  // @Input() angularMenus: ProcessedMenuItem[] = [];
  
  // bseMFMenus: ProcessedMenuItem[] = [];
  // otherMenus: ProcessedMenuItem[] = [];
  
  isLoading = true;
  queryParamsSubscription: any;
  private destroy$ = new Subject<void>();

  // @Output() ssoLoaded = new EventEmitter<void>();

  constructor(   private route: ActivatedRoute,
    private router: Router,
    // private authService: AuthService,
    private sharedService: Shared
    ){
  
  }

 
// http://bsetransactionang.imagicuat.in/#/sso?PageURL=app/Registerlist&UserName=tejas.gawde@datacomp.in&UserID=1&IFAID=RJYvPoURzxtufN4kwyb9dg==&IFAKey=MAvh9CEWMwNZ5JEbThW5Isl1/Gq8RbHygOUFgg9dnyk=

ngOnInit(): void {
  console.log(' sso comp called');
  console.log('Full URL:', window.location.href);
  console.log('Hash:', window.location.hash);
  // console.log(this.angularMenus,'angular menus');
  
  // Separate menus based on redirectURL
  // this.separateMenusByRedirectURL();
  // console.log('BSEMF Menus:', this.bseMFMenus);
  // console.log('Other Menus:', this.otherMenus);
  
  // Extract params directly from hash using cleaner method
  const pageURL = this.getHashParam('PageURL');
  const userName = this.getHashParam('UserName');
  const ifaid = this.getHashParam('IFAID');
  const userId = this.getHashParam('UserID');
  const IFAKey = this.getHashParam('IFAKey');

  console.log('Extracted Hash Params:', { pageURL, userName, userId, ifaid, IFAKey });
  
  if (userName && ifaid && userId && IFAKey) {
    let Ifaid = ifaid;
    
    // Store data BEFORE navigation
    localStorage.setItem('PageURL', pageURL || '');
    localStorage.setItem('IFAID', Ifaid);
    localStorage.setItem('IFAEmailId', userName);
    localStorage.setItem('UserID', userId);
    localStorage.setItem('IFAKey', IFAKey);
    
    console.log('localStorage set:', {
      PageURL: localStorage.getItem('PageURL'),
      IFAID: localStorage.getItem('IFAID'),
      IFAEmailId: localStorage.getItem('IFAEmailId'),
      UserID: localStorage.getItem('UserID'),
      IFAKey: localStorage.getItem('IFAKey')
    });
    
    // Update SharedEnv
    SharedEnv.IFAID = Ifaid;
    SharedEnv.IFAKey = IFAKey;
    SharedEnv.IFAEmailId = userName;
    SharedEnv.userID = userId;
   
    this.sharedService.UpdateEnv();
    
    // Navigate to app layout with target route as child
    this.isLoading = false;
    
    // Normalize PageURL: decode, strip leading slashes and whitespace
    let routeNameRaw = pageURL || '';
    // Remove leading slashes if present and trim
    const routeName = routeNameRaw.replace(/^\/+/, '').trim();
    const routeNameLower = routeName.toLowerCase();

    // Store normalized PageURL for later use
    localStorage.setItem('PageURL', routeName);

    // Map PageURL (lowercased keys) to the app route we expect
    const routeMap: { [key: string]: string } = {
      'app/registerlist': 'app/registerdList',
      'app/registerdlist': 'app/registerdList',
      'registerlist': 'app/registerdList',
      'registerdlist': 'app/registerdList'
    };

    // Resolve target route: prefer mapped value, otherwise use the normalized value
    const targetRoute = routeMap[routeNameLower] || (routeName ? routeName : '/');
    console.log('Extracted Route Name (raw):', routeNameRaw);
    console.log('Normalized Route Name:', routeName);
    console.log('Target Route:', targetRoute);
    
    // const navigationPath = `/app/${targetRoute}`;
    // console.log('Navigating to:', navigationPath);
    
    // Build navigation segments to ensure router matches child routes correctly
    const navSegments = (targetRoute || '/').toString().split('/').filter(s => s !== '');
    // If targetRoute is absolute (starts with '/'), keep as absolute by adding leading empty segment
    const navigateArgs = navSegments.length ? navSegments : ['/'];

    this.router.navigate(navigateArgs, { 
      queryParams: {}, 
      replaceUrl: true,
      state: { IFAID: Ifaid, IFAEmailId: userName, UserID: userId, IFAKey: IFAKey }
    }).then(success => {
      console.log('Navigation success:', success);
      // Emit event after successful navigation
      // this.ssoLoaded.emit();
    }).catch(error => {
      console.error('Navigation error:', error);
      // Still emit event even if navigation fails to allow app to continue
      // this.ssoLoaded.emit();
    });
  } else {
    console.warn('Missing required parameters:', { pageURL, userName, userId, ifaid, IFAKey });
    this.isLoading = false;
    this.sharedService.OpenAlert('Authentication Error: Missing parameters.');
    // Emit event even with missing parameters to prevent app from hanging
    // this.ssoLoaded.emit();
  }
}

  // Helper method to extract single param from hash URL
  private getHashParam(paramName: string): string | null {
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    return hashParams.get(paramName);
  }

  /**
   * Separate menus based on whether redirectURL includes "BSEMFTransactionAng"
   */
  // private separateMenusByRedirectURL(): void {
  //   this.bseMFMenus = this.angularMenus.filter(menu => 
  //     menu.redirectURL && menu.redirectURL.includes('BSEMFTransactionAng')
  //   );
    
  //   this.otherMenus = this.angularMenus.filter(menu => 
  //     !menu.redirectURL || !menu.redirectURL.includes('BSEMFTransactionAng')
  //   );
  // }

  /**
   * Redirect to the menu's redirectURL or navigationPath
   */
  // redirectToURL(menu: ProcessedMenuItem): void {
  //   if (menu.redirectURL) {
  //     console.log('Redirecting to:', menu.redirectURL);
  //     window.location.href = menu.redirectURL;
  //   } else if (menu.navigationPath) {
  //     console.log('Navigating to route:', menu.navigationPath);
  //     this.router.navigate([menu.navigationPath]);
  //   } else {
  //     console.warn('No redirect URL or navigation path found for menu:', menu);
  //   }
  // }
  

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
}
