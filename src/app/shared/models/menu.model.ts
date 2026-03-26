export interface MenuItem {
  menuId: string;
  menuName: string;
  menuIcon: string;
  routerLink: string | null;
  displayOrder: number;
  isActive: boolean;
  hasChildren: boolean;
  level: number;
  parentMenuId: string;
  children: MenuItem[];
}

export interface MenuApiResponse {
  success: boolean;
  message: string;
  data: MenuItem[];
  errorCode: string | null;
  timestamp: string;
}

export interface MenuApiRequest {
  // username: string;
  roleId: number;
  userId: number;
}
