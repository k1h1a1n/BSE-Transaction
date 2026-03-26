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


@Component({
  selector: 'app-coming-soon-dialog-box',
  imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule,  MatInputModule, MatRadioModule, MatFormFieldModule, MatTabsModule, MatCheckboxModule, MatDialogActions],
  templateUrl: './coming-soon-dialog-box.component.html',
  styleUrl: './coming-soon-dialog-box.component.scss'
})
export class ComingSoonDialogBoxComponent {
constructor(
    public dialogRef: MatDialogRef<ComingSoonDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
