import { Injectable } from '@angular/core';

export interface MenuItem {
  menuId: string;
  menuName: string;
  menuIcon: string;
  routerLink: string | null;
  redirectURL: string | null;
  displayOrder: number;
  isActive: boolean;
  hasChildren: boolean;
  level: number;
  parentMenuId: string;
  isAngular: string;
  children: MenuItem[];
}

export interface ProcessedMenuItem extends Omit<MenuItem, 'children'> {
  navigationPath: string | null; // Either routerLink or redirectURL based on isAngular
  isAngularMenu: boolean; // True if isAngular === "True"
  children: ProcessedMenuItem[]; // Properly typed children
}

@Injectable({
  providedIn: 'root'
})
export class MenuHandlerService {

  /**
   * Process menu data and separate Angular and non-Angular menus
   * Each menu is evaluated based on its own isAngular flag
   * @param menus - Raw menu data from API
   * @returns Object with angularMenus and nonAngularMenus arrays
   */
  processMennus(menus: MenuItem[]): { angularMenus: ProcessedMenuItem[]; nonAngularMenus: ProcessedMenuItem[] } {
    const processedMenus = this.transformMenus(menus);
    
    // Create maps for quick lookup
    const allMenusMap = new Map<string, ProcessedMenuItem>();
    this.flattenMenus(processedMenus).forEach(m => {
      allMenusMap.set(m.menuId, m);
    });
    
    // Separate menus into Angular and Non-Angular
    const angularMenus: ProcessedMenuItem[] = [];
    const nonAngularMenus: ProcessedMenuItem[] = [];
    
    allMenusMap.forEach(menu => {
      if (menu.isAngularMenu) {
        angularMenus.push(menu);
      } else {
        nonAngularMenus.push(menu);
      }
    });
    
    // Build hierarchies
    const angularHierarchy = this.buildTreeHierarchy(angularMenus, allMenusMap);
    const nonAngularHierarchy = this.buildTreeHierarchy(nonAngularMenus, allMenusMap);
    
    console.log('Angular Menus Count:', angularMenus.length);
    console.log('Non-Angular Menus Count:', nonAngularMenus.length);
    console.log('All Menus Map:', allMenusMap);
    
    return {
      angularMenus: angularHierarchy,
      nonAngularMenus: nonAngularHierarchy
    };
  }

  /**
   * Build tree hierarchy for menus of a specific type
   * A menu becomes root if parent is not in the same group
   */
  private buildTreeHierarchy(
    menuList: ProcessedMenuItem[],
    allMenusMap: Map<string, ProcessedMenuItem>
  ): ProcessedMenuItem[] {
    const menuIdSet = new Set(menuList.map(m => m.menuId));
    const result: ProcessedMenuItem[] = [];
    const processed = new Set<string>();

    menuList.forEach(menu => {
      if (processed.has(menu.menuId)) return;

      // Check if parent exists in this group
      const parent = menu.parentMenuId !== '0' ? allMenusMap.get(menu.parentMenuId) : null;
      const parentInGroup = parent && menuIdSet.has(parent.menuId);

      // If parent is not in this group, this is a root
      if (!parentInGroup) {
        const treeNode = this.buildNode(menu, menuList, allMenusMap, menuIdSet, processed);
        result.push(treeNode);
        processed.add(menu.menuId);
      }
    });

    return result;
  }

  /**
   * Recursively build a menu node with its children
   */
  private buildNode(
    menu: ProcessedMenuItem,
    menuList: ProcessedMenuItem[],
    allMenusMap: Map<string, ProcessedMenuItem>,
    menuIdSet: Set<string>,
    processed: Set<string>
  ): ProcessedMenuItem {
    const children: ProcessedMenuItem[] = [];

    menuList.forEach(item => {
      if (item.parentMenuId === menu.menuId && menuIdSet.has(item.menuId)) {
        const childNode = this.buildNode(item, menuList, allMenusMap, menuIdSet, processed);
        children.push(childNode);
        processed.add(item.menuId);
      }
    });

    return {
      ...menu,
      children
    };
  }

  /**
   * Transform menus to add navigationPath based on isAngular flag
   */
  private transformMenus(menus: MenuItem[]): ProcessedMenuItem[] {
    return menus.map(menu => this.transformMenuItem(menu));
  }

  /**
   * Transform a single menu item and its children
   */
  private transformMenuItem(menu: MenuItem): ProcessedMenuItem {
    const isAngularMenu = menu.isAngular === 'True';
    const navigationPath = isAngularMenu ? menu.routerLink : menu.redirectURL;

    return {
      ...menu,
      navigationPath,
      isAngularMenu,
      children: menu.children && menu.children.length > 0
        ? menu.children.map(child => this.transformMenuItem(child))
        : []
    };
  }


  /**
   * Filter menus by Angular flag (recursive)
   */
  private filterMenusByAngular(menus: ProcessedMenuItem[], isAngular: boolean): ProcessedMenuItem[] {
    return menus.filter(menu => menu.isAngularMenu === isAngular).map(menu => ({
      ...menu,
      children: this.filterMenusByAngular(menu.children, isAngular)
    }));
  }

  /**
   * Flatten menu hierarchy to get all menus as single array
   */
  flattenMenus(menus: ProcessedMenuItem[]): ProcessedMenuItem[] {
    let flattened: ProcessedMenuItem[] = [];
    
    menus.forEach(menu => {
      flattened.push({
        ...menu,
        children: []
      });
      if (menu.children && menu.children.length > 0) {
        flattened = flattened.concat(this.flattenMenus(menu.children));
      }
    });
    
    return flattened;
  }

  /**
   * Get menu by menuId
   */
  getMenuById(menus: ProcessedMenuItem[], menuId: string): ProcessedMenuItem | null {
    for (const menu of menus) {
      if (menu.menuId === menuId) {
        return menu;
      }
      if (menu.children && menu.children.length > 0) {
        const found = this.getMenuById(menu.children, menuId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Navigate based on menu type
   */
  navigateToMenu(menu: ProcessedMenuItem, router: any): void {
    if (!menu.navigationPath) {
      console.warn('No navigation path for menu:', menu.menuName);
      return;
    }

    if (menu.isAngularMenu) {
      // Internal Angular routing
      router.navigate([menu.navigationPath]);
    } else {
      // External URL redirect
      window.location.href = menu.navigationPath;
    }
  }

  /**
   * Group menus by parent
   */
  groupMenusByParent(menus: MenuItem[]): { [parentId: string]: MenuItem[] } {
    const grouped: { [parentId: string]: MenuItem[] } = {};
    
    const flatMenus = this.flattenRawMenus(menus);
    
    flatMenus.forEach(menu => {
      const parentId = menu.parentMenuId;
      if (!grouped[parentId]) {
        grouped[parentId] = [];
      }
      grouped[parentId].push(menu);
    });
    
    return grouped;
  }

  /**
   * Flatten raw menu hierarchy
   */
  private flattenRawMenus(menus: MenuItem[]): MenuItem[] {
    let flattened: MenuItem[] = [];
    
    menus.forEach(menu => {
      flattened.push({
        ...menu,
        children: []
      });
      if (menu.children && menu.children.length > 0) {
        flattened = flattened.concat(this.flattenRawMenus(menu.children));
      }
    });
    
    return flattened;
  }
}
