import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from "@angular/material/dialog";
import { MatRadioModule } from "@angular/material/radio";
import { MatTabsModule } from "@angular/material/tabs";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { Select } from "primeng/select";
import { SelectButton } from "primeng/selectbutton";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
    title: string;
    message: string;
  }

@Component({
    selector: 'app-dialog-box-ok-cancel',
    imports: [BreadcrumbModule, FormsModule, ButtonModule, ReactiveFormsModule, CommonModule, MatDialogContent,
     InputTextModule, MatInputModule, MatFormFieldModule, MatDialogActions,  MatRadioModule, MatTabsModule, MatCheckboxModule,],
    templateUrl: './dialog-box-ok-cancel.component.html',
    styleUrls: ['./dialog-box-ok-cancel.component.scss']
})

export class DialogBoxOkCancelComponent {

    constructor(
        public dialogRef: MatDialogRef<DialogBoxOkCancelComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
      ) {}
    
      onOk(): void {
        // Close dialog and send true as result
        this.dialogRef.close(true);
      }
    
      onClose(): void {
        // Close dialog and send false as result
        this.dialogRef.close(false);
      }
}