import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-success-dialog-with-button',
 imports: [BreadcrumbModule, FormsModule, ButtonModule, MatDialogActions, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule, MatInputModule, MatFormFieldModule,  MatRadioModule, MatTabsModule, MatCheckboxModule,],
  templateUrl: './success-dialog-with-button.component.html',
  styleUrl: './success-dialog-with-button.component.scss'
})
export class SuccessDialogWithButtonComponent {
safeMessage: SafeHtml;

  
constructor(
  public dialogRef: MatDialogRef<SuccessDialogWithButtonComponent>, // ✅ Correct injection here
  @Inject(MAT_DIALOG_DATA) public data: any,
  private sanitizer: DomSanitizer
) {
  this.safeMessage = this.sanitizer.bypassSecurityTrustHtml(this.data.message);
}
}
