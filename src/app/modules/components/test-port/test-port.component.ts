import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MatTabsModule } from '@angular/material/tabs';
import { AddressDetails } from '../address-details/address-details';
import { BseRegisterinvestors } from '../bse-registerinvestors/bse-registerinvestors';
import { DepoBankDetail } from '../depo-bank-detail/depo-bank-detail';
import { KycDetailsComponent } from '../kyc-details/kyc-details.component';
import { NomineeDetail } from '../nominee-detail/nominee-detail';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-test-port',
  standalone: true,
  // imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, InputTextModule, ButtonModule],
  imports: [CommonModule, MatSelectModule,BreadcrumbModule,FormsModule, MatTabsModule,ReactiveFormsModule , ButtonModule, 
     RouterOutlet, ],
  templateUrl: './test-port.component.html',
  styleUrls: ['./test-port.component.scss']
})
export class TestPortComponent implements OnInit {
  nomineeForm: any;
  nomineeRelations = [
    { value: 'SPOUSE', label: 'Spouse' },
    { value: 'CHILD', label: 'Child' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'OTHER', label: 'Other' }
  ];
  identityTypes = [
    { key: '1', label: 'PAN' },
    { key: '2', label: 'Aadhaar' },
    { key: '3', label: 'Driving License' },
    { key: '4', label: 'Passport' }
  ];

  savedNominees: any[] = [];
  maxNominees = 3;
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.nomineeForm = this.fb.group({
      nomineeName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]{2,25}$/)]],
      relation: ['', Validators.required],
      applicablePercentage: ['', [Validators.required, Validators.pattern(/^([1-9][0-9]?|100)(\.\d{1,2})?$/)]],
      identityType: ['', Validators.required],
      IDNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      address1: ['', [Validators.required, Validators.maxLength(50)]],
      address2: [''],
      address3: [''],
      city: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]{2,20}$/)]],
      pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['', Validators.required],
      isMinor: ['', Validators.required],
      guardianName: [''],
      nomineeDob: [''],
      pan: ['']
    });

    this.nomineeForm.get('isMinor')?.valueChanges.subscribe((val: any) => {
      if (val === 'Y') {
        this.nomineeForm.get('guardianName')?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z ]{2,50}$/)]);
        this.nomineeForm.get('nomineeDob')?.setValidators([Validators.required]);
        this.nomineeForm.get('pan')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]);
      } else {
        this.nomineeForm.get('guardianName')?.clearValidators();
        this.nomineeForm.get('nomineeDob')?.clearValidators();
        this.nomineeForm.get('pan')?.clearValidators();
      }
      this.nomineeForm.get('guardianName')?.updateValueAndValidity();
      this.nomineeForm.get('nomineeDob')?.updateValueAndValidity();
      this.nomineeForm.get('pan')?.updateValueAndValidity();
    });
  }

  get selectedIdentityType() {
    return this.nomineeForm.get('identityType')?.value;
  }

  addNominee() {
    if (this.savedNominees.length >= this.maxNominees) return;
    if (this.nomineeForm.invalid) {
      this.nomineeForm.markAllAsTouched();
      return;
    }

    const nominee = { ...this.nomineeForm.value };
    this.savedNominees.push(nominee);
    this.nomineeForm.reset();
  }

  addNomineeandExit() {
    this.addNominee();
    console.log('Saved nominees:', this.savedNominees);
  }

  deleteNominee(nominee: any, index: number) {
    this.savedNominees.splice(index, 1);
  }

  goBack() {
    console.log('Back clicked');
  }
}
