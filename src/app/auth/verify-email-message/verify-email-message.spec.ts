import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailMessageComponent } from './verify-email-message';

describe('VerifyEmailMessageComponent', () => {
  let component: VerifyEmailMessageComponent;
  let fixture: ComponentFixture<VerifyEmailMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailMessageComponent]
    })
    .compileComponents(); // Changed from VerifyEmailMessage to VerifyEmailMessageComponent

    fixture = TestBed.createComponent(VerifyEmailMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
