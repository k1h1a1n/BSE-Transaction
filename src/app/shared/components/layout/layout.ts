import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LeftSideMenu } from '../left-side-menu/left-side-menu';
import { PageHeader } from '../page-header/page-header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LeftSideMenu, PageHeader],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  
}
