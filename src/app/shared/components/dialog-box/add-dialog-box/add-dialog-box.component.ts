import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  selector: 'app-add-dialog-box',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule,  MatRadioModule, MatTabsModule, MatCheckboxModule,  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatRadioModule,
  MatTabsModule,
  MatDialogModule],
  templateUrl: './add-dialog-box.component.html',
  styleUrl: './add-dialog-box.component.scss'
})
export class AddDialogBoxComponent {
inputText = '';
  showError = false;

  constructor(
    public dialogRef: MatDialogRef<AddDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onInputChange() {
    if (this.inputText.trim()) {
      this.showError = false;
    }
  }

  onAddClick(): void {
    if (!this.inputText.trim()) {
      this.showError = true;
      return;
    }
    this.dialogRef.close(this.inputText.trim());
  }

  onCancelClick(): void {
    this.dialogRef.close(null);
  }
}
