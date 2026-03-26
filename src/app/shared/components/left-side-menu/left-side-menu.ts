import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild } from '@angular/core';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { MenuHandlerService, ProcessedMenuItem, MenuItem } from '../../services/menu-handler.service';
import { Sso } from '../sso/sso';
import { SharedEnv } from '../../environments/environment';

@Component({
  selector: 'app-left-side-menu',
    standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, RouterModule],
  templateUrl: './left-side-menu.html',
  styleUrl: './left-side-menu.scss',
})
export class LeftSideMenu {
 panelOpenState = signal(false);
  menuItems: MenuItem[] = [];
  angularMenus: ProcessedMenuItem[] = [];
  nonAngularMenus: ProcessedMenuItem[] = [];
  isLoading = true;
  errorMessage = '';
    bseMFMenus: any[] = [];
  otherMenus: any[] = [];
  bsemfRedirectURLs: string[] = [];
  bsemfMenuObjects: MenuItem[] = [];
  private dynamicQueryParams: string = '';

  /**
   * Build query parameters dynamically from SharedEnv values and pageURL
   * @param pageURL - The page URL to pass as PageURL parameter (defaults to menu's routerLink)
   */
  private buildQueryParams(pageURL: string = '/OnlineTransaction/bse-placeorder'): string {
    const ifaid = SharedEnv.IFAID || 'RJYvPoURzxtufN4kwyb9dg==';
    const ifaKey = SharedEnv.IFAKey || 'MAvh9CEWMwNZ5JEbThW5Isl1/Gq8RbHygOUFgg9dnyk=';
    const username = SharedEnv.IFAEmailId || 'tejas.gawde@datacomp.in';
    const userId = SharedEnv.userID || '1';

    // URL encode the parameters
    const encodedUsername = encodeURIComponent(username);
    const encodedIfaid = encodeURIComponent(ifaid);
    const encodedIfaKey = encodeURIComponent(ifaKey);
    // Use encodeURI to preserve forward slashes in the path
    const encodedPageURL = encodeURI(pageURL);

    return `#/sso?PageURL=${encodedPageURL}&UserName=${encodedUsername}&UserID=${userId}&IFAID=${encodedIfaid}&IFAKey=${encodedIfaKey}`;
  }

  getUpdatedUserID() {
    let IFAID = SharedEnv.IFAID;
    let IFAKey = SharedEnv.IFAKey;
    let username = SharedEnv.IFAEmailId;

    console.log(IFAID, IFAKey, username, 'ifaid', 'IFAKey', 'username');
    
    // Build dynamic query params
    this.dynamicQueryParams = this.buildQueryParams();
    console.log('Dynamic Query Params:', this.dynamicQueryParams);
  }

  @ViewChild('nestedAccordion') nestedAccordion!: MatAccordion;

  constructor(
    private menuService: MenuService,
    private menuHandlerService: MenuHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUpdatedUserID();
    this.loadMenu();
  }
  private get runtimeConfig() {
    return (window as any).__RUNTIME_CONFIG__ || { apiBaseUrl: 'not founds' };
  }
  loadMenu(forceRefresh: boolean = false): void {
    const request = {
      // username: SharedEnv.UserName || 'defaultUser',
      roleId: 1,
      userId: 1
    };

    const menuObservable = forceRefresh 
      ? this.menuService.refreshMenu(request)
      : this.menuService.getSideMenu(request);

    menuObservable.subscribe({
      next: (response) => {
        if (response.success) {
          // Cast response data to correct MenuItem type
          this.menuItems = response.data as MenuItem[];
          

          // ason 4-02-2026
          
          // Process menus based on isAngular flag
          const { angularMenus, nonAngularMenus } = this.menuHandlerService.processMennus(this.menuItems);
          this.angularMenus = angularMenus;
          this.nonAngularMenus = nonAngularMenus;
          
          // Extract and store BSEMF URLs from all menu items on load
          this.extractAndStoreBSEMFURLs(this.menuItems);
          
          // Extract and store external URL mappings for non-Angular menus
          this.extractAndStoreExternalURLMappings(this.menuItems);
     
          
          console.log('Angular Menus:', this.angularMenus);
          console.log('Non-Angular Menus:', this.nonAngularMenus);
          console.log('All Menu Items:', this.menuItems);
          console.log('BSEMF URLs in localStorage:', localStorage.getItem('redirectURL'));
          console.log('External URL Mappings in localStorage:', localStorage.getItem('externalURLMappings'));
          
          this.isLoading = false;
        } else {
          this.errorMessage = response.message;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading menu:', error);
        this.errorMessage = 'Failed to load menu';
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle menu navigation based on isAngular flag and redirectURL
   * isAngular: "True" -> Redirect to redirectURL (BSEMF Transaction Angular URL)
   * isAngular: "False" -> Redirect to redirectURL (External URL like wealthmagicclone)
   * For BSEMF URLs, appends dynamic query parameters with menu's routerLink as PageURL
   */
  redirectToURL(menu: MenuItem | ProcessedMenuItem): void {
    console.log('Menu clicked:', menu.menuName);
    console.log('isAngular:', menu.isAngular);
    console.log('redirectURL:', menu.redirectURL);
    console.log('routerLink:', menu.routerLink);
    
    // Case 1: isAngular is "True" with redirectURL (BSEMF URLs)
    if (menu.isAngular === 'True' && menu.redirectURL) {
      let finalURL = menu.redirectURL;
      
      // Check if URL contains 'BSEMFTransactionAng' and append query parameters
      // if (menu.redirectURL.includes('BSEMFTransactionAng')) {
         if (menu.redirectURL.includes('BSEMFTransactionAng') || menu.redirectURL.includes('MFTransactionUI')) {
        this.storeBSEMFRedirectURL(menu.redirectURL);
        // Use menu's routerLink as PageURL, or fallback to default
        const pageURL = menu.routerLink || '/OnlineTransaction/bse-placeorder';
        const queryParams = this.buildQueryParams(pageURL);
        finalURL = menu.redirectURL + queryParams;
        console.log('Redirecting to BSEMF URL with PageURL:', pageURL);
        console.log('Final URL:', finalURL);
        window.location.href = finalURL;
      } else {
        // Non-BSEMF external URL
        console.log('Redirecting to :', menu.routerLink);
        // window.location.href = finalURL;
      }
    }
    // Case 2: isAngular is "False" with redirectURL (External URL)
    else if (menu.isAngular === 'False' && menu.redirectURL) {
      // Combine redirectURL + routerLink for the final URL
      let finalURL = menu.redirectURL;
      if (menu.routerLink && !menu.redirectURL.includes(menu.routerLink)) {
        // Only append routerLink if it's not already in the redirectURL
        finalURL = menu.redirectURL + menu.routerLink;
      }
      
      // Store the mapping in localStorage
      if (menu.routerLink) {
        this.storeExternalURLMapping(menu.redirectURL, menu.routerLink, menu.menuName, menu);
        console.log('Stored External URL Mapping:', { 
          redirectURL: menu.redirectURL, 
          routerLink: menu.routerLink,
          combinedURL: finalURL 
        });
      }
      
      console.log('Redirecting to External URL:', finalURL);
      window.location.href = finalURL;
    }
    // Case 3: routerLink exists and isAngular is "True" (Angular route navigation)
    else if (menu.routerLink && this.isAngularMenu(menu)) {
      console.log('Navigating to route:', menu.routerLink);
      this.router.navigate([menu.routerLink]);
    }
    // Case 4: routerLink exists and isAngular is "False" (External link)
    else if (menu.routerLink) {
      console.log('Redirecting to external:', menu.routerLink);
      window.location.href = menu.routerLink;
    }
    // Case 5: No valid navigation path
    else {
      console.warn('No valid redirect URL or router link for menu:', menu);
    }
  }
  /**
   * Extract all external URL + routerLink mappings from menu hierarchy on load
   * Recursively traverse all menu levels to find non-Angular menu items with redirectURL and routerLink
   */
  private extractAndStoreExternalURLMappings(menuItems: MenuItem[]): void {
    // Recursive function to traverse menu hierarchy
    const traverseMenus = (menus: MenuItem[] | ProcessedMenuItem[]): void => {
      menus.forEach(menu => {
        // Check if this menu is non-Angular (isAngular === 'False') with both redirectURL and routerLink
        if (menu.isAngular === 'False' && menu.redirectURL && menu.routerLink) {
          this.storeExternalURLMapping(menu.redirectURL, menu.routerLink, menu.menuName, menu);
          console.log('External URL Mapping found and stored:', {
            menuName: menu.menuName,
            redirectURL: menu.redirectURL,
            routerLink: menu.routerLink
          });
        }
        
        // Recursively traverse children if they exist
        if (menu.children && menu.children.length > 0) {
          traverseMenus(menu.children);
        }
      });
    };
    
    // Start traversal from root menu items
    traverseMenus(menuItems);
    
    const storedMappings = localStorage.getItem('externalURLMappings');
    if (storedMappings) {
      console.log('External URL Mappings extracted and stored on load:', JSON.parse(storedMappings));
    } else {
      console.log('No external URL mappings found in menu hierarchy');
    }
  }

  /**
   * Extract all BSEMF redirect URLs and menu objects from menu hierarchy on load
   * Recursively traverse all menu levels to find menu items containing 'BSEMFTransactionAng' URLs
   */
  private extractAndStoreBSEMFURLs(menuItems: MenuItem[]): void {
    const bsemfURLs: Set<string> = new Set();
    const bsemfMenus: MenuItem[] = [];
    
    // Recursive function to traverse menu hierarchy
    const traverseMenus = (menus: MenuItem[] | ProcessedMenuItem[]): void => {
      menus.forEach(menu => {
        // Check if this menu has a BSEMF redirect URL
        // if (menu.redirectURL && menu.redirectURL.includes('BSEMFTransactionAng')) {
            if (menu.redirectURL && (menu.redirectURL.includes('BSEMFTransactionAng') || menu.redirectURL.includes('MFTransactionUI'))) {
          bsemfURLs.add(menu.redirectURL);
          bsemfMenus.push(menu as MenuItem);
          console.log('BSEMF Menu found:', menu.menuName, '- URL:', menu.redirectURL);
        }
        
        // Recursively traverse children if they exist
        if (menu.children && menu.children.length > 0) {
          traverseMenus(menu.children);
        }
      });
    };
    
    // Start traversal from root menu items
    traverseMenus(menuItems);
    
    // Convert Set to Array and store in localStorage
    if (bsemfURLs.size > 0) {
      const urlArray = Array.from(bsemfURLs);
      
      // For each BSEMF menu, append dynamic query parameters with its own routerLink as PageURL
      const urlsWithParams = urlArray.map((url, index) => {
        const menu = bsemfMenus[index];
        const pageURL = menu.routerLink || '/OnlineTransaction/bse-placeorder';
        const queryParams = this.buildQueryParams(pageURL);
        return url + queryParams;
      });
      
      // Append dynamic query parameters to each menu object's redirectURL with its own routerLink
      const bsemfMenusWithParams = bsemfMenus.map(menu => {
        const pageURL = menu.routerLink || '/OnlineTransaction/bse-placeorder';
        const queryParams = this.buildQueryParams(pageURL);
        return {
          ...menu,
          redirectURL: menu.redirectURL + queryParams
        };
      });
      
      // Store URLs with query parameters
      localStorage.setItem('redirectURL', JSON.stringify(urlsWithParams));
      this.bsemfRedirectURLs = urlsWithParams;
      
      // Store menu objects with query parameters in redirectURL
      localStorage.setItem('bsemfMenuObjects', JSON.stringify(bsemfMenusWithParams));
      this.bsemfMenuObjects = bsemfMenusWithParams;
      
      console.log('BSEMF URLs extracted from menu on load:', urlsWithParams);
      console.log('BSEMF Menu Objects stored with dynamic PageURL:', bsemfMenusWithParams);
    } else {
      console.log('No BSEMF URLs found in menu hierarchy');
    }
  }

  /**
   * Store BSEMF redirect URL and menu object when menu is clicked (add to existing list)
   */
  private storeBSEMFRedirectURL(url: string): void {
    // Get existing URLs from localStorage
    const storedURLs = localStorage.getItem('redirectURL');
    let urlList: string[] = [];
    
    if (storedURLs) {
      try {
        urlList = JSON.parse(storedURLs);
      } catch (error) {
        console.error('Error parsing stored URLs:', error);
        urlList = [];
      }
    }
    
    // Add URL if not already in list
    if (!urlList.includes(url)) {
      urlList.push(url);
      // Update localStorage and local property
      localStorage.setItem('redirectURL', JSON.stringify(urlList));
      this.bsemfRedirectURLs = urlList;
      console.log('BSEMF URL added to storage:', urlList);
    }
  }

  /**
   * Store external URL + routerLink mapping for non-Angular menus
   * Creates a mapping of redirectURL with its corresponding routerLink
   */
  // private storeExternalURLMapping(redirectURL: string, routerLink: string, menuName: string): void {
  //   // Get existing mappings from localStorage
  //   const storedMappings = localStorage.getItem('externalURLMappings');
  //   let mappings: Array<{ redirectURL: string; routerLink: string; menuName: string }> = [];
    
  //   if (storedMappings) {
  //     try {
  //       mappings = JSON.parse(storedMappings);
  //     } catch (error) {
  //       console.error('Error parsing stored mappings:', error);
  //       mappings = [];
  //     }
  //   }
    
  //   // Check if mapping already exists
  //   const existingIndex = mappings.findIndex(m => m.redirectURL === redirectURL && m.routerLink === routerLink);
    
  //   if (existingIndex === -1) {
  //     // Add new mapping if it doesn't exist
  //     mappings.push({ redirectURL, routerLink, menuName });
  //     localStorage.setItem('externalURLMappings', JSON.stringify(mappings));
  //     console.log('External URL Mapping stored:', { redirectURL, routerLink, menuName });
  //   } else {
  //     console.log('External URL Mapping already exists:', { redirectURL, routerLink, menuName });
  //   }
  // }

    private storeExternalURLMapping(redirectURL: string, routerLink: string, menuName: string, menu?: MenuItem | ProcessedMenuItem): void {
    // Get existing mappings from localStorage
    const storedMappings = localStorage.getItem('externalURLMappings');
    let mappings: Array<any> = [];
    
    if (storedMappings) {
      try {
        mappings = JSON.parse(storedMappings);
      } catch (error) {
        console.error('Error parsing stored mappings:', error);
        mappings = [];
      }
    }
    
    // Check if mapping already exists
    const existingIndex = mappings.findIndex(m => m.routerLink === routerLink && m.menuId === (menu as any)?.menuId);
    
    if (existingIndex === -1) {
      // Combine redirectURL + routerLink
      let combinedURL = redirectURL;
      if (routerLink && !redirectURL.includes(routerLink)) {
        combinedURL = redirectURL + routerLink;
      }
      
      // Store complete menu object with combined redirectURL
      const mappingObject = menu ? { 
        ...menu,
        redirectURL: combinedURL  // Store combined URL in redirectURL property
      } : { 
        menuId: '',
        menuName, 
        menuIcon: '',
        routerLink,
        displayOrder: 0,
        isActive: true,
        hasChildren: false,
        level: 0,
        parentMenuId: '',
        redirectURL: combinedURL,  // Store combined URL
        isAngular: 'False',
        children: []
      };
      
      mappings.push(mappingObject);
      
      localStorage.setItem('externalURLMappings', JSON.stringify(mappings));
      console.log('External URL Mapping stored with combined redirectURL:', mappingObject);
    } else {
      console.log('External URL Mapping already exists for routerLink:', routerLink);
    }
  }

  /**
   * Check if menu isAngular flag is "True"
   */
  private isAngularMenu(menu: MenuItem | ProcessedMenuItem): boolean {
    if ('isAngularMenu' in menu) {
      return (menu as ProcessedMenuItem).isAngularMenu;
    }
    return (menu as MenuItem).isAngular === 'True';
  }

  refreshMenu(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadMenu(true);
  }

  closeNestedPanels() {
    if (this.nestedAccordion) {
      this.nestedAccordion.closeAll();
    }
  }
  
//  by pooja ason 4-02-2026
  private separateMenusByRedirectURL(): void {
    this.bseMFMenus = this.angularMenus.filter(menu => 
      menu.redirectURL && (menu.redirectURL.includes('BSEMFTransactionAng') || menu.redirectURL.includes('MFTransactionUI'))
    );
    
    this.otherMenus = this.angularMenus.filter(menu => 
      !menu.redirectURL || (!menu.redirectURL.includes('BSEMFTransactionAng') || !menu.redirectURL.includes('MFTransactionUI'))
    );
  } 
  //   redirectToURL(menu: any): void {
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

  // end here
}
