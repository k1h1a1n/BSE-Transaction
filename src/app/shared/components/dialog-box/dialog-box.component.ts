import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-box',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule, MatInputModule, MatFormFieldModule,  MatRadioModule, MatTabsModule, MatCheckboxModule,   
  
  MatButtonModule,
  MatIconModule,
  MatRadioModule,
  MatTabsModule,
  MatDialogModule],
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.scss'
})
export class DialogBoxComponent {
  // data = inject(MAT_DIALOG_DATA);
 // message : string = ""


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
   
  }

}
