import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Crm } from './crm';

describe('Crm', () => {
  let component: Crm;
  let fixture: ComponentFixture<Crm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Crm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Crm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
