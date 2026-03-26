import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MenuApiResponse, MenuApiRequest, MenuItem } from '../models/menu.model';
import { SharedEnv } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
   private get runtimeConfig() {
    return (window as any).__RUNTIME_CONFIG__ || { apiBaseUrl: 'not founds' };
  }
  private apiUrl = `${SharedEnv.sideMenuUrl}/menu/side-menu`;
  //  private apiUrl = `https://MFTransactionapi.wm-enterprise.com/api/menu/side-menu`;
  private menuStorageKey = 'side_menu_data';
  private menuTimestampKey = 'side_menu_timestamp';
  private cacheExpiryHours = 24; // Cache expiry time in hours

  constructor(private http: HttpClient) { }

  getSideMenu(request: MenuApiRequest): Observable<MenuApiResponse> {
    // Check if cached menu exists and is valid
    const cachedMenu = this.getMenuFromStorage();
    if (cachedMenu) {
      return of(cachedMenu);
    }

    // Fetch from API and cache the result
    return this.http.post<MenuApiResponse>(this.apiUrl, request).pipe(
      tap(response => {
        if (response.success) {
          this.saveMenuToStorage(response);
        }
      })
    );
  }

  private saveMenuToStorage(menuData: MenuApiResponse): void {
    try {
      localStorage.setItem(this.menuStorageKey, JSON.stringify(menuData));
      localStorage.setItem(this.menuTimestampKey, new Date().getTime().toString());
    } catch (error) {
      console.error('Error saving menu to localStorage:', error);
    }
  }

  private getMenuFromStorage(): MenuApiResponse | null {
    try {
      const menuData = localStorage.getItem(this.menuStorageKey);
      const timestamp = localStorage.getItem(this.menuTimestampKey);

      if (!menuData || !timestamp) {
        return null;
      }

      // Check if cache has expired
      const cacheTime = parseInt(timestamp, 10);
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff > this.cacheExpiryHours) {
        this.clearMenuStorage();
        return null;
      }

      return JSON.parse(menuData) as MenuApiResponse;
    } catch (error) {
      console.error('Error reading menu from localStorage:', error);
      return null;
    }
  }

  clearMenuStorage(): void {
    try {
      localStorage.removeItem(this.menuStorageKey);
      localStorage.removeItem(this.menuTimestampKey);
    } catch (error) {
      console.error('Error clearing menu from localStorage:', error);
    }
  }

  refreshMenu(request: MenuApiRequest): Observable<MenuApiResponse> {
    this.clearMenuStorage();
    return this.getSideMenu(request);
  }
}
