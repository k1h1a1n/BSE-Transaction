import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MenuHandlerService, ProcessedMenuItem, MenuItem } from '../services/menu-handler.service';

@Component({
  selector: 'app-menu-processor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-processor.html',
  styleUrls: ['./menu-processor.scss']
})
export class MenuProcessorComponent implements OnInit {
  angularMenus: ProcessedMenuItem[] = [];
  nonAngularMenus: ProcessedMenuItem[] = [];
  allMenusFlattened: ProcessedMenuItem[] = [];

  constructor(
    private menuHandlerService: MenuHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // This is your menu data from API
    const menuData: MenuItem[] = [
      // ... your menu structure here from the JSON provided
    ];

    // Process menus
    const { angularMenus, nonAngularMenus } = this.menuHandlerService.processMennus(menuData);
    
    this.angularMenus = angularMenus;
    this.nonAngularMenus = nonAngularMenus;
    this.allMenusFlattened = this.menuHandlerService.flattenMenus([...angularMenus, ...nonAngularMenus]);

    // Log results
    console.log('Angular Menus:', this.angularMenus);
    console.log('Non-Angular Menus:', this.nonAngularMenus);
    console.log('All Menus Flattened:', this.allMenusFlattened);
  }

  /**
   * Handle menu click
   */
  onMenuClick(menu: ProcessedMenuItem): void {
    console.log('Menu clicked:', menu.menuName);
    this.menuHandlerService.navigateToMenu(menu, this.router);
  }

  /**
   * Get menu by ID for specific operations
   */
  getSpecificMenu(menuId: string): ProcessedMenuItem | null {
    return this.menuHandlerService.getMenuById(
      [...this.angularMenus, ...this.nonAngularMenus],
      menuId
    );
  }

  /**
   * Example: Get all Angular menus related to Online Transactions
   */
  getOnlineTransactionMenus(): ProcessedMenuItem[] {
    const onlineTransactionMenu = this.angularMenus.find(m => m.menuId === '244');
    return onlineTransactionMenu?.children || [];
  }
}
