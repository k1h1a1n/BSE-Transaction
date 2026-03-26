import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog-box',
  imports: [BreadcrumbModule, MatDialogModule,FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule, MatFormFieldModule, MatDialogActions, MatInputModule,  MatRadioModule, MatTabsModule, MatCheckboxModule,],
  templateUrl: './confirm-dialog-box.component.html',
  styleUrl: './confirm-dialog-box.component.scss'
})
export class ConfirmDialogBoxComponent {
constructor(
    public dialogRef: MatDialogRef<ConfirmDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // onConfirm(): void {
  //   this.dialogRef.close('yes');
  // }

  // onCancel(): void {
  //   this.dialogRef.close('no');
  // }

  onConfirm(): void {
  this.dialogRef.close(true);
}

onCancel(): void {
  this.dialogRef.close(false);
}

}
