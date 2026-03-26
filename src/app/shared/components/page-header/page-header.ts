import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  imports: [MatIconModule, MatButtonModule, MatMenuModule], 
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {

}
