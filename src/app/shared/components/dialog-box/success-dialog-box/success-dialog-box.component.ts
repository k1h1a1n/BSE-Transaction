import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
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
  selector: 'app-success-dialog-box',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule, MatDialogActions, MatFormFieldModule, MatInputModule,  MatRadioModule, MatTabsModule, MatCheckboxModule,],
  templateUrl: './success-dialog-box.component.html',
  styleUrl: './success-dialog-box.component.scss'
})
export class SuccessDialogBoxComponent  {
//public dialogRef: MatDialogRef<SuccessDialogBoxComponent>

  constructor(
    public dialogRef: MatDialogRef<SuccessDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onOkClick() {
    this.dialogRef.close(true);   // Send OK result back
  }
}
