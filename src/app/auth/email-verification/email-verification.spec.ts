import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailVerificationComponent } from './email-verification';

describe('EmailVerification', () => {
  let component: EmailVerificationComponent;
  let fixture: ComponentFixture<EmailVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ // Changed from EmailVerification to EmailVerificationComponent
      imports: [EmailVerificationComponent]
    })
    .compileComponents(); // Changed from EmailVerification to EmailVerificationComponent

    fixture = TestBed.createComponent(EmailVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
